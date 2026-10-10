# 🎙️ FacuHelps — Transcripción Inteligente de Clases y Entrevistas

Aplicación web moderna y minimalista para transcribir audios largos (clases magistrales, conferencias y entrevistas de hasta 2 horas) utilizando los modelos **Gemini Flash** y la **Files API** de Google AI Studio.

---

## ✨ Características

- **Gestión eficiente de audios**: Modo rápido inline para audios menores a 20 MB y uso de **Google Files API** para audios largos de hasta 2 horas.
- **Transcripciones de alta fidelidad (Verbatim)**: Transcripción completa, textual palabra por palabra, estructurada en párrafos con marcas de tiempo (`[hh:mm:ss]`).
- **Bucle de continuación multiciclo**: Evita cortes prematuros en audios extensos.
- **Múltiples formatos de exportación**:
  - 📄 **Microsoft Word (.docx)** con estilos visuales y marcas de tiempo formateadas.
  - 📝 **Archivo de texto plano (.txt)**.
  - 📑 **Markdown (.md)**.
  - 📋 **Copiar al portapapeles con un clic**.
- **Configuración flexible de API Key**: Ingreso seguro desde la interfaz web (almacenado en el navegador) o vía variable de entorno / archivo `.env`.

---

## 🚀 Despliegue en Render (Web Service Gratuito)

1. **Subir el código a GitHub**:
   - Crea un repositorio en GitHub (público o privado) y sube este código.
2. **Crear Web Service en Render**:
   - Ve a [dashboard.render.com](https://dashboard.render.com/) y haz clic en **New +** ➔ **Web Service**.
   - Conecta tu repositorio de GitHub.
   - Configuración:
     - **Name**: `facuhelps` (o el que prefieras).
     - **Runtime**: `Python 3`.
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
     - **Plan**: `Free`.
3. Haz clic en **Create Web Service**. ¡En 2 minutos estará disponible en internet con HTTPS gratuito!
