import asyncio
import gc
import io
import json
import os
import re
import shutil
import time
import uuid
from pathlib import Path
from typing import Optional

import docx
from docx.shared import Inches, Pt, RGBColor
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Cargar variables de entorno desde .env
load_dotenv()

app = FastAPI(title="FacuHelps")

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = Path("temp_uploads")
TEMP_DIR.mkdir(exist_ok=True)

# Mapeo de extensiones comunes a MIME types para Google Files API (se excluye .wav por tamaño excesivo)
MIME_MAP = {
    ".mp3": "audio/mp3",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".webm": "audio/webm",
    ".wma": "audio/x-ms-wma",
}

def parse_api_keys(key_string: Optional[str]) -> list[str]:
    """Extrae y limpia una lista de API Keys separadas por comas, espacios o saltos de línea."""
    if not key_string:
        return []
    # Separar por comas, punto y coma, o saltos de línea
    keys = re.split(r'[,;\n\r]+', key_string)
    cleaned = [k.strip() for k in keys if k and k.strip()]
    # Eliminar duplicados manteniendo el orden
    seen = set()
    result = []
    for k in cleaned:
        if k not in seen:
            seen.add(k)
            result.append(k)
    return result

def is_rate_limit_error(exc: Exception) -> bool:
    """Detecta si un error es de cuota/tasa excedida (429 / RESOURCE_EXHAUSTED)."""
    err_str = str(exc).lower()
    return any(keyword in err_str for keyword in [
        "429", "resource_exhausted", "quota", "rate limit", "ratelimit"
    ])

def is_retriable_error(exc: Exception) -> bool:
    """Detecta si un error de Gemini es temporal/503/UNAVAILABLE para reintentar con backoff."""
    err_str = str(exc).lower()
    return any(keyword in err_str for keyword in [
        "503", "unavailable", "servererror", "high demand", "overloaded",
        "temporary", "service unavailable"
    ])

