document.addEventListener("DOMContentLoaded", () => {
  // Inicializar Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Elementos DOM
  const btnHistoryToggle = document.getElementById("btnHistoryToggle");
  const historyBadgeCount = document.getElementById("historyBadgeCount");
  const historyModal = document.getElementById("historyModal");
  const btnCloseHistoryModal = document.getElementById("btnCloseHistoryModal");
  const btnClearHistory = document.getElementById("btnClearHistory");
  const historyListContainer = document.getElementById("historyListContainer");

  const btnThemeToggle = document.getElementById("btnThemeToggle");
  const themeIcon = document.getElementById("themeIcon");

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
  const inputKeywords = document.getElementById("inputKeywords");
  const btnStartTranscribe = document.getElementById("btnStartTranscribe");

  // Reproductor de Audio Integrado
  const audioPlayerSection = document.getElementById("audioPlayerSection");
  const audioPlayer = document.getElementById("audioPlayer");
  const speedButtons = document.querySelectorAll(".btn-speed");
  let currentAudioUrl = null;

  // Selector de Tipo de Audio
  const btnTypeClase = document.getElementById("btnTypeClase");
  const btnTypeEntrevista = document.getElementById("btnTypeEntrevista");
  const btnTypeRadio = document.getElementById("btnTypeRadio");
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
  const btnToggleEdit = document.getElementById("btnToggleEdit");
  const btnToggleEditLabel = document.getElementById("btnToggleEditLabel");
  const editModeIndicator = document.getElementById("editModeIndicator");
  const btnSummarize = document.getElementById("btnSummarize");
  const btnRenameSpeakers = document.getElementById("btnRenameSpeakers");
  const btnCopy = document.getElementById("btnCopy");
  const btnCopyLabel = document.getElementById("btnCopyLabel");
  const btnDownloadDocx = document.getElementById("btnDownloadDocx");
  const btnDownloadPdf = document.getElementById("btnDownloadPdf");
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
  const btnDownloadSummaryDocx = document.getElementById("btnDownloadSummaryDocx");

  // Modal Renombrar Oradores
  const renameModal = document.getElementById("renameModal");
  const btnCloseRenameModal = document.getElementById("btnCloseRenameModal");
  const btnCancelRename = document.getElementById("btnCancelRename");
  const btnSaveRename = document.getElementById("btnSaveRename");
  const renameListContainer = document.getElementById("renameListContainer");

  // Estado de la app
  let currentFile = null;
  let currentAudioType = "clase"; // 'clase' | 'entrevista' | 'continuo' | 'radio'
  let timerInterval = null;
  let startTime = null;
  let rawTranscriptText = "";
  let rawSummaryText = "";
  let isSummaryCollapsed = false;
  let hasServerApiKey = false;

  // 0. Modo Oscuro (Dark Mode)
  function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    applyTheme(isDark);
  }

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      if (themeIcon) themeIcon.setAttribute("data-lucide", "sun");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      if (themeIcon) themeIcon.setAttribute("data-lucide", "moon");
    }
    if (window.lucide) window.lucide.createIcons();
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
      const isCurrentlyDark = document.documentElement.classList.contains("dark");
      applyTheme(!isCurrentlyDark);
    });
  }

  // 1. Cargar configuración inicial
  async function loadInitialConfig() {
    initTheme();

    const savedKey = localStorage.getItem("gemini_api_key") || "";
    if (savedKey) {
      inputApiKey.value = savedKey;
      const keyCount = savedKey.split(",").filter((k) => k.trim()).length;
      updateApiKeyStatus(true, keyCount > 1 ? `${keyCount} API Keys` : "Clave guardada");
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
      btnApiKeyToggle.classList.add("border-emerald-200", "dark:border-emerald-800", "bg-emerald-50/60", "dark:bg-emerald-950/40", "text-emerald-700", "dark:text-emerald-300");
      btnApiKeyToggle.classList.remove("border-slate-200", "text-slate-700");
    } else {
      apiKeyStatusLabel.textContent = "Configurar API Key";
      btnApiKeyToggle.classList.remove("border-emerald-200", "dark:border-emerald-800", "bg-emerald-50/60", "dark:bg-emerald-950/40", "text-emerald-700", "dark:text-emerald-300");
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
      const keyCount = val.split(",").filter((k) => k.trim()).length;
      updateApiKeyStatus(true, keyCount > 1 ? `${keyCount} API Keys` : "Clave guardada");
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

  function updateAudioPlayer(file) {
    if (!audioPlayer) return;
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }

    if (file) {
      currentAudioUrl = URL.createObjectURL(file);
      audioPlayer.src = currentAudioUrl;
      audioPlayer.playbackRate = 1.0;
      setSpeedButtonActive(1.0);
      if (audioPlayerSection) audioPlayerSection.classList.remove("hidden");
    } else {
      audioPlayer.pause();
      audioPlayer.removeAttribute("src");
      audioPlayer.load();
      if (audioPlayerSection) audioPlayerSection.classList.add("hidden");
    }
  }

  function setSpeedButtonActive(speed) {
    speedButtons.forEach((btn) => {
      const btnSpeed = parseFloat(btn.getAttribute("data-speed"));
      if (btnSpeed === speed) {
        btn.className = "btn-speed px-2.5 py-1 text-xs font-semibold rounded-lg border border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 transition shadow-2xs";
      } else {
        btn.className = "btn-speed px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 transition";
      }
    });
  }

  speedButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const speed = parseFloat(btn.getAttribute("data-speed")) || 1.0;
      if (audioPlayer) {
        audioPlayer.playbackRate = speed;
      }
      setSpeedButtonActive(speed);
    });
  });

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

    // Cargar y mostrar en el reproductor de audio integrado
    updateAudioPlayer(file);

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
    updateAudioPlayer(null);
  });

  // Manejador del Selector de Tipo de Audio
  function setAudioType(type) {
    currentAudioType = type;
    const isClase = type === "clase";
    const isEntrevista = type === "entrevista";
    const isRadio = type === "radio";
    const isContinuo = type === "continuo";

    const updateBtn = (btn, isActive) => {
      if (!btn) return;
      const check = btn.querySelector(".check-icon");
      if (isActive) {
        btn.className = "audio-type-btn flex items-center justify-between p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 transition font-medium text-xs text-left shadow-xs";
        if (check) check.classList.remove("hidden");
      } else {
        btn.className = "audio-type-btn flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 transition font-medium text-xs text-left";
        if (check) check.classList.add("hidden");
      }
    };

    updateBtn(btnTypeClase, isClase);
    updateBtn(btnTypeEntrevista, isEntrevista);
    updateBtn(btnTypeRadio, isRadio);
    updateBtn(btnTypeContinuo, isContinuo);

    if (window.lucide) window.lucide.createIcons();
  }

  if (btnTypeClase) {
    btnTypeClase.addEventListener("click", () => setAudioType("clase"));
  }
  if (btnTypeEntrevista) {
    btnTypeEntrevista.addEventListener("click", () => setAudioType("entrevista"));
  }
  if (btnTypeRadio) {
    btnTypeRadio.addEventListener("click", () => setAudioType("radio"));
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
    clean = clean.replace(/(?:^|\n)(Docente|Profesor|Profesora|Alumno|Alumna|Estudiante|Entrevistador|Entrevistadora|Entrevistado|Orador|Persona\s*\d*|Hablante\s*\d*):/gi, (match, p1) => {
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
    setEditMode(false);
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
      if (inputKeywords && inputKeywords.value.trim()) {
        formData.append("keywords", inputKeywords.value.trim());
      }

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

      // Guardar automáticamente en el historial local ("Mis Transcripciones")
      if (rawTranscriptText && rawTranscriptText.trim()) {
        saveToHistory({
          filename: (currentFile ? currentFile.name : "audio_transcripcion.mp3"),
          audioType: currentAudioType || "clase",
          transcript: rawTranscriptText,
          timestamp: Date.now()
        });
      }

    } catch (err) {
      showError("Error al transcribir", err.message);
    } finally {
      stopTimer();
      progressCard.classList.add("hidden");
      btnStartTranscribe.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // Modo de edición opcional y protegido (solo lectura por defecto)
  let isEditingTranscript = false;

  function setEditMode(enable) {
    isEditingTranscript = enable;
    if (!transcriptContent) return;

    if (isEditingTranscript) {
      transcriptContent.contentEditable = "true";
      transcriptContent.classList.add("ring-1", "ring-indigo-500/30", "bg-indigo-50/10", "dark:bg-indigo-950/20", "rounded-xl", "p-2");
      transcriptContent.focus();

      if (btnToggleEdit) {
        btnToggleEdit.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-semibold transition shadow-xs";
        btnToggleEdit.innerHTML = '<i data-lucide="lock" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"></i> <span id="btnToggleEditLabel">🔒 Bloquear edición</span>';
      }

      if (editModeIndicator) {
        editModeIndicator.className = "inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium";
        editModeIndicator.innerHTML = '<i data-lucide="edit-3" class="w-3 h-3 text-amber-500"></i> Edición activa (escribe o corrige libremente)';
      }
    } else {
      transcriptContent.contentEditable = "false";
      transcriptContent.classList.remove("ring-1", "ring-indigo-500/30", "bg-indigo-50/10", "dark:bg-indigo-950/20", "rounded-xl", "p-2");

      if (btnToggleEdit) {
        btnToggleEdit.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition shadow-xs";
        btnToggleEdit.innerHTML = '<i data-lucide="edit-3" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"></i> <span id="btnToggleEditLabel">✏️ Editar texto</span>';
      }

      if (editModeIndicator) {
        editModeIndicator.className = "inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal";
        editModeIndicator.innerHTML = '<i data-lucide="lock" class="w-3 h-3 text-slate-400"></i> Modo solo lectura protegido';
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  if (btnToggleEdit) {
    btnToggleEdit.addEventListener("click", () => {
      setEditMode(!isEditingTranscript);
    });
  }

  // Obtener el texto actual de la transcripción (refleja ediciones directas del usuario)
  function getCurrentTranscriptText() {
    if (transcriptContent && transcriptContent.innerText) {
      const text = transcriptContent.innerText.trim();
      if (text) return text;
    }
    return rawTranscriptText || "";
  }

  // 8. Acciones de Exportación
  btnCopy.addEventListener("click", async () => {
    const textToCopy = getCurrentTranscriptText();
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
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
    const textToExport = getCurrentTranscriptText();
    if (!textToExport) return;
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
          transcript: textToExport
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

  // Exportación directa a PDF con tipografía académica y márgenes limpios
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener("click", async () => {
      const textToExport = getCurrentTranscriptText();
      if (!textToExport) return;

      const baseName = (currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "transcripcion");
      const originalHtml = btnDownloadPdf.innerHTML;
      btnDownloadPdf.disabled = true;
      btnDownloadPdf.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div> <span>Generando PDF...</span>';

      try {
        // Crear contenedor temporal para el renderizado del PDF con estilo académico
        const printContainer = document.createElement("div");
        printContainer.style.fontFamily = "'Calibri', 'Arial', sans-serif";
        printContainer.style.fontSize = "11pt";
        printContainer.style.lineHeight = "1.35";
        printContainer.style.color = "#0f172a";
        printContainer.style.padding = "20px";
        printContainer.style.background = "#ffffff";

        // Título del documento
        const headerDiv = document.createElement("div");
        headerDiv.style.borderBottom = "2px solid #e2e8f0";
        headerDiv.style.paddingBottom = "12px";
        headerDiv.style.marginBottom = "20px";
        headerDiv.innerHTML = `
          <h1 style="font-size: 16pt; font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">Transcripción: ${currentFile ? currentFile.name : 'Documento'}</h1>
          <p style="font-size: 9pt; color: #64748b; margin: 0; font-style: italic;">Registro textual académico • FacuHelps</p>
        `;
        printContainer.appendChild(headerDiv);

        // Contenido de la transcripción
        const bodyDiv = document.createElement("div");
        bodyDiv.innerHTML = formatTranscript(textToExport);
        // Asegurar estilos de lectura limpia en párrafos
        bodyDiv.querySelectorAll("p").forEach((p) => {
          p.style.marginBottom = "10px";
          p.style.lineHeight = "1.35";
        });
        printContainer.appendChild(bodyDiv);

        if (window.html2pdf) {
          const opt = {
            margin: [15, 15, 15, 15], // mm
            filename: `${baseName}_transcripcion.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          await window.html2pdf().set(opt).from(printContainer).save();
        } else {
          // Fallback a ventana de impresión nativa si no cargó la biblioteca
          const printWindow = window.open("", "_blank");
          printWindow.document.write(`
            <html>
              <head>
                <title>${baseName}_transcripcion</title>
                <style>
                  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.35; padding: 25mm 20mm; color: #0f172a; }
                  h1 { font-size: 16pt; margin-bottom: 4px; }
                  p { margin-bottom: 8px; }
                  strong { font-weight: bold; }
                </style>
              </head>
              <body>
                ${printContainer.innerHTML}
                <script>window.onload = function() { window.print(); window.close(); }<\/script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } catch (err) {
        alert("No se pudo generar el archivo PDF: " + err.message);
      } finally {
        btnDownloadPdf.disabled = false;
        btnDownloadPdf.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  btnDownloadTxt.addEventListener("click", () => {
    downloadFile(getCurrentTranscriptText(), "txt", "text/plain;charset=utf-8");
  });

  btnDownloadMd.addEventListener("click", () => {
    downloadFile(getCurrentTranscriptText(), "md", "text/markdown;charset=utf-8");
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
      // Evitar que el clic en botones dispare el colapso
      if (e.target.closest("#btnCopySummary") || e.target.closest("#btnDownloadSummaryDocx")) return;
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

  if (btnDownloadSummaryDocx) {
    btnDownloadSummaryDocx.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!rawSummaryText) {
        alert("Aún no hay resumen generado para descargar.");
        return;
      }
      const baseName = (currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "resumen");
      const originalText = btnDownloadSummaryDocx.innerHTML;

      try {
        btnDownloadSummaryDocx.disabled = true;
        btnDownloadSummaryDocx.innerHTML = '<div class="w-3 h-3 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div> <span>Generando .docx...</span>';

        const res = await fetch("/api/export-summary-docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: currentFile ? currentFile.name : "resumen",
            summary: rawSummaryText
          })
        });

        if (!res.ok) throw new Error("Error en el servidor al exportar el resumen a Word.");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${baseName}_resumen.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert("No se pudo generar el archivo Word del resumen: " + err.message);
      } finally {
        btnDownloadSummaryDocx.disabled = false;
        btnDownloadSummaryDocx.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
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

  // 12. Historial Local ("Mis Transcripciones")
  const HISTORY_STORAGE_KEY = "facuhelps_transcriptions_history";
  const MAX_HISTORY_ITEMS = 10;

  function getHistory() {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("Error al leer historial:", e);
      return [];
    }
  }

  function saveToHistory(item) {
    try {
      let list = getHistory();
      // Agregar al inicio
      list.unshift(item);
      // Mantener hasta 10 elementos
      if (list.length > MAX_HISTORY_ITEMS) {
        list = list.slice(0, MAX_HISTORY_ITEMS);
      }
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
      updateHistoryBadge();
    } catch (e) {
      console.warn("Error al guardar en historial:", e);
    }
  }

  function updateHistoryBadge() {
    const list = getHistory();
    if (historyBadgeCount) {
      if (list.length > 0) {
        historyBadgeCount.textContent = list.length;
        historyBadgeCount.classList.remove("hidden");
      } else {
        historyBadgeCount.classList.add("hidden");
      }
    }
  }

  function getAudioTypeLabel(type) {
    switch (type) {
      case "clase": return "🎓 Clase / Teórico";
      case "entrevista": return "🎙️ Entrevista";
      case "radio": return "📻 Radio / Podcast";
      case "continuo": return "📝 Texto continuo";
      default: return type;
    }
  }

  function renderHistoryList() {
    const list = getHistory();
    if (!historyListContainer) return;

    historyListContainer.innerHTML = "";

    if (btnClearHistory) {
      if (list.length > 0) {
        btnClearHistory.classList.remove("hidden");
      } else {
        btnClearHistory.classList.add("hidden");
      }
    }

    if (list.length === 0) {
      historyListContainer.innerHTML = `
        <div class="py-12 px-4 text-center">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <i data-lucide="inbox" class="w-6 h-6"></i>
          </div>
          <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">No hay transcripciones guardadas aún</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Cada vez que transcribas un audio con éxito, se guardará aquí automáticamente.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    list.forEach((item, index) => {
      const dateStr = item.timestamp 
        ? new Date(item.timestamp).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) 
        : "Fecha reciente";

      const previewText = (item.transcript || "").slice(0, 150).replace(/\*\*/g, "") + "...";

      const card = document.createElement("div");
      card.className = "p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition space-y-2.5";
      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="overflow-hidden">
            <h4 class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
              <i data-lucide="file-audio" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0"></i>
              <span class="truncate">${item.filename || 'audio.mp3'}</span>
            </h4>
            <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span>${dateStr}</span>
              <span>•</span>
              <span class="font-medium text-indigo-600 dark:text-indigo-400">${getAudioTypeLabel(item.audioType)}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" class="btn-load-history px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 shadow-2xs" data-index="${index}">
              <i data-lucide="eye" class="w-3 h-3"></i>
              <span>Cargar en visor</span>
            </button>
            <button type="button" class="btn-copy-history p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition" title="Copiar transcripción" data-index="${index}">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="btn-download-docx-history p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition" title="Descargar Word (.docx)" data-index="${index}">
              <i data-lucide="file-type" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="btn-download-pdf-history p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition" title="Descargar PDF" data-index="${index}">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <p class="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800/80 font-sans">
          "${previewText}"
        </p>
      `;

      // Cargar en visor
      card.querySelector(".btn-load-history").addEventListener("click", () => {
        rawTranscriptText = item.transcript || "";
        resultFileName.textContent = item.filename || "audio.mp3";
        resultModelBadge.textContent = "Historial local";
        transcriptContent.innerHTML = formatTranscript(rawTranscriptText);
        resultSection.classList.remove("hidden");
        if (completedBadge) completedBadge.classList.remove("hidden");
        if (streamingIndicator) streamingIndicator.classList.add("hidden");
        if (summarySection) summarySection.classList.add("hidden");
        historyModal.classList.add("hidden");
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      // Copiar
      card.querySelector(".btn-copy-history").addEventListener("click", async (e) => {
        try {
          await navigator.clipboard.writeText(item.transcript || "");
          const btn = e.currentTarget;
          const orig = btn.innerHTML;
          btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i>';
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            btn.innerHTML = orig;
            if (window.lucide) window.lucide.createIcons();
          }, 1500);
        } catch (err) {
          alert("No se pudo copiar.");
        }
      });

      // Descargar Word
      card.querySelector(".btn-download-docx-history").addEventListener("click", async () => {
        const baseName = (item.filename || "transcripcion").replace(/\.[^/.]+$/, "");
        try {
          const res = await fetch("/api/export-docx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: item.filename || "transcripcion",
              transcript: item.transcript || ""
            })
          });
          if (!res.ok) throw new Error("Error en el servidor");
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${baseName}_transcripcion.docx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (err) {
          alert("Error al descargar Word: " + err.message);
        }
      });

      // Descargar PDF
      card.querySelector(".btn-download-pdf-history").addEventListener("click", async () => {
        const baseName = (item.filename || "transcripcion").replace(/\.[^/.]+$/, "");
        try {
          const printContainer = document.createElement("div");
          printContainer.style.fontFamily = "'Calibri', 'Arial', sans-serif";
          printContainer.style.fontSize = "11pt";
          printContainer.style.lineHeight = "1.35";
          printContainer.style.color = "#0f172a";
          printContainer.style.padding = "20px";
          printContainer.style.background = "#ffffff";
          printContainer.innerHTML = `
            <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">
              <h1 style="font-size: 16pt; font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">Transcripción: ${item.filename || 'Documento'}</h1>
              <p style="font-size: 9pt; color: #64748b; margin: 0; font-style: italic;">Registro textual académico • FacuHelps</p>
            </div>
            <div>${formatTranscript(item.transcript || '')}</div>
          `;

          if (window.html2pdf) {
            const opt = {
              margin: [15, 15, 15, 15],
              filename: `${baseName}_transcripcion.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            await window.html2pdf().set(opt).from(printContainer).save();
          } else {
            downloadFile(item.transcript || "", "txt", "text/plain;charset=utf-8");
          }
        } catch (err) {
          alert("Error al descargar PDF: " + err.message);
        }
      });

      historyListContainer.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  if (btnHistoryToggle) {
    btnHistoryToggle.addEventListener("click", () => {
      renderHistoryList();
      historyModal.classList.remove("hidden");
    });
  }

  if (btnCloseHistoryModal) {
    btnCloseHistoryModal.addEventListener("click", () => {
      historyModal.classList.add("hidden");
    });
  }

  if (historyModal) {
    historyModal.addEventListener("click", (e) => {
      if (e.target === historyModal) {
        historyModal.classList.add("hidden");
      }
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => {
      if (confirm("¿Estás seguro de vaciar el historial de transcripciones guardadas?")) {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        updateHistoryBadge();
        renderHistoryList();
      }
    });
  }

  // Inicializar
  loadInitialConfig();
  updateHistoryBadge();
});
