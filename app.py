import asyncio
import gc
import io
import json
import os
import re
import shutil
import tempfile
import time
import unicodedata
import urllib.error
import urllib.request
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

TEMP_DIR = Path(tempfile.gettempdir()) / "temp_uploads"
TEMP_DIR.mkdir(exist_ok=True, parents=True)

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

def sanitize_filename(filename: str) -> str:
    """Genera un nombre seguro en ASCII sin tildes, eñes ni caracteres especiales."""
    # Normalizar caracteres con tildes/eñes a caracteres base equivalentes en ASCII
    normalized = unicodedata.normalize('NFKD', filename).encode('ascii', 'ignore').decode('ascii')
    # Reemplazar cualquier caracter no alfanumérico (excepto puntos, guiones y guiones bajos) por guiones bajos
    safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', normalized).strip('._')
    return safe_name or "audio"

def sanitize_audio_mime(filename: str = "", mime: str = "") -> str:
    fn = (filename or "").lower().strip()
    m = (mime or "").lower().strip()
    if fn.endswith(".m4a") or fn.endswith(".aac") or "m4a" in m or "aac" in m:
        return "audio/mp4"
    if fn.endswith(".mp3") or "mp3" in m or "mpeg" in m:
        return "audio/mp3"
    if fn.endswith(".wav") or "wav" in m:
        return "audio/wav"
    if fn.endswith(".ogg") or "ogg" in m:
        return "audio/ogg"
    if fn.endswith(".flac") or "flac" in m:
        return "audio/flac"
    return "audio/mp4" if "mp4" in m else (mime or "audio/mp3")

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

def is_rotatable_error(exc: Exception) -> bool:
    """Detecta si un error amerita rotar a la siguiente API Key del pool inmediatamente:
    - Cuota o tasa excedida: 429, RESOURCE_EXHAUSTED, quota, rate limit
    - Clave inválida, mal copiada o revocada: 400, 403, API_KEY_INVALID, PERMISSION_DENIED, invalid api key
    - Errores de servidor y sobrecarga de Google AI Studio: 500, 503, INTERNAL, UNAVAILABLE, high demand, overloaded
    """
    err_str = str(exc).lower()
    return any(keyword in err_str for keyword in [
        "429", "resource_exhausted", "quota", "rate limit", "ratelimit",
        "400", "403", "api_key_invalid", "permission_denied", "invalid api key",
        "api key not valid", "unauthenticated", "forbidden",
        "500", "internal",
        "503", "unavailable", "servererror", "high demand", "overloaded",
        "temporary", "service unavailable"
    ])

def is_retriable_error(exc: Exception) -> bool:
    """Detecta si un error de Gemini es temporal/500/503/UNAVAILABLE/INTERNAL para reintentar localmente si no hay más claves."""
    err_str = str(exc).lower()
    return any(keyword in err_str for keyword in [
        "503", "unavailable", "servererror", "high demand", "overloaded",
        "temporary", "service unavailable",
        "500", "internal"
    ])

def get_safety_settings():
    try:
        from google.genai import types
        categories = [
            "HARM_CATEGORY_HARASSMENT",
            "HARM_CATEGORY_HATE_SPEECH",
            "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "HARM_CATEGORY_DANGEROUS_CONTENT",
            "HARM_CATEGORY_CIVIC_INTEGRITY"
        ]
        settings = []
        for cat_name in categories:
            cat = getattr(types.HarmCategory, cat_name, None)
            if cat is not None:
                settings.append(types.SafetySetting(
                    category=cat,
                    threshold=types.HarmBlockThreshold.BLOCK_NONE
                ))
        return settings
    except Exception:
        return []

def extract_transcript_text(response) -> str:
    if not response:
        return ""
    text = ""
    try:
        if hasattr(response, "text") and response.text:
            text = response.text.strip()
    except Exception:
        pass
    
    if not text and hasattr(response, "candidates") and response.candidates:
        cand = response.candidates[0]
        if hasattr(cand, "content") and cand.content:
            parts = getattr(cand.content, "parts", []) or []
            extracted = [getattr(p, "text", "") for p in parts if getattr(p, "text", None)]
            if extracted:
                text = "".join(extracted).strip()
    return text