def get_system_instruction(audio_type: str = "clase") -> str:
    if audio_type == "continuo":
        speaker_rules = """3. SIN DIFERENCIAR HABLANTES (TEXTO CONTINUO EN PÁRRAFOS):
   - NO incluyas NINGUNA etiqueta de orador bajo ninguna circunstancia (está terminantemente prohibido usar Docente, Estudiante, Hablante, Entrevistador, Entrevistado, Persona o nombres propios).
   - Transcribe todo el texto de corrido organizado únicamente en párrafos limpios, legibles y naturales, con puntos y aparte claros ante cada cambio de tema o pausa temática, sin ningún prefijo ni número al inicio de los párrafos."""
    elif audio_type == "entrevista":
        speaker_rules = """3. UNIFORMIDAD TOTAL DE ORADORES (ENTREVISTA):
   - NO utilices nombres propios de personas bajo ninguna circunstancia como etiquetas de orador, incluso si se mencionan en la conversación.
   - Utiliza OBLIGATORIAMENTE de principio a fin las etiquetas en negrita:
     * **Entrevistador:** para quien realiza las preguntas.
     * **Entrevistado:** (o **Entrevistado 1:**, **Entrevistado 2:** si hubiese varios) para quien responde.
   - Si habla una sola persona (relato o monólogo): separa obligatoriamente en párrafos naturales y legibles con puntos y aparte ante cada cambio de tema o pausa, sin ningún número al inicio."""
    elif audio_type == "radio":
        speaker_rules = """3. UNIFORMIDAD TOTAL DE ORADORES (RADIO / PODCAST / DEBATE):
   - NO utilices nombres propios de personas bajo ninguna circunstancia como etiquetas de orador, incluso si los participantes son presentados o se nombran entre sí.
   - Identifica y distingue a todos los hablantes intervinientes usando ESTRICTAMENTE y de principio a fin el formato en negrita:
     * **Persona 1:** para la primera voz que habla.
     * **Persona 2:** para la segunda voz que interviene.
     * **Persona 3:**, **Persona 4:**, etc., incrementando consecutivamente según las distintas voces del programa o panel.
   - Mantené siempre asignado el mismo número a la misma voz a lo largo de todo el audio.
   - Separa cada intervención en párrafos limpios y claros, con puntos y aparte."""
    else:  # clase / teórico
        speaker_rules = """3. UNIFORMIDAD TOTAL DE ORADORES (CLASE / TEÓRICO):
   - NO utilices nombres propios de personas bajo ninguna circunstancia como etiquetas de orador, incluso si se mencionan en la conversación.
   - Utiliza OBLIGATORIAMENTE de principio a fin las etiquetas en negrita:
     * **Docente:** para quien enseña o expone la clase.
     * **Estudiante:** (o **Estudiante 1:**, **Estudiante 2:** si intervienen varios) para los alumnos que participan o preguntan.
   - Si habla una sola persona (clase magistral o monólogo continuo): separa obligatoriamente en párrafos naturales y legibles con puntos y aparte ante cada cambio de tema o pausa, sin ningún número al inicio."""

    return f"""Actúa como un taquígrafo profesional y motor de transcripción de máxima fidelidad textual.
Tu única tarea es transcribir exactamente cada palabra pronunciada en el audio de principio a fin de forma fiel, con una estructura de lectura limpia, clara y sin marcas de tiempo.

REGLAS ESTRICTAS DE TRANSCRIPCIÓN Y FORMATO:
1. FIDELIDAD TEXTUAL SIN RESUMIR: Transcribe el contenido íntegro del audio de principio a fin sin resumir, sin sintetizar y sin omitir frases ni explicaciones. Transcribe hasta la última palabra del archivo.
2. FILTRO Y TOLERANCIA A AUDIOS DIFÍCILES (RUIDO Y ECO):
   - Si el audio presenta baja ganancia, eco de aula, murmullos de fondo o lejanía del micrófono, aísla la voz principal del orador e ignora el ruido ambiente.
   - Reconstruye con máxima fidelidad las palabras habladas apoyándote en el contexto semántico de la clase o conversación.
{speaker_rules}
4. LIMPIEZA DE HABLA (FLUIDEZ):
   - Elimina repeticiones involuntarias y tartamudeos accidentales (ej.: "de de de" -> "de", "con- contrastivas" -> "contrastivas", "pe- presentar" -> "presentar").
   - Omite muletillas sonoras y vacilaciones como "eh", "mmm", "este...", manteniendo intactas todas las demás palabras pronunciadas.
5. USO DE COMILLAS:
   - No utilices comillas angulares («...»). Emplea exclusivamente comillas dobles estándar ("...") para citas, términos específicos o ejemplos mencionados.
6. PROHIBIDAS LAS MARCAS DE TIEMPO: Está terminantemente prohibido incluir marcas de tiempo, timestamps, segundos o minutos (nada de [mm:ss], [hh:mm:ss] ni numeración de tiempo en ninguna parte).
7. PROHIBIDO DEVOLVER BLOQUES DENSOS: No entregues textos continuos en un solo bloque denso sin saltos de línea.
8. SIN INTRODUCCIONES NI NOTAS: No agregues notas, comentarios ni saludos. Comienza directamente con la transcripción."""

