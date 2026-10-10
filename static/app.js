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

  // Selector de Tipo de Audio
  const btnTypeClase = document.getElementById("btnTypeClase");
  const btnTypeEntrevista = document.getElementById("btnTypeEntrevista");
  const btnTypeContinuo = document.getElementById("btnTypeContinuo");

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
  const btnSummarize = document.getElementById("btnSummarize");
  const btnRenameSpeakers = document.getElementById("btnRenameSpeakers");
  const btnCopy = document.getElementById("btnCopy");
  const btnCopyLabel = document.getElementById("btnCopyLabel");
  const btnDownloadDocx = document.getElementById("btnDownloadDocx");
  const btnDownloadTxt = document.getElementById("btnDownloadTxt");
  const btnDownloadMd = document.getElementById("btnDownloadMd");
  const searchTranscript = document.getElementById("searchTranscript");
  const searchCount = document.getElementById("searchCount");

  // Sección de Resumen Ejecutivo
  const summarySection = document.getElementById("summarySection");
  const summaryHeader = document.getElementById("summaryHeader");
  const summaryBody = document.getElementById("summaryBody");
  const summaryContent = document.getElementById("summaryContent");
  const btnToggleSummary = document.getElementById("btnToggleSummary");
  const summaryChevron = document.getElementById("summaryChevron");
  const btnCopySummary = document.getElementById("btnCopySummary");

  // Modal Renombrar Oradores
  const renameModal = document.getElementById("renameModal");
  const btnCloseRenameModal = document.getElementById("btnCloseRenameModal");
  const btnCancelRename = document.getElementById("btnCancelRename");
  const btnSaveRename = document.getElementById("btnSaveRename");
  const renameListContainer = document.getElementById("renameListContainer");

  // Estado de la app
  let currentFile = null;
  let currentAudioType = "clase"; // 'clase' | 'entrevista' | 'continuo'
  let timerInterval = null;
  let startTime = null;
  let rawTranscriptText = "";
  let rawSummaryText = "";
  let isSummaryCollapsed = false;
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

    const validExtensions = [".mp3", ".m4a", ".aac", ".ogg", ".flac", ".webm"];
    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (ext === ".wav") {
      showError("Formato WAV no admitido", "No se admite WAV por tamaño excesivo. Por favor conviértelo a MP3 o M4A para transcribir.");
      return;
    }

    if (!validExtensions.includes(ext)) {
      showError("Formato de audio no compatible", "Formatos compatibles: MP3, M4A, AAC, OGG (no se admite WAV por tamaño excesivo).");
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

  // Manejador del Selector de Tipo de Audio
  function setAudioType(type) {
    currentAudioType = type;
    const isClase = type === "clase";
    const isEntrevista = type === "entrevista";
    const isContinuo = type === "continuo";

    const updateBtn = (btn, isActive) => {
      if (!btn) return;
      const check = btn.querySelector(".check-icon");
      if (isActive) {
        btn.className = "audio-type-btn flex items-center justify-between p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 text-indigo-900 transition font-medium text-xs text-left shadow-xs";
        if (check) check.classList.remove("hidden");
      } else {
        btn.className = "audio-type-btn flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 text-slate-700 transition font-medium text-xs text-left";
        if (check) check.classList.add("hidden");
      }
    };

    updateBtn(btnTypeClase, isClase);
    updateBtn(btnTypeEntrevista, isEntrevista);
    updateBtn(btnTypeContinuo, isContinuo);

    if (window.lucide) window.lucide.createIcons();
  }

  if (btnTypeClase) {
    btnTypeClase.addEventListener("click", () => setAudioType("clase"));
  }
  if (btnTypeEntrevista) {
    btnTypeEntrevista.addEventListener("click", () => setAudioType("entrevista"));
  }
  if (btnTypeContinuo) {
    btnTypeContinuo.addEventListener("click", () => setAudioType("continuo"));
  }

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
  function setProgressStep(step) {
    // step: 'local' | 'cloud' | 'gemini' | 'done'
    const steps = [stepLocal, stepCloud, stepGemini];
    steps.forEach((s) => s.classList.remove("active", "completed"));
    stepCloud.classList.remove("hidden");

    if (step === "local") {
      stepLocal.classList.add("active");
      progressTitle.textContent = "Preparando audio...";
      progressSubtitle.textContent = "Guardando audio en disco (bloques de 1 MB, RAM mínima).";
    } else if (step === "cloud") {
      stepLocal.classList.add("completed");
      stepCloud.classList.add("active");
      progressTitle.textContent = "Procesando en Google Files API...";
      progressSubtitle.textContent = "Subiendo y verificando audio en Google AI Studio desde disco.";
    } else if (step === "gemini") {
      stepLocal.classList.add("completed");
      stepCloud.classList.add("completed");
      stepGemini.classList.add("active");
      progressTitle.textContent = "Gemini Flash transcribiendo...";
      progressSubtitle.textContent = "Transcribiendo palabra por palabra (verbatim) de forma estructurada.";
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

    // Reemplazar negrita de Markdown **texto** (oradores y énfasis)
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');

    // Reemplazar timestamps tipo [00:01:23] o [01:23]
    clean = clean.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, (match, p1) => {
      return `<span class="timestamp-tag">[${p1}]</span>`;
    });

    // Reemplazar indicadores de hablantes en negrita si no vinieron en markdown
    clean = clean.replace(/(?:^|\n)(Docente|Profesor|Profesora|Alumno|Alumna|Estudiante|Entrevistador|Entrevistadora|Entrevistado|Orador|Hablante\s*\d*):/gi, (match, p1) => {
      return `\n<strong class="speaker-tag font-semibold text-slate-900">${p1}:</strong>`;
    });

    // Convertir saltos de línea en párrafos legibles
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
    if (summarySection) summarySection.classList.add("hidden");
    if (searchTranscript) searchTranscript.value = "";
    if (searchCount) searchCount.classList.add("hidden");
    rawSummaryText = "";
    progressCard.classList.remove("hidden");
    btnStartTranscribe.disabled = true;

    startTimer();
    setProgressStep("local");

    try {
      const formData = new FormData();
      formData.append("file", currentFile);
      if (apiKey) {
        formData.append("api_key", apiKey);
      }
      formData.append("audio_type", currentAudioType || "clase");
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
                setProgressStep(msg.stage);
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
                setProgressStep("done");
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

  // 9. Renombrar Oradores
  function detectSpeakers(text) {
    if (!text) return [];
    // Busca patrones de oradores como **Docente:**, **Estudiante 1:**, **Entrevistador:**, etc.
    const regex = /\*\*([^\*\n:]+?):?\*\*/g;
    const speakers = new Set();
    let match;
    while ((match = regex.exec(text)) !== null) {
      const name = (match[1] || "").trim();
      // Filtrar palabras que no son oradores o son muy largas
      if (name && name.length <= 40 && !/^[\d\s]+$/.test(name)) {
        speakers.add(name);
      }
    }
    return Array.from(speakers);
  }

  function openRenameModal() {
    if (!rawTranscriptText) {
      alert("Aún no hay transcripción generada para renombrar oradores.");
      return;
    }

    const detected = detectSpeakers(rawTranscriptText);
    renameListContainer.innerHTML = "";

    if (detected.length === 0) {
      renameListContainer.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          No se detectaron etiquetas de oradores en negrita (ej: **Docente:** o **Entrevistador:**).
        </div>
      `;
      btnSaveRename.classList.add("hidden");
    } else {
      btnSaveRename.classList.remove("hidden");
      detected.forEach((speaker, idx) => {
        const item = document.createElement("div");
        item.className = "p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5";
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              Orador detectado: <code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">${speaker}</code>
            </span>
          </div>
          <input 
            type="text" 
            data-original-speaker="${speaker.replace(/"/g, '&quot;')}"
            value="${speaker.replace(/"/g, '&quot;')}" 
            placeholder="Nuevo nombre (ej: Rosana Guber)" 
            class="rename-speaker-input w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          >
        `;
        renameListContainer.appendChild(item);
      });
    }

    renameModal.classList.remove("hidden");
  }

  function closeRenameModal() {
    renameModal.classList.add("hidden");
  }

  if (btnRenameSpeakers) {
    btnRenameSpeakers.addEventListener("click", openRenameModal);
  }
  if (btnCloseRenameModal) {
    btnCloseRenameModal.addEventListener("click", closeRenameModal);
  }
  if (btnCancelRename) {
    btnCancelRename.addEventListener("click", closeRenameModal);
  }
  if (renameModal) {
    renameModal.addEventListener("click", (e) => {
      if (e.target === renameModal) closeRenameModal();
    });
  }

  if (btnSaveRename) {
    btnSaveRename.addEventListener("click", () => {
      const inputs = renameListContainer.querySelectorAll(".rename-speaker-input");
      if (!inputs || inputs.length === 0) {
        closeRenameModal();
        return;
      }

      let updatedText = rawTranscriptText;
      let changesCount = 0;

      inputs.forEach((input) => {
        const originalName = input.getAttribute("data-original-speaker");
        const newName = input.value.trim();

        if (originalName && newName && originalName !== newName) {
          const escapedOrig = originalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          // Reemplazar tanto **Orador:** como **Orador**:
          const pattern1 = new RegExp(`\\*\\*${escapedOrig}:\\*\\*`, "g");
          const pattern2 = new RegExp(`\\*\\*${escapedOrig}\\*\\*:`, "g");

          if (pattern1.test(updatedText) || pattern2.test(updatedText)) {
            updatedText = updatedText
              .replace(pattern1, `**${newName}:**`)
              .replace(pattern2, `**${newName}:**`);
            changesCount++;
          }
        }
      });

      if (changesCount > 0) {
        rawTranscriptText = updatedText;
        transcriptContent.innerHTML = formatTranscript(rawTranscriptText);
        // Feedback visual en el botón de renombrar
        const originalLabel = btnRenameSpeakers.innerHTML;
        btnRenameSpeakers.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i> <span class="text-emerald-700">¡Nombres actualizados!</span>';
        setTimeout(() => {
          btnRenameSpeakers.innerHTML = originalLabel;
          if (window.lucide) window.lucide.createIcons();
        }, 2500);
      }

      closeRenameModal();
    });
  }

  // 10. Resumen Ejecutivo (IA Síntesis)
  function formatSummaryMarkdown(md) {
    if (!md) return "";
    let clean = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Títulos Markdown ###
    clean = clean.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5">$1</h4>');
    clean = clean.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-2">$1</h3>');

    // Negrita
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    
    // Viñetas * o -
    clean = clean.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-slate-700 my-0.5">$1</li>');

    // Párrafos
    const paragraphs = clean.split(/\n\s*\n/);
    return paragraphs.map((p) => {
      if (p.startsWith("<h") || p.startsWith("<li")) return p;
      return `<p class="text-xs text-slate-700 leading-relaxed mb-2">${p.replace(/\n/g, "<br>")}</p>`;
    }).join("");
  }

  function toggleSummaryCollapse() {
    isSummaryCollapsed = !isSummaryCollapsed;
    if (isSummaryCollapsed) {
      summaryBody.classList.add("hidden");
      if (summaryChevron) summaryChevron.style.transform = "rotate(180deg)";
    } else {
      summaryBody.classList.remove("hidden");
      if (summaryChevron) summaryChevron.style.transform = "rotate(0deg)";
    }
  }

  if (summaryHeader) {
    summaryHeader.addEventListener("click", (e) => {
      // Evitar que el clic en copiar dispare el colapso
      if (e.target.closest("#btnCopySummary")) return;
      toggleSummaryCollapse();
    });
  }

  if (btnCopySummary) {
    btnCopySummary.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!rawSummaryText) return;
      try {
        await navigator.clipboard.writeText(rawSummaryText);
        const originalHtml = btnCopySummary.innerHTML;
        btnCopySummary.innerHTML = '<i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> <span class="text-emerald-700 font-medium">¡Copiado!</span>';
        setTimeout(() => {
          btnCopySummary.innerHTML = originalHtml;
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      } catch (err) {
        alert("No se pudo copiar el resumen al portapapeles.");
      }
    });
  }

  if (btnSummarize) {
    btnSummarize.addEventListener("click", async () => {
      if (!rawTranscriptText || !rawTranscriptText.trim()) {
        alert("Primero genera una transcripción para poder resumirla.");
        return;
      }

      const apiKey = (localStorage.getItem("gemini_api_key") || "").trim();
      const originalBtnHtml = btnSummarize.innerHTML;
      btnSummarize.disabled = true;
      btnSummarize.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div> <span>Generando resumen...</span>';

      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: rawTranscriptText,
            api_key: apiKey || null,
            model_name: "gemini-3.8-flash"
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Error en el servidor al generar el resumen.");
        }

        const data = await response.json();
        rawSummaryText = data.summary || "";

        summaryContent.innerHTML = formatSummaryMarkdown(rawSummaryText);
        summarySection.classList.remove("hidden");
        summaryBody.classList.remove("hidden");
        isSummaryCollapsed = false;
        if (summaryChevron) summaryChevron.style.transform = "rotate(0deg)";

        summarySection.scrollIntoView({ behavior: "smooth", block: "nearest" });

      } catch (err) {
        alert("Error al generar resumen: " + err.message);
      } finally {
        btnSummarize.disabled = false;
        btnSummarize.innerHTML = originalBtnHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // 11. Búsqueda rápida con resaltado en amarillo
  searchTranscript.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (!rawTranscriptText) return;

    if (!query) {
      transcriptContent.innerHTML = formatTranscript(rawTranscriptText);
      searchCount.classList.add("hidden");
      return;
    }

    const formatted = formatTranscript(rawTranscriptText);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");

    // Contar coincidencias en el texto plano
    const matches = (rawTranscriptText.match(new RegExp(escapedQuery, "gi")) || []).length;
    searchCount.textContent = `${matches} ${matches === 1 ? 'coincidencia' : 'coincidencias'}`;
    searchCount.classList.remove("hidden");

    // Resaltar coincidencias en amarillo intenso
    transcriptContent.innerHTML = formatted.replace(regex, `<mark class="highlight">$1</mark>`);
  });

  // Inicializar
  loadInitialConfig();
});