def get_system_instruction(audio_type: str = "clase") -> str:
    if audio_type == "continuo":
        speaker_rules = """3. SIN DIFERENCIAR HABLANTES (TEXTO CONTINUO EN PÁRRAFOS):
   - NO incluyas ninguna etiqueta de orador bajo ninguna circunstancia.
   - Transcribe todo el texto de corrido organizado únicamente en párrafos limpios, legibles y naturales, con puntos y aparte claros ante cada cambio de tema o pausa temática, sin prefijos ni números al inicio."""
    elif audio_type == "entrevista":
        speaker_rules = """3. IDENTIFICACIÓN DE ORADORES (ENTREVISTA):
   - Si en el audio o en los términos clave se conocen o mencionan los nombres de los participantes (ejemplo: el entrevistador y el entrevistado se presentan o son presentados), utiliza sus NOMBRES REALES en negrita como etiqueta de orador (ejemplo: **[Nombre del entrevistador]:** y **[Nombre del entrevistado]:**).
   - Si no se mencionan nombres propios, utiliza de principio a fin las etiquetas en negrita:
     * **Entrevistador:** para quien realiza las preguntas.
     * **Entrevistado:** (o **Entrevistado 1:**, **Entrevistado 2:** si hubiese varios) para quien responde.
   - Si habla una sola persona (relato o monólogo): separa obligatoriamente en párrafos naturales y legibles con puntos y aparte ante cada cambio de tema."""
    elif audio_type == "radio":
        speaker_rules = """3. IDENTIFICACIÓN DE ORADORES (RADIO / PODCAST / DEBATE):
   - Si los conductores, periodistas, columnistas o invitados se presentan o son nombrados en la emisión, utiliza sus NOMBRES REALES en negrita como etiqueta de orador (ejemplo: **[Nombre del conductor]:**, **[Nombre del columnista]:**, **[Nombre del invitado]:**).
   - Si no se mencionan sus nombres propios, identifica a los participantes de principio a fin de forma fija y correlativa como **Persona 1:**, **Persona 2:**, **Persona 3:**, etc., manteniendo siempre la misma etiqueta para la misma voz.
   - Separa cada intervención en párrafos limpios y claros, con puntos y aparte."""
    else:  # clase / teórico
        speaker_rules = """3. IDENTIFICACIÓN PRECISA DE ORADORES Y AUDIOS EXTERNOS (CLASE / TEÓRICO):
   - ORADORES EN EL AULA (DOCENTE Y ALUMNOS):
     * **Docente:** para el profesor o expositor principal de la clase (o **Docente [Nombre]:** si el profesor se presenta o es nombrado, ej: **Docente (Profesor Rossi):**).
     * ALUMNOS Y PREGUNTAS: Identifica a los estudiantes que intervienen asignando un identificador claro a cada voz:
       - Si el alumno se presenta o el docente lo llama por su nombre (ej: "Juan", "Sofía"), puedes etiquetarlo como **Estudiante (Juan):** o **Juan:**.
       - Si no se conoce el nombre, numéralos correlativamente según cada voz distinta (**Estudiante 1:**, **Estudiante 2:**, **Estudiante 3:**... pudiendo llegar a **Estudiante 10:** o más si intervienen varias personas distintas). NUNCA agrupes voces diferentes bajo un mismo número.
       - ACOTACIONES BREVES EN EL AULA: Si un alumno hace una pregunta o acotación de pocas palabras (por ejemplo: "¿Qué?", "El podcast...", "Sí.", "Una duda", "Una consulta", "¿De quién?"), dale OBLIGATORIAMENTE su propia línea y etiqueta de estudiante (**Estudiante N:**). NUNCA descartes estas acotaciones ni las fusiones dentro del párrafo del docente.
   - AUDIOS Y MATERIALES EXTERNOS REPRODUCIDOS EN CLASE:
     * Cuando en clase se reproduce un audio externo (programas de radio, streaming, televisión, llamadas, entrevistas o música), transcribe con precisión distinguiendo los hablantes del audio reproducido con estas etiquetas acordes a lo que se escucha y a lo que introduce el docente:
       - Si el docente introduce al personaje o columnista por su nombre antes o durante la reproducción (ej.: "se llama Sergio", "vamos a escuchar a Javier Negre", "Luca Prodan"): UTILIZA ESE NOMBRE EXACTO en la etiqueta (ejemplo: **Sergio en audio:**, **Javier Negre en audio:**, **Luca Prodan en audio:**).
       - Para el locutor o conductor del programa de radio/TV donde se emite la columna o entrevista: **Conductor en audio:** o **Entrevistador en audio:** (o **Periodista en audio:**).
       - Para aperturas o locuciones breves de radio: **Voz en audio:** o **Locutor en audio:**.
       - Para cortinas o separadores de radio: **Cortina musical en audio:**.
       - Para temas musicales reproducidos: **Canción en audio:** (indicando el título o banda si se escucha o se nombra).
       - Para trabajos o audios de alumnos reproducidos por el docente: **Audio de alumna:** o **Audio de alumno:**.
       - Para llamadas judiciales, estafas o testimonios generales: **Audio:**.
       - Para avisos comerciales: **Publicidad en audio:**.
     * NUNCA omitas ni dejes sin etiquetar los audios reproducidos en el aula, y NUNCA los fusiones dentro de la voz del docente."""

    return f"""Actúa como un taquígrafo profesional y motor de transcripción de máxima fidelidad textual.
Tu única tarea es transcribir exactamente cada palabra pronunciada en el audio de principio a fin de forma fiel, con una estructura de lectura limpia, clara y sin marcas de tiempo.

REGLAS ESTRICTAS DE TRANSCRIPCIÓN Y FORMATO:
1. FIDELIDAD TEXTUAL ABSOLUTA (VERBATIM ESTRICTO): Transcribe el contenido íntegro del audio de principio a fin sin resumir, sin sintetizar y sin omitir frases ni explicaciones. Transcribe hasta la última palabra del archivo.
   - NUNCA inventes, cambies ni sustituyas nombres de bandas, canciones, radios, marcas ni autores por otros parecidos. Transcribe estrictamente lo que se pronuncia en el audio de forma literal.
2. TOLERANCIA A AUDIOS DIFÍCILES Y CAPTURA DE TODAS LAS VOCES:
   - Captura y transcribe rigurosamente TODAS las intervenciones orales del aula: tanto la voz principal del docente como la de cualquier estudiante que hable desde los laterales del aula (canal izquierdo o derecho), el fondo o lejos del micrófono, por breves que sean sus intervenciones.
   - No descartes las intervenciones de los alumnos como ruido: aísla únicamente ruidos mecánicos o golpes y transcribe con máxima fidelidad cada turno de habla.
{speaker_rules}
4. LIMPIEZA DE HABLA (FLUIDEZ):
   - Elimina repeticiones involuntarias y tartamudeos accidentales (ej.: "de de de" -> "de", "con- contrastivas" -> "contrastivas", "pe- presentar" -> "presentar").
   - Omite muletillas sonoras y vacilaciones como "eh", "mmm", "este...", manteniendo intactas todas las demás palabras pronunciadas.
5. USO DE COMILLAS:
   - No utilices comillas angulares («...»). Emplea comillas dobles estándar ("...") para citas, términos específicos o ejemplos mencionados.
6. PROHIBIDAS LAS MARCAS DE TIEMPO: Está terminantemente prohibido incluir marcas de tiempo, timestamps, segundos o minutos (nada de [mm:ss], [hh:mm:ss] ni numeración de tiempo en ninguna parte).
7. PROHIBIDO DEVOLVER BLOQUES DENSOS: No entregues textos continuos en un solo bloque denso sin saltos de línea.
8. SIN INTRODUCCIONES NI NOTAS: No agregues notas, comentarios ni saludos. Comienza directamente con la transcripción."""

