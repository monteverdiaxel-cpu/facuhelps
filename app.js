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

  // Elementos DOM Autenticación / Supabase
  const btnUserAuth = document.getElementById("btnUserAuth");
  const userAuthLabel = document.getElementById("userAuthLabel");
  const modalAuth = document.getElementById("modalAuth");
  const btnCloseAuthModal = document.getElementById("btnCloseAuthModal");
  const authLoggedInView = document.getElementById("authLoggedInView");
  const authLoggedInEmail = document.getElementById("authLoggedInEmail");
  const authLoggedOutView = document.getElementById("authLoggedOutView");
  const tabAuthLogin = document.getElementById("tabAuthLogin");
  const tabAuthRegister = document.getElementById("tabAuthRegister");
  const formAuth = document.getElementById("formAuth");
  const inputAuthEmail = document.getElementById("inputAuthEmail");
  const inputAuthPassword = document.getElementById("inputAuthPassword");
  const authAlert = document.getElementById("authAlert");
  const authSuccessAlert = document.getElementById("authSuccessAlert");
  const btnAuthSubmit = document.getElementById("btnAuthSubmit");
  const btnAuthSubmitText = document.getElementById("btnAuthSubmitText");
  const authSpinner = document.getElementById("authSpinner");
  const btnLogout = document.getElementById("btnLogout");
  const btnManualSync = document.getElementById("btnManualSync");

  // Elementos DOM Perfil y Recuperación de Contraseña
  const modalUserProfile = document.getElementById("modalUserProfile");
  const userProfileEmail = document.getElementById("userProfileEmail");
  const btnLogoutAction = document.getElementById("btnLogoutAction");
  const btnCloseProfileModal = document.getElementById("btnCloseProfileModal");
  const btnForgotPassLink = document.getElementById("btnForgotPassLink");
  const authRecoverySection = document.getElementById("authRecoverySection");
  const recoveryEmail = document.getElementById("recoveryEmail");
  const btnSendRecovery = document.getElementById("btnSendRecovery");
  const btnBackToLogin = document.getElementById("btnBackToLogin");
  const modalNewPassword = document.getElementById("modalNewPassword");
  const formNewPassword = document.getElementById("formNewPassword");
  const inputNewPassword = document.getElementById("inputNewPassword");

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
  let serverKeyPool = [];

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
      const res = await fetch("/api/key-pool");
      if (res.ok) {
        const data = await res.json();
        serverKeyPool = Array.isArray(data.keys) ? data.keys : [];
        hasServerApiKey = Boolean(data.has_keys || serverKeyPool.length > 0);
        if (hasServerApiKey) {
          envKeyNotice.classList.remove("hidden");
          if (!savedKey) {
            updateApiKeyStatus(true, serverKeyPool.length > 1 ? `${serverKeyPool.length} Claves (.env)` : "Clave en .env");
          }
        }
      } else {
        // Fallback a /api/config si /api/key-pool no respondiera
        const cfgRes = await fetch("/api/config");
        if (cfgRes.ok) {
          const cfgData = await cfgRes.json();
          hasServerApiKey = cfgData.has_server_api_key;
          if (hasServerApiKey) {
            envKeyNotice.classList.remove("hidden");
            if (!savedKey) updateApiKeyStatus(true, "Clave en .env");
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo verificar configuración del servidor:", e);
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

  // ==========================================
  // AUTENTICACIÓN Y SINCRONIZACIÓN SUPABASE
  // ==========================================
  const SUPABASE_URL = "https://ctnyhpdvvnfdiypjeqxv.supabase.co";
  const SUPABASE_KEY = "sb_publishable_RjMAzX_fvzzkKNH7uCQLvQ_yVfv92bB";
  let supabaseClient = null;
  let currentAuthUser = null;
  let authMode = "login"; // "login" | "register"
  let syncDebounceTimer = null;

  if (window.supabase && typeof window.supabase.createClient === "function") {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      window.supabaseClient = supabaseClient;
    } catch (e) {
      console.warn("No se pudo inicializar Supabase:", e);
    }
  }

  function formatAuthError(msg) {
    if (!msg) return "Ocurrió un error inesperado al procesar la solicitud.";
    if (msg.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
    if (msg.includes("User already registered")) return "Ya existe un usuario con este correo electrónico.";
    if (msg.includes("Password should be at least 6 characters")) return "La contraseña debe tener al menos 6 caracteres.";
    if (msg.includes("Email not confirmed")) return "Por favor revisá tu correo y confirmá tu cuenta antes de ingresar.";
    if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) return "Demasiados intentos. Por favor esperá unos momentos.";
    return msg;
  }

  function updateAuthUI(user) {
    currentAuthUser = user || null;
    const userAuthIcon = btnUserAuth ? btnUserAuth.querySelector('[data-lucide="user"], svg') : null;
    if (user) {
      if (userAuthIcon) userAuthIcon.classList.add("hidden");
      if (userAuthLabel) {
        userAuthLabel.innerHTML = `👤 <span class="max-w-[130px] md:max-w-[200px] truncate inline-block align-bottom">${user.email}</span> <span class="text-emerald-500 font-bold ml-0.5">✓</span>`;
      }
      if (btnUserAuth) {
        btnUserAuth.title = `👤 ${user.email} (Sincronizado ✓) - Clic para ver opciones o cerrar sesión`;
        btnUserAuth.classList.add("border-emerald-300", "dark:border-emerald-800");
      }
      if (authLoggedInEmail) authLoggedInEmail.textContent = user.email || "";
      if (authLoggedInView) authLoggedInView.classList.remove("hidden");
      if (authLoggedOutView) authLoggedOutView.classList.add("hidden");
    } else {
      if (userAuthIcon) userAuthIcon.classList.remove("hidden");
      if (userAuthLabel) {
        userAuthLabel.textContent = "👤 Iniciar sesión";
      }
      if (btnUserAuth) {
        btnUserAuth.title = "Iniciar sesión para sincronizar automáticamente entre dispositivos";
        btnUserAuth.classList.remove("border-emerald-300", "dark:border-emerald-800");
      }
      if (authLoggedInView) authLoggedInView.classList.add("hidden");
      if (authLoggedOutView) authLoggedOutView.classList.remove("hidden");
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function setAuthTab(mode) {
    authMode = mode;
    if (authAlert) authAlert.classList.add("hidden");
    if (authSuccessAlert) authSuccessAlert.classList.add("hidden");
    if (authRecoverySection) authRecoverySection.classList.add("hidden");
    if (formAuth) formAuth.classList.remove("hidden");

    if (mode === "login") {
      if (tabAuthLogin) {
        tabAuthLogin.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs transition";
      }
      if (tabAuthRegister) {
        tabAuthRegister.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition";
      }
      if (btnAuthSubmitText) btnAuthSubmitText.textContent = "Iniciar sesión";
    } else {
      if (tabAuthRegister) {
        tabAuthRegister.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs transition";
      }
      if (tabAuthLogin) {
        tabAuthLogin.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition";
      }
      if (btnAuthSubmitText) btnAuthSubmitText.textContent = "Crear cuenta";
    }
  }

  if (tabAuthLogin) {
    tabAuthLogin.addEventListener("click", () => setAuthTab("login"));
  }
  if (tabAuthRegister) {
    tabAuthRegister.addEventListener("click", () => setAuthTab("register"));
  }

  if (btnUserAuth) {
    btnUserAuth.addEventListener("click", () => {
      if (currentAuthUser) {
        if (userProfileEmail) {
          userProfileEmail.textContent = currentAuthUser.email || "";
        }
        if (modalUserProfile) {
          modalUserProfile.classList.remove("hidden");
        }
      } else {
        if (modalAuth) {
          modalAuth.classList.remove("hidden");
          if (authRecoverySection) authRecoverySection.classList.add("hidden");
          if (formAuth) formAuth.classList.remove("hidden");
          if (inputAuthEmail) inputAuthEmail.focus();
        }
      }
    });
  }

  if (btnCloseAuthModal) {
    btnCloseAuthModal.addEventListener("click", () => {
      if (modalAuth) modalAuth.classList.add("hidden");
    });
  }

  if (modalAuth) {
    modalAuth.addEventListener("click", (e) => {
      if (e.target === modalAuth) {
        modalAuth.classList.add("hidden");
      }
    });
  }

  // Controladores de Modal de Perfil (Cerrar sesión)
  if (btnCloseProfileModal) {
    btnCloseProfileModal.addEventListener("click", () => {
      if (modalUserProfile) modalUserProfile.classList.add("hidden");
    });
  }

  if (modalUserProfile) {
    modalUserProfile.addEventListener("click", (e) => {
      if (e.target === modalUserProfile) {
        modalUserProfile.classList.add("hidden");
      }
    });
  }

  if (btnLogoutAction) {
    btnLogoutAction.addEventListener("click", async () => {
      if (!supabaseClient) return;
      try {
        await supabaseClient.auth.signOut();
        await dbClearAllData();
        try {
          localStorage.removeItem(HISTORY_STORAGE_KEY);
        } catch (e) {}
        if (modalUserProfile) modalUserProfile.classList.add("hidden");
        window.location.reload();
      } catch (err) {
        console.warn("Error al cerrar sesión:", err);
        window.location.reload();
      }
    });
  }

  // Controladores de Recuperación de Contraseña
  if (btnForgotPassLink) {
    btnForgotPassLink.addEventListener("click", () => {
      if (formAuth) formAuth.classList.add("hidden");
      if (authRecoverySection) authRecoverySection.classList.remove("hidden");
      if (recoveryEmail) {
        recoveryEmail.value = inputAuthEmail ? inputAuthEmail.value.trim() : "";
        recoveryEmail.focus();
      }
      if (authAlert) authAlert.classList.add("hidden");
      if (authSuccessAlert) authSuccessAlert.classList.add("hidden");
    });
  }

  if (btnBackToLogin) {
    btnBackToLogin.addEventListener("click", () => {
      if (authRecoverySection) authRecoverySection.classList.add("hidden");
      if (formAuth) formAuth.classList.remove("hidden");
      if (authAlert) authAlert.classList.add("hidden");
      if (authSuccessAlert) authSuccessAlert.classList.add("hidden");
    });
  }

  if (btnSendRecovery) {
    btnSendRecovery.addEventListener("click", async () => {
      if (!supabaseClient) return;
      const email = recoveryEmail ? recoveryEmail.value.trim() : "";
      if (!email) {
        if (authAlert) {
          authAlert.textContent = "Por favor ingresá tu correo electrónico.";
          authAlert.classList.remove("hidden");
        }
        return;
      }
      const origText = btnSendRecovery.textContent;
      btnSendRecovery.disabled = true;
      btnSendRecovery.textContent = "Enviando...";
      if (authAlert) authAlert.classList.add("hidden");
      if (authSuccessAlert) authSuccessAlert.classList.add("hidden");

      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        if (authSuccessAlert) {
          authSuccessAlert.textContent = "¡Listo! Te enviamos un enlace a tu correo para restablecer tu contraseña.";
          authSuccessAlert.classList.remove("hidden");
        }
      } catch (err) {
        console.warn("Error en recuperación:", err);
        if (authAlert) {
          authAlert.textContent = formatAuthError(err.message || "");
          authAlert.classList.remove("hidden");
        }
      } finally {
        btnSendRecovery.disabled = false;
        btnSendRecovery.textContent = origText;
      }
    });
  }

  // Vaciar IndexedDB local para aislamiento total al cerrar sesión
  async function dbClearAllData() {
    try {
      const db = await openDatabase();
      const storeNames = ["subjects", "folders", "files", "notes", "careerPlan"];
      const existingStores = storeNames.filter(name => db.objectStoreNames.contains(name));
      if (existingStores.length > 0) {
        const tx = db.transaction(existingStores, "readwrite");
        for (const name of existingStores) {
          tx.objectStore(name).clear();
        }
        await new Promise((resolve) => {
          tx.oncomplete = resolve;
          tx.onerror = resolve;
        });
      }
    } catch (e) {
      console.warn("Error al vaciar base de datos local:", e);
    }
  }

  // Manejo de cierre de sesión con pantalla en blanco
  async function handleUserSignOut() {
    currentAuthUser = null;
    updateAuthUI(null);

    // 1. Vaciar la base local IndexedDB
    await dbClearAllData();

    // 2. Vaciar historial local
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      updateHistoryBadge();
    } catch (e) {
      console.warn("Error al limpiar historial:", e);
    }

    // 3. Restablecer estado en memoria
    currentSubject = null;
    currentFolder = null;
    careerPlanData = {
      selectedOrientation: "periodismo",
      grades: {}
    };

    // 4. Refrescar la pantalla en blanco
    if (typeof renderOrganizerView === "function") {
      await renderOrganizerView();
    }
    if (typeof renderCareerView === "function") {
      await renderCareerView();
    }
    if (typeof renderHistoryList === "function") {
      renderHistoryList();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  if (formAuth) {
    formAuth.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!supabaseClient) {
        if (authAlert) {
          authAlert.textContent = "Supabase no se cargó correctamente. Verificá tu conexión a internet.";
          authAlert.classList.remove("hidden");
        }
        return;
      }

      const email = inputAuthEmail ? inputAuthEmail.value.trim() : "";
      const password = inputAuthPassword ? inputAuthPassword.value : "";

      if (!email || !password) return;

      if (btnAuthSubmit) btnAuthSubmit.disabled = true;
      if (authSpinner) authSpinner.classList.remove("hidden");
      if (authAlert) authAlert.classList.add("hidden");
      if (authSuccessAlert) authSuccessAlert.classList.add("hidden");

      try {
        if (authMode === "login") {
          const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (data && data.user) {
            updateAuthUI(data.user);
            if (authSuccessAlert) {
              authSuccessAlert.textContent = "¡Sesión iniciada con éxito! Cargando tus datos...";
              authSuccessAlert.classList.remove("hidden");
            }
            await syncUserData(data.user.id);
            setTimeout(() => {
              if (modalAuth) modalAuth.classList.add("hidden");
              if (authSuccessAlert) authSuccessAlert.classList.add("hidden");
            }, 800);
          }
        } else {
          const { data, error } = await supabaseClient.auth.signUp({ email, password });
          if (error) throw error;
          if (data && data.session && data.user) {
            updateAuthUI(data.user);
            if (authSuccessAlert) {
              authSuccessAlert.textContent = "¡Cuenta creada con éxito! Sincronizando datos...";
              authSuccessAlert.classList.remove("hidden");
            }
            await syncUserData(data.user.id);
            setTimeout(() => {
              if (modalAuth) modalAuth.classList.add("hidden");
              if (authSuccessAlert) authSuccessAlert.classList.add("hidden");
            }, 800);
          } else {
            if (authSuccessAlert) {
              authSuccessAlert.textContent = "¡Cuenta creada! Revisá tu casilla de correo para confirmar tu registro y luego iniciá sesión.";
              authSuccessAlert.classList.remove("hidden");
            }
          }
        }
      } catch (err) {
        console.warn("Error en autenticación:", err);
        if (authAlert) {
          authAlert.textContent = formatAuthError(err.message || "");
          authAlert.classList.remove("hidden");
        }
      } finally {
        if (btnAuthSubmit) btnAuthSubmit.disabled = false;
        if (authSpinner) authSpinner.classList.add("hidden");
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      if (!supabaseClient) return;
      try {
        await supabaseClient.auth.signOut();
        await handleUserSignOut();
        if (modalAuth) modalAuth.classList.add("hidden");
      } catch (err) {
        console.warn("Error al cerrar sesión:", err);
      }
    });
  }

  if (btnManualSync) {
    btnManualSync.addEventListener("click", async () => {
      if (!supabaseClient || !currentAuthUser) return;
      const originalHTML = btnManualSync.innerHTML;
      btnManualSync.disabled = true;
      btnManualSync.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-slate-700 dark:border-slate-300 border-t-transparent rounded-full animate-spin"></div><span>Sincronizando...</span>`;
      try {
        await syncUserData(currentAuthUser.id);
        await loadUserTranscriptsFromCloud();
        btnManualSync.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span>¡Sincronizado!</span>`;
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          btnManualSync.disabled = false;
          btnManualSync.innerHTML = originalHTML;
          if (window.lucide) window.lucide.createIcons();
        }, 1500);
      } catch (err) {
        console.warn("Error en sincronización manual:", err);
        btnManualSync.disabled = false;
        btnManualSync.innerHTML = originalHTML;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // 1. Aislamiento y detección de sesión (onAuthStateChange y getSession)
  if (supabaseClient) {
    supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
      const user = session ? session.user : null;
      if (user) {
        updateAuthUI(user);
        await syncUserData(user.id);
        await loadUserTranscriptsFromCloud();
      } else {
        updateAuthUI(null);
      }
    }).catch(err => console.warn("Error al leer sesión Supabase:", err));

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        if (modalNewPassword) modalNewPassword.classList.remove("hidden");
        if (modalAuth) modalAuth.classList.add("hidden");
        if (modalUserProfile) modalUserProfile.classList.add("hidden");
        if (inputNewPassword) inputNewPassword.focus();
        return;
      }

      const user = session ? session.user : null;
      if (user) {
        updateAuthUI(user);
        await syncUserData(user.id);
        await loadUserTranscriptsFromCloud();
      } else {
        await handleUserSignOut();
      }
    });
  }

  // Controlador para guardar nueva contraseña tras recuperación
  if (formNewPassword) {
    formNewPassword.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!supabaseClient) return;
      const newPass = inputNewPassword ? inputNewPassword.value : "";
      if (!newPass || newPass.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      try {
        const { error } = await supabaseClient.auth.updateUser({ password: newPass });
        if (error) throw error;
        alert("¡Contraseña actualizada con éxito!");
        if (modalNewPassword) modalNewPassword.classList.add("hidden");
        window.location.reload();
      } catch (err) {
        alert("Error al actualizar la contraseña: " + (err.message || "Intentá de nuevo."));
      }
    });
  }

  if (modalNewPassword) {
    modalNewPassword.addEventListener("click", (e) => {
      if (e.target === modalNewPassword) {
        modalNewPassword.classList.add("hidden");
      }
    });
  }

  // 2. Sincronización bidireccional y aislamiento exclusivo por usuario
  async function syncUserData(userId) {
    if (!supabaseClient || !userId) return;
    try {
      const db = await openDatabase();

      // a. Descargar materias de ese usuario
      let remoteSubjects = [];
      try {
        const { data, error } = await supabaseClient
          .from("user_subjects")
          .select("*")
          .eq("user_id", userId);
        if (!error && Array.isArray(data)) remoteSubjects = data;
      } catch (eSub) {
        console.warn("Error al descargar user_subjects:", eSub);
      }

      // b. Descargar notas de ese usuario
      let remoteNotes = [];
      try {
        const { data, error } = await supabaseClient
          .from("user_notes")
          .select("*")
          .eq("user_id", userId);
        if (!error && Array.isArray(data)) remoteNotes = data;
      } catch (eNotes) {
        console.warn("Error al descargar user_notes:", eNotes);
      }

      // c. Descargar carrera de ese usuario
      let remotePlan = null;
      try {
        const { data, error } = await supabaseClient
          .from("user_career_plan")
          .select("data, updated_at")
          .eq("user_id", userId)
          .maybeSingle();
        if (!error && data) remotePlan = data;
      } catch (ePlan) {
        console.warn("Error al descargar user_career_plan:", ePlan);
      }

      // Actualizar la base de datos IndexedDB local de forma aislada
      const storeNames = ["subjects", "notes", "careerPlan"];
      const existingStores = storeNames.filter(name => db.objectStoreNames.contains(name));
      if (existingStores.length > 0) {
        const tx = db.transaction(existingStores, "readwrite");

        if (db.objectStoreNames.contains("subjects")) {
          const subStore = tx.objectStore("subjects");
          subStore.clear();
          for (const s of remoteSubjects) {
            subStore.put({
              id: Number(s.id),
              name: s.name,
              createdAt: Number(s.created_at) || Date.now()
            });
          }
        }

        if (db.objectStoreNames.contains("notes")) {
          const notesStore = tx.objectStore("notes");
          notesStore.clear();
          for (const n of remoteNotes) {
            notesStore.put({
              id: Number(n.id),
              subjectId: Number(n.subject_id),
              title: n.title || "",
              content: n.content || "",
              createdAt: Number(n.created_at) || Date.now(),
              updatedAt: Number(n.updated_at) || Date.now()
            });
          }
        }

        if (db.objectStoreNames.contains("careerPlan")) {
          const planStore = tx.objectStore("careerPlan");
          planStore.clear();
          if (remotePlan && remotePlan.data) {
            planStore.put({
              key: "userPlan",
              data: remotePlan.data,
              updatedAt: Number(remotePlan.updated_at) || Date.now()
            });
            careerPlanData = Object.assign({ selectedOrientation: "periodismo", grades: {} }, remotePlan.data);
          } else {
            careerPlanData = { selectedOrientation: "periodismo", grades: {} };
          }
        }

        await new Promise((resolve) => {
          tx.oncomplete = resolve;
          tx.onerror = resolve;
        });
      }

      // Actualizar historial local de transcripciones desde la nube
      await loadUserTranscriptsFromCloud();

      // Refrescar en vivo las vistas en pantalla
      currentSubject = null;
      currentFolder = null;

      if (typeof renderOrganizerView === "function") {
        await renderOrganizerView();
      }
      if (typeof renderCareerView === "function") {
        await renderCareerView();
      }
      if (typeof renderHistoryList === "function") {
        renderHistoryList();
      }
      if (window.lucide) window.lucide.createIcons();

    } catch (err) {
      console.warn("Error en syncUserData:", err);
    }
  }


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

  // 6. Formateo y Renderizado de Transcripción (Con colores acordes a FacuHelps y Modo Oscuro)
  function formatTranscript(text) {
    if (!text) return "";
    
    // Escapar HTML básico
    let clean = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Reemplazar negrita de Markdown **texto** (destacado en dorado FacuHelps en modo oscuro)
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#001b44] dark:text-[#ffc700]">$1</strong>');

    // Reemplazar timestamps tipo o con insignia estilizada
    clean = clean.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, (match, p1) => {
      return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-amber-300 border border-blue-200/50 dark:border-amber-400/30 mr-1.5">[${p1}]</span>`;
    });

    // Reemplazar indicadores de hablantes en negrita si no vinieron con asteriscos
    clean = clean.replace(/(?:^|\n)(Docente|Profesor|Profesora|Alumno|Alumna|Estudiante|Entrevistador|Entrevistadora|Entrevistado|Orador|Persona\s*\d*|Hablante\s*\d*):/gi, (match, p1) => {
      return `\n<strong class="speaker-tag font-bold text-[#001b44] dark:text-[#ffc700]">${p1}:</strong>`;
    });

    // Convertir saltos de línea en párrafos limpios, legibles y de alto contraste
    const paragraphs = clean.split(/\n\s*\n/);
    return paragraphs
      .map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return "";
        return `<p class="mb-3.5 text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed text-left">${trimmed.replace(/\n/g, "<br>")}</p>`;
      })
      .filter(Boolean)
      .join("");
  }

  function getSystemInstructionJS(audioType = "clase") {
    let speakerRules = "";
    if (audioType === "continuo") {
      speakerRules = `3. SIN DIFERENCIAR HABLANTES (TEXTO CONTINUO EN PÁRRAFOS):
   - NO incluyas NINGUNA etiqueta de orador bajo ninguna circunstancia.
   - Transcribe todo de corrido organizado únicamente en párrafos limpios con puntos y aparte claros.`;
    } else if (audioType === "entrevista") {
      speakerRules = `3. UNIFORMIDAD TOTAL DE ORADORES (ENTREVISTA):
   - NO utilices nombres propios como etiquetas.
   - Utiliza OBLIGATORIAMENTE las etiquetas en negrita: **Entrevistador:** y **Entrevistado:**.`;
    } else if (audioType === "radio") {
      speakerRules = `3. UNIFORMIDAD TOTAL DE ORADORES (RADIO / PODCAST / DEBATE):
   - Identifica y distingue a todos los hablantes usando ESTRICTAMENTE: **Persona 1:**, **Persona 2:**, etc.`;
    } else {
      speakerRules = `3. UNIFORMIDAD TOTAL DE ORADORES (CLASE / TEÓRICO):
   - Utiliza OBLIGATORIAMENTE las etiquetas en negrita: **Docente:** y **Estudiante:**.`;
    }

    return `Actúa como un taquígrafo profesional y motor de transcripción de máxima fidelidad textual.
Tu única tarea es transcribir exactamente cada palabra pronunciada en el audio de principio a fin de forma fiel, con una estructura de lectura limpia, clara y sin marcas de tiempo.

REGLAS ESTRICTAS DE TRANSCRIPCIÓN Y FORMATO:
1. FIDELIDAD TEXTUAL SIN RESUMIR: Transcribe el contenido íntegro hasta la última palabra sin omitir nada.
2. FILTRO Y TOLERANCIA A RUIDO Y ECO: Aísla la voz principal del orador e ignora el ruido ambiente.
${speakerRules}
4. LIMPIEZA DE HABLA: Elimina tartamudeos involuntarios y muletillas sonoras ("eh", "mmm").
5. USO DE COMILLAS: Emplea exclusivamente comillas dobles estándar ("...").
6. PROHIBIDAS LAS MARCAS DE TIEMPO: Cero timestamps [mm:ss].
7. SIN INTRODUCCIONES NI NOTAS: Comienza directamente con la transcripción.`;
  }

  function getUserPromptJS(audioType = "clase", keywords = "") {
    let speakerHint = "";
    if (audioType === "continuo") speakerHint = "- Formato: SIN etiquetas de orador.";
    else if (audioType === "entrevista") speakerHint = "- Formato: **Entrevistador:** y **Entrevistado:**.";
    else if (audioType === "radio") speakerHint = "- Formato: **Persona 1:**, **Persona 2:**, etc.";
    else speakerHint = "- Formato: **Docente:** y **Estudiante:**.";

    const kw = keywords.trim() ? `\n- Atención a vocabulario específico: asegura correcta ortografía en: ${keywords.trim()}.` : "";
    return `Transcribe todo el audio adjunto de principio a fin de forma fiel y completa sin resumir:
${speakerHint}${kw}
- Limpieza de habla: elimina tartamudeos y muletillas ("eh", "mmm").
- Comillas dobles estándar ("...").
- PROHIBIDO incluir marcas de tiempo o timestamps.`;
  }

  // 7. Iniciar Proceso de Transcripción (Opción B: Subida Directa Exclusiva a Google)
  btnStartTranscribe.addEventListener("click", async () => {
    if (!currentFile) return;

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
      // Resolver API Key activa
      const localKey = (localStorage.getItem("gemini_api_key") || "").trim();
      let activeKey = localKey;
      if (!activeKey) {
        try {
          const poolRes = await fetch("/api/key-pool");
          if (poolRes.ok) {
            const poolData = await poolRes.json();
            if (poolData.keys && poolData.keys.length > 0) {
              activeKey = poolData.keys[0];
            }
          }
        } catch (e) {}
      }

      if (!activeKey) {
        showError("Falta la API Key", "Por favor ingresa tu API Key de Google AI Studio antes de continuar.");
        if (apiKeyModal) apiKeyModal.classList.remove("hidden");
        return;
      }

      // Paso 1: Subir audio directamente por Cloudflare (0 MB consumidos en Render)
      setProgressStep("cloud");
      const workerUrl = `https://facuhelps-upload.monteverdiaxel.workers.dev/?key=${encodeURIComponent(activeKey)}&mime=${encodeURIComponent(currentFile.type || "audio/mp3")}&name=${encodeURIComponent(currentFile.name)}&size=${currentFile.size}`;

      const uploadResponse = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": currentFile.type || "application/octet-stream"
        },
        body: currentFile
      });

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        throw new Error(`Error en Cloudflare al subir archivo: ${errText}`);
      }

      const uploadData = await uploadResponse.json();
      const googleFileName = uploadData.file ? uploadData.file.name : (uploadData.name || "");
      if (!googleFileName) {
        throw new Error("No se recibió el identificador del archivo desde Google.");
      }

      // Paso 2: Pedir la transcripción a Render enviando únicamente el identificador (1 KB)
      setProgressStep("gemini");
      const selectedModelName = (selectModel ? selectModel.value : "gemini-3.8-flash") || "gemini-3.8-flash";
      const transcribeResponse = await fetch("/api/transcribe-file-uri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          file_name: googleFileName,
          api_key: localKey || undefined,
          audio_type: currentAudioType || "clase",
          keywords: (inputKeywords && inputKeywords.value.trim()) || "",
          model_name: selectedModelName
        })
      });

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        let errMsg = "Error en el servidor al transcribir el archivo.";
        try {
          errMsg = JSON.parse(errorText).detail || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data = await transcribeResponse.json();
      rawTranscriptText = data.transcript || "";

      if (!rawTranscriptText.trim()) {
        throw new Error("La transcripción recibida está vacía.");
      }

      // Finalizar visualización limpia
      setProgressStep("done");
      progressCard.classList.add("hidden");
      resultSection.classList.remove("hidden");
      if (completedBadge) completedBadge.classList.remove("hidden");
      if (streamingIndicator) streamingIndicator.classList.add("hidden");
      currentActiveFileName = currentFile ? currentFile.name : "audio.mp3";
      resultFileName.textContent = currentActiveFileName;
      resultModelBadge.textContent = `${data.model_used || selectedModelName} • completado`;
      transcriptContent.innerHTML = formatTranscript(rawTranscriptText);

      // Guardar en historial local y sincronizar con Supabase
      saveToHistory({
        filename: currentActiveFileName,
        audioType: currentAudioType || "clase",
        transcript: rawTranscriptText,
        timestamp: Date.now()
      });

      setTimeout(() => {
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

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
      btnDownloadPdf.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div> <span>Generando PDF...</span>';

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
    clean = clean.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-[#001b44] dark:text-[#ffc700] mt-4 mb-2 flex items-center gap-1.5">$1</h4>');
    clean = clean.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-[#001b44] dark:text-[#ffc700] mt-5 mb-2.5 flex items-center gap-1.5">$1</h3>');

    // Negrita **texto**
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>');

    // Cursiva *texto* o _texto_
    clean = clean.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>');
    clean = clean.replace(/_([^_]+)_/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>');

    // Viñetas * o -
    clean = clean.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1">$1</li>');

    // Limpiar asteriscos crudos residuales si quedara alguno sin cerrar
    clean = clean.replace(/\*+/g, '');

    // Párrafos
    const paragraphs = clean.split(/\n\s*\n/);
    return paragraphs.map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<li")) return trimmed;
      return `<p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">${trimmed.replace(/\n/g, "<br>")}</p>`;
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

  async function saveToHistory(item) {
    try {
      let list = getHistory();
      // Evitar duplicados por timestamp o filename
      list = list.filter(t => t.timestamp !== item.timestamp);
      list.unshift(item);
      if (list.length > MAX_HISTORY_ITEMS) {
        list = list.slice(0, MAX_HISTORY_ITEMS);
      }
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
      updateHistoryBadge();

      // Guardar en la nube (Supabase) si hay sesión activa
      if (window.supabaseClient) {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session && session.user) {
          await window.supabaseClient.from('user_transcripts').insert([{
            user_id: session.user.id,
            filename: item.filename,
            audio_type: item.audioType,
            transcript: item.transcript,
            created_at: new Date(item.timestamp).toISOString()
          }]);
        }
      }

      // Si el modal de historial está abierto, refrescar la lista en vivo
      if (historyModal && !historyModal.classList.contains("hidden")) {
        renderHistoryList();
      }
    } catch (e) {
      console.warn("Error al guardar en historial:", e);
    }
  }

  async function loadUserTranscriptsFromCloud() {
    if (!window.supabaseClient) return;
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (!session || !session.user) return;

      const { data, error } = await window.supabaseClient
        .from('user_transcripts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY_ITEMS);

      if (error) throw error;
      if (data && data.length > 0) {
        const cloudItems = data.map(row => ({
          filename: row.filename || "audio.mp3",
          audioType: row.audio_type || "clase",
          transcript: row.transcript,
          timestamp: new Date(row.created_at).getTime()
        }));
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(cloudItems));
        updateHistoryBadge();
        if (historyModal && !historyModal.classList.contains("hidden")) {
          renderHistoryList();
        }
      }
    } catch (err) {
      console.warn("Error al cargar transcripciones desde Supabase:", err);
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
            <button type="button" class="btn-download-pdf-history p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition" title="Descargar PDF" data-index="${index}">
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
    btnHistoryToggle.addEventListener("click", async () => {
      try {
        await loadUserTranscriptsFromCloud();
      } catch (e) {
        console.warn("Error al cargar historial desde la nube:", e);
      }
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
  const tabBtnCareer = document.getElementById("tabBtnCareer");
  const btnHeaderLogoHome = document.getElementById("btnHeaderLogoHome");
  const btnHeroOpenTranscriptor = document.getElementById("btnHeroOpenTranscriptor");
  const btnHeroOpenOrganizer = document.getElementById("btnHeroOpenOrganizer");
  const btnCardOpenTranscriptor = document.getElementById("btnCardOpenTranscriptor");
  const btnCardOpenOrganizer = document.getElementById("btnCardOpenOrganizer");
  const btnCardOpenCareer = document.getElementById("btnCardOpenCareer");

  const viewHome = document.getElementById("viewHome");
  const viewTranscriptor = document.getElementById("viewTranscriptor");
  const viewOrganizer = document.getElementById("viewOrganizer");
  const viewCareer = document.getElementById("viewCareer");

  function setTabButtonState(btn, isActive, activeTitle, inactiveSub, activeSub) {
    if (!btn) return;
    const activeClasses = "nav-tab-btn shrink-0 flex-1 lg:flex-initial flex items-center gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl border-2 border-[#ffc700] bg-[#001b44]/10 dark:bg-[#001b44]/40 text-[#001b44] dark:text-[#ffc700] font-semibold text-xs transition-all shadow-xs text-left";
    const inactiveClasses = "nav-tab-btn shrink-0 flex-1 lg:flex-initial flex items-center gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium text-xs transition-all text-left";

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
    if (viewCareer) viewCareer.classList.add("hidden");

    // 2. Actualizar estados visuales de los botones de navegación
    setTabButtonState(tabBtnHome, target === "home");
    setTabButtonState(tabBtnTranscriptor, target === "transcriptor");
    setTabButtonState(tabBtnOrganizer, target === "organizer");
    setTabButtonState(tabBtnCareer, target === "career");

    // 3. Mostrar la vista seleccionada y disparar sus acciones
    if (target === "home") {
      if (viewHome) viewHome.classList.remove("hidden");
    } else if (target === "transcriptor") {
      if (viewTranscriptor) viewTranscriptor.classList.remove("hidden");
    } else if (target === "organizer") {
      if (viewOrganizer) viewOrganizer.classList.remove("hidden");
      renderOrganizerView();
    } else if (target === "career") {
      if (viewCareer) viewCareer.classList.remove("hidden");
      renderCareerView();
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
  if (tabBtnCareer) {
    tabBtnCareer.addEventListener("click", () => switchTab("career"));
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
  if (btnCardOpenCareer) {
    btnCardOpenCareer.addEventListener("click", () => switchTab("career"));
  }

  // ─────────────────────────────────────────────────────────────
  // 14. MÓDULO ORGANIZADOR DE MATERIAS (INDEXEDDB LOCAL)
  // ─────────────────────────────────────────────────────────────
  const DB_NAME = "FacuHelpsDB";
  const DB_VERSION = 4;
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
  const btnPdfViewerSummarizeMobile = document.getElementById("btnPdfViewerSummarizeMobile");
  const pdfSummaryPanel = document.getElementById("pdfSummaryPanel");
  const pdfSummaryLoading = document.getElementById("pdfSummaryLoading");
  const pdfSummaryContent = document.getElementById("pdfSummaryContent");
  const btnCopyPdfSummary = document.getElementById("btnCopyPdfSummary");
  const btnDownloadPdfSummaryDocx = document.getElementById("btnDownloadPdfSummaryDocx");
  const btnDownloadPdfSummaryPdf = document.getElementById("btnDownloadPdfSummaryPdf");
  const btnClosePdfSummaryPanel = document.getElementById("btnClosePdfSummaryPanel");
  let currentViewerBlobUrl = null;
  let currentViewerFileItem = null;
  let currentPdfSummaryText = "";

  // Modal Dedicado de Resumen Académico a Ancho Completo
  const modalSummaryViewer = document.getElementById("modalSummaryViewer");
  const summaryViewerDocTitle = document.getElementById("summaryViewerDocTitle");
  const btnSummaryModalCopy = document.getElementById("btnSummaryModalCopy");
  const btnSummaryModalDownloadDocx = document.getElementById("btnSummaryModalDownloadDocx");
  const btnSummaryModalDownloadPdf = document.getElementById("btnSummaryModalDownloadPdf");
  const btnSummaryModalClose = document.getElementById("btnSummaryModalClose");
  const summaryModalLoading = document.getElementById("summaryModalLoading");
  const summaryModalContent = document.getElementById("summaryModalContent");
  let currentSummaryViewerFileItem = null;
  let currentSummaryViewerText = "";

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
        // Almacén de Mi Carrera (Plan 504 Comu UBA)
        if (!db.objectStoreNames.contains("careerPlan")) {
          db.createObjectStore("careerPlan", { keyPath: "key" });
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
      const now = Date.now();
      const req = store.add({ name, createdAt: now });
      req.onsuccess = () => {
        const newId = req.result;
        if (supabaseClient && currentAuthUser) {
          try {
            supabaseClient.from("user_subjects").upsert({
              user_id: currentAuthUser.id,
              id: newId,
              name: name,
              created_at: now
            }).then();
          } catch (e) {
            console.warn("Error al guardar materia en Supabase:", e);
          }
        }
        resolve(newId);
      };
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
        putReq.onsuccess = () => {
          if (supabaseClient && currentAuthUser) {
            try {
              supabaseClient.from("user_subjects").upsert({
                user_id: currentAuthUser.id,
                id: Number(subjectId),
                name: newName,
                created_at: item.createdAt || Date.now()
              }).then();
            } catch (e) {
              console.warn("Error al actualizar materia en Supabase:", e);
            }
          }
          resolve(putReq.result);
        };
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  // Operaciones DB: Notas de la Materia
  async function dbGetAllNotes() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("notes", "readonly");
      const store = tx.objectStore("notes");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

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
      req.onsuccess = () => {
        const newNoteId = req.result;
        if (supabaseClient && currentAuthUser) {
          try {
            supabaseClient.from("user_notes").upsert({
              user_id: currentAuthUser.id,
              id: newNoteId,
              subject_id: Number(subjectId),
              title: title.trim(),
              content: content.trim(),
              created_at: now,
              updated_at: now
            }).then();
          } catch (e) {
            console.warn("Error al guardar nota en Supabase:", e);
          }
        }
        resolve(newNoteId);
      };
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
        putReq.onsuccess = () => {
          if (supabaseClient && currentAuthUser) {
            try {
              supabaseClient.from("user_notes").upsert({
                user_id: currentAuthUser.id,
                id: Number(noteId),
                subject_id: Number(item.subjectId),
                title: item.title,
                content: item.content,
                created_at: item.createdAt || item.updatedAt,
                updated_at: item.updatedAt
              }).then();
            } catch (e) {
              console.warn("Error al actualizar nota en Supabase:", e);
            }
          }
          resolve(putReq.result);
        };
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
      req.onsuccess = () => {
        if (supabaseClient && currentAuthUser) {
          try {
            supabaseClient.from("user_notes").delete().eq("user_id", currentAuthUser.id).eq("id", Number(noteId)).then();
          } catch (e) {
            console.warn("Supabase delete note warning:", e);
          }
        }
        resolve();
      };
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
      req.onsuccess = () => {
        if (supabaseClient && currentAuthUser) {
          try {
            supabaseClient.from("user_subjects").delete().eq("user_id", currentAuthUser.id).eq("id", Number(subjectId)).then();
            supabaseClient.from("user_notes").delete().eq("user_id", currentAuthUser.id).eq("subject_id", Number(subjectId)).then();
          } catch (e) {
            console.warn("Supabase delete subject warning:", e);
          }
        }
        resolve();
      };
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
  function openEmbeddedPdfViewer(fileItem, autoShowSummary = false) {
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

    currentPdfSummaryText = (fileItem.summary && fileItem.summary.trim()) ? fileItem.summary : "";

    if (btnPdfViewerSummarize) {
      if (currentPdfSummaryText) {
        btnPdfViewerSummarize.innerHTML = '<i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> <span>⚡ Resumen Listo</span>';
      } else {
        btnPdfViewerSummarize.innerHTML = '<i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> <span>⚡ Resumen con IA</span>';
      }
    }

    if (modalPdfViewer) {
      modalPdfViewer.classList.remove("hidden");
    }

    // Si se solicitó abrir con el resumen visible o ya existe y se clickeó "Ver Resumen"
    if (autoShowSummary && currentPdfSummaryText) {
      showPdfSummaryInViewer(currentPdfSummaryText);
    } else if (!autoShowSummary) {
      if (pdfSummaryPanel) pdfSummaryPanel.classList.add("hidden");
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
    if (btnPdfViewerSummarizeMobile) {
      btnPdfViewerSummarizeMobile.disabled = true;
    }

    const apiKey = (localStorage.getItem("gemini_api_key") || "").trim();

    // Timeout de seguridad de 90 segundos con AbortController para evitar cuelgues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const formData = new FormData();
      formData.append("file", currentViewerFileItem.blob, currentViewerFileItem.name);
      if (apiKey) {
        formData.append("api_key", apiKey);
      }
      formData.append("model_name", "gemini-3.8-flash");

      const response = await fetch("/api/summarize-pdf", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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

      // Mostrar en el panel lateral de inmediato
      showPdfSummaryInViewer(summaryText);

      // Refrescar listado de archivos para actualizar etiqueta de botón en la tarjeta
      renderFilesList();

    } catch (err) {
      clearTimeout(timeoutId);
      if (pdfSummaryLoading) pdfSummaryLoading.classList.add("hidden");

      if (err.name === "AbortError") {
        alert("El documento es muy extenso o el servidor demoró en responder. Por favor reintentá.");
      } else {
        alert("Error al generar resumen académico: " + err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      if (btnPdfViewerSummarize) {
        btnPdfViewerSummarize.disabled = false;
        if (currentViewerFileItem && currentViewerFileItem.summary) {
          btnPdfViewerSummarize.innerHTML = '<i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> <span>⚡ Resumen Listo</span>';
        } else {
          btnPdfViewerSummarize.innerHTML = '<i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> <span>⚡ Resumen con IA</span>';
        }
      }
      if (btnPdfViewerSummarizeMobile) {
        btnPdfViewerSummarizeMobile.disabled = false;
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function handleSummarizeButtonClick() {
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
  }

  if (btnPdfViewerSummarize) {
    btnPdfViewerSummarize.addEventListener("click", handleSummarizeButtonClick);
  }
  if (btnPdfViewerSummarizeMobile) {
    btnPdfViewerSummarizeMobile.addEventListener("click", handleSummarizeButtonClick);
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

  // Exportación del Resumen Académico a PDF vectorial limpio con jsPDF
  function generateAcademicSummaryPdf(summaryMarkdown, docTitle, subjectName) {
    const { jsPDF } = window.jspdf || window;
    if (!jsPDF) {
      throw new Error("La librería jsPDF no está disponible en este momento.");
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Dimensiones A4 en mm: 210 x 297, márgenes estándar de 20 mm
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    const bottomMargin = 20;

    let y = margin;

    function checkPageBreak(neededHeight) {
      if (y + neededHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    }

    // Filtro de caracteres rotos y emojis (🎯, 💡, 🧭, 📌, ❓, etc.)
    function sanitizeText(str) {
      if (!str) return "";
      return str
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1FA00}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]/gu, "")
        .replace(/[🎯💡🧭📌❓⚡📖📄📑✓✔✕✖•]/g, "")
        .replace(/[^\x00-\x7F\u00C0-\u017F\s.,;:!?¿¡'"`()\[\]\-_+\/=%$@#&]/g, "")
        .trim();
    }

    const cleanDocTitle = sanitizeText(docTitle) || "Lectura Académica";
    const cleanSubject = sanitizeText(subjectName) || "";

    // --- ENCABEZADO INSTITUCIONAL ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(0, 27, 68); // #001b44 Azul Xeneize
    const headerTitleLines = doc.splitTextToSize(`Resumen Académico: ${cleanDocTitle}`, contentWidth);
    doc.text(headerTitleLines, margin, y + 2);
    y += (headerTitleLines.length * 6.5);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // slate-500
    const metaText = cleanSubject 
      ? `Comu UBA - Materia: ${cleanSubject} - FacuHelps` 
      : "Comu UBA - Análisis Académico - FacuHelps";
    doc.text(metaText, margin, y + 1);
    y += 5.5;

    // Línea divisoria sobria
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.line(margin, y + 1, margin + contentWidth, y + 1);
    y += 8;

    // --- PARSEO Y MAQUETACIÓN DEL CONTENIDO ---
    const rawLines = (summaryMarkdown || "").split("\n");
    const normalLineHeight = 5.3;

    for (let i = 0; i < rawLines.length; i++) {
      let rawLine = rawLines[i].trim();
      if (!rawLine) {
        y += 2.5;
        continue;
      }

      // 1. Títulos de sección ### o ##
      if (rawLine.startsWith("###") || rawLine.startsWith("##")) {
        // Remover numerales, emojis y asteriscos
        let headerText = rawLine.replace(/^#+\s*/, "").replace(/\*\*/g, "");
        headerText = sanitizeText(headerText);
        if (!headerText) continue;

        checkPageBreak(15);
        y += 4; // Espaciado previo antes de una sección nueva

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.5);
        doc.setTextColor(0, 27, 68); // #001b44 Azul Xeneize
        const hLines = doc.splitTextToSize(headerText, contentWidth);
        doc.text(hLines, margin, y);
        y += (hLines.length * 5.8) + 2;
        continue;
      }

      // 2. Preguntas de parcial numeradas (ej: "1. Pregunta...", "**1. Pregunta...**")
      const questionMatch = rawLine.match(/^(\*{0,2}(\d+[\.\)]\s*[^\n:]+:?)\*{0,2})\s*(.*)$/);
      if (questionMatch && (questionMatch[2].length > 10 || rawLine.toLowerCase().includes("pregunta") || rawLine.toLowerCase().includes("respuesta"))) {
        const qTitle = sanitizeText(questionMatch[1].replace(/\*\*/g, ""));
        const qRest = sanitizeText(questionMatch[3].replace(/\*\*/g, ""));

        checkPageBreak(12);
        y += 2.5;

        // Pregunta en negrita
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42); // slate-900
        const qLines = doc.splitTextToSize(qTitle, contentWidth);
        doc.text(qLines, margin, y);
        y += (qLines.length * normalLineHeight);

        // Si la respuesta venía en la misma línea
        if (qRest) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(51, 65, 85); // slate-700
          const indent = 5;
          const aLines = doc.splitTextToSize(qRest, contentWidth - indent);
          checkPageBreak(aLines.length * normalLineHeight);
          doc.text(aLines, margin + indent, y);
          y += (aLines.length * normalLineHeight) + 1.5;
        }
        continue;
      }

      // 3. Respuesta esperada identificada en línea propia (ej: "- Respuesta esperada: ...")
      if (/^[-*]?\s*(?:Respuesta(?:\s+sintética|\s+esperada)?|Rta):/i.test(rawLine)) {
        let cleanAns = rawLine.replace(/^[-*]\s*/, "").replace(/\*\*/g, "");
        cleanAns = sanitizeText(cleanAns);
        if (!cleanAns) continue;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85); // slate-700
        const indent = 5;
        const ansLines = doc.splitTextToSize(cleanAns, contentWidth - indent);
        checkPageBreak(ansLines.length * normalLineHeight);
        doc.text(ansLines, margin + indent, y);
        y += (ansLines.length * normalLineHeight) + 2;
        continue;
      }

      // 4. Viñeta - o *
      const bulletMatch = rawLine.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        let bulletText = bulletMatch[1].replace(/\*\*/g, "").replace(/\*/g, "");
        bulletText = sanitizeText(bulletText);
        if (!bulletText) continue;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.8);
        doc.setTextColor(30, 41, 59);

        const bLines = doc.splitTextToSize(bulletText, contentWidth - 6);
        checkPageBreak(bLines.length * normalLineHeight);

        // Viñeta geométrica limpia
        doc.circle(margin + 2, y - 1, 0.55, "F");
        doc.text(bLines, margin + 5.5, y);
        y += (bLines.length * normalLineHeight) + 1.2;
        continue;
      }

      // 5. Párrafo común
      let cleanP = rawLine.replace(/\*\*/g, "").replace(/\*/g, "");
      cleanP = sanitizeText(cleanP);
      if (!cleanP) continue;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.8);
      doc.setTextColor(30, 41, 59);

      const pLines = doc.splitTextToSize(cleanP, contentWidth);
      checkPageBreak(pLines.length * normalLineHeight);
      doc.text(pLines, margin, y);
      y += (pLines.length * normalLineHeight) + 1.5;
    }

    // Pie de página con numeración elegante
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Página ${p} de ${totalPages} - Resumen Académico Comu UBA`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    const safeFilename = `${cleanDocTitle.replace(/\s+/g, "_")}_resumen_academico.pdf`.replace(/[\\/:*?"<>|]/g, "_");
    doc.save(safeFilename);
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
        btnDownloadPdfSummaryDocx.innerHTML = '<div class="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> <span>Exportando...</span>';

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

  if (btnDownloadPdfSummaryPdf) {
    btnDownloadPdfSummaryPdf.addEventListener("click", () => {
      if (!currentPdfSummaryText) {
        alert("Aún no hay resumen generado para descargar.");
        return;
      }
      const baseName = (currentViewerFileItem ? currentViewerFileItem.name.replace(/\.[^/.]+$/, "") : "resumen_academico");
      const subjectName = (currentSubject ? currentSubject.name : "");
      const originalText = btnDownloadPdfSummaryPdf.innerHTML;

      try {
        btnDownloadPdfSummaryPdf.disabled = true;
        btnDownloadPdfSummaryPdf.innerHTML = '<div class="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> <span>Exportando...</span>';

        generateAcademicSummaryPdf(currentPdfSummaryText, baseName, subjectName);
      } catch (err) {
        alert("No se pudo generar el archivo PDF del resumen: " + err.message);
      } finally {
        btnDownloadPdfSummaryPdf.disabled = false;
        btnDownloadPdfSummaryPdf.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Modal Dedicado de Resumen Académico a Ancho Completo
  // ─────────────────────────────────────────────────────────────
  function openSummaryDedicatedViewer(fileItem) {
    if (!fileItem) return;
    currentSummaryViewerFileItem = fileItem;
    currentSummaryViewerText = (fileItem.summary && fileItem.summary.trim()) ? fileItem.summary : "";

    if (summaryViewerDocTitle) {
      const parentName = currentFolder 
        ? `${currentSubject ? currentSubject.name + ' > ' : ''}${currentFolder.name}` 
        : (currentSubject ? currentSubject.name : 'Materia');
      summaryViewerDocTitle.textContent = `${fileItem.name} • ${parentName}`;
    }

    if (modalSummaryViewer) {
      modalSummaryViewer.classList.remove("hidden");
    }

    if (currentSummaryViewerText) {
      if (summaryModalLoading) summaryModalLoading.classList.add("hidden");
      if (summaryModalContent) {
        summaryModalContent.classList.remove("hidden");
        summaryModalContent.innerHTML = formatSummaryMarkdown(currentSummaryViewerText);
      }
    } else {
      // Si aún no tiene resumen, generarlo de inmediato
      generateSummaryForDedicatedViewer(fileItem);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function closeSummaryDedicatedViewer() {
    if (modalSummaryViewer) {
      modalSummaryViewer.classList.add("hidden");
    }
    if (summaryModalContent) {
      summaryModalContent.innerHTML = "";
    }
    currentSummaryViewerFileItem = null;
    currentSummaryViewerText = "";
  }

  async function generateSummaryForDedicatedViewer(fileItem) {
    if (!fileItem || !fileItem.blob) {
      alert("No se encontró el archivo para generar el resumen.");
      closeSummaryDedicatedViewer();
      return;
    }

    if (summaryModalLoading) summaryModalLoading.classList.remove("hidden");
    if (summaryModalContent) {
      summaryModalContent.classList.add("hidden");
      summaryModalContent.innerHTML = "";
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutos

    try {
      const apiKey = (localStorage.getItem("gemini_api_key") || "").trim();
      const formData = new FormData();
      formData.append("file", fileItem.blob, fileItem.name);
      if (apiKey) formData.append("api_key", apiKey);

      const res = await fetch("/api/summarize-pdf", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error del servidor HTTP ${res.status}`);
      }

      const data = await res.json();
      const summaryText = data.summary || "";

      // Persistir resumen en IndexedDB
      fileItem.summary = summaryText;
      await dbUpdateFileSummary(fileItem.id, summaryText);

      currentSummaryViewerText = summaryText;

      if (summaryModalLoading) summaryModalLoading.classList.add("hidden");
      if (summaryModalContent) {
        summaryModalContent.classList.remove("hidden");
        summaryModalContent.innerHTML = formatSummaryMarkdown(summaryText);
      }

      // Actualizar listado de archivos en la materia
      renderFilesList();

    } catch (err) {
      clearTimeout(timeoutId);
      if (summaryModalLoading) summaryModalLoading.classList.add("hidden");

      if (err.name === "AbortError") {
        alert("El documento es muy extenso o el servidor demoró en responder. Por favor reintentá.");
      } else {
        alert("Error al generar resumen académico: " + err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      if (window.lucide) window.lucide.createIcons();
    }
  }

  if (btnSummaryModalClose) {
    btnSummaryModalClose.addEventListener("click", closeSummaryDedicatedViewer);
  }

  if (modalSummaryViewer) {
    modalSummaryViewer.addEventListener("click", (e) => {
      if (e.target === modalSummaryViewer) closeSummaryDedicatedViewer();
    });
  }

  if (btnSummaryModalCopy) {
    btnSummaryModalCopy.addEventListener("click", async () => {
      if (!currentSummaryViewerText) return;
      try {
        await navigator.clipboard.writeText(currentSummaryViewerText);
        const originalHtml = btnSummaryModalCopy.innerHTML;
        btnSummaryModalCopy.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i> <span class="text-emerald-700 font-medium">¡Copiado!</span>';
        setTimeout(() => {
          btnSummaryModalCopy.innerHTML = originalHtml;
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      } catch (err) {
        alert("No se pudo copiar el resumen al portapapeles.");
      }
    });
  }

  if (btnSummaryModalDownloadDocx) {
    btnSummaryModalDownloadDocx.addEventListener("click", async () => {
      if (!currentSummaryViewerText) {
        alert("Aún no hay resumen generado para descargar.");
        return;
      }
      const baseName = (currentSummaryViewerFileItem ? currentSummaryViewerFileItem.name.replace(/\.[^/.]+$/, "") : "resumen_academico");
      const originalText = btnSummaryModalDownloadDocx.innerHTML;

      try {
        btnSummaryModalDownloadDocx.disabled = true;
        btnSummaryModalDownloadDocx.innerHTML = '<div class="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> <span>Exportando...</span>';

        const res = await fetch("/api/export-summary-docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `${baseName}_resumen_academico`,
            summary: currentSummaryViewerText
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
        btnSummaryModalDownloadDocx.disabled = false;
        btnSummaryModalDownloadDocx.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  if (btnSummaryModalDownloadPdf) {
    btnSummaryModalDownloadPdf.addEventListener("click", () => {
      if (!currentSummaryViewerText) {
        alert("Aún no hay resumen generado para descargar.");
        return;
      }
      const baseName = (currentSummaryViewerFileItem ? currentSummaryViewerFileItem.name.replace(/\.[^/.]+$/, "") : "resumen_academico");
      const subjectName = (currentSubject ? currentSubject.name : "");
      const originalText = btnSummaryModalDownloadPdf.innerHTML;

      try {
        btnSummaryModalDownloadPdf.disabled = true;
        btnSummaryModalDownloadPdf.innerHTML = '<div class="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> <span>Exportando...</span>';

        generateAcademicSummaryPdf(currentSummaryViewerText, baseName, subjectName);
      } catch (err) {
        alert("No se pudo generar el archivo PDF del resumen: " + err.message);
      } finally {
        btnSummaryModalDownloadPdf.disabled = false;
        btnSummaryModalDownloadPdf.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Cerrar visor con tecla Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalSummaryViewer && !modalSummaryViewer.classList.contains("hidden")) {
        closeSummaryDedicatedViewer();
      } else if (modalPdfViewer && !modalPdfViewer.classList.contains("hidden")) {
        closeEmbeddedPdfViewer();
      }
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
          <div class="w-9 h-9 rounded-lg bg-[#001b44]/10 dark:bg-[#001b44]/40 text-[#ffc700] border border-[#ffc700]/30 flex items-center justify-center shrink-0">
            <i data-lucide="file-text" class="w-4 h-4 text-[#ffc700]"></i>
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
          <button type="button" class="btn-open-pdf px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 hover:brightness-125 transition shadow-xs" style="background-color: #001b44; color: #ffc700;">
            <i data-lucide="eye" class="w-3.5 h-3.5" style="color: #ffc700;"></i>
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

      // Resumen IA desde la tarjeta del PDF (Abre el Modal Dedicado de Resumen a Ancho Completo)
      row.querySelector(".btn-summarize-pdf-card").addEventListener("click", () => {
        openSummaryDedicatedViewer(fileItem);
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

  // ─────────────────────────────────────────────────────────────
  // 15. MÓDULO INTERACTIVO 'MI CARRERA (PLAN 504 - COMU UBA)'
  // ─────────────────────────────────────────────────────────────

  // Datos curriculares del Plan 504 (FSOC UBA)
  const CAREER_ORIENTATIONS = [
    {
      id: "periodismo",
      icon: "newspaper",
      name: "Periodismo",
      workField: "Prensa, medios digitales, streaming y TV",
      description: "Redacciones de noticias, medios digitales, streaming, radio, TV, periodismo de datos e investigación.",
      stage2: {
        introductory: [
          { id: "per_intro_1", name: "Teoría del Periodismo", area: "Introductoria" },
          { id: "per_intro_2", name: "Periodismo de Investigación", area: "Introductoria" },
          { id: "per_intro_3", name: "Narrativas Periodísticas Contemporáneas", area: "Introductoria" }
        ],
        applied: [
          { id: "per_app_1", name: "Periodismo de Datos y Fact-Checking", area: "Aplicada" },
          { id: "per_app_2", name: "Producción y Gestión de Medios Periodísticos", area: "Aplicada" },
          { id: "per_app_3", name: "Periodismo Digital, Transmedia y Plataformas", area: "Aplicada" },
          { id: "per_app_4", name: "Ética y Legislación de Prensa", area: "Aplicada" }
        ],
        workshops: [
          { id: "per_tall_1", name: "Taller de Producción Periodística en Prensa", area: "Taller Específico" },
          { id: "per_tall_2", name: "Taller de Periodismo Audiovisual y Streaming", area: "Taller Específico" }
        ]
      }
    },
    {
      id: "opinion_publica",
      icon: "bar-chart-3",
      name: "Opinión Pública y Publicidad",
      workField: "Campañas políticas, consultoría y agencias",
      description: "Campañas políticas y electorales, consultoría, agencias de publicidad, branding y análisis de opinión pública.",
      stage2: {
        introductory: [
          { id: "op_intro_1", name: "Teoría de la Opinión Pública", area: "Introductoria" },
          { id: "op_intro_2", name: "Comunicación Política y Campañas Electorales", area: "Introductoria" },
          { id: "op_intro_3", name: "Teoría y Práctica de la Publicidad", area: "Introductoria" }
        ],
        applied: [
          { id: "op_app_1", name: "Metodología de Encuestas y Métricas de Opinión", area: "Aplicada" },
          { id: "op_app_2", name: "Estrategias de Branding y Comunicación Institucional", area: "Aplicada" },
          { id: "op_app_3", name: "Comportamiento del Consumidor y Ciudadano", area: "Aplicada" },
          { id: "op_app_4", name: "Planificación de Medios y Publicidad Digital", area: "Aplicada" }
        ],
        workshops: [
          { id: "op_tall_1", name: "Taller de Creatividad Publicitaria", area: "Taller Específico" },
          { id: "op_tall_2", name: "Taller de Consultoría y Estrategia Política", area: "Taller Específico" }
        ]
      }
    },
    {
      id: "politicas",
      icon: "landmark",
      name: "Políticas y Planificación",
      workField: "Gestión estatal, regulación y políticas públicas",
      description: "Gestión estatal, ministerios, organismos reguladores, políticas públicas de medios y ONGs.",
      stage2: {
        introductory: [
          { id: "pol_intro_1", name: "Economía Política de las Comunicaciones", area: "Introductoria" },
          { id: "pol_intro_2", name: "Estructura y Concentración del Sistema de Medios", area: "Introductoria" },
          { id: "pol_intro_3", name: "Planificación Estratégica de la Comunicación", area: "Introductoria" }
        ],
        applied: [
          { id: "pol_app_1", name: "Regulación, Espectro Radioeléctrico y Plataformas", area: "Aplicada" },
          { id: "pol_app_2", name: "Gestión de la Comunicación en el Estado y Sector Público", area: "Aplicada" },
          { id: "pol_app_3", name: "Diseño y Evaluación de Políticas Públicas", area: "Aplicada" },
          { id: "pol_app_4", name: "Comunicación en Organizaciones y Redes Sociales", area: "Aplicada" }
        ],
        workshops: [
          { id: "pol_tall_1", name: "Taller de Planificación y Formulación de Proyectos", area: "Taller Específico" },
          { id: "pol_tall_2", name: "Taller de Campañas Públicas y Gubernamentales", area: "Taller Específico" }
        ]
      }
    },
    {
      id: "comunitaria",
      icon: "sprout",
      name: "Comunicación Comunitaria",
      workField: "Medios populares, territorio y movimientos",
      description: "Medios comunitarios y cooperativos, organizaciones barriales, movimientos sociales y derechos humanos en territorio.",
      stage2: {
        introductory: [
          { id: "comu_intro_1", name: "Comunicación Popular y Movimientos Sociales", area: "Introductoria" },
          { id: "comu_intro_2", name: "Metodologías Participativas y Diagnóstico Territorial", area: "Introductoria" },
          { id: "comu_intro_3", name: "Sostenibilidad de Medios Comunitarios y Populares", area: "Introductoria" }
        ],
        applied: [
          { id: "comu_app_1", name: "Comunicación, Derechos Humanos y Géneros", area: "Aplicada" },
          { id: "comu_app_2", name: "Gestión de Redes Barriales y Territoriales", area: "Aplicada" },
          { id: "comu_app_3", name: "Economía Social, Cooperativismo y Medios", area: "Aplicada" },
          { id: "comu_app_4", name: "Narrativas y Producción Popular de Contenidos", area: "Aplicada" }
        ],
        workshops: [
          { id: "comu_tall_1", name: "Taller de Intervención Comunitaria y Territorio", area: "Taller Específico" },
          { id: "comu_tall_2", name: "Taller de Medios Comunitarios, Redes y Radio", area: "Taller Específico" }
        ]
      }
    },
    {
      id: "educacion",
      icon: "graduation-cap",
      name: "Procesos Educativos",
      workField: "Pedagogía de medios, e-learning y didáctica",
      description: "Pedagogía de medios, e-learning, diseño de plataformas educativas y materiales didácticos.",
      stage2: {
        introductory: [
          { id: "edu_intro_1", name: "Comunicación y Educación: Teorías y Debates", area: "Introductoria" },
          { id: "edu_intro_2", name: "Pedagogía Crítica y Alfabetización Mediática", area: "Introductoria" },
          { id: "edu_intro_3", name: "Tecnologías Educativas y Nuevos Escenarios", area: "Introductoria" }
        ],
        applied: [
          { id: "edu_app_1", name: "Diseño de Entornos Virtuales y E-learning", area: "Aplicada" },
          { id: "edu_app_2", name: "Producción de Materiales Educativos y Transmedia", area: "Aplicada" },
          { id: "edu_app_3", name: "Didáctica de la Comunicación", area: "Aplicada" },
          { id: "edu_app_4", name: "Evaluación de Programas Socioeducativos", area: "Aplicada" }
        ],
        workshops: [
          { id: "edu_tall_1", name: "Taller de Diseño de Recursos Didácticos Digitales", area: "Taller Específico" },
          { id: "edu_tall_2", name: "Taller de Capacitación y Proyectos Socioeducativos", area: "Taller Específico" }
        ]
      }
    },
    {
      id: "digital",
      icon: "laptop",
      name: "Nuevos Medios y Digital",
      workField: "Transmedia, productos digitales y UX/UI",
      description: "Narrativas transmedia, comunidades digitales, plataformas y tecnologías de la información.",
      stage2: {
        introductory: [
          { id: "dig_intro_1", name: "Cultura Digital, Algoritmos y Plataformas", area: "Introductoria" },
          { id: "dig_intro_2", name: "Narrativas Transmedia y Storytelling Digital", area: "Introductoria" },
          { id: "dig_intro_3", name: "Arquitectura de la Información y Experiencia de Usuario (UX)", area: "Introductoria" }
        ],
        applied: [
          { id: "dig_app_1", name: "Inteligencia Artificial y Automatización en Comunicación", area: "Aplicada" },
          { id: "dig_app_2", name: "Estrategias de Contenido y Gestión de Comunidades", area: "Aplicada" },
          { id: "dig_app_3", name: "Análisis de Redes y Métricas Digitales", area: "Aplicada" },
          { id: "dig_app_4", name: "Producción y Monetización de Nuevos Medios", area: "Aplicada" }
        ],
        workshops: [
          { id: "dig_tall_1", name: "Taller de Prototipado y Diseño de Interfaces UX/UI", area: "Taller Específico" },
          { id: "dig_tall_2", name: "Taller de Creación y Producción Transmedia", area: "Taller Específico" }
        ]
      }
    }
  ];

  // Etapa 1: Ciclo Inicial (18 materias en 4 áreas)
  const CAREER_STAGE1 = {
    comunicacional: [
      { id: "c1", name: "Teorías y Prácticas de la Comunicación I", area: "Área Comunicacional" },
      { id: "c2", name: "Teorías y Prácticas de la Comunicación II", area: "Área Comunicacional" },
      { id: "c3", name: "Semiótica", area: "Área Comunicacional" },
      { id: "c4", name: "Semiótica de los Medios", area: "Área Comunicacional" },
      { id: "c5", name: "Historia de los Medios", area: "Área Comunicacional" },
      { id: "c6", name: "Comunicación y Cultura", area: "Área Comunicacional" },
      { id: "c7", name: "Políticas Públicas de la Comunicación", area: "Área Comunicacional" },
      { id: "c8", name: "La Investigación en Comunicación", area: "Área Comunicacional" },
      { id: "c9", name: "Derecho a la Comunicación", area: "Área Comunicacional" }
    ],
    practica: [
      { id: "p1", name: "Taller de Escritura", area: "Área Práctica (Taller)" },
      { id: "p2", name: "Taller de Redacción y Géneros Periodísticos", area: "Área Práctica (Taller)" },
      { id: "p3", name: "Taller Radial", area: "Área Práctica (Taller)" },
      { id: "p4", name: "Taller Audiovisual", area: "Área Práctica (Taller)" }
    ],
    sociales: [
      { id: "s1", name: "Historia Social General", area: "Ciencias Sociales (Opción 1/5)" },
      { id: "s2", name: "Historia Argentina Contemporánea", area: "Ciencias Sociales (Opción 2/5)" },
      { id: "s3", name: "Economía Política", area: "Ciencias Sociales (Opción 3/5)" },
      { id: "s4", name: "Antropología y Comunicación", area: "Ciencias Sociales (Opción 4/5)" },
      { id: "s5", name: "Filosofía y Métodos de las Ciencias Sociales", area: "Ciencias Sociales (Opción 5/5)" }
    ],
    problemas: [
      { id: "pr1", name: "Cuerpo, Imagen y Sentido", area: "Problemas del Campo (Opción 1/3)" },
      { id: "pr2", name: "Técnica, Cultura y Sociedad", area: "Problemas del Campo (Opción 2/3)" },
      { id: "pr3", name: "Comunicación, Sujetos y Territorios", area: "Problemas del Campo (Opción 3/3)" }
    ]
  };

  // Requisitos transversales (Habilitados desde el tramo inicial)
  const CAREER_LANGUAGES = [
    { id: "idiom_1", name: "Idioma Extranjero - Nivel I", area: "Idioma (Nivel I)", level: "I" },
    { id: "idiom_2", name: "Idioma Extranjero - Nivel II", area: "Idioma (Nivel II)", level: "II" },
    { id: "idiom_3", name: "Idioma Extranjero - Nivel III", area: "Idioma (Nivel III)", level: "III" }
  ];

  const CAREER_SEMINARS = [
    { id: "opt_1", name: "Seminario Optativo I", area: "Seminario de Grado" },
    { id: "opt_2", name: "Seminario Optativo II", area: "Seminario de Grado" }
  ];

  // Instancia final de graduación y titulación
  const CAREER_GRADUATION = [
    { 
      id: "ppp_2", 
      name: "Prácticas Preprofesionales II (PPP II)", 
      subtitle: "60 hs de práctica asistida en institución u organización", 
      area: "Práctica Supervisada",
      isPpp2: true
    },
    { 
      id: "tif", 
      name: "Taller de TIF (Trabajo Integrador Final)", 
      subtitle: "Elaboración, tutoría y defensa de tesis o proyecto de grado", 
      area: "Instancia Final de Grado",
      isTif: true
    }
  ];

  // Estado local del plan de carrera en memoria
  let careerPlanData = {
    selectedOrientation: "periodismo",
    grades: {} // { [subjectId]: { p1, p2, finalGrade, status, finalScore, isSufficiency, customName, isAccredited } }
  };

  // Operaciones DB: Career Plan
  async function dbGetCareerPlan() {
    const db = await openDatabase();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction("careerPlan", "readonly");
        const store = tx.objectStore("careerPlan");
        const req = store.get("userPlan");
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async function dbSaveCareerPlan(data) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction("careerPlan", "readwrite");
        const store = tx.objectStore("careerPlan");
        const planToSave = data || careerPlanData;
        const now = Date.now();
        const req = store.put({ key: "userPlan", data: planToSave, updatedAt: now });
        req.onsuccess = () => {
          if (supabaseClient && currentAuthUser) {
            try {
              supabaseClient.from("user_career_plan").upsert({
                user_id: currentAuthUser.id,
                data: planToSave,
                updated_at: now
              }).then();
            } catch (e) {
              console.warn("Error al guardar plan de carrera en Supabase:", e);
            }
          }
          resolve();
        };
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  // Lógica de Estado UBA para Notas
  function calculateSubjectStatus(p1Val, p2Val, finalVal, isSufficiency = false) {
    if (isSufficiency) {
      return { 
        status: "sufficiency", 
        label: "✓ Suficiencia / Libre", 
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold", 
        score: null, 
        isPassed: true 
      };
    }

    const p1 = (p1Val !== "" && p1Val !== null && !isNaN(Number(p1Val))) ? Number(p1Val) : null;
    const p2 = (p2Val !== "" && p2Val !== null && !isNaN(Number(p2Val))) ? Number(p2Val) : null;
    const fin = (finalVal !== "" && finalVal !== null && !isNaN(Number(finalVal))) ? Number(finalVal) : null;

    if (p1 === null && p2 === null && fin === null) {
      return { status: "pending", label: "Cursada pendiente", badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", score: null, isPassed: false };
    }

    // Si se cargó examen final directo
    if (fin !== null) {
      if (fin >= 4) {
        return { status: "final_passed", label: "✓ Aprobada en final", badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold", score: fin, isPassed: true };
      } else {
        return { status: "final_failed", label: "⚠️ Final reprobado", badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-semibold", score: fin, isPassed: false };
      }
    }

    // Evaluación por parciales
    if (p1 !== null && p2 !== null) {
      if (p1 >= 7 && p2 >= 7) {
        const avg = ((p1 + p2) / 2);
        return { status: "promoted", label: "🎉 Promocionada", badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold", score: avg, isPassed: true };
      } else if (p1 >= 4 && p2 >= 4) {
        return { status: "regular", label: "📝 Regular (A final)", badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-semibold", score: null, isPassed: false };
      } else {
        return { status: "recup", label: "⚠️ Recuperatorio", badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-semibold", score: null, isPassed: false };
      }
    }

    if (p1 !== null || p2 !== null) {
      const single = p1 !== null ? p1 : p2;
      if (single < 4) {
        return { status: "recup", label: "⚠️ Recuperatorio", badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-semibold", score: null, isPassed: false };
      }
      return { status: "in_progress", label: "⏳ En curso", badgeClass: "bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300", score: null, isPassed: false };
    }

    return { status: "pending", label: "Cursada pendiente", badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", score: null, isPassed: false };
  }

  // Renderizar la vista de Mi Carrera
  async function renderCareerView() {
    // 1. Cargar persistencia
    const saved = await dbGetCareerPlan();
    if (saved) {
      careerPlanData = Object.assign({ selectedOrientation: "periodismo", grades: {} }, saved);
    }

    // 2. Renderizar Malla Curricular Etapa 1
    renderCareerStage1();

    // 3. Renderizar Requisitos Transversales (Idiomas + Seminarios)
    renderCareerTransversal();

    // 4. Renderizar Orientaciones (Conmutador 3x2)
    renderCareerOrientations();

    // 5. Renderizar Malla Curricular Etapa 2 (9 materias de la orientación)
    renderCareerStage2();

    // 6. Renderizar Instancia de Graduación (PPP II + TIF)
    renderCareerGraduation();

    // 7. Actualizar Tablero de Métricas
    updateCareerMetrics();

    if (window.lucide) window.lucide.createIcons();
  }

  // Matriz de afinidad de materias para recomendación de orientaciones
  const ORIENTATION_AFFINITIES = {
    periodismo: ["p1", "p2", "p3", "p4"],
    opinion_publica: ["c3", "s3", "c8"],
    politicas: ["c7", "c9", "s1"],
    comunitaria: ["s4", "c6", "pr3"],
    educacion: ["s5", "c1", "c2"],
    digital: ["pr2", "c4", "p4"]
  };

  // Cálculo inteligente de recomendaciones
  function getRecommendedOrientations() {
    const recommended = new Set();
    const scores = {};

    Object.entries(ORIENTATION_AFFINITIES).forEach(([oriId, subjects]) => {
      let passedCount = 0;
      let totalGrade = 0;
      let countWithGrade = 0;

      subjects.forEach(subId => {
        const gradeObj = careerPlanData.grades[subId];
        if (gradeObj) {
          const evalRes = calculateSubjectStatus(gradeObj.p1, gradeObj.p2, gradeObj.finalGrade);
          if (evalRes.isPassed) {
            passedCount++;
            if (evalRes.score !== null) {
              totalGrade += evalRes.score;
              countWithGrade++;
            }
          }
        }
      });

      const avg = countWithGrade > 0 ? (totalGrade / countWithGrade) : (passedCount > 0 ? 7 : 0);
      const score = passedCount > 0 ? (passedCount * 10 + avg) : 0;
      scores[oriId] = { passedCount, avg, score };
    });

    const maxScore = Math.max(...Object.values(scores).map(s => s.score));

    if (maxScore > 0) {
      Object.entries(scores).forEach(([oriId, s]) => {
        // Recomendada si tiene 2 o más materias clave aprobadas, o 1 con nota destacada (>= 7), o puntaje más alto
        if (s.passedCount >= 2 || (s.passedCount >= 1 && s.avg >= 7) || (s.score === maxScore && s.passedCount > 0)) {
          recommended.add(oriId);
        }
      });
    }

    return recommended;
  }

  // Mapeo de perfiles profesionales para materias optativas (Etapa 1 y 2)
  const SUBJECT_PROFILE_MAP = {
    // Ciencias Sociales (Etapa 1)
    s1: { label: "Políticas / Historia Social", orientations: ["politicas"] },
    s2: { label: "Periodismo / Políticas", orientations: ["periodismo", "politicas"] },
    s3: { label: "Opinión Pública / Políticas", orientations: ["opinion_publica", "politicas"] },
    s4: { label: "Comunitaria / Investigación", orientations: ["comunitaria"] },
    s5: { label: "Investigación / Procesos Educativos", orientations: ["educacion"] },
    // Problemas del Campo (Etapa 1)
    pr1: { label: "Nuevos Medios / Educación", orientations: ["digital", "educacion"] },
    pr2: { label: "Nuevos Medios / Digital", orientations: ["digital"] },
    pr3: { label: "Comunitaria / Territorio", orientations: ["comunitaria"] },
    // Optativas transversales (Etapa 2)
    opt_1: { label: "Orientación elegida", orientations: ["all"] },
    opt_2: { label: "Orientación elegida", orientations: ["all"] }
  };

  function renderCareerOrientations() {
    const grid = document.getElementById("careerOrientationsGrid");
    const badge = document.getElementById("careerCurrentOrientationBadge");
    const label = document.getElementById("careerCurrentOrientationLabel");
    if (!grid) return;

    grid.innerHTML = "";

    const currentOri = CAREER_ORIENTATIONS.find(o => o.id === careerPlanData.selectedOrientation) || CAREER_ORIENTATIONS[0];
    if (badge && label) {
      badge.classList.remove("hidden");
      label.textContent = `Orientación: ${currentOri.name}`;
    }

    const recommendedOrientations = getRecommendedOrientations();

    CAREER_ORIENTATIONS.forEach(ori => {
      const isSelected = ori.id === careerPlanData.selectedOrientation;
      const isRecommended = recommendedOrientations.has(ori.id);
      const card = document.createElement("button");
      card.type = "button";
      card.className = `p-2.5 sm:p-3 rounded-xl border transition-all text-left flex items-start gap-2.5 sm:gap-3 w-full cursor-pointer relative group ${
        isSelected 
          ? "border-[#ffc700] bg-blue-950/10 dark:bg-blue-950/40 text-blue-950 dark:text-amber-200 font-semibold ring-1 ring-[#ffc700] shadow-xs" 
          : isRecommended
            ? "border-amber-300 dark:border-amber-600/70 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-400 text-slate-800 dark:text-slate-200 shadow-2xs"
            : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
      }`;

      card.innerHTML = `
        <div class="w-8 h-8 rounded-lg ${
          isSelected 
            ? 'bg-[#001b44] text-[#ffc700]' 
            : isRecommended
              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
        } flex items-center justify-center shrink-0 transition-colors">
          <i data-lucide="${ori.icon}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 min-w-0 pr-1">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <span class="text-xs font-bold truncate ${isSelected ? 'text-blue-950 dark:text-amber-200' : 'text-slate-900 dark:text-slate-100'}">${ori.name}</span>
            ${isRecommended ? '<span class="text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-300 dark:border-amber-600 shrink-0">💡 Recomendada</span>' : ''}
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight">${ori.workField || ori.description}</p>
        </div>
        ${isSelected ? '<div class="w-2 h-2 rounded-full bg-[#ffc700] ring-2 ring-white dark:ring-slate-900 shrink-0 mt-1"></div>' : ''}
      `;

      card.addEventListener("click", async () => {
        careerPlanData.selectedOrientation = ori.id;
        await dbSaveCareerPlan(careerPlanData);
        renderCareerView();
      });

      grid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function createSubjectCardElement(subject) {
    const gradeObj = careerPlanData.grades[subject.id] || { p1: "", p2: "", finalGrade: "" };
    const evalResult = calculateSubjectStatus(gradeObj.p1, gradeObj.p2, gradeObj.finalGrade);

    const profile = SUBJECT_PROFILE_MAP[subject.id];
    const isProfileMatch = profile && (profile.orientations.includes(careerPlanData.selectedOrientation) || profile.orientations.includes("all"));

    const card = document.createElement("div");
    card.className = `p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
      evalResult.isPassed 
        ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
        : isProfileMatch
          ? "border-[#ffc700] dark:border-[#ffc700]/80 ring-1 ring-[#ffc700]/70 dark:ring-[#ffc700]/60 bg-amber-50/15 dark:bg-amber-950/15 shadow-2xs"
          : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
    }`;

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-1.5 mb-1.5">
          <span class="text-[10px] text-slate-400 font-medium truncate">${subject.area}</span>
          <span class="badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${evalResult.badgeClass}">
            ${evalResult.label}
          </span>
        </div>
        <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2" title="${subject.name}">
          ${subject.name}
        </h5>
        ${profile ? `
          <div class="mt-2">
            <span class="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md transition-colors ${
              isProfileMatch
                ? 'bg-[#ffc700]/20 text-amber-900 dark:text-amber-200 border border-[#ffc700]/60 font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 font-normal'
            }">
              🏷️ Perfila para: ${profile.label}
            </span>
          </div>
        ` : ''}
      </div>

      <div class="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-medium mb-0.5">P1</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              step="0.5" 
              placeholder="-" 
              value="${gradeObj.p1 ?? ''}" 
              class="input-p1 w-9 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
            >
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-medium mb-0.5">P2</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              step="0.5" 
              placeholder="-" 
              value="${gradeObj.p2 ?? ''}" 
              class="input-p2 w-9 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
            >
          </div>
        </div>

        <div class="flex flex-col items-end">
          <span class="text-[9px] text-slate-400 font-medium mb-0.5">Final</span>
          <input 
            type="number" 
            min="1" 
            max="10" 
            step="0.5" 
            placeholder="-" 
            value="${gradeObj.finalGrade ?? ''}" 
            class="input-final w-11 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
          >
        </div>
      </div>
    `;

    // Eventos de guardado reactivo
    const inputP1 = card.querySelector(".input-p1");
    const inputP2 = card.querySelector(".input-p2");
    const inputFinal = card.querySelector(".input-final");

    const handleGradeChange = async () => {
      const p1 = inputP1.value.trim();
      const p2 = inputP2.value.trim();
      const fin = inputFinal.value.trim();

      careerPlanData.grades[subject.id] = {
        p1: p1 ? Number(p1) : "",
        p2: p2 ? Number(p2) : "",
        finalGrade: fin ? Number(fin) : ""
      };

      await dbSaveCareerPlan(careerPlanData);

      // Re-evaluar insignia y métricas de inmediato
      const newEval = calculateSubjectStatus(p1, p2, fin);
      const badgeElem = card.querySelector(".badge-status");
      if (badgeElem) {
        badgeElem.className = `badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${newEval.badgeClass}`;
        badgeElem.textContent = newEval.label;
      }

      card.className = `p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
        newEval.isPassed 
          ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
          : isProfileMatch
            ? "border-[#ffc700] dark:border-[#ffc700]/80 ring-1 ring-[#ffc700]/70 dark:ring-[#ffc700]/60 bg-amber-50/15 dark:bg-amber-950/15 shadow-2xs"
            : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
      }`;

      updateCareerMetrics();
      renderCareerOrientations();
    };

    inputP1.addEventListener("change", handleGradeChange);
    inputP2.addEventListener("change", handleGradeChange);
    inputFinal.addEventListener("change", handleGradeChange);

    return card;
  }

  function renderCareerStage1() {
    const listCom = document.getElementById("careerListComArea");
    const listPract = document.getElementById("careerListPractArea");
    const listSoc = document.getElementById("careerListSocArea");
    const listProb = document.getElementById("careerListProbArea");

    if (listCom) {
      listCom.innerHTML = "";
      CAREER_STAGE1.comunicacional.forEach(sub => listCom.appendChild(createSubjectCardElement(sub)));
    }
    if (listPract) {
      listPract.innerHTML = "";
      CAREER_STAGE1.practica.forEach(sub => listPract.appendChild(createSubjectCardElement(sub)));
    }
    if (listSoc) {
      listSoc.innerHTML = "";
      CAREER_STAGE1.sociales.forEach(sub => listSoc.appendChild(createSubjectCardElement(sub)));
    }
    if (listProb) {
      listProb.innerHTML = "";
      CAREER_STAGE1.problemas.forEach(sub => listProb.appendChild(createSubjectCardElement(sub)));
    }
  }

  // 3. Renderizar Requisitos Transversales (Idiomas + Seminarios)
  function createLanguageCardElement(subject) {
    const gradeObj = careerPlanData.grades[subject.id] || { p1: "", p2: "", finalGrade: "", isSufficiency: false };
    const isSuff = !!gradeObj.isSufficiency;
    const evalResult = calculateSubjectStatus(gradeObj.p1, gradeObj.p2, gradeObj.finalGrade, isSuff);

    const card = document.createElement("div");
    card.className = `p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
      evalResult.isPassed 
        ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
        : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
    }`;

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-1.5 mb-1.5">
          <span class="text-[10px] text-slate-400 font-medium truncate">${subject.area}</span>
          <span class="badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${evalResult.badgeClass}">
            ${evalResult.label}
          </span>
        </div>
        <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
          ${subject.name}
        </h5>
        <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              class="checkbox-sufficiency rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-slate-600 dark:bg-slate-800 w-3.5 h-3.5"
              ${isSuff ? "checked" : ""}
            >
            <span class="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Aprobado por Examen Libre / Suficiencia
            </span>
          </label>
        </div>
      </div>

      <div class="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 ${isSuff ? 'opacity-40 pointer-events-none' : ''} grades-container">
        <div class="flex items-center gap-1.5">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-medium mb-0.5">P1</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              step="0.5" 
              placeholder="-" 
              value="${gradeObj.p1 ?? ''}" 
              class="input-p1 w-9 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
            >
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-medium mb-0.5">P2</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              step="0.5" 
              placeholder="-" 
              value="${gradeObj.p2 ?? ''}" 
              class="input-p2 w-9 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
            >
          </div>
        </div>

        <div class="flex flex-col items-end">
          <span class="text-[9px] text-slate-400 font-medium mb-0.5">Final</span>
          <input 
            type="number" 
            min="1" 
            max="10" 
            step="0.5" 
            placeholder="-" 
            value="${gradeObj.finalGrade ?? ''}" 
            class="input-final w-11 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
          >
        </div>
      </div>
    `;

    const chkSuff = card.querySelector(".checkbox-sufficiency");
    const gradesBox = card.querySelector(".grades-container");
    const inputP1 = card.querySelector(".input-p1");
    const inputP2 = card.querySelector(".input-p2");
    const inputFinal = card.querySelector(".input-final");

    const saveAndRefresh = async () => {
      const isSuffActive = chkSuff.checked;
      const p1 = inputP1.value.trim();
      const p2 = inputP2.value.trim();
      const fin = inputFinal.value.trim();

      careerPlanData.grades[subject.id] = {
        isSufficiency: isSuffActive,
        p1: p1 ? Number(p1) : "",
        p2: p2 ? Number(p2) : "",
        finalGrade: fin ? Number(fin) : ""
      };

      await dbSaveCareerPlan(careerPlanData);

      const newEval = calculateSubjectStatus(p1, p2, fin, isSuffActive);
      const badgeElem = card.querySelector(".badge-status");
      if (badgeElem) {
        badgeElem.className = `badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${newEval.badgeClass}`;
        badgeElem.textContent = newEval.label;
      }

      if (isSuffActive) {
        gradesBox.classList.add("opacity-40", "pointer-events-none");
      } else {
        gradesBox.classList.remove("opacity-40", "pointer-events-none");
      }

      card.className = `p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
        newEval.isPassed 
          ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
          : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
      }`;

      updateCareerMetrics();
    };

    chkSuff.addEventListener("change", saveAndRefresh);
    inputP1.addEventListener("change", saveAndRefresh);
    inputP2.addEventListener("change", saveAndRefresh);
    inputFinal.addEventListener("change", saveAndRefresh);

    return card;
  }

  function createSeminarCardElement(subject) {
    const gradeObj = careerPlanData.grades[subject.id] || { p1: "", p2: "", finalGrade: "", customName: "" };
    const evalResult = calculateSubjectStatus(gradeObj.p1, gradeObj.p2, gradeObj.finalGrade);

    const card = document.createElement("div");
    card.className = `p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
      evalResult.isPassed 
        ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
        : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
    }`;

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-1.5 mb-1.5">
          <span class="text-[10px] text-slate-400 font-medium truncate">${subject.area}</span>
          <span class="badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${evalResult.badgeClass}">
            ${evalResult.label}
          </span>
        </div>
        <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
          ${subject.name}
        </h5>
        <div class="mt-2">
          <input 
            type="text" 
            placeholder="Escribí el nombre del seminario cursado..." 
            value="${gradeObj.customName || ''}" 
            class="input-seminar-name w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          >
        </div>
      </div>

      <div class="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-medium mb-0.5">P1</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              step="0.5" 
              placeholder="-" 
              value="${gradeObj.p1 ?? ''}" 
              class="input-p1 w-9 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
            >
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-medium mb-0.5">P2</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              step="0.5" 
              placeholder="-" 
              value="${gradeObj.p2 ?? ''}" 
              class="input-p2 w-9 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
            >
          </div>
        </div>

        <div class="flex flex-col items-end">
          <span class="text-[9px] text-slate-400 font-medium mb-0.5">Final</span>
          <input 
            type="number" 
            min="1" 
            max="10" 
            step="0.5" 
            placeholder="-" 
            value="${gradeObj.finalGrade ?? ''}" 
            class="input-final w-11 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
          >
        </div>
      </div>
    `;

    const inputName = card.querySelector(".input-seminar-name");
    const inputP1 = card.querySelector(".input-p1");
    const inputP2 = card.querySelector(".input-p2");
    const inputFinal = card.querySelector(".input-final");

    const saveSeminar = async () => {
      const customName = inputName.value.trim();
      const p1 = inputP1.value.trim();
      const p2 = inputP2.value.trim();
      const fin = inputFinal.value.trim();

      careerPlanData.grades[subject.id] = {
        customName,
        p1: p1 ? Number(p1) : "",
        p2: p2 ? Number(p2) : "",
        finalGrade: fin ? Number(fin) : ""
      };

      await dbSaveCareerPlan(careerPlanData);

      const newEval = calculateSubjectStatus(p1, p2, fin);
      const badgeElem = card.querySelector(".badge-status");
      if (badgeElem) {
        badgeElem.className = `badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${newEval.badgeClass}`;
        badgeElem.textContent = newEval.label;
      }

      card.className = `p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
        newEval.isPassed 
          ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
          : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
      }`;

      updateCareerMetrics();
    };

    inputName.addEventListener("change", saveSeminar);
    inputP1.addEventListener("change", saveSeminar);
    inputP2.addEventListener("change", saveSeminar);
    inputFinal.addEventListener("change", saveSeminar);

    return card;
  }

  function renderCareerTransversal() {
    const listIdiomas = document.getElementById("careerListIdiomas");
    const listSeminarios = document.getElementById("careerListSeminarios");

    if (listIdiomas) {
      listIdiomas.innerHTML = "";
      CAREER_LANGUAGES.forEach(sub => listIdiomas.appendChild(createLanguageCardElement(sub)));
    }
    if (listSeminarios) {
      listSeminarios.innerHTML = "";
      CAREER_SEMINARS.forEach(sub => listSeminarios.appendChild(createSeminarCardElement(sub)));
    }
  }

  // 5. Renderizar Malla Curricular Etapa 2 (Solo las 9 materias de la orientación)
  function renderCareerStage2() {
    const container = document.getElementById("careerStage2Container");
    const badge = document.getElementById("careerStage2OrientationBadge");
    if (!container) return;

    const currentOri = CAREER_ORIENTATIONS.find(o => o.id === careerPlanData.selectedOrientation) || CAREER_ORIENTATIONS[0];
    if (badge) badge.textContent = `Orientación: ${currentOri.name}`;

    container.innerHTML = "";

    // 2.1 Asignaturas Introductorias (3)
    const cardIntro = document.createElement("div");
    cardIntro.className = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3.5 sm:p-4 space-y-2.5";
    cardIntro.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
        <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📖 Asignaturas Introductorias</span>
          <span class="text-[11px] font-normal text-slate-400 dark:text-slate-500">(3 materias de la orientación)</span>
        </h4>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3" id="stage2ListIntro"></div>
    `;
    container.appendChild(cardIntro);
    const listIntro = cardIntro.querySelector("#stage2ListIntro");
    currentOri.stage2.introductory.forEach(sub => listIntro.appendChild(createSubjectCardElement(sub)));

    // 2.2 Asignaturas Aplicadas (4)
    const cardApp = document.createElement("div");
    cardApp.className = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3.5 sm:p-4 space-y-2.5";
    cardApp.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
        <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🎯 Asignaturas Aplicadas</span>
          <span class="text-[11px] font-normal text-slate-400 dark:text-slate-500">(4 materias de la orientación)</span>
        </h4>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3" id="stage2ListApp"></div>
    `;
    container.appendChild(cardApp);
    const listApp = cardApp.querySelector("#stage2ListApp");
    currentOri.stage2.applied.forEach(sub => listApp.appendChild(createSubjectCardElement(sub)));

    // 2.3 Talleres Específicos (2)
    const cardTall = document.createElement("div");
    cardTall.className = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3.5 sm:p-4 space-y-2.5";
    cardTall.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
        <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🛠️ Talleres Específicos</span>
          <span class="text-[11px] font-normal text-slate-400 dark:text-slate-500">(2 talleres de la orientación)</span>
        </h4>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3" id="stage2ListTall"></div>
    `;
    container.appendChild(cardTall);
    const listTall = cardTall.querySelector("#stage2ListTall");
    currentOri.stage2.workshops.forEach(sub => listTall.appendChild(createSubjectCardElement(sub)));
  }

  // 6. Renderizar Instancia de Graduación / Cierre (PPP II + TIF)
  function createGraduationCardElement(subject) {
    const gradeObj = careerPlanData.grades[subject.id] || { p1: "", p2: "", finalGrade: "", isAccredited: false };
    const isAccredited = !!gradeObj.isAccredited;
    const evalResult = subject.isPpp2 
      ? (isAccredited 
          ? { isPassed: true, label: "✓ Acreditada (60 hs)", badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold", score: null } 
          : calculateSubjectStatus(gradeObj.p1, gradeObj.p2, gradeObj.finalGrade))
      : calculateSubjectStatus(gradeObj.p1, gradeObj.p2, gradeObj.finalGrade);

    const card = document.createElement("div");
    card.className = `p-4 rounded-2xl border transition-all flex flex-col justify-between ${
      evalResult.isPassed 
        ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
        : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
    }`;

    if (subject.isPpp2) {
      card.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-1.5 mb-1.5">
            <span class="text-[10px] text-slate-400 font-medium truncate">${subject.area}</span>
            <span class="badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${evalResult.badgeClass}">
              ${evalResult.label}
            </span>
          </div>
          <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
            ${subject.name}
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            ${subject.subtitle}
          </p>
          <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                class="checkbox-accredited rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 w-4 h-4"
                ${isAccredited ? "checked" : ""}
              >
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Acreditar 60 hs cumplidas en convenio / organización
              </span>
            </label>
          </div>
        </div>

        <div class="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-400">
          <span class="text-[11px]">Requiere Ciclo Orientado + PPP I</span>
          <span class="font-mono text-[11px] text-slate-500">${isAccredited ? '60/60 hs ✓' : '0/60 hs'}</span>
        </div>
      `;

      const chk = card.querySelector(".checkbox-accredited");
      chk.addEventListener("change", async () => {
        const val = chk.checked;
        careerPlanData.grades[subject.id] = { isAccredited: val };
        await dbSaveCareerPlan(careerPlanData);

        const newEval = val 
          ? { isPassed: true, label: "✓ Acreditada (60 hs)", badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold" }
          : { isPassed: false, label: "Cursada pendiente", badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };

        const badgeElem = card.querySelector(".badge-status");
        if (badgeElem) {
          badgeElem.className = `badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${newEval.badgeClass}`;
          badgeElem.textContent = newEval.label;
        }

        card.className = `p-4 rounded-2xl border transition-all flex flex-col justify-between ${
          newEval.isPassed 
            ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
            : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
        }`;

        updateCareerMetrics();
      });
    } else {
      // TIF
      card.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-1.5 mb-1.5">
            <span class="text-[10px] text-slate-400 font-medium truncate">${subject.area}</span>
            <span class="badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${evalResult.badgeClass}">
              ${evalResult.label}
            </span>
          </div>
          <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
            ${subject.name}
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            ${subject.subtitle}
          </p>
        </div>

        <div class="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-medium mb-0.5">P1 (Avance)</span>
              <input 
                type="number" 
                min="1" 
                max="10" 
                step="0.5" 
                placeholder="-" 
                value="${gradeObj.p1 ?? ''}" 
                class="input-p1 w-10 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
              >
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-medium mb-0.5">P2 (Borrador)</span>
              <input 
                type="number" 
                min="1" 
                max="10" 
                step="0.5" 
                placeholder="-" 
                value="${gradeObj.p2 ?? ''}" 
                class="input-p2 w-10 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
              >
            </div>
          </div>

          <div class="flex flex-col items-end">
            <span class="text-[9px] text-slate-400 font-medium mb-0.5">Defensa / Nota Final</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              step="0.5" 
              placeholder="-" 
              value="${gradeObj.finalGrade ?? ''}" 
              class="input-final w-14 h-7 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition shadow-2xs"
            >
          </div>
        </div>
      `;

      const inputP1 = card.querySelector(".input-p1");
      const inputP2 = card.querySelector(".input-p2");
      const inputFinal = card.querySelector(".input-final");

      const handleTifChange = async () => {
        const p1 = inputP1.value.trim();
        const p2 = inputP2.value.trim();
        const fin = inputFinal.value.trim();

        careerPlanData.grades[subject.id] = {
          p1: p1 ? Number(p1) : "",
          p2: p2 ? Number(p2) : "",
          finalGrade: fin ? Number(fin) : ""
        };

        await dbSaveCareerPlan(careerPlanData);

        const newEval = calculateSubjectStatus(p1, p2, fin);
        const badgeElem = card.querySelector(".badge-status");
        if (badgeElem) {
          badgeElem.className = `badge-status text-[10px] px-2 py-0.5 rounded-full shrink-0 ${newEval.badgeClass}`;
          badgeElem.textContent = newEval.label;
        }

        card.className = `p-4 rounded-2xl border transition-all flex flex-col justify-between ${
          newEval.isPassed 
            ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs" 
            : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
        }`;

        updateCareerMetrics();
      };

      inputP1.addEventListener("change", handleTifChange);
      inputP2.addEventListener("change", handleTifChange);
      inputFinal.addEventListener("change", handleTifChange);
    }

    return card;
  }

  function renderCareerGraduation() {
    const container = document.getElementById("careerGraduationContainer");
    if (!container) return;
    container.innerHTML = "";
    CAREER_GRADUATION.forEach(sub => container.appendChild(createGraduationCardElement(sub)));
  }

  function updateCareerMetrics() {
    const isSubjectPassed = (subId) => {
      const g = careerPlanData.grades[subId];
      if (!g) return false;
      if (g.isSufficiency || g.isAccredited) return true;
      return calculateSubjectStatus(g.p1, g.p2, g.finalGrade, !!g.isSufficiency).isPassed;
    };

    const countPassed = (list) => {
      return list.filter(sub => isSubjectPassed(sub.id)).length;
    };

    // 1. Contar aprobadas por área del Ciclo Inicial (18)
    const passedCom = countPassed(CAREER_STAGE1.comunicacional);
    const passedPract = countPassed(CAREER_STAGE1.practica);
    const passedSocRaw = countPassed(CAREER_STAGE1.sociales);
    const passedSoc = Math.min(3, passedSocRaw);
    const passedProbRaw = countPassed(CAREER_STAGE1.problemas);
    const passedProb = Math.min(2, passedProbRaw);
    const stage1TotalPassed = passedCom + passedPract + passedSoc + passedProb;

    const elCom = document.getElementById("careerCountComArea");
    if (elCom) elCom.textContent = `${passedCom}/9`;
    const elPract = document.getElementById("careerCountPractArea");
    if (elPract) elPract.textContent = `${passedPract}/4`;
    const elSoc = document.getElementById("careerCountSocArea");
    if (elSoc) elSoc.textContent = `${passedSocRaw}/3 elegidas`;
    const elProb = document.getElementById("careerCountProbArea");
    if (elProb) elProb.textContent = `${passedProbRaw}/2 elegidas`;

    const elStage1Count = document.getElementById("careerStage1Count");
    if (elStage1Count) elStage1Count.textContent = `${stage1TotalPassed} / 18 aprobadas`;

    // Tarjeta interactiva de acreditación de PPP I en Bloque 2
    const ppp1Card = document.getElementById("careerPpp1AccreditationCard");
    const ppp1Icon = document.getElementById("careerPpp1AccreditationIcon");
    const ppp1Badge = document.getElementById("careerPpp1Badge");
    const ppp1Desc = document.getElementById("careerPpp1Desc");
    const ppp1StatusBox = document.getElementById("careerPpp1StatusBox");

    if (passedPract >= 2) {
      if (ppp1Card) {
        ppp1Card.className = "rounded-2xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/25";
      }
      if (ppp1Icon) {
        ppp1Icon.className = "w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center shrink-0 transition-colors";
      }
      if (ppp1Badge) {
        ppp1Badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200";
        ppp1Badge.textContent = `✓ Acreditada automáticamente (${passedPract}/4 talleres aprobados)`;
      }
      if (ppp1Desc) {
        ppp1Desc.textContent = "¡Felicitaciones! Cumpliste con el requisito de 2 talleres del Área Práctica. PPP I acreditada para tu legajo.";
      }
      if (ppp1StatusBox) {
        ppp1StatusBox.className = "shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300/80 dark:border-emerald-700 bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 transition-colors";
        ppp1StatusBox.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 dark:text-emerald-400"></i><span>Acreditada ✓</span>';
      }
    } else {
      if (ppp1Card) {
        ppp1Card.className = "rounded-2xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900";
      }
      if (ppp1Icon) {
        ppp1Icon.className = "w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 transition-colors";
      }
      if (ppp1Badge) {
        ppp1Badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
        ppp1Badge.textContent = `Pendiente (${passedPract}/2 talleres)`;
      }
      if (ppp1Desc) {
        ppp1Desc.textContent = "Se acredita automáticamente al aprobar al menos 2 de los 4 talleres del Área Práctica (Escritura, Redacción, Radial o Audiovisual).";
      }
      if (ppp1StatusBox) {
        ppp1StatusBox.className = "shrink-0 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 transition-colors";
        ppp1StatusBox.innerHTML = '<i data-lucide="clock" class="w-4 h-4"></i><span>Requiere 2 talleres</span>';
      }
    }

    // 2. Requisitos Transversales (5: 3 idiomas + 2 seminarios)
    const passedIdiomas = countPassed(CAREER_LANGUAGES);
    const passedSeminarios = countPassed(CAREER_SEMINARS);
    const transversalTotalPassed = passedIdiomas + passedSeminarios;

    const elIdiomas = document.getElementById("careerCountIdiomas");
    if (elIdiomas) elIdiomas.textContent = `${passedIdiomas}/3`;
    const elSeminarios = document.getElementById("careerCountSeminarios");
    if (elSeminarios) elSeminarios.textContent = `${passedSeminarios}/2`;
    const elTransversalCount = document.getElementById("careerTransversalCount");
    if (elTransversalCount) elTransversalCount.textContent = `${transversalTotalPassed} / 5 aprobados`;

    // 3. Etapa 2: Orientación (9 materias)
    const currentOri = CAREER_ORIENTATIONS.find(o => o.id === careerPlanData.selectedOrientation) || CAREER_ORIENTATIONS[0];
    const stage2Subs = [
      ...currentOri.stage2.introductory,
      ...currentOri.stage2.applied,
      ...currentOri.stage2.workshops
    ];
    const stage2TotalPassed = countPassed(stage2Subs);

    const elStage2Count = document.getElementById("careerStage2Count");
    if (elStage2Count) elStage2Count.textContent = `${stage2TotalPassed} / 9 aprobadas`;

    // 4. Instancia de Graduación (2: PPP II + TIF)
    const graduationTotalPassed = countPassed(CAREER_GRADUATION);
    const elGraduationCount = document.getElementById("careerGraduationCount");
    if (elGraduationCount) elGraduationCount.textContent = `${graduationTotalPassed} / 2 cumplidos`;

    // 5. Total Carrera (34 requisitos globales)
    const totalPassedAll = Math.min(34, stage1TotalPassed + transversalTotalPassed + stage2TotalPassed + graduationTotalPassed);
    const progressPercent = Math.round((totalPassedAll / 34) * 100);

    const elPassedCount = document.getElementById("careerMetricPassedCount");
    if (elPassedCount) elPassedCount.textContent = `${totalPassedAll} de 34`;

    const elPercent = document.getElementById("careerMetricPercent");
    if (elPercent) elPercent.textContent = `${progressPercent}%`;

    const elProgressBar = document.getElementById("careerProgressBar");
    if (elProgressBar) elProgressBar.style.width = `${progressPercent}%`;

    // 6. Promedio General Académico
    let scoresSum = 0;
    let scoresCount = 0;

    Object.values(careerPlanData.grades).forEach(g => {
      const res = calculateSubjectStatus(g.p1, g.p2, g.finalGrade, !!g.isSufficiency);
      if (res.isPassed && res.score !== null) {
        scoresSum += res.score;
        scoresCount++;
      }
    });

    const elAverage = document.getElementById("careerMetricAverage");
    if (elAverage) {
      if (scoresCount > 0) {
        const avg = (scoresSum / scoresCount).toFixed(2);
        elAverage.textContent = avg;
      } else {
        elAverage.textContent = "-";
      }
    }

    // 7. Alertas superiores (PPP I y Pase a Orientación)
    const cardPpp1 = document.getElementById("careerCardAlertPpp1");
    const iconPpp1 = document.getElementById("careerIconPpp1");
    const textPpp1 = document.getElementById("careerStatusPpp1Text");

    if (passedPract >= 2) {
      if (cardPpp1) {
        cardPpp1.className = "bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-300 dark:border-emerald-800 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between transition-colors";
      }
      if (iconPpp1) {
        iconPpp1.className = "w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center transition-colors";
      }
      if (textPpp1) {
        textPpp1.className = "text-sm font-bold text-emerald-800 dark:text-emerald-300";
        textPpp1.textContent = `✓ Habilitada (${passedPract}/4 talleres)`;
      }
    } else {
      if (cardPpp1) {
        cardPpp1.className = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between transition-colors";
      }
      if (iconPpp1) {
        iconPpp1.className = "w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors";
      }
      if (textPpp1) {
        textPpp1.className = "text-sm font-bold text-slate-700 dark:text-slate-300";
        textPpp1.textContent = `Pendiente (${passedPract}/2 talleres)`;
      }
    }

    const cardOriented = document.getElementById("careerCardAlertOriented");
    const iconOriented = document.getElementById("careerIconOriented");
    const textOriented = document.getElementById("careerStatusOrientedText");

    if (stage1TotalPassed >= 18) {
      if (cardOriented) {
        cardOriented.className = "bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-300 dark:border-emerald-800 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between transition-colors";
      }
      if (iconOriented) {
        iconOriented.className = "w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center transition-colors";
      }
      if (textOriented) {
        textOriented.className = "text-sm font-bold text-emerald-800 dark:text-emerald-300";
        textOriented.textContent = "✓ Pase Habilitado (18/18)";
      }
    } else {
      if (cardOriented) {
        cardOriented.className = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between transition-colors";
      }
      if (iconOriented) {
        iconOriented.className = "w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors";
      }
      if (textOriented) {
        textOriented.className = "text-sm font-bold text-slate-700 dark:text-slate-300";
        textOriented.textContent = `${stage1TotalPassed} de 18 del Inicial`;
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // Inicializar
  loadInitialConfig();
  updateHistoryBadge();
  dbGetCareerPlan().then(saved => {
    if (saved) careerPlanData = Object.assign(careerPlanData, saved);
  });
});
