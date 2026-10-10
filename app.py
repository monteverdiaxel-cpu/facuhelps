import io
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
from fastapi.responses import FileResponse, JSONResponse
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

# Mapeo de extensiones comunes a MIME types para Google Files API
MIME_MAP = {
    ".mp3": "audio/mp3",
    ".m4a": "audio/mp4",
    ".wav": "audio/wav",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".webm": "audio/webm",
    ".wma": "audio/x-ms-wma",
}

INLINE_SIZE_LIMIT = 20 * 1024 * 1024  # 20 MB

SYSTEM_INSTRUCTION = """Actúa como un transcriptor judicial y motor de reconocimiento de voz (Speech-to-Text / ASR) de máxima fidelidad textual.
Tu tarea es escribir EXACTAMENTE y ÚNICAMENTE lo que se dice en el audio, palabra por palabra (verbatim), desde el segundo inicial hasta el último segundo de la grabación.

INSTRUCCIONES CRÍTICAS OBLIGATORIAS:
1. PROHIBIDO RESUMIR O SINTETIZAR: Bajo ninguna circunstancia resumas, simplifiques, omitas o parafrasees. No hagas un resumen de los temas ni selecciones ideas principales. Debes transcribir cada una de las oraciones completas de los hablantes.
2. VERBATIM TOTAL: Transcribe cada palabra tal cual como fue dicha, incluyendo repeticiones, autocorrecciones del hablante y muletillas (ej: "eh", "este", "bueno", "o sea", "um", etc.).
3. TRANSCRIPCIÓN ÍNTEGRA: Transcribe desde el principio hasta el final del audio sin truncar ni cortar nada.
4. SIN TEXTO ADICIONAL: NO incluyas introducciones (ej: "Aquí está la transcripción:"), notas al pie ni conclusiones. El texto debe comenzar inmediatamente con la primera palabra hablada.
5. FORMATO Y MARCAS DE TIEMPO:
   - Organiza la transcripción en párrafos lógicos y naturales.
   - Coloca marcas de tiempo en formato [hh:mm:ss] o [mm:ss] al inicio de los párrafos y en cada cambio temático o de intervención.
   - Si se distinguen interlocutores, indica quién habla (ej: [00:01:15] Profesor: ..., [00:04:30] Alumno: ...).
6. INAUDIBLE: Solo si una palabra o fragmento es ininteligible debido a ruido insuperable, escribe [inaudible].
"""