def get_user_prompt(audio_type: str = "clase", keywords: Optional[str] = None) -> str:
    if audio_type == "continuo":
        speaker_hint = """- Formato: SIN etiquetas de orador. Transcribe el texto de corrido organizado únicamente en párrafos limpios con puntos y aparte claros."""
    elif audio_type == "entrevista":
        speaker_hint = """- Formato de oradores: Identifica a los participantes por sus nombres reales si se mencionan o se conocen (ej: **[Nombre]:**); si no se nombran, utiliza obligatoriamente **Entrevistador:** y **Entrevistado:**."""
    elif audio_type == "radio":
        speaker_hint = """- Formato de oradores: Identifica a los participantes por sus nombres reales si se mencionan en la emisión (ej: **[Nombre]:**); si no se nombran, utiliza estrictamente **Persona 1:**, **Persona 2:**, etc."""
    else:
        speaker_hint = """- Formato de oradores en aula:
  * Docente: usa **Docente:** (o **Docente [Nombre]:** si se menciona).
  * Alumnos: usa **Estudiante 1:**, **Estudiante 2:**, **Estudiante 3:**... (o el nombre del alumno si el docente lo nombra, ej: **Estudiante (Lucas):**), asignando un número único correlativo a cada voz distinta que hable en el aula. Nunca agrupes personas distintas bajo el mismo número.
  * Acotaciones breves: captura siempre las preguntas y comentarios cortos de alumnos en su propia línea separada (ej.: "¿Qué?", "El podcast...", "Sí.", "Una duda", "¿De quién?").
- Audios reproducidos en clase: transcribe todos los audios pasados por el docente identificando el orador según el contexto:
  * Si el docente lo nombra o se presenta: usa ese nombre exacto (ej: **Sergio en audio:**, **Javier Negre en audio:**, **Luca Prodan en audio:**).
  * En radio y entrevistas: **Conductor en audio:**, **Entrevistador en audio:**, **Periodista en audio:**, **Voz en audio:** o **Locutor en audio:**.
  * Música, publicidades y clips: **Cortina musical en audio:**, **Canción en audio:**, **Publicidad en audio:**, **Audio de alumna:** o **Audio:**."""

    keywords_instruction = ""
    clean_kw = (keywords or "").strip()
    if clean_kw:
        keywords_instruction = f"\n- Términos clave, autores y oradores: transcribe con exacta fidelidad ortográfica los siguientes términos y nombres: {clean_kw}. Si alguno de estos nombres corresponde a un orador del audio, utilízalo como su etiqueta de orador correspondiente."

    return f"""Transcribe todo el audio adjunto de principio a fin de forma fiel, exacta y completa sin resumir:
- Fidelidad estricta: transcribe literalmente cada palabra sin inventar ni cambiar nombres de bandas, canciones, radios ni autores.
- Captura integral de voces: transcribe a todos los participantes del aula (tanto al docente como a los estudiantes que acotan o preguntan desde los lados o fondo) y a todos los audios reproducidos.
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

@app.get("/api/key-pool")
async def get_key_pool():
    keys = parse_api_keys(os.getenv("GEMINI_API_KEY", ""))
    return {
        "has_keys": len(keys) > 0,
        "keys": keys,
        "default_model": os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    }

@app.get("/api/upload-keys")
async def get_upload_keys():
    """Entrega el pool de claves del .env para subida directa por Cloudflare con rotación."""
    pool = parse_api_keys(os.getenv("GEMINI_API_KEY", ""))
    return {"keys": pool}

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

    # Sanitizar el nombre del archivo para generar un nombre seguro en ASCII sin tildes ni eñes
    safe_filename = sanitize_filename(Path(file.filename).name)
    temp_filename = f"{uuid.uuid4().hex}_{safe_filename}"
    local_temp_path = TEMP_DIR / temp_filename

    google_file = None
    client = None

    try:
        from google import genai
        from google.genai import types

        with open(local_temp_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                f.write(chunk)

        gen_config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.0,
            max_output_tokens=65536,
            safety_settings=get_safety_settings()
        )

        transcript_text = ""
        last_error = None

        # Bucle de rotación de claves completo: cada clave sube su propio archivo, espera y transcribe
        for k_idx, current_key in enumerate(key_pool):
            client = None
            google_file = None
            try:
                # 1. Instanciar client con la clave actual
                client = genai.Client(api_key=current_key)

                # 2. Subir el archivo local temporal con ese mismo client
                google_file = client.files.upload(
                    file=str(local_temp_path),
                    config=types.UploadFileConfig(
                        mime_type=mime_type,
                        display_name=safe_filename
                    )
                )

                # 3. Esperar a que pase a ACTIVE con ese mismo client
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
                    raise Exception(f"Google no pudo procesar el archivo. Estado: {google_file.state.name}")

                # 4. Ejecutar generate_content con reintentos en el mismo archivo ante 503
                response = None
                for attempt in range(1, 4):
                    try:
                        response = client.models.generate_content(
                            model=target_model_name,
                            contents=[
                                google_file,
                                user_prompt
                            ],
                            config=gen_config
                        )
                        break
                    except Exception as gen_err:
                        if is_retriable_error(gen_err) and attempt < 3:
                            time.sleep(3)
                            continue
                        raise gen_err

                transcript_text = extract_transcript_text(response)
                if not transcript_text:
                    raise Exception("La API de Gemini devolvió una transcripción vacía.")

                # Transcripción exitosa conseguida con esta clave
                break

            except Exception as exc:
                last_error = exc
                # Si ocurre 429, 400, 403, 500, 503, cuota agotada, sobrecarga o error de servidor y hay más claves, rotar de inmediato
                if is_rotatable_error(exc) and k_idx + 1 < len(key_pool):
                    time.sleep(1)
                    continue
                # Si no es error rotativo o es la última clave, propagar el error
                if isinstance(exc, HTTPException):
                    raise exc
                if k_idx + 1 >= len(key_pool):
                    raise exc
                # Para cualquier otro error irrecuperable en esta key si no es rotativo, relanzar
                raise exc

            finally:
                # 5. Limpiar inmediatamente el archivo en Google Files API para esta clave
                if client and google_file and getattr(google_file, "name", None):
                    try:
                        client.files.delete(name=google_file.name)
                    except Exception:
                        pass

        if not transcript_text:
            raise HTTPException(
                status_code=500,
                detail=f"No se pudo completar la transcripción con ninguna de las claves disponibles: {str(last_error)}"
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
        # Limpieza garantizada del archivo temporal local en disco
        if local_temp_path and os.path.exists(local_temp_path):
            try:
                os.remove(local_temp_path)
            except Exception:
                pass

        gc.collect()

class UploadSessionRequest(BaseModel):
    filename: str
    mime_type: str
    file_size: int
    api_key: Optional[str] = None

@app.post("/api/get-upload-session")
async def get_upload_session(req: UploadSessionRequest):
    if not req.filename or not req.mime_type or not req.file_size:
        raise HTTPException(status_code=400, detail="Faltan parámetros obligatorios (filename, mime_type, file_size).")

    key_pool = parse_api_keys(req.api_key)
    if not key_pool:
        key_pool = parse_api_keys(os.getenv("GEMINI_API_KEY", ""))

    if not key_pool:
        raise HTTPException(
            status_code=400,
            detail="No se encontró ninguna API Key válida en el cliente ni en el archivo .env del servidor."
        )

    safe_name = sanitize_filename(req.filename)
    payload_data = json.dumps({
        "file": {
            "display_name": safe_name
        }
    }).encode("utf-8")

    last_error = None
    for k_idx, current_key in enumerate(key_pool):
        url = f"https://generativelanguage.googleapis.com/upload/v1beta/files?key={current_key}"
        headers = {
            "X-Goog-Upload-Protocol": "resumable",
            "X-Goog-Upload-Command": "start",
            "X-Goog-Upload-Header-Content-Length": str(req.file_size),
            "X-Goog-Upload-Header-Content-Type": req.mime_type,
            "Content-Type": "application/json"
        }

        try:
            http_req = urllib.request.Request(url, data=payload_data, headers=headers, method="POST")
            with urllib.request.urlopen(http_req, timeout=15) as response:
                upload_url = response.headers.get("x-goog-upload-url")
                if upload_url:
                    return JSONResponse({
                        "upload_url": upload_url,
                        "key_index": k_idx
                    })
                else:
                    raise Exception("No se recibió 'x-goog-upload-url' en las cabeceras de respuesta de Google.")
        except urllib.error.HTTPError as http_err:
            last_error = http_err
            # Si es rotativo y hay más claves, rotar
            if is_rotatable_error(http_err) and k_idx + 1 < len(key_pool):
                time.sleep(1)
                continue
            if k_idx + 1 >= len(key_pool):
                raise HTTPException(
                    status_code=http_err.code if http_err.code in (400, 403, 429) else 500,
                    detail=f"Google Files API rechazó la sesión de subida: {http_err.reason}"
                )
            raise http_err
        except Exception as exc:
            last_error = exc
            if is_rotatable_error(exc) and k_idx + 1 < len(key_pool):
                time.sleep(1)
                continue
            if k_idx + 1 >= len(key_pool):
                raise HTTPException(status_code=500, detail=f"Error al iniciar sesión de subida con Google: {str(exc)}")
            raise exc

    raise HTTPException(status_code=500, detail=f"No se pudo crear sesión de subida con ninguna API Key: {str(last_error)}")

class CreateUploadSessionRequest(BaseModel):
    filename: str
    file_size: int
    mime_type: Optional[str] = "audio/mp3"
    api_key: Optional[str] = None

@app.post("/api/create-upload-session")
async def create_upload_session(req: CreateUploadSessionRequest):
    key_pool = []
    if req.api_key:
        key_pool.extend(parse_api_keys(req.api_key))
    for k in parse_api_keys(os.getenv("GEMINI_API_KEY", "")):
        if k not in key_pool:
            key_pool.append(k)

    if not key_pool:
        raise HTTPException(status_code=400, detail="No hay claves configuradas en el servidor (.env).")

    clean_mime = sanitize_audio_mime(req.filename, req.mime_type or "audio/mp3")
    safe_display_name = sanitize_filename(req.filename)

    last_err = None
    for k_idx, current_key in enumerate(key_pool):
        try:
            init_url = f"https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key={current_key}"
            payload = json.dumps({"file": {"display_name": safe_display_name, "mime_type": clean_mime}}).encode("utf-8")
            
            headers = {
                "X-Goog-Upload-Protocol": "resumable",
                "X-Goog-Upload-Command": "start",
                "X-Goog-Upload-Header-Content-Length": str(req.file_size),
                "X-Goog-Upload-Header-Content-Type": clean_mime,
                "Content-Type": "application/json",
                "x-goog-api-key": current_key
            }
            
            req_obj = urllib.request.Request(init_url, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req_obj, timeout=15) as resp:
                upload_url = resp.headers.get("x-goog-upload-url") or resp.headers.get("X-Goog-Upload-URL")
                if upload_url:
                    return JSONResponse({
                        "success": True,
                        "upload_url": upload_url,
                        "key_used": current_key,
                        "mime_type": clean_mime
                    })
        except Exception as e:
            last_err = e
            continue

    raise HTTPException(
        status_code=500, 
        detail=f"No se pudo iniciar la sesión de subida en Google con ninguna de las {len(key_pool)} claves: {str(last_err)}"
    )

def get_transcription_prompts(audio_type: Optional[str] = "clase", keywords: Optional[str] = "") -> tuple[str, str]:
    effective_audio_type = (audio_type or "clase").lower().strip()
    if effective_audio_type not in ["clase", "entrevista", "continuo", "radio"]:
        effective_audio_type = "clase"
    clean_keywords = (keywords or "").strip()
    return get_system_instruction(effective_audio_type), get_user_prompt(effective_audio_type, clean_keywords)

class TranscribeFileUriRequest(BaseModel):
    file_uri: Optional[str] = None
    file_name: Optional[str] = None
    mime_type: Optional[str] = "audio/mp3"
    audio_type: Optional[str] = "clase"
    keywords: Optional[str] = ""
    api_key: Optional[str] = None
    model_name: Optional[str] = "gemini-3.8-flash"

import traceback
import time

@app.post("/api/transcribe-file-uri")
async def transcribe_file_uri(req: TranscribeFileUriRequest):
    from google import genai
    from google.genai import types

    # 1. Utilizar estrictamente la clave con la que el archivo fue subido
    current_key = (req.api_key or "").strip()
    if not current_key:
        server_keys = parse_api_keys(os.getenv("GEMINI_API_KEY", ""))
        current_key = server_keys[0] if server_keys else None

    if not current_key:
        raise HTTPException(status_code=400, detail="No se encontró una API Key válida.")

    file_name = (req.file_name or "").strip()
    if not file_name and req.file_uri:
        if "/files/" in req.file_uri:
            file_name = "files/" + req.file_uri.split("/files/")[-1].split("?")[0]

    if file_name and not file_name.startswith("files/"):
        file_name = f"files/{file_name}"

    if not file_name:
        raise HTTPException(status_code=400, detail="No se especificó un identificador de archivo (file_name) válido.")

    clean_mime = sanitize_audio_mime(file_name, req.mime_type or "audio/mp3")
    system_instruction, user_prompt = get_transcription_prompts(req.audio_type, req.keywords)

    # Configuración limpia 100% compatible con multimodalidad de audio (sin thinking_config)
    gen_config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.0,
        max_output_tokens=65536,
        safety_settings=get_safety_settings()
    )

    client = genai.Client(api_key=current_key)
    google_file = None

    # 2. Espera activa hasta que Google confirme estado ACTIVE (hasta 90s para audios > 100 MB)
    is_active = False
    for attempt in range(1, 46):
        try:
            google_file = await asyncio.to_thread(client.files.get, name=file_name)
            state_obj = getattr(google_file, "state", None)
            state_name = getattr(state_obj, "name", str(state_obj)).upper()
            print(f"[Google Files API] Esperando audio ({attempt}/45): {state_name} | mime={getattr(google_file, 'mime_type', '')}")

            if "ACTIVE" in state_name:
                is_active = True
                break
            elif "FAIL" in state_name:
                raise Exception("Google Files API reportó fallo al procesar el archivo de audio.")
        except Exception as e:
            if "reportó fallo" in str(e):
                raise HTTPException(status_code=500, detail=str(e))
            print(f"[Google Files API] Intento {attempt}/45: {e}")

        await asyncio.sleep(2)

    if not google_file or not is_active:
        raise HTTPException(status_code=500, detail="El audio no alcanzó el estado ACTIVE en Google Files API.")

    # Asegurar que el objeto File tenga el MIME type oficial aceptado por Gemini (audio/mp4 para .m4a)
    try:
        raw_mime = getattr(google_file, "mime_type", "") or clean_mime
        display_fn = getattr(google_file, "display_name", "") or file_name
        google_file.mime_type = sanitize_audio_mime(display_fn, raw_mime if raw_mime != "application/octet-stream" else clean_mime)
    except Exception:
        pass

    # 3. Llamar a Gemini ("gemini-3.8-flash") con reintentos ante errores temporales o de cuota (429/503)
    target_model_name = "gemini-3.8-flash"
    last_exc = None

    for gen_attempt in range(1, 4):
        try:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=target_model_name,
                contents=[google_file, user_prompt],
                config=gen_config
            )

            transcript_text = extract_transcript_text(response)
            if not transcript_text:
                finish_reason = ""
                try:
                    if response and getattr(response, "candidates", None):
                        finish_reason = f" (finish_reason={getattr(response.candidates[0], 'finish_reason', '')})"
                except Exception:
                    pass
                raise Exception(f"Gemini devolvió una transcripción vacía{finish_reason}.")

            # Limpiar archivo temporal de Google tras transcribir exitosamente
            try:
                await asyncio.to_thread(client.files.delete, name=google_file.name)
            except Exception:
                pass

            return JSONResponse({
                "success": True,
                "transcript": transcript_text,
                "model_used": target_model_name
            })

        except Exception as exc:
            last_exc = exc
            err_str = str(exc)
            print(f"[WARN GENERATE CONTENT] Intento {gen_attempt}/3 falló: {err_str}")
            if gen_attempt < 3 and any(code in err_str.upper() for code in ["429", "503", "RESOURCE_EXHAUSTED", "UNAVAILABLE", "QUOTA", "OVERLOADED", "TIMEOUT", "VACÍA", "EMPTY"]):
                time.sleep(5)
                continue
            break

    traceback.print_exc()
    error_detail = str(last_exc)
    if hasattr(last_exc, "message"):
        error_detail = last_exc.message
    print(f"[ERROR GENERATE CONTENT]: {error_detail}")
    raise HTTPException(
        status_code=500,
        detail=f"Error durante la transcripción directa: {error_detail}"
    )

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

        target_model_name = "gemini-3.8-flash"

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
            temperature=0.0,
            max_output_tokens=65536,
            safety_settings=get_safety_settings()
        )

        response = None
        current_k_idx = 0

        while current_k_idx < len(key_pool):
            curr_key = key_pool[current_k_idx]
            curr_client = genai.Client(api_key=curr_key)
            should_rotate = False
            has_next = (current_k_idx + 1 < len(key_pool))
            max_attempts = 1 if has_next else 3

            for attempt in range(1, max_attempts + 1):
                try:
                    response = curr_client.models.generate_content(
                        model=target_model_name,
                        contents=[user_content],
                        config=config
                    )
                    break
                except Exception as api_err:
                    if is_rotatable_error(api_err):
                        if has_next:
                            should_rotate = True
                            break
                        else:
                            raise api_err
                    elif is_retriable_error(api_err) and attempt < max_attempts:
                        await asyncio.sleep(2)
                    else:
                        raise api_err

            if response is not None:
                break

            if should_rotate:
                current_k_idx += 1
                await asyncio.sleep(1)
            else:
                break

        summary_text = extract_transcript_text(response)
        return JSONResponse({
            "success": True,
            "summary": summary_text
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar el resumen: {str(e)}")

@app.post("/api/summarize-pdf")
async def summarize_pdf(
    file: UploadFile = File(...),
    api_key: Optional[str] = Form(None),
    model_name: Optional[str] = Form("gemini-3.8-flash")
):
    """
    Genera un resumen analítico y riguroso de un PDF académico para Ciencias Sociales
    utilizando Google AI Studio Files API y rotación segura de claves en el key_pool.
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No se seleccionó ningún archivo PDF.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="El archivo proporcionado no es un PDF válido.")

    raw_pool = []
    if api_key:
        raw_pool.extend(parse_api_keys(api_key))

    env_key = os.environ.get("GEMINI_API_KEY")
    if env_key:
        raw_pool.extend(parse_api_keys(env_key))

    key_pool = []
    seen = set()
    for k in raw_pool:
        if k not in seen:
            seen.add(k)
            key_pool.append(k)

    if not key_pool:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una API Key válida. Ingrésala en la interfaz o configúrala en el servidor."
        )

    safe_filename = sanitize_filename(file.filename)
    unique_prefix = uuid.uuid4().hex[:8]
    local_temp_path = TEMP_DIR / f"pdf_{unique_prefix}_{safe_filename}.pdf"

    try:
        from google import genai
        from google.genai import types

        # Guardar temporalmente el PDF en disco
        with local_temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        target_model_name = "gemini-3.8-flash"

        system_instruction = (
            "Actúa como un profesor universitario y analista de textos académicos de Ciencias Sociales. "
            "A partir del texto en PDF provisto, generá un resumen analítico riguroso, profundo y exhaustivo para preparación de exámenes de grado. "
            "Estructurá el análisis académico en estas 5 secciones en Markdown sin omitir ninguna:\n\n"
            "### 🎯 Tesis Central y Debate Teórico\n"
            "(Explica la hipótesis central del autor, el problema epistemológico/social que aborda y con qué tradiciones teóricas o autores dialoga o polemiza en el texto).\n\n"
            "### 💡 Núcleo Conceptual y Categorías de Análisis\n"
            "(Define con máxima precisión técnica cada concepto fundamental, categoría teórica y término analítico central introducido o discutido por el autor).\n\n"
            "### 🧭 Desarrollo de la Argumentación y Casos Empíricos\n"
            "(Desglosa paso a paso la estructura del razonamiento: cómo fundamenta sus argumentos, qué metodología o ejemplos de campo utiliza y cómo llega a sus conclusiones).\n\n"
            "### 📌 Citas Textuales Clave para Exámenes\n"
            "(Extrae citas textuales representativas del PDF indispensables para fundamentar respuestas teóricas en instancias de evaluación).\n\n"
            "### ❓ 5 Preguntas Guía Tipo Parcial\n"
            "(Formula exactamente 5 preguntas conceptuales de parcial de Sociales/UBA sobre este texto, y redactá la respuesta teórica sintética que la cátedra espera)."
        )

        user_prompt = "Por favor, analizá y generá el resumen académico riguroso de este documento PDF siguiendo al pie de la letra las 5 secciones solicitadas sin omitir ninguna."

        gen_config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
            max_output_tokens=8192,
            safety_settings=get_safety_settings()
        )

        summary_text = None
        last_error = None

        for k_idx, current_key in enumerate(key_pool):
            client = None
            google_file = None
            try:
                # 1. Instanciar client con la clave actual
                client = genai.Client(api_key=current_key)

                # 2. Subir el archivo PDF a Files API
                google_file = client.files.upload(
                    file=str(local_temp_path),
                    config=types.UploadFileConfig(
                        mime_type="application/pdf",
                        display_name=safe_filename
                    )
                )

                # 3. Esperar a que pase a estado ACTIVE
                max_wait_seconds = 180
                start_time = time.time()
                while google_file.state.name == "PROCESSING":
                    if time.time() - start_time > max_wait_seconds:
                        raise HTTPException(
                            status_code=504,
                            detail="Tiempo de espera agotado mientras Google procesaba el archivo PDF."
                        )
                    time.sleep(1)
                    google_file = client.files.get(name=google_file.name)

                if google_file.state.name != "ACTIVE":
                    raise Exception(f"Google no pudo procesar el PDF. Estado: {google_file.state.name}")

                # 4. Generar contenido con el modelo
                has_next_key = (k_idx + 1 < len(key_pool))
                max_attempts = 1 if has_next_key else 3
                response = None
                for attempt in range(1, max_attempts + 1):
                    try:
                        response = client.models.generate_content(
                            model=target_model_name,
                            contents=[
                                google_file,
                                user_prompt
                            ],
                            config=gen_config
                        )
                        break
                    except Exception as gen_err:
                        if is_rotatable_error(gen_err) and has_next_key:
                            raise gen_err
                        if is_retriable_error(gen_err) and attempt < max_attempts:
                            time.sleep(2)
                        else:
                            raise gen_err

                summary_text = extract_transcript_text(response)
                if not summary_text:
                    raise Exception("La API de Gemini devolvió un resumen vacío.")

                break

            except Exception as exc:
                last_error = exc
                if is_rotatable_error(exc) and k_idx + 1 < len(key_pool):
                    time.sleep(1)
                    continue
                if isinstance(exc, HTTPException):
                    raise exc
                if k_idx + 1 >= len(key_pool):
                    raise exc
                raise exc

            finally:
                # 5. Eliminar siempre el archivo en Google Files API
                if client and google_file and getattr(google_file, "name", None):
                    try:
                        client.files.delete(name=google_file.name)
                    except Exception:
                        pass

        if not summary_text:
            raise HTTPException(
                status_code=500,
                detail=f"No se pudo completar el resumen académico del PDF con ninguna clave: {str(last_error)}"
            )

        return JSONResponse({
            "success": True,
            "summary": summary_text,
            "filename": file.filename,
            "model_used": target_model_name
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado al resumir el PDF: {str(e)}"
        )
    finally:
        # Limpieza del archivo temporal local
        if local_temp_path.exists():
            try:
                local_temp_path.unlink()
            except Exception:
                pass

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
    title_run = title.add_run(f"Transcripción: {clean_base}")
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
    
    # Párrafos e intervenciones de la transcripción con formato académico estricto
    raw_paras = [p.strip() for p in req.transcript.split("\n") if p.strip()]
    for line in raw_paras:
        p = doc.add_paragraph()
        # Formato académico: Espaciado posterior 6 pt, interlineado 1.15
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15

        # Detectar si la línea inicia con una etiqueta de hablante (con o sin asteriscos markdown)
        m = re.match(r'^\*{0,2}([A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\(\)]+:)\*{0,2}\s*(.*)$', line)

        if m:
            speaker = m.group(1).replace('*', '').strip()
            speech = m.group(2).replace('*', '').strip()

            r_spk = p.add_run(speaker + " ")
            r_spk.bold = True
            r_spk.font.name = "Calibri"
            r_spk.font.size = Pt(11)
            r_spk.font.color.rgb = RGBColor(15, 23, 42)  # Azul oscuro/negro pizarra

            if speech:
                r_text = p.add_run(speech)
                r_text.font.name = "Calibri"
                r_text.font.size = Pt(11)
                r_text.font.color.rgb = RGBColor(51, 65, 85)  # Slate oscuro
        else:
            r_text = p.add_run(line.replace('*', ''))
            r_text.font.name = "Calibri"
            r_text.font.size = Pt(11)
            r_text.font.color.rgb = RGBColor(51, 65, 85)

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

@app.get("/")
async def read_root():
    index_path = Path("static/index.html")
    if not index_path.exists():
        index_path = Path(__file__).parent / "static" / "index.html"
    return FileResponse(index_path)

# Montar carpeta estática
STATIC_DIR = Path("static")
if not STATIC_DIR.exists():
    try:
        STATIC_DIR.mkdir(exist_ok=True, parents=True)
    except Exception:
        pass

app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Iniciando servidor en http://localhost:{port} (host: {host})...")
    uvicorn.run("app:app", host=host, port=port)