def get_user_prompt(audio_type: str = "clase", keywords: Optional[str] = None) -> str:
    if audio_type == "continuo":
        speaker_hint = """- Formato: SIN etiquetas de orador (nada de Docente, Estudiante ni Hablante). Transcribe el texto de corrido organizado únicamente en párrafos limpios con puntos y aparte claros."""
    elif audio_type == "entrevista":
        speaker_hint = """- Formato de oradores: USA OBLIGATORIAMENTE **Entrevistador:** y **Entrevistado:** (CERO nombres propios). Si habla una sola persona, párrafos limpios con puntos y aparte sin prefijos."""
    elif audio_type == "radio":
        speaker_hint = """- Formato de oradores: Identifica a todos los participantes usando ESTRICTAMENTE **Persona 1:**, **Persona 2:**, **Persona 3:**, etc. (incrementando según cada voz distinta). CERO nombres propios."""
    else:
        speaker_hint = """- Formato de oradores: USA OBLIGATORIAMENTE **Docente:** y **Estudiante:** (o **Estudiante 1:**, **Estudiante 2:**) (CERO nombres propios). Si es clase magistral individual, párrafos limpios con puntos y aparte sin prefijos."""

    keywords_instruction = ""
    clean_kw = (keywords or "").strip()
    if clean_kw:
        keywords_instruction = f"\n- Atención a vocabulario específico: asegúrate de transcribir con correcta ortografía los siguientes términos y autores si aparecen en el audio: {clean_kw}."

    return f"""Transcribe todo el audio adjunto de principio a fin de forma fiel y completa sin resumir:
- Filtro de audio difícil: aísla la voz principal ante eco de aula, lejanía o ruido de fondo, reconstruyendo las palabras con fidelidad según el contexto temático.
{speaker_hint}{keywords_instruction}
- Limpieza de habla: elimina tartamudeos ("de de") y muletillas sonoras ("eh", "mmm"), dejando el resto intacto.
- Comillas: usa exclusivamente comillas dobles comunes ("..."), nunca angulares («...»).
- PROHIBIDO incluir marcas de tiempo [mm:ss] o timestamps.
- Prohibido devolver bloques densos de texto sin saltos de línea."""

@app.get("/api/config")
async def get_config():
    """Permite saber al frontend si hay una API Key configurada en el archivo .env del servidor."""
    has_env_key = bool(os.getenv("GEMINI_API_KEY", "").strip())
    return {
        "has_server_api_key": has_env_key,
        "default_model": os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    }