USER_PROMPT = """Transcribe absolutamente todo el audio adjunto palabra por palabra (verbatim) de principio a fin, sin resumir, sin sintetizar y sin omitir ninguna frase ni muletilla, hasta el último segundo del archivo. Escribe el texto literal exacto de todo lo hablado."""

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
    model_name: Optional[str] = Form("gemini-3.8-flash")
):
    # 1. Resolver API Key
    effective_key = (api_key or "").strip() or os.getenv("GEMINI_API_KEY", "").strip()
    if not effective_key:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una API Key válida. Ingrésala en la interfaz o configúrala en el archivo .env."
        )

    # 2. Validar extensión de archivo
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in MIME_MAP:
        supported = ", ".join(MIME_MAP.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no soportado ({file_ext}). Formatos permitidos: {supported}"
        )

    mime_type = MIME_MAP[file_ext]
    temp_filename = f"{uuid.uuid4().hex}_{Path(file.filename).name}"
    local_temp_path = TEMP_DIR / temp_filename

    google_file = None
    client = None

    try:
        # Import diferido para capturar errores de instalación si los hubiera
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=effective_key)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al inicializar el cliente de Google GenAI: {str(e)}"
        )

    try:
        # 3. Guardar archivo temporal en chunks (evita desbordar memoria RAM con audios de cientos de MB)
        with open(local_temp_path, "wb") as buffer:
            chunk_size = 1024 * 1024  # 1MB por chunk
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                buffer.write(chunk)

        # Determinar si el archivo es menor a 20 MB para procesarlo inline (rápido)
        file_size = local_temp_path.stat().st_size
        use_inline = file_size < INLINE_SIZE_LIMIT
        audio_content = None

        if use_inline:
            # Procesamiento inline directo en memoria para audios menores a 20 MB (pocos segundos)
            with open(local_temp_path, "rb") as f:
                audio_bytes = f.read()
            audio_content = types.Part.from_bytes(
                data=audio_bytes,
                mime_type=mime_type
            )
            processing_mode = "inline (< 20 MB)"
        else:
            # Para audios de 20 MB o más (hasta 2 horas), usar Google Files API
            processing_mode = "files_api (>= 20 MB)"
            try:
                google_file = client.files.upload(
                    file=str(local_temp_path),
                    config=types.UploadFileConfig(
                        mime_type=mime_type,
                        display_name=file.filename
                    )
                )
            except Exception as e:
                error_msg = str(e)
                if "API_KEY_INVALID" in error_msg or "400" in error_msg and "key" in error_msg.lower():
                    raise HTTPException(status_code=401, detail="API Key de Google AI Studio inválida o sin permisos.")
                raise HTTPException(status_code=500, detail=f"Error al subir el audio a Google Files API: {error_msg}")

            # Esperar a que el archivo esté listo (ACTIVE) en Google AI Studio
            max_wait_seconds = 180
            start_time = time.time()
            while google_file.state.name == "PROCESSING":
                if time.time() - start_time > max_wait_seconds:
                    raise HTTPException(
                        status_code=504,
                        detail="Tiempo de espera agotado mientras Google procesaba el archivo de audio."
                    )
                time.sleep(2)
                google_file = client.files.get(name=google_file.name)

            if google_file.state.name != "ACTIVE":
                raise HTTPException(
                    status_code=500,
                    detail=f"Google no pudo procesar el archivo. Estado: {google_file.state.name}"
                )

            audio_content = google_file

        # Generar transcripción estricta verbatim con temperature=0 y max_output_tokens
        primary_model = (model_name or "").strip() or "gemini-3.8-flash"
        
        # Lista ordenada de modelos a intentar en caso de saturación o error 503
        candidate_models = [primary_model]
        for alt in ["gemini-2.5-flash", "gemini-2.0-flash"]:
            if alt not in candidate_models:
                candidate_models.append(alt)

        # Configuraciones de generación priorizando desactivación de thinking (para evitar síntesis) y modo verbatim
        def build_generation_configs():
            cfgs = []
            try:
                cfgs.append(types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.0,
                    max_output_tokens=65536,
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                    audio_transcription_config=types.AudioTranscriptionConfig(mode="VERBATIM")
                ))
            except Exception:
                pass

            try:
                cfgs.append(types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.0,
                    max_output_tokens=65536,
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                ))
            except Exception:
                pass

            cfgs.append(types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.0,
                max_output_tokens=65536
            ))

            cfgs.append(types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.0,
                max_output_tokens=8192
            ))
            return cfgs

        response = None
        used_model = None
        last_error = None
        generation_configs = build_generation_configs()

        for model_to_try in candidate_models:
            for current_config in generation_configs:
                # Intentar hasta 2 veces por modelo/config en caso de 503
                for attempt in range(2):
                    try:
                        response = client.models.generate_content(
                            model=model_to_try,
                            contents=[
                                audio_content,
                                USER_PROMPT
                            ],
                            config=current_config
                        )
                        used_model = model_to_try
                        break
                    except Exception as e:
                        err_str = str(e)
                        last_error = err_str

                        # Si es error 503 (alta demanda) o 429, esperar brevemente y reintentar
                        is_overloaded = any(kw in err_str for kw in ["503", "UNAVAILABLE", "high demand", "429", "RESOURCE_EXHAUSTED"])
                        if is_overloaded and attempt == 0:
                            time.sleep(2)
                            continue
                        else:
                            # Pasar a la siguiente configuración o modelo
                            break

                if response:
                    break
            if response:
                break

        if not response:
            raise HTTPException(
                status_code=503,
                detail=f"Los servidores de Google AI Studio están experimentando alta demanda temporal. Detalle: {last_error}"
            )

        full_transcript_parts = []
        if response and response.text:
            full_transcript_parts.append(response.text.strip())

        # Bucle de continuación automática para audios largos (hasta 2 horas)
        cand = response.candidates[0] if (response and response.candidates) else None
        finish_reason = getattr(cand, "finish_reason", None)
        finish_reason_name = getattr(finish_reason, "name", str(finish_reason)) if finish_reason else ""

        continuation_attempts = 0
        max_continuations = 8

        while continuation_attempts < max_continuations:
            last_text = full_transcript_parts[-1] if full_transcript_parts else ""
            if not last_text:
                break

            last_snippet = last_text[-120:].replace("\n", " ").strip()
            continuation_prompt = (
                f"Continúa la transcripción literal palabra por palabra inmediatamente después de este fragmento: '{last_snippet}'. "
                f"Si ya transcribiste absolutamente todo el audio hasta el último segundo de la grabación, responde ÚNICAMENTE '[FIN_DE_AUDIO]'. "
                f"De lo contrario, transcribe la siguiente sección completa de forma textual sin resumir."
            )

            continuation_attempts += 1
            try:
                from google.genai import types
                cont_response = client.models.generate_content(
                    model=used_model,
                    contents=[
                        audio_content,
                        types.Part.from_text(text=continuation_prompt)
                    ],
                    config=current_config
                )
                if cont_response and cont_response.text:
                    new_text = cont_response.text.strip()
                    if "[FIN_DE_AUDIO]" in new_text:
                        cleaned_final = new_text.replace("[FIN_DE_AUDIO]", "").strip()
                        if cleaned_final and cleaned_final not in full_transcript_parts:
                            full_transcript_parts.append(cleaned_final)
                        break
                    
                    if new_text and new_text not in full_transcript_parts:
                        full_transcript_parts.append(new_text)
                    else:
                        break
                else:
                    break
            except Exception:
                break

        transcript_text = "\n\n".join(full_transcript_parts)

        return {
            "success": True,
            "filename": file.filename,
            "model_used": used_model,
            "processing_mode": processing_mode,
            "transcript": transcript_text
        }

    finally:
        # 7. Limpieza garantizada
        # Eliminar archivo temporal local
        if local_temp_path.exists():
            try:
                local_temp_path.unlink()
            except Exception:
                pass

        # Eliminar archivo en Google Files API para no consumir espacio
        if client and google_file and getattr(google_file, "name", None):
            try:
                client.files.delete(name=google_file.name)
            except Exception:
                pass

