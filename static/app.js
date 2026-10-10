document.addEventListener("DOMContentLoaded", () => {
  // Inicializar Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Elementos DOM
  const btnApiKeyToggle = document.getElementById("btnApiKeyToggle");
  const apiKeyStatusLabel = document.getElementById("apiKeyStatusLabel");
  const apiKeyModal = document.getElementById("apiKeyModal");
  const btnCloseApiKeyModal = document.getElementById("btnCloseApiKeyModal");
  const inputApiKey = document.getElementById("inputApiKey");
  const btnToggleShowKey = document.getElementById("btnToggleShowKey");
  const btnSaveApiKey = document.getElementById("btnSaveApiKey");
  const envKeyNotice = document.getElementById("envKeyNotice");
  const selectModel = document.getElementById("selectModel");

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const filePreview = document.getElementById("filePreview");
  const fileName = document.getElementById("fileName");
  const fileDetails = document.getElementById("fileDetails");
  const btnRemoveFile = document.getElementById("btnRemoveFile");
  const btnStartTranscribe = document.getElementById("btnStartTranscribe");

  const progressCard = document.getElementById("progressCard");
  const progressTitle = document.getElementById("progressTitle");
  const progressSubtitle = document.getElementById("progressSubtitle");
  const elapsedTimer = document.getElementById("elapsedTimer");
  const stepLocal = document.getElementById("step-local");
  const stepCloud = document.getElementById("step-cloud");
  const stepGemini = document.getElementById("step-gemini");

  const errorAlert = document.getElementById("errorAlert");
  const errorTitle = document.getElementById("errorTitle");
  const errorMessage = document.getElementById("errorMessage");
  const btnCloseError = document.getElementById("btnCloseError");

  const resultSection = document.getElementById("resultSection");
  const resultFileName = document.getElementById("resultFileName");
  const resultModelBadge = document.getElementById("resultModelBadge");
  const completedBadge = document.getElementById("completedBadge");
  const streamingIndicator = document.getElementById("streamingIndicator");
  const transcriptContainer = document.getElementById("transcriptContainer");
  const transcriptContent = document.getElementById("transcriptContent");
  const btnCopy = document.getElementById("btnCopy");
  const btnCopyLabel = document.getElementById("btnCopyLabel");
  const btnDownloadDocx = document.getElementById("btnDownloadDocx");
  const btnDownloadTxt = document.getElementById("btnDownloadTxt");
  const btnDownloadMd = document.getElementById("btnDownloadMd");
  const searchTranscript = document.getElementById("searchTranscript");
  const searchCount = document.getElementById("searchCount");

  // Estado de la app
  let currentFile = null;
  let timerInterval = null;
  let startTime = null;
  let rawTranscriptText = "";
  let hasServerApiKey = false;

  // 1. Cargar configuración inicial
  async function loadInitialConfig() {
    const savedKey = localStorage.getItem("gemini_api_key") || "";
    if (savedKey) {
      inputApiKey.value = savedKey;
      updateApiKeyStatus(true, "Clave guardada");
    }

    let savedModel = "gemini-3.8-flash";
    localStorage.setItem("gemini_model", "gemini-3.8-flash");
    if (selectModel) {
      selectModel.value = "gemini-3.8-flash";
    }

    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        hasServerApiKey = data.has_server_api_key;
        if (hasServerApiKey) {
          envKeyNotice.classList.remove("hidden");
          if (!savedKey) {
            updateApiKeyStatus(true, "Clave en .env");
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo verificar /api/config:", e);
    }
  }

  function updateApiKeyStatus(isConfigured, text) {
    if (isConfigured) {
      apiKeyStatusLabel.textContent = text || "API Key Lista";
      btnApiKeyToggle.classList.add("border-emerald-200", "bg-emerald-50/60", "text-emerald-700");
      btnApiKeyToggle.classList.remove("border-slate-200", "text-slate-700");
    } else {
      apiKeyStatusLabel.textContent = "Configurar API Key";
      btnApiKeyToggle.classList.remove("border-emerald-200", "bg-emerald-50/60", "text-emerald-700");
      btnApiKeyToggle.classList.add("border-slate-200", "text-slate-700");
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // Modal API Key
  btnApiKeyToggle.addEventListener("click", () => {
    apiKeyModal.classList.remove("hidden");
    inputApiKey.focus();
  });

  btnCloseApiKeyModal.addEventListener("click", () => {
    apiKeyModal.classList.add("hidden");
  });

  apiKeyModal.addEventListener("click", (e) => {
    if (e.target === apiKeyModal) {
      apiKeyModal.classList.add("hidden");
    }
  });

  btnToggleShowKey.addEventListener("click", () => {
    const isPass = inputApiKey.type === "password";
    inputApiKey.type = isPass ? "text" : "password";
    btnToggleShowKey.innerHTML = isPass ? '<i data-lucide="eye-off" class="w-4 h-4"></i>' : '<i data-lucide="eye" class="w-4 h-4"></i>';
    if (window.lucide) window.lucide.createIcons();
  });

  btnSaveApiKey.addEventListener("click", () => {
    const val = inputApiKey.value.trim();
    if (val) {
      localStorage.setItem("gemini_api_key", val);
      updateApiKeyStatus(true, "Clave guardada");
    } else {
      localStorage.removeItem("gemini_api_key");
      updateApiKeyStatus(hasServerApiKey, hasServerApiKey ? "Clave en .env" : "Configurar API Key");
    }
    localStorage.setItem("gemini_model", selectModel.value);
    apiKeyModal.classList.add("hidden");
  });

  // 2. Drag & Drop y Selección de Archivos
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function handleFileSelected(file) {
    if (!file) return;

    const validExtensions = [".mp3", ".m4a", ".wav", ".aac", ".ogg", ".flac", ".webm"];
    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      showError("Formato de audio no compatible", `Selecciona un archivo compatible: ${validExtensions.join(", ")}`);
      return;
    }

    currentFile = file;
    fileName.textContent = file.name;
    fileDetails.textContent = `${formatBytes(file.size)} • Listo para transcribir`;
    
    filePreview.classList.remove("hidden");
    btnStartTranscribe.disabled = false;
    hideError();
    if (window.lucide) window.lucide.createIcons();
  }

  dropZone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-indigo-500", "bg-indigo-50/50");
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-indigo-500", "bg-indigo-50/50");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-indigo-500", "bg-indigo-50/50");
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  btnRemoveFile.addEventListener("click", () => {
    currentFile = null;
    fileInput.value = "";
    filePreview.classList.add("hidden");
    btnStartTranscribe.disabled = true;
  });

  // 3. Manejo de Errores
  function showError(title, msg) {
    errorTitle.textContent = title;
    errorMessage.textContent = msg;
    errorAlert.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  function hideError() {
    errorAlert.classList.add("hidden");
  }

  btnCloseError.addEventListener("click", hideError);

  // 4. Temporizador de Transcripción
  function startTimer() {
    startTime = Date.now();
    elapsedTimer.textContent = "00:00";
    timerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
      const secs = String(elapsedSec % 60).padStart(2, "0");
      elapsedTimer.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // 5. Pasos de Progreso
  function setProgressStep(step, isInline = false) {
    // step: 'local' | 'cloud' | 'gemini' | 'done'
    const steps = [stepLocal, stepCloud, stepGemini];
    steps.forEach((s) => s.classList.remove("active", "completed"));

    if (isInline) {
      stepCloud.classList.add("hidden");
    } else {
      stepCloud.classList.remove("hidden");
    }

    if (step === "local") {
      stepLocal.classList.add("active");
      progressTitle.textContent = isInline ? "Preparando audio..." : "Subiendo archivo local...";
      progressSubtitle.textContent = isInline 
        ? "Cargando audio en modo rápido directo (< 20 MB)." 
        : "Cargando audio en streaming al servidor local.";
    } else if (step === "cloud") {
      stepLocal.classList.add("completed");
      stepCloud.classList.add("active");
      progressTitle.textContent = "Procesando en Google Files API...";
      progressSubtitle.textContent = "Subiendo y verificando audio en Google AI Studio (archivo de gran tamaño).";
    } else if (step === "gemini") {
      stepLocal.classList.add("completed");
      if (!isInline) stepCloud.classList.add("completed");
      stepGemini.classList.add("active");
      progressTitle.textContent = "Gemini Flash transcribiendo...";
      progressSubtitle.textContent = "Transcribiendo palabra por palabra (verbatim) con marcas de tiempo.";
    } else if (step === "done") {
      steps.forEach((s) => s.classList.add("completed"));
      progressTitle.textContent = "¡Transcripción completada!";
      progressSubtitle.textContent = "Transcripción literal finalizada con éxito.";
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // 6. Formateo y Renderizado de Transcripción
  function formatTranscript(text) {
    if (!text) return "";
    
    // Escapar HTML básico
    let clean = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Reemplazar timestamps tipo [00:01:23] o [01:23]
    clean = clean.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, (match, p1) => {
      return `<span class="timestamp-tag">[${p1}]</span>`;
    });

    // Reemplazar indicadores de hablantes en negrita o inicio de frase (ej. Docente:, Alumno:, Profesor:)
    clean = clean.replace(/(?:^|\n)(Docente|Profesor|Profesora|Alumno|Alumna|Estudiante|Entrevistador|Entrevistadora|Entrevistado|Orador|Hablante\s*\d*):/gi, (match, p1) => {
      return `\n<strong class="speaker-tag text-slate-900">${p1}:</strong>`;
    });

    // Convertir saltos de línea en párrafos
    const paragraphs = clean.split(/\n\s*\n/);
    return paragraphs.map((p) => `<p class="mb-3 text-slate-700 leading-relaxed">${p.replace(/\n/g, "<br>")}</p>`).join("");
  }

  // 7. Iniciar Proceso de Transcripción
  btnStartTranscribe.addEventListener("click", async () => {
    if (!currentFile) return;

    const apiKey = (localStorage.getItem("gemini_api_key") || "").trim();
    if (!apiKey && !hasServerApiKey) {
      showError("Falta la API Key", "Por favor ingresa tu API Key de Google AI Studio en el botón superior antes de continuar.");
      apiKeyModal.classList.remove("hidden");
      return;
    }

    hideError();
    resultSection.classList.add("hidden");
    progressCard.classList.remove("hidden");
    btnStartTranscribe.disabled = true;

    const isInline = currentFile.size < (20 * 1024 * 1024);
    startTimer();
    setProgressStep("local", isInline);

    try {
      const formData = new FormData();
      formData.append("file", currentFile);
      if (apiKey) {
        formData.append("api_key", apiKey);
      }
      const selectedModelName = (selectModel ? selectModel.value : "gemini-3.8-flash") || "gemini-3.8-flash";
      formData.append("model_name", selectedModelName);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = "Error en el servidor al procesar el audio.";
        try {
          errMsg = JSON.parse(errorText).detail || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }

      // Preparar visor en vivo
      resultSection.classList.remove("hidden");
      if (completedBadge) completedBadge.classList.add("hidden");
      if (streamingIndicator) streamingIndicator.classList.remove("hidden");
      resultFileName.textContent = currentFile.name;
      resultModelBadge.textContent = `${selectedModelName} • en vivo`;
      transcriptContent.innerHTML = '<p class="text-slate-400 italic flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span> Conectando con Gemini Flash y transcribiendo en vivo...</p>';
      
      setTimeout(() => {
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

      // Leer el stream SSE mediante ReadableStream
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      rawTranscriptText = "";
      let hasReceivedFirstChunk = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop(); // conservar resto incompleto

        for (const block of blocks) {
          const lines = block.split(/\r?\n/);
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;

            try {
              const msg = JSON.parse(jsonStr);

              if (msg.event === "status") {
                setProgressStep(msg.stage, msg.mode === "inline");
                if (msg.message) progressSubtitle.textContent = msg.message;
              } else if (msg.event === "chunk") {
                if (!hasReceivedFirstChunk) {
                  hasReceivedFirstChunk = true;
                  progressCard.classList.add("hidden"); // Ocultar tarjeta de carga cuando fluye el texto
                }
                rawTranscriptText += msg.text;
                // Renderizado en vivo con cursor pulsante
                transcriptContent.innerHTML = formatTranscript(rawTranscriptText) + '<span class="inline-block w-1.5 h-4 bg-indigo-600 animate-pulse ml-0.5 align-middle"></span>';
                if (transcriptContainer) {
                  transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
                }
              } else if (msg.event === "done") {
                setProgressStep("done", isInline);
                if (completedBadge) completedBadge.classList.remove("hidden");
                if (streamingIndicator) streamingIndicator.classList.add("hidden");
                rawTranscriptText = msg.transcript || rawTranscriptText;
                resultFileName.textContent = msg.filename || currentFile.name;
                resultModelBadge.textContent = `${msg.model_used || selectModel.value} • ${msg.processing_mode || 'completado'}`;
                transcriptContent.innerHTML = formatTranscript(rawTranscriptText);
              } else if (msg.event === "error") {
                throw new Error(msg.message);
              }
            } catch (err) {
              if (err.message && err.message !== "Unexpected end of JSON input") {
                throw err;
              }
            }
          }
        }
      }

      // Procesar cualquier residuo en el buffer al cerrar el stream
      if (buffer && buffer.trim()) {
        const lines = buffer.split(/\r?\n/);
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const msg = JSON.parse(jsonStr);
            if (msg.event === "chunk") {
              rawTranscriptText += msg.text;
            } else if (msg.event === "done") {
              rawTranscriptText = msg.transcript || rawTranscriptText;
            }
          } catch (e) {}
        }
      }

      // Finalizar visualización limpia
      if (completedBadge) completedBadge.classList.remove("hidden");
      if (streamingIndicator) streamingIndicator.classList.add("hidden");
      transcriptContent.innerHTML = formatTranscript(rawTranscriptText);

    } catch (err) {
      showError("Error al transcribir", err.message);
    } finally {
      stopTimer();
      progressCard.classList.add("hidden");
      btnStartTranscribe.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // 8. Acciones de Exportación
  btnCopy.addEventListener("click", async () => {
    if (!rawTranscriptText) return;
    try {
      await navigator.clipboard.writeText(rawTranscriptText);
      btnCopyLabel.textContent = "¡Copiado!";
      btnCopy.classList.add("bg-emerald-50", "text-emerald-700", "border-emerald-200");
      setTimeout(() => {
        btnCopyLabel.textContent = "Copiar texto";
        btnCopy.classList.remove("bg-emerald-50", "text-emerald-700", "border-emerald-200");
      }, 2000);
    } catch (e) {
      alert("No se pudo copiar automáticamente. Puedes seleccionar el texto y presionar Ctrl+C.");
    }
  });

  function downloadFile(content, extension, mime) {
    if (!content) return;
    const baseName = (currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "transcripcion");
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_transcripcion.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  btnDownloadDocx.addEventListener("click", async () => {
    if (!rawTranscriptText) return;
    const baseName = (currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "transcripcion");
    try {
      btnDownloadDocx.disabled = true;
      const originalText = btnDownloadDocx.innerHTML;
      btnDownloadDocx.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> Generando .docx...';

      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: currentFile ? currentFile.name : "transcripcion",
          transcript: rawTranscriptText
        })
      });

      if (!res.ok) throw new Error("Error en el servidor al generar Word.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}_transcripcion.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      btnDownloadDocx.innerHTML = originalText;
    } catch (err) {
      alert("No se pudo generar el archivo Word: " + err.message);
      if (window.lucide) window.lucide.createIcons();
    } finally {
      btnDownloadDocx.disabled = false;
    }
  });

  btnDownloadTxt.addEventListener("click", () => {
    downloadFile(rawTranscriptText, "txt", "text/plain;charset=utf-8");
  });

  btnDownloadMd.addEventListener("click", () => {
    downloadFile(rawTranscriptText, "md", "text/markdown;charset=utf-8");
  });

  // 9. Búsqueda rápida en el texto
  searchTranscript.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!rawTranscriptText) return;

    if (!query) {
      transcriptContent.innerHTML = formatTranscript(rawTranscriptText);
      searchCount.classList.add("hidden");
      return;
    }

    const formatted = formatTranscript(rawTranscriptText);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    
    // Contar coincidencias
    const matches = (rawTranscriptText.toLowerCase().match(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    searchCount.textContent = `${matches} ${matches === 1 ? 'coincidencia' : 'coincidencias'}`;
    searchCount.classList.remove("hidden");

    // Resaltar
    transcriptContent.innerHTML = formatted.replace(regex, `<mark class="highlight">$1</mark>`);
  });

  // Inicializar
  loadInitialConfig();
});
