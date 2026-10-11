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
  let currentActiveFileName = ""; // Guarda el nombre del archivo activo (cargado de subida o del historial)
  let currentAudioType = "clase"; // 'clase' | 'entrevista' | 'continuo' | 'radio'
  let timerInterval = null;
  let startTime = null;
  let rawTranscriptText = "";
  let rawSummaryText = "";
  let isSummaryCollapsed = false;
  let hasServerApiKey = false;

  function getActiveBaseName() {
    let name = currentActiveFileName || (currentFile ? currentFile.name : "") || "transcripcion";
    return name.replace(/\.[^/.]+$/, "");
  }

  function getActiveFullName() {
    return currentActiveFileName || (currentFile ? currentFile.name : "") || "transcripcion.mp3";
  }

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
        btn.className = "btn-speed px-2.5 py-1 text-xs font-semibold rounded-lg border border-blue-800 bg-blue-50 dark:bg-slate-800/80 text-blue-900 dark:text-amber-300 transition shadow-2xs";
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
    currentActiveFileName = file.name;
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
    dropZone.classList.add("border-amber-400", "bg-blue-50/40");
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-amber-400", "bg-blue-50/40");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-amber-400", "bg-blue-50/40");
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  btnRemoveFile.addEventListener("click", () => {
    currentFile = null;
    currentActiveFileName = "";
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
        btn.className = "audio-type-btn flex items-center justify-between p-3 rounded-xl border-2 border-blue-800 dark:border-amber-400/60 bg-blue-50/50 dark:bg-slate-800/80 text-blue-950 dark:text-amber-200 transition font-medium text-xs text-left shadow-xs";
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

      const data = await response.json();
      rawTranscriptText = data.transcript || "";

      if (!rawTranscriptText.trim()) {
        throw new Error("La transcripción recibida está vacía.");
      }

      // Finalizar visualización limpia y directa
      setProgressStep("done");
      progressCard.classList.add("hidden");
      resultSection.classList.remove("hidden");
      if (completedBadge) completedBadge.classList.remove("hidden");
      if (streamingIndicator) streamingIndicator.classList.add("hidden");
      currentActiveFileName = data.filename || (currentFile ? currentFile.name : "") || "audio.mp3";
      resultFileName.textContent = currentActiveFileName;
      resultModelBadge.textContent = `${data.model_used || selectedModelName} • completado`;
      transcriptContent.innerHTML = formatTranscript(rawTranscriptText);

      setTimeout(() => {
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      // Guardar automáticamente en el historial local ("Mis Transcripciones")
      saveToHistory({
        filename: currentActiveFileName,
        audioType: currentAudioType || "clase",
        transcript: rawTranscriptText,
        timestamp: Date.now()
      });

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
      transcriptContent.classList.add("ring-1", "ring-amber-400/40", "bg-blue-50/20", "dark:bg-slate-800/40", "rounded-xl", "p-2");
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
      transcriptContent.classList.remove("ring-1", "ring-amber-400/40", "bg-blue-50/20", "dark:bg-slate-800/40", "rounded-xl", "p-2");

      if (btnToggleEdit) {
        btnToggleEdit.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition shadow-xs";
        btnToggleEdit.innerHTML = '<i data-lucide="edit-3" class="w-3.5 h-3.5 text-blue-900 dark:text-amber-400"></i> <span id="btnToggleEditLabel">✏️ Editar texto</span>';
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
    const baseName = getActiveBaseName();
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
    const baseName = getActiveBaseName();
    const fullName = getActiveFullName();
    try {
      btnDownloadDocx.disabled = true;
      const originalText = btnDownloadDocx.innerHTML;
      btnDownloadDocx.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> Generando .docx...';

      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: fullName,
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

  // Exportación directa a PDF vectorial con jsPDF nativo y tipografía académica
  function generateVectorPdf(transcriptText, baseName) {
    // Verificar disponibilidad de jsPDF (vía window.jspdf.jsPDF o window.jsPDF)
    const { jsPDF } = window.jspdf || window;
    if (!jsPDF) {
      throw new Error("La librería jsPDF no está disponible en este momento.");
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Dimensiones A4 en mm: 210 x 297
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15; // 15 mm estándar
    const contentWidth = pageWidth - (margin * 2);
    const bottomMargin = margin;

    let y = margin;

    // Helper para verificar y agregar salto de página si es necesario
    function checkPageBreak(neededHeight) {
      if (y + neededHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    }

    // --- ENCABEZADO DE LA PÁGINA 1 (Exactamente en el margen superior de 15 mm) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900

    // Dividir título si excede el ancho disponible
    const titleLines = doc.splitTextToSize(`Transcripción: ${baseName}`, contentWidth);
    doc.text(titleLines, margin, y + 4);
    y += (titleLines.length * 7);

    // Subtítulo con metadata
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Registro textual académico • FacuHelps", margin, y + 2);
    y += 5;

    // Línea separadora sutil
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(margin, y + 2, margin + contentWidth, y + 2);
    y += 8;

    // --- RENDERIZADO DEL CUERPO DE LA TRANSCRIPCIÓN ---
    doc.setFontSize(10.5);
    const lineHeight = 5.2;
    const paragraphSpacing = 3.5;

    const rawParas = (transcriptText || "").split("\n").map(p => p.trim()).filter(p => p.length > 0);

    for (const pText of rawParas) {
      // Analizar si el párrafo comienza con una etiqueta de orador (ej: **Docente:**, **Persona 1:**)
      const speakerMatch = pText.match(/^(\*\*[^\*]+?\*\*:?|\b[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]+:)\s*(.*)$/);

      if (speakerMatch) {
        let speakerLabel = speakerMatch[1].replace(/\*\*/g, "").trim();
        if (!speakerLabel.endsWith(":")) speakerLabel += ":";
        const speechContent = (speakerMatch[2] || "").replace(/\*\*/g, "").trim();

        // Calcular ancho del prefijo del orador
        doc.setFont("helvetica", "bold");
        const speakerWidth = doc.getTextWidth(speakerLabel + " ");

        // Primer intento: imprimir orador y medir texto restante
        doc.setFont("helvetica", "normal");
        const availableFirstLineWidth = contentWidth - speakerWidth;

        // Comprobar si cabe al menos una línea
        checkPageBreak(lineHeight * 2);

        if (availableFirstLineWidth > 35 && speechContent) {
          // Imprimir etiqueta de orador
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(speakerLabel, margin, y);

          // Texto complementario en la misma línea y subsecuentes
          doc.setFont("helvetica", "normal");
          doc.setTextColor(30, 41, 59);

          // Dividir palabras para colocar la primera parte al lado del orador
          const words = speechContent.split(" ");
          let firstLine = "";
          let remainingIndex = 0;

          for (let i = 0; i < words.length; i++) {
            const test = firstLine ? (firstLine + " " + words[i]) : words[i];
            if (doc.getTextWidth(test) <= availableFirstLineWidth) {
              firstLine = test;
              remainingIndex = i + 1;
            } else {
              break;
            }
          }

          if (firstLine) {
            doc.text(firstLine, margin + speakerWidth, y);
            y += lineHeight;

            const remainingText = words.slice(remainingIndex).join(" ").trim();
            if (remainingText) {
              const remainingLines = doc.splitTextToSize(remainingText, contentWidth);
              for (const line of remainingLines) {
                checkPageBreak(lineHeight);
                doc.text(line, margin, y);
                y += lineHeight;
              }
            }
          } else {
            y += lineHeight;
            const fullLines = doc.splitTextToSize(speechContent, contentWidth);
            for (const line of fullLines) {
              checkPageBreak(lineHeight);
              doc.text(line, margin, y);
              y += lineHeight;
            }
          }
        } else {
          // Si el orador ocupa casi todo el renglón, poner orador en su propia línea
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(speakerLabel, margin, y);
          y += lineHeight;

          if (speechContent) {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 41, 59);
            const remainingLines = doc.splitTextToSize(speechContent, contentWidth);
            for (const line of remainingLines) {
              checkPageBreak(lineHeight);
              doc.text(line, margin, y);
              y += lineHeight;
            }
          }
        }
      } else {
        // Párrafo sin etiqueta de orador: texto corrido en párrafos limpios
        const cleanP = pText.replace(/\*\*/g, "");
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);

        const lines = doc.splitTextToSize(cleanP, contentWidth);
        for (const line of lines) {
          checkPageBreak(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        }
      }

      // Espaciado entre párrafos
      y += paragraphSpacing;
    }

    doc.save(`${baseName}_transcripcion.pdf`);
  }

  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener("click", async () => {
      const textToExport = getCurrentTranscriptText();
      if (!textToExport) return;

      const baseName = getActiveBaseName();
      const originalHtml = btnDownloadPdf.innerHTML;
      btnDownloadPdf.disabled = true;
      btnDownloadPdf.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div> <span>Generando PDF...</span>';

      try {
        generateVectorPdf(textToExport, baseName);
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
              <span class="w-2 h-2 rounded-full bg-blue-900"></span>
              Orador detectado: <code class="bg-blue-50 text-blue-950 px-1.5 py-0.5 rounded font-mono border border-blue-200/60">${speaker}</code>
            </span>
          </div>
          <input 
            type="text" 
            data-original-speaker="${speaker.replace(/"/g, '&quot;')}"
            value="${speaker.replace(/"/g, '&quot;')}" 
            placeholder="Nuevo nombre (ej: Rosana Guber)" 
            class="rename-speaker-input w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-800 transition"
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

        // Persistir el resumen en el historial local asociado al archivo activo
        updateHistorySummary(currentActiveFileName, rawSummaryText);

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

  function updateHistorySummary(targetFilename, summaryText) {
    if (!targetFilename || !summaryText) return;
    try {
      let list = getHistory();
      let updated = false;
      for (let i = 0; i < list.length; i++) {
        if (list[i].filename === targetFilename) {
          list[i].summary = summaryText;
          updated = true;
          break;
        }
      }
      if (updated) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.warn("Error al actualizar resumen en historial:", e);
    }
  }

  function deleteFromHistory(index) {
    try {
      let list = getHistory();
      if (index >= 0 && index < list.length) {
        list.splice(index, 1);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
        updateHistoryBadge();
        renderHistoryList();
      }
    } catch (e) {
      console.warn("Error al eliminar del historial:", e);
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
      card.className = "p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-blue-800 dark:hover:border-amber-400/50 transition space-y-2.5";
      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="overflow-hidden">
            <h4 class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
              <i data-lucide="file-audio" class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0"></i>
              <span class="truncate">${item.filename || 'audio.mp3'}</span>
              ${item.summary ? '<span class="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-md shrink-0">⚡ Con resumen</span>' : ''}
            </h4>
            <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span>${dateStr}</span>
              <span>•</span>
              <span class="font-medium text-blue-900 dark:text-amber-400">${getAudioTypeLabel(item.audioType)}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" class="btn-load-history px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-900 hover:bg-blue-800 text-amber-200 hover:text-white transition flex items-center gap-1 shadow-2xs" data-index="${index}">
              <i data-lucide="eye" class="w-3 h-3"></i>
              <span>Cargar en visor</span>
            </button>
            <button type="button" class="btn-copy-history p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-900 dark:hover:text-amber-400 transition" title="Copiar transcripción" data-index="${index}">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="btn-download-docx-history p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition" title="Descargar Word (.docx)" data-index="${index}">
              <i data-lucide="file-type" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="btn-download-pdf-history p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition" title="Descargar PDF" data-index="${index}">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="btn-delete-history p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition" title="Eliminar de historial" data-index="${index}">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
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
        currentActiveFileName = item.filename || "audio.mp3";
        resultFileName.textContent = currentActiveFileName;
        resultModelBadge.textContent = "Historial local";
        transcriptContent.innerHTML = formatTranscript(rawTranscriptText);
        resultSection.classList.remove("hidden");
        if (completedBadge) completedBadge.classList.remove("hidden");
        if (streamingIndicator) streamingIndicator.classList.add("hidden");

        // Si ya cuenta con un resumen previo guardado en el historial, cargarlo directamente
        if (item.summary && item.summary.trim()) {
          rawSummaryText = item.summary;
          summaryContent.innerHTML = formatSummaryMarkdown(rawSummaryText);
          summarySection.classList.remove("hidden");
          summaryBody.classList.remove("hidden");
          isSummaryCollapsed = false;
          if (summaryChevron) summaryChevron.style.transform = "rotate(0deg)";
        } else {
          rawSummaryText = "";
          if (summarySection) summarySection.classList.add("hidden");
        }

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
              filename: item.filename || "transcripcion.mp3",
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
      card.querySelector(".btn-download-pdf-history").addEventListener("click", () => {
        const baseName = (item.filename || "transcripcion").replace(/\.[^/.]+$/, "");
        try {
          generateVectorPdf(item.transcript || "", baseName);
        } catch (err) {
          alert("Error al descargar PDF: " + err.message);
        }
      });

      // Borrar elemento individual del historial
      const btnDelete = card.querySelector(".btn-delete-history");
      if (btnDelete) {
        btnDelete.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteFromHistory(index);
        });
      }

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

  // ─────────────────────────────────────────────────────────────
  // 13. NAVEGACIÓN POR SOLAPAS (TABS)
  // ─────────────────────────────────────────────────────────────
  const tabBtnHome = document.getElementById("tabBtnHome");
  const tabBtnTranscriptor = document.getElementById("tabBtnTranscriptor");
  const tabBtnOrganizer = document.getElementById("tabBtnOrganizer");
  const btnHeaderLogoHome = document.getElementById("btnHeaderLogoHome");
  const btnHeroOpenTranscriptor = document.getElementById("btnHeroOpenTranscriptor");
  const btnHeroOpenOrganizer = document.getElementById("btnHeroOpenOrganizer");
  const btnCardOpenTranscriptor = document.getElementById("btnCardOpenTranscriptor");
  const btnCardOpenOrganizer = document.getElementById("btnCardOpenOrganizer");

  const viewHome = document.getElementById("viewHome");
  const viewTranscriptor = document.getElementById("viewTranscriptor");
  const viewOrganizer = document.getElementById("viewOrganizer");

  function setTabButtonState(btn, isActive, activeTitle, inactiveSub, activeSub) {
    if (!btn) return;
    const activeClasses = "nav-tab-btn flex-1 lg:flex-initial flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 border-[#ffc700] bg-[#001b44]/10 dark:bg-[#001b44]/40 text-[#001b44] dark:text-[#ffc700] font-semibold text-xs transition-all shadow-xs text-left";
    const inactiveClasses = "nav-tab-btn flex-1 lg:flex-initial flex items-center gap-3 px-3.5 py-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium text-xs transition-all text-left";

    btn.className = isActive ? activeClasses : inactiveClasses;
    const iconContainer = btn.querySelector("div");
    if (iconContainer) {
      iconContainer.className = isActive
        ? "w-8 h-8 rounded-lg bg-[#001b44]/15 dark:bg-[#001b44]/60 text-[#ffc700] flex items-center justify-center shrink-0"
        : "w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0";
    }
    const subText = btn.querySelector("div.text-\\[11px\\]");
    if (subText) {
      subText.className = isActive
        ? "hidden lg:block text-[11px] text-[#001b44]/80 dark:text-[#ffc700]/80 font-normal truncate"
        : "hidden lg:block text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate";
    }
  }

  function switchTab(target) {
    // 1. Ocultar todas las vistas principales
    if (viewHome) viewHome.classList.add("hidden");
    if (viewTranscriptor) viewTranscriptor.classList.add("hidden");
    if (viewOrganizer) viewOrganizer.classList.add("hidden");

    // 2. Actualizar estados visuales de los botones de navegación
    setTabButtonState(tabBtnHome, target === "home");
    setTabButtonState(tabBtnTranscriptor, target === "transcriptor");
    setTabButtonState(tabBtnOrganizer, target === "organizer");

    // 3. Mostrar la vista seleccionada y disparar sus acciones
    if (target === "home") {
      if (viewHome) viewHome.classList.remove("hidden");
    } else if (target === "transcriptor") {
      if (viewTranscriptor) viewTranscriptor.classList.remove("hidden");
    } else if (target === "organizer") {
      if (viewOrganizer) viewOrganizer.classList.remove("hidden");
      renderOrganizerView();
    }

    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (window.lucide) window.lucide.createIcons();
  }

  if (tabBtnHome) {
    tabBtnHome.addEventListener("click", () => switchTab("home"));
  }
  if (tabBtnTranscriptor) {
    tabBtnTranscriptor.addEventListener("click", () => switchTab("transcriptor"));
  }
  if (tabBtnOrganizer) {
    tabBtnOrganizer.addEventListener("click", () => switchTab("organizer"));
  }

  // Redirecciones desde la portada y header
  if (btnHeaderLogoHome) {
    btnHeaderLogoHome.addEventListener("click", () => switchTab("home"));
  }
  if (btnHeroOpenTranscriptor) {
    btnHeroOpenTranscriptor.addEventListener("click", () => switchTab("transcriptor"));
  }
  if (btnHeroOpenOrganizer) {
    btnHeroOpenOrganizer.addEventListener("click", () => switchTab("organizer"));
  }
  if (btnCardOpenTranscriptor) {
    btnCardOpenTranscriptor.addEventListener("click", () => switchTab("transcriptor"));
  }
  if (btnCardOpenOrganizer) {
    btnCardOpenOrganizer.addEventListener("click", () => switchTab("organizer"));
  }

  // ─────────────────────────────────────────────────────────────
  // 14. MÓDULO ORGANIZADOR DE MATERIAS (INDEXEDDB LOCAL)
  // ─────────────────────────────────────────────────────────────
  const DB_NAME = "FacuHelpsDB";
  const DB_VERSION = 3;
  let dbInstance = null;

  // Estado de navegación del organizador
  let currentSubject = null; // { id, name, createdAt }
  let currentFolder = null;   // { id, subjectId, name, createdAt }

  // Elementos DOM del Organizador
  const orgBreadcrumbs = document.getElementById("orgBreadcrumbs");
  const orgCurrentTitle = document.getElementById("orgCurrentTitle");
  const orgCurrentSubtitle = document.getElementById("orgCurrentSubtitle");
  const btnNewSubjectModal = document.getElementById("btnNewSubjectModal");
  const btnNewFolderModal = document.getElementById("btnNewFolderModal");
  const btnNewFolderInline = document.getElementById("btnNewFolderInline");
  const orgSubjectsView = document.getElementById("orgSubjectsView");
  const orgSubjectsGrid = document.getElementById("orgSubjectsGrid");
  const orgSubjectsEmpty = document.getElementById("orgSubjectsEmpty");
  const btnNewSubjectEmpty = document.getElementById("btnNewSubjectEmpty");
  const orgSubjectDetailView = document.getElementById("orgSubjectDetailView");
  const orgFoldersGrid = document.getElementById("orgFoldersGrid");
  const orgFoldersEmpty = document.getElementById("orgFoldersEmpty");
  const orgPdfDropZone = document.getElementById("orgPdfDropZone");
  const orgPdfDropZoneLabel = document.getElementById("orgPdfDropZoneLabel");
  const orgPdfFileInput = document.getElementById("orgPdfFileInput");
  const orgPdfSectionTitle = document.getElementById("orgPdfSectionTitle");
  const orgPdfList = document.getElementById("orgPdfList");
  const orgPdfEmpty = document.getElementById("orgPdfEmpty");
  const orgPdfCountLabel = document.getElementById("orgPdfCountLabel");

  // Elementos del Módulo de Notas de la Materia
  const orgSubjectNotesCard = document.getElementById("orgSubjectNotesCard");
  const orgNotesCountLabel = document.getElementById("orgNotesCountLabel");
  const btnNewNoteModal = document.getElementById("btnNewNoteModal");
  const orgNotesGrid = document.getElementById("orgNotesGrid");
  const orgNotesEmpty = document.getElementById("orgNotesEmpty");

  // Modal Crear / Editar Nota
  const modalNote = document.getElementById("modalNote");
  const modalNoteTitle = document.getElementById("modalNoteTitle");
  const formNote = document.getElementById("formNote");
  const noteEditId = document.getElementById("noteEditId");
  const inputNoteTitle = document.getElementById("inputNoteTitle");
  const inputNoteContent = document.getElementById("inputNoteContent");
  const btnCloseNoteModal = document.getElementById("btnCloseNoteModal");
  const btnCancelNoteModal = document.getElementById("btnCancelNoteModal");

  // Elementos del Visor de PDF Integrado y Resumen Académico
  const modalPdfViewer = document.getElementById("modalPdfViewer");
  const pdfViewerFrame = document.getElementById("pdfViewerFrame");
  const pdfViewerTitle = document.getElementById("pdfViewerTitle");
  const pdfViewerSubtitle = document.getElementById("pdfViewerSubtitle");
  const btnPdfViewerDownload = document.getElementById("btnPdfViewerDownload");
  const btnPdfViewerClose = document.getElementById("btnPdfViewerClose");
  const btnPdfViewerSummarize = document.getElementById("btnPdfViewerSummarize");
  const pdfSummaryPanel = document.getElementById("pdfSummaryPanel");
  const pdfSummaryLoading = document.getElementById("pdfSummaryLoading");
  const pdfSummaryContent = document.getElementById("pdfSummaryContent");
  const btnCopyPdfSummary = document.getElementById("btnCopyPdfSummary");
  const btnDownloadPdfSummaryDocx = document.getElementById("btnDownloadPdfSummaryDocx");
  const btnClosePdfSummaryPanel = document.getElementById("btnClosePdfSummaryPanel");
  let currentViewerBlobUrl = null;
  let currentViewerFileItem = null;
  let currentPdfSummaryText = "";

  // Modales del Organizador
  const modalSubject = document.getElementById("modalSubject");
  const formNewSubject = document.getElementById("formNewSubject");
  const inputSubjectName = document.getElementById("inputSubjectName");
  const btnCloseSubjectModal = document.getElementById("btnCloseSubjectModal");
  const btnCancelSubjectModal = document.getElementById("btnCancelSubjectModal");

  const modalFolder = document.getElementById("modalFolder");
  const formNewFolder = document.getElementById("formNewFolder");
  const inputFolderName = document.getElementById("inputFolderName");
  const btnCloseFolderModal = document.getElementById("btnCloseFolderModal");
  const btnCancelFolderModal = document.getElementById("btnCancelFolderModal");

  // Modales de Edición / Renombrado
  const modalEditSubject = document.getElementById("modalEditSubject");
  const formEditSubject = document.getElementById("formEditSubject");
  const editSubjectId = document.getElementById("editSubjectId");
  const inputEditSubjectName = document.getElementById("inputEditSubjectName");
  const btnCloseEditSubjectModal = document.getElementById("btnCloseEditSubjectModal");
  const btnCancelEditSubjectModal = document.getElementById("btnCancelEditSubjectModal");

  const modalEditFolder = document.getElementById("modalEditFolder");
  const formEditFolder = document.getElementById("formEditFolder");
  const editFolderId = document.getElementById("editFolderId");
  const inputEditFolderName = document.getElementById("inputEditFolderName");
  const btnCloseEditFolderModal = document.getElementById("btnCloseEditFolderModal");
  const btnCancelEditFolderModal = document.getElementById("btnCancelEditFolderModal");

  // Inicialización de IndexedDB
  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (dbInstance) {
        resolve(dbInstance);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        // Almacén de Materias
        if (!db.objectStoreNames.contains("subjects")) {
          db.createObjectStore("subjects", { keyPath: "id", autoIncrement: true });
        }
        // Almacén de Subcarpetas (con índice de subjectId)
        if (!db.objectStoreNames.contains("folders")) {
          const folderStore = db.createObjectStore("folders", { keyPath: "id", autoIncrement: true });
          folderStore.createIndex("subjectId", "subjectId", { unique: false });
        }
        // Almacén de Archivos PDF (con índices folderId y subjectId)
        let fileStore;
        if (!db.objectStoreNames.contains("files")) {
          fileStore = db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
          fileStore.createIndex("folderId", "folderId", { unique: false });
        } else {
          fileStore = e.target.transaction.objectStore("files");
        }
        if (!fileStore.indexNames.contains("subjectId")) {
          fileStore.createIndex("subjectId", "subjectId", { unique: false });
        }
        // Almacén de Notas de Materias (con índice de subjectId)
        if (!db.objectStoreNames.contains("notes")) {
          const notesStore = db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
          notesStore.createIndex("subjectId", "subjectId", { unique: false });
        }
      };
      request.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  // Operaciones DB: Materias
  async function dbGetSubjects() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("subjects", "readonly");
      const store = tx.objectStore("subjects");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbAddSubject(name) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("subjects", "readwrite");
      const store = tx.objectStore("subjects");
      const req = store.add({ name, createdAt: Date.now() });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbUpdateSubject(subjectId, newName) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("subjects", "readwrite");
      const store = tx.objectStore("subjects");
      const getReq = store.get(Number(subjectId));
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) {
          reject(new Error("Materia no encontrada"));
          return;
        }
        item.name = newName;
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve(putReq.result);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  // Operaciones DB: Notas de la Materia
  async function dbGetNotesBySubject(subjectId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("notes", "readonly");
      const store = tx.objectStore("notes");
      const index = store.index("subjectId");
      const req = index.getAll(Number(subjectId));
      req.onsuccess = () => {
        const notes = req.result || [];
        // Ordenar notas por fecha de última actualización descendente
        notes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        resolve(notes);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function dbAddNote(subjectId, title, content) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");
      const now = Date.now();
      const noteItem = {
        subjectId: Number(subjectId),
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now
      };
      const req = store.add(noteItem);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbUpdateNote(noteId, title, content) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");
      const getReq = store.get(Number(noteId));
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) {
          reject(new Error("Nota no encontrada"));
          return;
        }
        item.title = title.trim();
        item.content = content.trim();
        item.updatedAt = Date.now();
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve(putReq.result);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function dbDeleteNote(noteId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");
      const req = store.delete(Number(noteId));
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function dbGetSubject(subjectId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("subjects", "readonly");
      const store = tx.objectStore("subjects");
      const getReq = store.get(Number(subjectId));
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function dbDeleteSubject(subjectId) {
    const db = await openDatabase();
    // Eliminar también subcarpetas, PDFs asociados y notas
    const folders = await dbGetFoldersBySubject(subjectId);
    for (const f of folders) {
      await dbDeleteFolder(f.id);
    }
    const directFiles = await dbGetFilesBySubject(subjectId);
    for (const f of directFiles) {
      await dbDeleteFile(f.id);
    }
    const notes = await dbGetNotesBySubject(subjectId);
    for (const n of notes) {
      await dbDeleteNote(n.id);
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("subjects", "readwrite");
      const store = tx.objectStore("subjects");
      const req = store.delete(Number(subjectId));
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Operaciones DB: Subcarpetas
  async function dbGetFoldersBySubject(subjectId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("folders", "readonly");
      const store = tx.objectStore("folders");
      const index = store.index("subjectId");
      const req = index.getAll(subjectId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbAddFolder(subjectId, name) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("folders", "readwrite");
      const store = tx.objectStore("folders");
      const req = store.add({ subjectId, name, createdAt: Date.now() });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbUpdateFolder(folderId, newName) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("folders", "readwrite");
      const store = tx.objectStore("folders");
      const getReq = store.get(Number(folderId));
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) {
          reject(new Error("Subcarpeta no encontrada"));
          return;
        }
        item.name = newName;
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve(putReq.result);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function dbDeleteFolder(folderId) {
    const db = await openDatabase();
    // Eliminar archivos asociados a la subcarpeta
    const files = await dbGetFilesByFolder(folderId);
    for (const file of files) {
      await dbDeleteFile(file.id);
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("folders", "readwrite");
      const store = tx.objectStore("folders");
      const req = store.delete(folderId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Operaciones DB: Archivos PDF
  async function dbGetFilesByFolder(folderId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      const index = store.index("folderId");
      const req = index.getAll(folderId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbGetFilesBySubject(subjectId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      if (store.indexNames.contains("subjectId")) {
        const index = store.index("subjectId");
        const req = index.getAll(subjectId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } else {
        // Fallback
        const req = store.getAll();
        req.onsuccess = () => {
          const all = req.result || [];
          resolve(all.filter(f => f.subjectId === subjectId));
        };
        req.onerror = () => reject(req.error);
      }
    });
  }

  async function dbAddFile(subjectId, folderId, file) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const item = {
        subjectId,
        folderId: folderId || null,
        name: file.name,
        size: file.size,
        type: file.type || "application/pdf",
        blob: file,
        uploadedAt: Date.now()
      };
      const req = store.add(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbUpdateFileSummary(fileId, summary) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const getReq = store.get(Number(fileId));
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) {
          reject(new Error("Archivo PDF no encontrado"));
          return;
        }
        item.summary = summary;
        item.summaryUpdatedAt = Date.now();
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve(putReq.result);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function dbGetFile(fileId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      const getReq = store.get(Number(fileId));
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function dbDeleteFile(fileId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const req = store.delete(Number(fileId));
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Visor de PDF Integrado (Embebido a Pantalla Completa)
  function openEmbeddedPdfViewer(fileItem) {
    if (!fileItem || !fileItem.blob) return;
    currentViewerFileItem = fileItem;

    if (currentViewerBlobUrl) {
      URL.revokeObjectURL(currentViewerBlobUrl);
      currentViewerBlobUrl = null;
    }

    currentViewerBlobUrl = URL.createObjectURL(fileItem.blob);
    if (pdfViewerTitle) pdfViewerTitle.textContent = fileItem.name;
    if (pdfViewerSubtitle) {
      const parentName = currentFolder 
        ? `${currentSubject ? currentSubject.name + ' > ' : ''}${currentFolder.name}` 
        : (currentSubject ? currentSubject.name : 'Materia');
      pdfViewerSubtitle.textContent = `${formatBytes(fileItem.size)} • ${parentName}`;
    }
    if (pdfViewerFrame) {
      pdfViewerFrame.src = currentViewerBlobUrl;
    }

    // El visor abre 100% en modo lectura (panel lateral cerrado por defecto).
    // El resumen se genera o muestra únicamente a demanda cuando el usuario presiona '⚡ Resumen con IA'.
    if (pdfSummaryPanel) pdfSummaryPanel.classList.add("hidden");
    currentPdfSummaryText = (fileItem.summary && fileItem.summary.trim()) ? fileItem.summary : "";

    if (btnPdfViewerSummarize) {
      if (currentPdfSummaryText) {
        btnPdfViewerSummarize.innerHTML = '<i data-lucide="zap" class="w-3.5 h-3.5 text-[#ffc700]"></i> <span>⚡ Ver Resumen Guardado</span>';
      } else {
        btnPdfViewerSummarize.innerHTML = '<i data-lucide="zap" class="w-3.5 h-3.5 text-[#ffc700]"></i> <span>⚡ Resumen con IA</span>';
      }
    }

    if (modalPdfViewer) {
      modalPdfViewer.classList.remove("hidden");
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function closeEmbeddedPdfViewer() {
    if (pdfViewerFrame) {
      pdfViewerFrame.src = "about:blank";
    }
    if (modalPdfViewer) {
      modalPdfViewer.classList.add("hidden");
    }
    if (pdfSummaryPanel) {
      pdfSummaryPanel.classList.add("hidden");
    }
    if (currentViewerBlobUrl) {
      URL.revokeObjectURL(currentViewerBlobUrl);
      currentViewerBlobUrl = null;
    }
    currentViewerFileItem = null;
    currentPdfSummaryText = "";
  }

  if (btnPdfViewerClose) {
    btnPdfViewerClose.addEventListener("click", closeEmbeddedPdfViewer);
  }

  if (btnPdfViewerDownload) {
    btnPdfViewerDownload.addEventListener("click", () => {
      if (!currentViewerFileItem || !currentViewerFileItem.blob) return;
      const blobUrl = URL.createObjectURL(currentViewerFileItem.blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = currentViewerFileItem.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    });
  }

  // Mostrar resumen en el panel lateral del visor
  function showPdfSummaryInViewer(summaryText) {
    currentPdfSummaryText = summaryText;
    if (!pdfSummaryPanel || !pdfSummaryContent) return;
    pdfSummaryContent.innerHTML = formatSummaryMarkdown(summaryText);
    if (pdfSummaryLoading) pdfSummaryLoading.classList.add("hidden");
    pdfSummaryContent.classList.remove("hidden");
    pdfSummaryPanel.classList.remove("hidden");
    if (btnPdfViewerSummarize) {
      btnPdfViewerSummarize.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i> <span>Resumen Listo</span>';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // Generar resumen académico para el archivo actualmente visualizado
  async function generateAcademicSummaryForCurrentPdf() {
    if (!currentViewerFileItem || !currentViewerFileItem.blob) {
      alert("No hay ningún archivo PDF cargado en el visor.");
      return;
    }

    if (!pdfSummaryPanel) return;
    pdfSummaryPanel.classList.remove("hidden");
    if (pdfSummaryLoading) pdfSummaryLoading.classList.remove("hidden");
    if (pdfSummaryContent) {
      pdfSummaryContent.classList.add("hidden");
      pdfSummaryContent.innerHTML = "";
    }

    const originalBtnHtml = btnPdfViewerSummarize ? btnPdfViewerSummarize.innerHTML : "";
    if (btnPdfViewerSummarize) {
      btnPdfViewerSummarize.disabled = true;
      btnPdfViewerSummarize.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div> <span>Generando análisis...</span>';
    }

    const apiKey = (localStorage.getItem("gemini_api_key") || "").trim();

    try {
      const formData = new FormData();
      formData.append("file", currentViewerFileItem.blob, currentViewerFileItem.name);
      if (apiKey) {
        formData.append("api_key", apiKey);
      }
      formData.append("model_name", "gemini-3.8-flash");

      const response = await fetch("/api/summarize-pdf", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Error en el servidor al generar el resumen académico del PDF.");
      }

      const data = await response.json();
      const summaryText = data.summary || "";

      // Guardar en memoria y en IndexedDB
      currentViewerFileItem.summary = summaryText;
      currentViewerFileItem.summaryUpdatedAt = Date.now();
      await dbUpdateFileSummary(currentViewerFileItem.id, summaryText);

      // Mostrar en el panel lateral
      showPdfSummaryInViewer(summaryText);

      // Refrescar listado de archivos para actualizar etiqueta de botón en la tarjeta
      renderFilesList();

    } catch (err) {
      alert("Error al generar resumen académico: " + err.message);
      if (pdfSummaryLoading) pdfSummaryLoading.classList.add("hidden");
    } finally {
      if (btnPdfViewerSummarize) {
        btnPdfViewerSummarize.disabled = false;
        if (currentViewerFileItem && currentViewerFileItem.summary) {
          btnPdfViewerSummarize.innerHTML = '<i data-lucide="zap" class="w-3.5 h-3.5 text-[#ffc700]"></i> <span>⚡ Ver Resumen Guardado</span>';
        } else {
          btnPdfViewerSummarize.innerHTML = '<i data-lucide="zap" class="w-3.5 h-3.5 text-[#ffc700]"></i> <span>⚡ Resumen con IA</span>';
        }
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  if (btnPdfViewerSummarize) {
    btnPdfViewerSummarize.addEventListener("click", () => {
      if (currentViewerFileItem && currentViewerFileItem.summary && currentViewerFileItem.summary.trim()) {
        // Si ya tiene resumen guardado en IndexedDB: abrir o alternar el panel instantáneamente sin consultar la API
        if (pdfSummaryPanel) {
          if (pdfSummaryPanel.classList.contains("hidden")) {
            showPdfSummaryInViewer(currentViewerFileItem.summary);
          } else {
            pdfSummaryPanel.classList.add("hidden");
          }
        }
      } else {
        // Si no tiene resumen previo, generarlo a demanda
        generateAcademicSummaryForCurrentPdf();
      }
    });
  }

  if (btnClosePdfSummaryPanel) {
    btnClosePdfSummaryPanel.addEventListener("click", () => {
      if (pdfSummaryPanel) pdfSummaryPanel.classList.add("hidden");
    });
  }

  if (btnCopyPdfSummary) {
    btnCopyPdfSummary.addEventListener("click", async () => {
      if (!currentPdfSummaryText) return;
      try {
        await navigator.clipboard.writeText(currentPdfSummaryText);
        const originalHtml = btnCopyPdfSummary.innerHTML;
        btnCopyPdfSummary.innerHTML = '<i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> <span class="text-emerald-700 font-medium">¡Copiado!</span>';
        setTimeout(() => {
          btnCopyPdfSummary.innerHTML = originalHtml;
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      } catch (err) {
        alert("No se pudo copiar el resumen al portapapeles.");
      }
    });
  }

  if (btnDownloadPdfSummaryDocx) {
    btnDownloadPdfSummaryDocx.addEventListener("click", async () => {
      if (!currentPdfSummaryText) {
        alert("Aún no hay resumen generado para descargar.");
        return;
      }
      const baseName = (currentViewerFileItem ? currentViewerFileItem.name.replace(/\.[^/.]+$/, "") : "resumen_academico");
      const originalText = btnDownloadPdfSummaryDocx.innerHTML;

      try {
        btnDownloadPdfSummaryDocx.disabled = true;
        btnDownloadPdfSummaryDocx.innerHTML = '<div class="w-3 h-3 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div> <span>Word...</span>';

        const res = await fetch("/api/export-summary-docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `${baseName}_resumen_academico`,
            summary: currentPdfSummaryText
          })
        });

        if (!res.ok) throw new Error("Error en el servidor al exportar el resumen a Word.");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${baseName}_resumen_academico.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert("No se pudo exportar a Word: " + err.message);
      } finally {
        btnDownloadPdfSummaryDocx.disabled = false;
        btnDownloadPdfSummaryDocx.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Cerrar visor con tecla Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalPdfViewer && !modalPdfViewer.classList.contains("hidden")) {
      closeEmbeddedPdfViewer();
    }
  });

  // Renderizado dinámico del Organizador
  async function renderOrganizerView() {
    renderBreadcrumbs();

    if (!currentSubject) {
      // Nivel 1: Lista general de Materias
      orgSubjectsView.classList.remove("hidden");
      orgSubjectDetailView.classList.add("hidden");
      btnNewSubjectModal.classList.remove("hidden");
      btnNewFolderModal.classList.add("hidden");
      orgCurrentTitle.textContent = "Materias";
      orgCurrentSubtitle.textContent = "Organizador académico 100% privado en tu navegador (IndexedDB local)";
      await renderSubjectsList();
    } else {
      // Nivel 2 y 3: Interior de la Materia (Subcarpetas opcionales + PDFs)
      orgSubjectsView.classList.add("hidden");
      orgSubjectDetailView.classList.remove("hidden");
      btnNewSubjectModal.classList.add("hidden");
      btnNewFolderModal.classList.remove("hidden");

      if (!currentFolder) {
        // Vista directa de la Materia
        orgCurrentTitle.textContent = currentSubject.name;
        orgCurrentSubtitle.textContent = "Subcarpetas temáticas opcionales, notas de cursada y PDFs directos";
        if (orgPdfSectionTitle) orgPdfSectionTitle.textContent = `PDFs directos de ${currentSubject.name}`;
        if (orgPdfDropZoneLabel) orgPdfDropZoneLabel.textContent = `Arrastra tus archivos PDF aquí a "${currentSubject.name}"`;
      } else {
        // Vista enfocada en una subcarpeta
        orgCurrentTitle.textContent = `${currentSubject.name} › ${currentFolder.name}`;
        orgCurrentSubtitle.textContent = `Subcarpeta: ${currentFolder.name}`;
        if (orgPdfSectionTitle) orgPdfSectionTitle.textContent = `PDFs en ${currentFolder.name}`;
        if (orgPdfDropZoneLabel) orgPdfDropZoneLabel.textContent = `Arrastra tus archivos PDF aquí a "${currentFolder.name}"`;
      }

      await renderNotesList();
      await renderFoldersList();
      await renderFilesList();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function renderBreadcrumbs() {
    if (!orgBreadcrumbs) return;
    orgBreadcrumbs.innerHTML = "";

    // Migaja raíz: Materias
    const rootBtn = document.createElement("button");
    rootBtn.type = "button";
    rootBtn.className = currentSubject 
      ? "hover:text-blue-900 dark:hover:text-amber-400 font-semibold transition" 
      : "text-slate-800 dark:text-slate-200 font-bold";
    rootBtn.textContent = "Materias";
    rootBtn.addEventListener("click", () => {
      currentSubject = null;
      currentFolder = null;
      renderOrganizerView();
    });
    orgBreadcrumbs.appendChild(rootBtn);

    if (currentSubject) {
      const sep1 = document.createElement("span");
      sep1.textContent = ">";
      sep1.className = "text-slate-400";
      orgBreadcrumbs.appendChild(sep1);

      const subjBtn = document.createElement("button");
      subjBtn.type = "button";
      subjBtn.className = currentFolder 
        ? "hover:text-blue-900 dark:hover:text-amber-400 font-semibold transition truncate max-w-[150px]" 
        : "text-slate-800 dark:text-slate-200 font-bold truncate max-w-[150px]";
      subjBtn.textContent = currentSubject.name;
      subjBtn.addEventListener("click", () => {
        currentFolder = null;
        renderOrganizerView();
      });
      orgBreadcrumbs.appendChild(subjBtn);
    }

    if (currentFolder) {
      const sep2 = document.createElement("span");
      sep2.textContent = ">";
      sep2.className = "text-slate-400";
      orgBreadcrumbs.appendChild(sep2);

      const foldSpan = document.createElement("span");
      foldSpan.className = "text-slate-800 dark:text-slate-200 font-bold truncate max-w-[150px]";
      foldSpan.textContent = currentFolder.name;
      orgBreadcrumbs.appendChild(foldSpan);
    }
  }

  // Render Nivel 1: Materias
  async function renderSubjectsList() {
    const subjects = await dbGetSubjects();
    orgSubjectsGrid.innerHTML = "";

    if (subjects.length === 0) {
      orgSubjectsEmpty.classList.remove("hidden");
      orgSubjectsGrid.classList.add("hidden");
      return;
    }

    orgSubjectsEmpty.classList.add("hidden");
    orgSubjectsGrid.classList.remove("hidden");

    for (const subj of subjects) {
      const folders = await dbGetFoldersBySubject(subj.id);
      let totalFiles = 0;
      for (const f of folders) {
        const files = await dbGetFilesByFolder(f.id);
        totalFiles += files.length;
      }
      const directFiles = await dbGetFilesBySubject(subj.id);
      totalFiles += directFiles.length;
      const subjNotes = await dbGetNotesBySubject(subj.id);

      const card = document.createElement("div");
      card.className = "p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-800 dark:hover:border-amber-400/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between group";
      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-xl bg-blue-50 dark:bg-slate-800/80 text-blue-900 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <i data-lucide="folder" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-900 dark:group-hover:text-amber-400 transition-colors">${subj.name}</h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                ${subjNotes.length} ${subjNotes.length === 1 ? 'nota' : 'notas'} • ${folders.length} ${folders.length === 1 ? 'subcarpeta' : 'subcarpetas'} • ${totalFiles} ${totalFiles === 1 ? 'PDF' : 'PDFs'}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" class="btn-edit-subject p-1.5 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-blue-50 dark:hover:bg-slate-800/60 transition" title="Editar / Renombrar materia">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button type="button" class="btn-delete-subject p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition" title="Eliminar materia">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-blue-900 dark:text-amber-400 font-medium">
          <span>Abrir materia</span>
          <i data-lucide="chevron-right" class="w-4 h-4 group-hover:translate-x-0.5 transition-transform"></i>
        </div>
      `;

      // Entrar a la materia
      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-delete-subject") || e.target.closest(".btn-edit-subject")) return;
        currentSubject = subj;
        currentFolder = null;
        renderOrganizerView();
      });

      // Editar / Renombrar materia
      card.querySelector(".btn-edit-subject").addEventListener("click", (e) => {
        e.stopPropagation();
        if (editSubjectId && inputEditSubjectName && modalEditSubject) {
          editSubjectId.value = subj.id;
          inputEditSubjectName.value = subj.name;
          modalEditSubject.classList.remove("hidden");
          inputEditSubjectName.focus();
        }
      });

      // Eliminar materia
      card.querySelector(".btn-delete-subject").addEventListener("click", async (e) => {
        e.stopPropagation();
        if (confirm(`¿Estás seguro de eliminar la materia "${subj.name}" y todos sus archivos guardados?`)) {
          await dbDeleteSubject(subj.id);
          renderSubjectsList();
        }
      });

      orgSubjectsGrid.appendChild(card);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // Render Notas de la Materia
  async function renderNotesList() {
    if (!currentSubject || !orgNotesGrid) return;
    const notes = await dbGetNotesBySubject(currentSubject.id);
    orgNotesGrid.innerHTML = "";

    if (orgNotesCountLabel) {
      orgNotesCountLabel.textContent = `${notes.length} ${notes.length === 1 ? 'nota' : 'notas'}`;
    }

    if (notes.length === 0) {
      if (orgNotesEmpty) orgNotesEmpty.classList.remove("hidden");
      orgNotesGrid.classList.add("hidden");
      return;
    }

    if (orgNotesEmpty) orgNotesEmpty.classList.add("hidden");
    orgNotesGrid.classList.remove("hidden");

    for (const note of notes) {
      const dateStr = note.updatedAt 
        ? new Date(note.updatedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) 
        : "";

      const card = document.createElement("div");
      card.className = "p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs transition flex flex-col justify-between group";

      // Vista previa de 2 líneas de texto
      const previewText = note.content ? note.content.trim() : "(Sin contenido adicional)";

      card.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-2.5 mb-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
              </div>
              <h4 class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">${note.title || 'Nota sin título'}</h4>
            </div>
            <div class="flex items-center gap-0.5 shrink-0">
              <button type="button" class="btn-edit-note p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition" title="Editar nota">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>
              <button type="button" class="btn-delete-note p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition" title="Eliminar nota">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-wrap break-words">
            ${previewText}
          </p>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>${dateStr}</span>
          <button type="button" class="btn-read-note text-blue-900 dark:text-amber-400 hover:underline font-medium flex items-center gap-1">
            <span>Abrir / Editar</span>
            <i data-lucide="chevron-right" class="w-3 h-3"></i>
          </button>
        </div>
      `;

      // Abrir / Editar nota al hacer clic
      const openEdit = () => {
        if (!modalNote || !inputNoteTitle || !inputNoteContent || !noteEditId) return;
        noteEditId.value = note.id;
        inputNoteTitle.value = note.title;
        inputNoteContent.value = note.content;
        if (modalNoteTitle) {
          modalNoteTitle.innerHTML = `<i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Editar Nota`;
        }
        modalNote.classList.remove("hidden");
        inputNoteTitle.focus();
        if (window.lucide) window.lucide.createIcons();
      };

      card.querySelector(".btn-edit-note").addEventListener("click", (e) => {
        e.stopPropagation();
        openEdit();
      });

      card.querySelector(".btn-read-note").addEventListener("click", (e) => {
        e.stopPropagation();
        openEdit();
      });

      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-delete-note") || e.target.closest(".btn-edit-note") || e.target.closest(".btn-read-note")) return;
        openEdit();
      });

      // Eliminar nota
      card.querySelector(".btn-delete-note").addEventListener("click", async (e) => {
        e.stopPropagation();
        if (confirm(`¿Estás seguro de eliminar la nota "${note.title || 'sin título'}"?`)) {
          await dbDeleteNote(note.id);
          renderNotesList();
        }
      });

      orgNotesGrid.appendChild(card);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // Render Subcarpetas
  async function renderFoldersList() {
    if (!currentSubject) return;
    const folders = await dbGetFoldersBySubject(currentSubject.id);
    orgFoldersGrid.innerHTML = "";

    if (folders.length === 0) {
      orgFoldersEmpty.classList.remove("hidden");
      orgFoldersGrid.classList.add("hidden");
      return;
    }

    orgFoldersEmpty.classList.add("hidden");
    orgFoldersGrid.classList.remove("hidden");

    for (const fold of folders) {
      const files = await dbGetFilesByFolder(fold.id);
      const isSelected = currentFolder && currentFolder.id === fold.id;

      const card = document.createElement("div");
      card.className = `p-4 rounded-xl border ${isSelected ? 'border-blue-800 dark:border-amber-400 bg-blue-50/50 dark:bg-slate-800/80 ring-1 ring-amber-400/40' : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600/50'} hover:shadow-xs transition cursor-pointer flex flex-col justify-between group`;
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-lg ${isSelected ? 'bg-blue-900 text-amber-300' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <i data-lucide="folder-open" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">${fold.name}</h4>
              <p class="text-[11px] text-slate-400 dark:text-slate-500">
                ${files.length} ${files.length === 1 ? 'PDF' : 'PDFs'}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-0.5 shrink-0">
            <button type="button" class="btn-edit-folder p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition" title="Renombrar subcarpeta">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="btn-delete-folder p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition" title="Eliminar subcarpeta">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] ${isSelected ? 'text-blue-900 dark:text-amber-400 font-bold' : 'text-slate-500 font-medium'}">
          <span>${isSelected ? '✓ Subcarpeta seleccionada' : 'Ver PDFs de esta subcarpeta'}</span>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"></i>
        </div>
      `;

      // Entrar o alternar la subcarpeta
      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-delete-folder") || e.target.closest(".btn-edit-folder")) return;
        if (currentFolder && currentFolder.id === fold.id) {
          // Si ya está seleccionada, volver a ver todos los PDFs directos de la materia
          currentFolder = null;
        } else {
          currentFolder = fold;
        }
        renderOrganizerView();
      });

      // Editar / Renombrar subcarpeta
      card.querySelector(".btn-edit-folder").addEventListener("click", (e) => {
        e.stopPropagation();
        if (editFolderId && inputEditFolderName && modalEditFolder) {
          editFolderId.value = fold.id;
          inputEditFolderName.value = fold.name;
          modalEditFolder.classList.remove("hidden");
          inputEditFolderName.focus();
        }
      });

      // Eliminar subcarpeta
      card.querySelector(".btn-delete-folder").addEventListener("click", async (e) => {
        e.stopPropagation();
        if (confirm(`¿Estás seguro de eliminar la subcarpeta "${fold.name}" y sus PDFs?`)) {
          await dbDeleteFolder(fold.id);
          if (currentFolder && currentFolder.id === fold.id) {
            currentFolder = null;
          }
          renderOrganizerView();
        }
      });

      orgFoldersGrid.appendChild(card);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // Render Archivos PDF (Directos de la materia si currentFolder es null, o de la subcarpeta seleccionada)
  async function renderFilesList() {
    if (!currentSubject) return;

    let files = [];
    if (currentFolder) {
      files = await dbGetFilesByFolder(currentFolder.id);
    } else {
      files = await dbGetFilesBySubject(currentSubject.id);
    }

    orgPdfList.innerHTML = "";
    orgPdfCountLabel.textContent = `${files.length} ${files.length === 1 ? 'archivo' : 'archivos'}`;

    if (files.length === 0) {
      orgPdfEmpty.classList.remove("hidden");
      return;
    }

    orgPdfEmpty.classList.add("hidden");

    files.forEach((fileItem) => {
      const dateStr = fileItem.uploadedAt 
        ? new Date(fileItem.uploadedAt).toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit', year: 'numeric' })
        : "Reciente";

      const row = document.createElement("div");
      row.className = "px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition";
      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <i data-lucide="file-text" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">${fileItem.name}</h4>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              ${formatBytes(fileItem.size)} • Guardado el ${dateStr}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" class="btn-summarize-pdf-card px-2.5 py-1.5 rounded-lg border border-[#ffc700]/40 text-xs font-semibold flex items-center gap-1 shadow-2xs hover:brightness-125 transition" style="background-color: #001b44; color: #ffc700;" title="Generar o ver Resumen Académico con IA">
            <i data-lucide="zap" class="w-3.5 h-3.5" style="color: #ffc700;"></i>
            <span>${fileItem.summary ? 'Ver Resumen' : '⚡ Resumen IA'}</span>
          </button>
          <button type="button" class="btn-open-pdf px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>Ver / Leer</span>
          </button>
          <button type="button" class="btn-download-pdf-db p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition" title="Descargar PDF">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" class="btn-delete-pdf-db p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 transition" title="Eliminar archivo">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;

      // Resumen IA desde la tarjeta del PDF
      row.querySelector(".btn-summarize-pdf-card").addEventListener("click", () => {
        openEmbeddedPdfViewer(fileItem);
        if (!fileItem.summary) {
          generateAcademicSummaryForCurrentPdf();
        }
      });

      // Ver / Leer PDF dentro del visor embebido integrado
      row.querySelector(".btn-open-pdf").addEventListener("click", () => {
        openEmbeddedPdfViewer(fileItem);
      });

      // Descargar PDF
      row.querySelector(".btn-download-pdf-db").addEventListener("click", () => {
        if (!fileItem.blob) return;
        const blobUrl = URL.createObjectURL(fileItem.blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileItem.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      });

      // Eliminar PDF
      row.querySelector(".btn-delete-pdf-db").addEventListener("click", async () => {
        if (confirm(`¿Eliminar el archivo "${fileItem.name}"?`)) {
          await dbDeleteFile(fileItem.id);
          renderFilesList();
        }
      });

      orgPdfList.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Modales de creación de Materia y Subcarpeta
  if (btnNewSubjectModal) {
    btnNewSubjectModal.addEventListener("click", () => {
      inputSubjectName.value = "";
      modalSubject.classList.remove("hidden");
      inputSubjectName.focus();
    });
  }
  if (btnNewSubjectEmpty) {
    btnNewSubjectEmpty.addEventListener("click", () => {
      inputSubjectName.value = "";
      modalSubject.classList.remove("hidden");
      inputSubjectName.focus();
    });
  }
  if (btnCloseSubjectModal) {
    btnCloseSubjectModal.addEventListener("click", () => modalSubject.classList.add("hidden"));
  }
  if (btnCancelSubjectModal) {
    btnCancelSubjectModal.addEventListener("click", () => modalSubject.classList.add("hidden"));
  }
  if (modalSubject) {
    modalSubject.addEventListener("click", (e) => {
      if (e.target === modalSubject) modalSubject.classList.add("hidden");
    });
  }
  if (formNewSubject) {
    formNewSubject.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = inputSubjectName.value.trim();
      if (!name) return;
      await dbAddSubject(name);
      modalSubject.classList.add("hidden");
      renderSubjectsList();
    });
  }

  if (btnNewFolderModal) {
    btnNewFolderModal.addEventListener("click", () => {
      inputFolderName.value = "";
      modalFolder.classList.remove("hidden");
      inputFolderName.focus();
    });
  }
  if (btnNewFolderInline) {
    btnNewFolderInline.addEventListener("click", () => {
      inputFolderName.value = "";
      modalFolder.classList.remove("hidden");
      inputFolderName.focus();
    });
  }
  if (btnCloseFolderModal) {
    btnCloseFolderModal.addEventListener("click", () => modalFolder.classList.add("hidden"));
  }
  if (btnCancelFolderModal) {
    btnCancelFolderModal.addEventListener("click", () => modalFolder.classList.add("hidden"));
  }
  if (modalFolder) {
    modalFolder.addEventListener("click", (e) => {
      if (e.target === modalFolder) modalFolder.classList.add("hidden");
    });
  }
  if (formNewFolder) {
    formNewFolder.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentSubject) return;
      const name = inputFolderName.value.trim();
      if (!name) return;
      await dbAddFolder(currentSubject.id, name);
      modalFolder.classList.add("hidden");
      renderOrganizerView();
    });
  }

  // Eventos de edición / renombrado de Materia
  if (btnCloseEditSubjectModal) {
    btnCloseEditSubjectModal.addEventListener("click", () => modalEditSubject.classList.add("hidden"));
  }
  if (btnCancelEditSubjectModal) {
    btnCancelEditSubjectModal.addEventListener("click", () => modalEditSubject.classList.add("hidden"));
  }
  if (modalEditSubject) {
    modalEditSubject.addEventListener("click", (e) => {
      if (e.target === modalEditSubject) modalEditSubject.classList.add("hidden");
    });
  }
  if (formEditSubject) {
    formEditSubject.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = editSubjectId.value;
      const newName = inputEditSubjectName.value.trim();
      if (!id || !newName) return;
      await dbUpdateSubject(id, newName);
      if (currentSubject && Number(currentSubject.id) === Number(id)) {
        currentSubject.name = newName;
      }
      modalEditSubject.classList.add("hidden");
      renderOrganizerView();
    });
  }

  // Eventos de edición / renombrado de Subcarpeta
  if (btnCloseEditFolderModal) {
    btnCloseEditFolderModal.addEventListener("click", () => modalEditFolder.classList.add("hidden"));
  }
  if (btnCancelEditFolderModal) {
    btnCancelEditFolderModal.addEventListener("click", () => modalEditFolder.classList.add("hidden"));
  }
  if (modalEditFolder) {
    modalEditFolder.addEventListener("click", (e) => {
      if (e.target === modalEditFolder) modalEditFolder.classList.add("hidden");
    });
  }
  if (formEditFolder) {
    formEditFolder.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = editFolderId.value;
      const newName = inputEditFolderName.value.trim();
      if (!id || !newName) return;
      await dbUpdateFolder(id, newName);
      if (currentFolder && Number(currentFolder.id) === Number(id)) {
        currentFolder.name = newName;
      }
      modalEditFolder.classList.add("hidden");
      renderOrganizerView();
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Eventos: Notas de la Materia (Crear / Editar / Guardar)
  // ─────────────────────────────────────────────────────────────
  function openNewNoteModal() {
    if (!modalNote || !inputNoteTitle || !inputNoteContent || !noteEditId) return;
    noteEditId.value = "";
    inputNoteTitle.value = "";
    inputNoteContent.value = "";
    if (modalNoteTitle) {
      modalNoteTitle.innerHTML = `<i data-lucide="file-text" class="w-5 h-5 text-amber-500"></i> Nueva Nota`;
    }
    modalNote.classList.remove("hidden");
    inputNoteTitle.focus();
    if (window.lucide) window.lucide.createIcons();
  }

  function closeNoteModal() {
    if (modalNote) modalNote.classList.add("hidden");
  }

  if (btnNewNoteModal) {
    btnNewNoteModal.addEventListener("click", openNewNoteModal);
  }
  if (btnCloseNoteModal) {
    btnCloseNoteModal.addEventListener("click", closeNoteModal);
  }
  if (btnCancelNoteModal) {
    btnCancelNoteModal.addEventListener("click", closeNoteModal);
  }
  if (modalNote) {
    modalNote.addEventListener("click", (e) => {
      if (e.target === modalNote) closeNoteModal();
    });
  }

  if (formNote) {
    formNote.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentSubject) return;

      const editId = noteEditId.value;
      const title = inputNoteTitle.value.trim();
      const content = inputNoteContent.value;

      if (!title) return;

      try {
        if (editId) {
          await dbUpdateNote(editId, title, content);
        } else {
          await dbAddNote(currentSubject.id, title, content);
        }
        closeNoteModal();
        await renderNotesList();
      } catch (err) {
        console.error("Error al guardar nota:", err);
      }
    });
  }

  // Subida de PDFs en Zona Drag & Drop (Nivel Materia o Subcarpeta)
  if (orgPdfDropZone && orgPdfFileInput) {
    orgPdfDropZone.addEventListener("click", () => orgPdfFileInput.click());

    orgPdfFileInput.addEventListener("change", async (e) => {
      if (e.target.files.length > 0 && currentSubject) {
        for (const f of e.target.files) {
          if (f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf") {
            const folderId = currentFolder ? currentFolder.id : null;
            await dbAddFile(currentSubject.id, folderId, f);
          }
        }
        orgPdfFileInput.value = "";
        renderFilesList();
      }
    });

    orgPdfDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      orgPdfDropZone.classList.add("border-amber-400", "bg-blue-50/30");
    });

    orgPdfDropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      orgPdfDropZone.classList.remove("border-amber-400", "bg-blue-50/30");
    });

    orgPdfDropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      orgPdfDropZone.classList.remove("border-amber-400", "bg-blue-50/30");
      if (e.dataTransfer.files.length > 0 && currentSubject) {
        for (const f of e.dataTransfer.files) {
          if (f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf") {
            const folderId = currentFolder ? currentFolder.id : null;
            await dbAddFile(currentSubject.id, folderId, f);
          }
        }
        renderFilesList();
      }
    });
  }

  // Inicializar
  loadInitialConfig();
  updateHistoryBadge();
});