class DocxExportRequest(BaseModel):
    filename: Optional[str] = "transcripcion"
    transcript: str

@app.post("/api/export-docx")
async def export_docx(req: DocxExportRequest):
    if not req.transcript:
        raise HTTPException(status_code=400, detail="El contenido de la transcripción está vacío.")
    
    doc = docx.Document()
    
    # Configurar márgenes de página
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    clean_base = Path(req.filename).stem if req.filename else "transcripcion"
    
    # Encabezado / Título principal
    title = doc.add_paragraph()
    title_run = title.add_run(f"Transcripción: {req.filename}")
    title_run.font.name = "Calibri"
    title_run.font.size = Pt(18)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(79, 70, 229)  # Índigo elegante
    title.paragraph_format.space_after = Pt(2)
    
    # Subtítulo con metadata
    sub = doc.add_paragraph()
    sub_run = sub.add_run("Generado con Gemini Audio Transcriber — Transcripción Literal (Verbatim)")
    sub_run.font.name = "Calibri"
    sub_run.font.size = Pt(9.5)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(100, 116, 139)  # Slate
    sub.paragraph_format.space_after = Pt(14)
    
    # Párrafos de la transcripción
    raw_paras = [p.strip() for p in req.transcript.split("\n\n") if p.strip()]
    for p_text in raw_paras:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.line_spacing = 1.15
        
        # Segmentar marcas de tiempo tipo [00:01:23] o [01:23]
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
                # Detección de oradores (ej. Profesor:, Docente:, etc.)
                speaker_match = re.match(r'^(Docente|Profesor|Profesora|Alumno|Alumna|Estudiante|Entrevistador|Entrevistadora|Entrevistado|Orador|Hablante\s*\d*):(.*)', part, re.DOTALL | re.IGNORECASE)
                if speaker_match:
                    sp_label = speaker_match.group(1) + ":"
                    rest = speaker_match.group(2)
                    
                    sp_run = p.add_run(sp_label)
                    sp_run.font.name = "Calibri"
                    sp_run.font.size = Pt(11)
                    sp_run.font.bold = True
                    sp_run.font.color.rgb = RGBColor(15, 23, 42)
                    
                    text_run = p.add_run(rest)
                    text_run.font.name = "Calibri"
                    text_run.font.size = Pt(11)
                    text_run.font.color.rgb = RGBColor(51, 65, 85)
                else:
                    text_run = p.add_run(part)
                    text_run.font.name = "Calibri"
                    text_run.font.size = Pt(11)
                    text_run.font.color.rgb = RGBColor(51, 65, 85)

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
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Iniciando servidor en http://localhost:{port} (host: {host})...")
    uvicorn.run("app:app", host=host, port=port)
