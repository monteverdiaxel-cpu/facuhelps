import asyncio
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
    target_model_name = (model_name or "").strip() or "gemini-3.8-flash"

    # Leer contenido del audio
    content_bytes = await file.read()
    file_size = len(content_bytes)
    use_inline = file_size < INLINE_SIZE_LIMIT

    async def generate_events():
        google_file = None
        client = None
        local_temp_path = None

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=effective_key)

            # Notificar fase de preparación
            yield f"data: {json.dumps({'event': 'status', 'stage': 'local', 'message': 'Audio preparado...', 'mode': 'inline' if use_inline else 'files_api'})}\n\n"

            if use_inline:
                # 1. OPTIMIZACIÓN: Modo inline directo en memoria (< 20 MB) sin tocar disco ni Files API
                yield f"data: {json.dumps({'event': 'status', 'stage': 'gemini', 'message': 'Modo rápido inline (< 20 MB) en memoria activado...', 'mode': 'inline'})}\n\n"
                audio_content = types.Part.from_bytes(
                    data=content_bytes,
                    mime_type=mime_type
                )
                processing_mode = "inline (< 20 MB)"
            else:
                # 2. OPTIMIZACIÓN: Modo Files API (>= 20 MB) con polling cada 2 segundos
                processing_mode = "files_api (>= 20 MB)"
                temp_filename = f"{uuid.uuid4().hex}_{Path(file.filename).name}"
                local_temp_path = TEMP_DIR / temp_filename

                with open(local_temp_path, "wb") as f:
                    f.write(content_bytes)

                yield f"data: {json.dumps({'event': 'status', 'stage': 'cloud', 'message': f'Subiendo {file_size / (1024*1024):.1f} MB a Google Files API...', 'mode': 'files_api'})}\n\n"

                try:
                    google_file = client.files.upload(
                        file=str(local_temp_path),
                        config=types.UploadFileConfig(
                            mime_type=mime_type,
                            display_name=file.filename
                        )
                    )
                except Exception as e:
                    yield f"data: {json.dumps({'event': 'error', 'message': f'Error al subir el audio a Google Files API: {str(e)}'})}\n\n"
                    return

                # Sondeo optimizado a cada 2 segundos
                max_wait_seconds = 180
                start_time = time.time()
                while google_file.state.name == "PROCESSING":
                    if time.time() - start_time > max_wait_seconds:
                        yield f"data: {json.dumps({'event': 'error', 'message': 'Tiempo de espera agotado mientras Google procesaba el audio.'})}\n\n"
                        return
                    yield f"data: {json.dumps({'event': 'status', 'stage': 'cloud', 'message': 'Procesando archivo en Google AI Studio (verificando cada 2s)...', 'mode': 'files_api'})}\n\n"
                    await asyncio.sleep(2)
                    google_file = client.files.get(name=google_file.name)

                if google_file.state.name != "ACTIVE":
                    yield f"data: {json.dumps({'event': 'error', 'message': f'Google no pudo procesar el archivo. Estado: {google_file.state.name}'})}\n\n"
                    return

                audio_content = google_file
                yield f"data: {json.dumps({'event': 'status', 'stage': 'gemini', 'message': 'Audio activo. Iniciando streaming con Gemini Flash...', 'mode': 'files_api'})}\n\n"

            # 3. Modelos candidatos con fallback en caso de 503
            candidate_models = [target_model_name]
            for alt in ["gemini-2.5-flash", "gemini-2.0-flash"]:
                if alt not in candidate_models:
                    candidate_models.append(alt)

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

            generation_configs = build_generation_configs()
            full_transcript_parts = []
            used_model = None
            used_config = None
            stream_started = False
            last_error = None

            for model_to_try in candidate_models:
                for current_config in generation_configs:
                    for attempt in range(2):
                        try:
                            # STREAMING EN VIVO con generate_content_stream
                            stream = client.models.generate_content_stream(
                                model=model_to_try,
                                contents=[
                                    audio_content,
                                    USER_PROMPT
                                ],
                                config=current_config
                            )
                            part_text = ""
                            for chunk in stream:
                                if chunk.text:
                                    part_text += chunk.text
                                    stream_started = True
                                    yield f"data: {json.dumps({'event': 'chunk', 'text': chunk.text})}\n\n"

                            if part_text:
                                full_transcript_parts.append(part_text.strip())
                            used_model = model_to_try
                            used_config = current_config
                            break
                        except Exception as e:
                            err_str = str(e)
                            last_error = err_str
                            is_overloaded = any(kw in err_str for kw in ["503", "UNAVAILABLE", "high demand", "429", "RESOURCE_EXHAUSTED"])
                            if is_overloaded and attempt == 0 and not stream_started:
                                await asyncio.sleep(2)
                                continue
                            else:
                                break

                    if stream_started:
                        break
                if stream_started:
                    break

            if not stream_started and not full_transcript_parts:
                yield f"data: {json.dumps({'event': 'error', 'message': f'Error al generar la transcripción: {last_error}'})}\n\n"
                return

            # 4. Bucle de continuación activa en streaming para audios extensos
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
                    cont_stream = client.models.generate_content_stream(
                        model=used_model,
                        contents=[
                            audio_content,
                            types.Part.from_text(text=continuation_prompt)
                        ],
                        config=used_config
                    )
                    cont_text = ""
                    for chunk in cont_stream:
                        if chunk.text:
                            clean_chunk = chunk.text.replace("[FIN_DE_AUDIO]", "")
                            if clean_chunk:
                                cont_text += clean_chunk
                                yield f"data: {json.dumps({'event': 'chunk', 'text': clean_chunk})}\n\n"

                    cont_text_stripped = cont_text.strip()
                    if "[FIN_DE_AUDIO]" in cont_text or not cont_text_stripped:
                        break

                    if cont_text_stripped and cont_text_stripped not in full_transcript_parts:
                        full_transcript_parts.append(cont_text_stripped)
                    else:
                        break
                except Exception:
                    break

            final_full_text = "\n\n".join(full_transcript_parts)
            yield f"data: {json.dumps({'event': 'done', 'filename': file.filename, 'model_used': used_model, 'processing_mode': processing_mode, 'transcript': final_full_text})}\n\n"

        except Exception as global_err:
            yield f"data: {json.dumps({'event': 'error', 'message': f'Error en el proceso: {str(global_err)}'})}\n\n"

        finally:
            # 5. Limpieza garantizada
            if local_temp_path and local_temp_path.exists():
                try:
                    local_temp_path.unlink()
                except Exception:
                    pass

            if client and google_file and getattr(google_file, "name", None):
                try:
                    client.files.delete(name=google_file.name)
                except Exception:
                    pass

    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
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