@app.post("/api/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    api_key: Optional[str] = Form(None),
    model_name: Optional[str] = Form("gemini-3.8-flash"),
    audio_type: Optional[str] = Form("clase"),
    keywords: Optional[str] = Form(None)
):
    # 1. Resolver Pool de API Keys
    key_pool = parse_api_keys(api_key)
    if not key_pool:
        key_pool = parse_api_keys(os.getenv("GEMINI_API_KEY", ""))

    if not key_pool:
        raise HTTPException(
            status_code=400,
            detail="No se encontró ninguna API Key válida. Ingrésala en la interfaz o configúrala en el archivo .env."
        )

    # 2. Validar extensión de archivo
    file_ext = Path(file.filename).suffix.lower()
    if file_ext == ".wav":
        raise HTTPException(
            status_code=400,
            detail="No se admite el formato WAV debido a su tamaño excesivo. Por favor utiliza MP3, M4A o AAC."
        )

    if file_ext not in MIME_MAP:
        supported = ", ".join(MIME_MAP.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no soportado ({file_ext}). Formatos permitidos: {supported} (WAV no admitido)."
        )

    mime_type = MIME_MAP[file_ext]
    target_model_name = "gemini-3.8-flash"
    effective_audio_type = (audio_type or "clase").lower().strip()
    if effective_audio_type not in ["clase", "entrevista", "continuo", "radio"]:
        effective_audio_type = "clase"

    clean_keywords = (keywords or "").strip()
    system_instruction = get_system_instruction(effective_audio_type)
    user_prompt = get_user_prompt(effective_audio_type, clean_keywords)

    # Guardar audio en disco en bloques de 1 MB (protege memoria RAM)
    temp_filename = f"{uuid.uuid4().hex}_{Path(file.filename).name}"
    local_temp_path = TEMP_DIR / temp_filename

    google_file = None
    client = None

    try:
        from google import genai
        from google.genai import types

        with open(local_temp_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                f.write(chunk)

        # Subir a Google Files API probando con el pool de API keys si hay 429
        upload_success = False
        last_upload_err = None
        key_index_used = 0

        for k_idx, current_key in enumerate(key_pool):
            try:
                client = genai.Client(api_key=current_key)
                google_file = client.files.upload(
                    file=str(local_temp_path),
                    config=types.UploadFileConfig(
                        mime_type=mime_type,
                        display_name=file.filename
                    )
                )
                upload_success = True
                key_index_used = k_idx
                break
            except Exception as up_err:
                last_upload_err = up_err
                if is_rate_limit_error(up_err) and k_idx + 1 < len(key_pool):
                    time.sleep(1)
                    continue
                else:
                    break

        if not upload_success or not google_file:
            raise HTTPException(
                status_code=500,
                detail=f"Error al subir el archivo de audio: {str(last_upload_err)}"
            )

        # Polling rápido cada 1 segundo exacto hasta que esté ACTIVE
        max_wait_seconds = 180
        start_time = time.time()
        while google_file.state.name == "PROCESSING":
            if time.time() - start_time > max_wait_seconds:
                raise HTTPException(
                    status_code=504,
                    detail="Tiempo de espera agotado mientras Google procesaba el audio."
                )
            time.sleep(1)
            google_file = client.files.get(name=google_file.name)

        if google_file.state.name != "ACTIVE":
            raise HTTPException(
                status_code=500,
                detail=f"Google no pudo procesar el archivo. Estado: {google_file.state.name}"
            )

        # Transcripción directa con gemini-3.8-flash de una sola vez
        gen_config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.0,
            max_output_tokens=65536,
            thinking_config=types.ThinkingConfig(thinking_budget=0)
        )

        response = None
        current_k_idx = key_index_used

        while current_k_idx < len(key_pool):
            curr_key = key_pool[current_k_idx]
            curr_client = genai.Client(api_key=curr_key)
            should_rotate = False

            for attempt in range(1, 4):
                try:
                    response = curr_client.models.generate_content(
                        model=target_model_name,
                        contents=[
                            google_file,
                            user_prompt
                        ],
                        config=gen_config
                    )
                    break
                except Exception as api_err:
                    if is_rate_limit_error(api_err):
                        if current_k_idx + 1 < len(key_pool):
                            should_rotate = True
                            break
                        else:
                            raise api_err
                    elif is_retriable_error(api_err) and attempt < 3:
                        time.sleep(3)
                    else:
                        raise api_err

            if response is not None:
                break

            if should_rotate:
                current_k_idx += 1
                time.sleep(1)
            else:
                break

        transcript_text = (response.text or "").strip() if response else ""

        if not transcript_text:
            raise HTTPException(
                status_code=500,
                detail="La API de Gemini devolvió una transcripción vacía."
            )

        return JSONResponse({
            "transcript": transcript_text,
            "filename": file.filename,
            "model_used": target_model_name
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error durante la transcripción: {str(e)}"
        )
    finally:
        # Limpieza de archivo local y remoto en Google Files API
        if local_temp_path and os.path.exists(local_temp_path):
            try:
                os.remove(local_temp_path)
            except Exception:
                pass

        if client and google_file and getattr(google_file, "name", None):
            try:
                client.files.delete(name=google_file.name)
            except Exception:
                pass

        gc.collect()

class SummarizeRequest(BaseModel):
    transcript: str
    api_key: Optional[str] = None
    model_name: Optional[str] = "gemini-3.8-flash"

@app.post("/api/summarize")
async def summarize_transcript(req: SummarizeRequest):
    if not req.transcript or not req.transcript.strip():
        raise HTTPException(status_code=400, detail="El texto de la transcripción está vacío.")

    key_pool = parse_api_keys(req.api_key)
    if not key_pool:
        key_pool = parse_api_keys(os.getenv("GEMINI_API_KEY", ""))

    if not key_pool:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una API Key válida. Ingrésala en la interfaz o configúrala en el servidor."
        )

    try:
        from google import genai
        from google.genai import types

        target_model = "gemini-3.8-flash"

        system_instruction = (
            "Actúa como un analista y asistente pedagógico experto. "
            "A partir de la transcripción completa provista, genera un resumen estructurado, riguroso y sin omitir información explícita:\n\n"
            "### 💡 Conceptos Teóricos Clave y Autores Citados\n"
            "(Sintetiza las ideas fuerza, teorías, definiciones principales y enumera todos los autores, investigadores o textos citados)\n\n"
            "### 📌 Fechas, Plazos y Compromisos\n"
            "(Extrae TODAS las fechas explícitas mencionadas en el audio: días del mes, días de la semana, horarios, exámenes, parciales, entregas, recuperatorios y lecturas. No afirmes que no hay fechas si fueron nombradas en la conversación. Si y solo si no existe absolutamente ninguna mención temporal, acláralo)\n\n"
            "### 📝 Consignas del Trabajo Práctico y Tareas\n"
            "(Detalla con viñetas claras las consignas, pautas de evaluación, formato solicitado o pasos requeridos para trabajos prácticos y tareas)."
        )

        user_content = (
            "A continuación tienes la transcripción completa para generar el resumen estructurado:\n\n"
            f"{req.transcript}"
        )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.1,
            max_output_tokens=8192
        )

        response = None
        current_k_idx = 0

        while current_k_idx < len(key_pool):
            curr_key = key_pool[current_k_idx]
            curr_client = genai.Client(api_key=curr_key)
            should_rotate = False

            for attempt in range(1, 4):
                try:
                    response = curr_client.models.generate_content(
                        model=target_model,
                        contents=[user_content],
                        config=config
                    )
                    break
                except Exception as api_err:
                    if is_rate_limit_error(api_err):
                        if current_k_idx + 1 < len(key_pool):
                            should_rotate = True
                            break
                        else:
                            raise api_err
                    elif is_retriable_error(api_err) and attempt < 3:
                        await asyncio.sleep(3)
                    else:
                        raise api_err

            if response is not None:
                break

            if should_rotate:
                current_k_idx += 1
                await asyncio.sleep(1)
            else:
                break

        summary_text = (response.text or "").strip() if response else ""
        return JSONResponse({
            "success": True,
            "summary": summary_text
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar el resumen: {str(e)}")

class SummaryDocxExportRequest(BaseModel):
    filename: Optional[str] = "resumen"
    summary: str

@app.post("/api/export-summary-docx")
async def export_summary_docx(req: SummaryDocxExportRequest):
    if not req.summary or not req.summary.strip():
        raise HTTPException(status_code=400, detail="El contenido del resumen está vacío.")

    doc = docx.Document()

    # Formato académico estricto: Márgenes estándar de 2.5 cm (aprox 0.984 pulgadas)
    for section in doc.sections:
        section.top_margin = Inches(0.984)
        section.bottom_margin = Inches(0.984)
        section.left_margin = Inches(0.984)
        section.right_margin = Inches(0.984)

    clean_base = Path(req.filename).stem if req.filename else "resumen"

    # Título principal académico
    title = doc.add_paragraph()
    title_run = title.add_run(f"Resumen Ejecutivo: {clean_base}")
    title_run.font.name = "Calibri"
    title_run.font.size = Pt(16)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(15, 23, 42)
    title.paragraph_format.space_after = Pt(2)

    # Subtítulo con metadata
    sub = doc.add_paragraph()
    sub_run = sub.add_run("Síntesis pedagógica generada por FacuHelps con Gemini Flash")
    sub_run.font.name = "Calibri"
    sub_run.font.size = Pt(9.5)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(100, 116, 139)
    sub.paragraph_format.space_after = Pt(12)

    # Procesar líneas de Markdown del resumen
    lines = req.summary.split("\n")
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        if line.startswith("### "):
            header_text = line[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(header_text)
            run.font.name = "Calibri"
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42)
        elif line.startswith("## "):
            header_text = line[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(header_text)
            run.font.name = "Calibri"
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42)
        elif line.startswith("- ") or line.startswith("* "):
            bullet_text = line[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15

            # Procesar negritas dentro de la viñeta
            subparts = re.split(r'(\*\*.*?\*\*)', bullet_text)
            for subpart in subparts:
                if not subpart:
                    continue
                if subpart.startswith("**") and subpart.endswith("**") and len(subpart) >= 4:
                    b_run = p.add_run(subpart[2:-2])
                    b_run.font.name = "Calibri"
                    b_run.font.size = Pt(11)
                    b_run.font.bold = True
                    b_run.font.color.rgb = RGBColor(15, 23, 42)
                else:
                    norm_run = p.add_run(subpart)
                    norm_run.font.name = "Calibri"
                    norm_run.font.size = Pt(11)
                    norm_run.font.color.rgb = RGBColor(51, 65, 85)
        else:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15

            subparts = re.split(r'(\*\*.*?\*\*)', line)
            for subpart in subparts:
                if not subpart:
                    continue
                if subpart.startswith("**") and subpart.endswith("**") and len(subpart) >= 4:
                    b_run = p.add_run(subpart[2:-2])
                    b_run.font.name = "Calibri"
                    b_run.font.size = Pt(11)
                    b_run.font.bold = True
                    b_run.font.color.rgb = RGBColor(15, 23, 42)
                else:
                    norm_run = p.add_run(subpart)
                    norm_run.font.name = "Calibri"
                    norm_run.font.size = Pt(11)
                    norm_run.font.color.rgb = RGBColor(51, 65, 85)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{clean_base}_resumen.docx"'
        }
    )

class DocxExportRequest(BaseModel):
    filename: Optional[str] = "transcripcion"
    transcript: str

@app.post("/api/export-docx")
async def export_docx(req: DocxExportRequest):
    if not req.transcript:
        raise HTTPException(status_code=400, detail="El contenido de la transcripción está vacío.")
    
    doc = docx.Document()
    
    # Formato académico estricto: Márgenes estándar de 2.5 cm (aprox 0.984 pulgadas)
    for section in doc.sections:
        section.top_margin = Inches(0.984)
        section.bottom_margin = Inches(0.984)
        section.left_margin = Inches(0.984)
        section.right_margin = Inches(0.984)
        
    clean_base = Path(req.filename).stem if req.filename else "transcripcion"
    
    # Encabezado / Título principal
    title = doc.add_paragraph()
    title_run = title.add_run(f"Transcripción: {req.filename}")
    title_run.font.name = "Calibri"
    title_run.font.size = Pt(16)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(15, 23, 42)
    title.paragraph_format.space_after = Pt(2)
    
    # Subtítulo con metadata
    sub = doc.add_paragraph()
    sub_run = sub.add_run("Registro textual literal y académico (Verbatim)")
    sub_run.font.name = "Calibri"
    sub_run.font.size = Pt(9.5)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(100, 116, 139)  # Slate
    sub.paragraph_format.space_after = Pt(12)
    
    # Párrafos e intervenciones de la transcripción con formato académico
    raw_paras = [p.strip() for p in req.transcript.split("\n") if p.strip()]
    for p_text in raw_paras:
        p = doc.add_paragraph()
        # Formato académico: Espaciado posterior 6 pt, interlineado 1.15
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        
        # Segmentar marcas de tiempo si existieran
        parts = re.split(r'(\[\d{1,2}:\d{2}(?::\d{2})?\])', p_text)
        for part in parts:
            if not part:
                continue
            if re.match(r'^\[\d{1,2}:\d{2}(?::\d{2})?\]$', part):
                run = p.add_run(part + " ")
                run.font.name = "Consolas"
                run.font.size = Pt(9.5)
                run.font.bold = True
                run.font.color.rgb = RGBColor(79, 70, 229)
            else:
                # Segmentar negrita Markdown **...** para nombres de oradores en negrita al inicio y énfasis
                subparts = re.split(r'(\*\*.*?\*\*)', part)
                for subpart in subparts:
                    if not subpart:
                        continue
                    if subpart.startswith("**") and subpart.endswith("**") and len(subpart) >= 4:
                        bold_text = subpart[2:-2]
                        run = p.add_run(bold_text)
                        run.font.name = "Calibri"
                        run.font.size = Pt(11)
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(15, 23, 42)
                    else:
                        run = p.add_run(subpart)
                        run.font.name = "Calibri"
                        run.font.size = Pt(11)
                        run.font.color.rgb = RGBColor(30, 41, 59)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{clean_base}_transcripcion.docx"'
        }
    )

# Montar carpeta estática
STATIC_DIR = Path("static")
STATIC_DIR.mkdir(exist_ok=True)

app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Iniciando servidor en http://localhost:{port} (host: {host})...")
    uvicorn.run("app:app", host=host, port=port)
