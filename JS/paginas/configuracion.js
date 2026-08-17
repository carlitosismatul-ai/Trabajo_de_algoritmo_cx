document.addEventListener("DOMContentLoaded", () => {

    const root = document.documentElement;

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const openSettings = document.getElementById("openSettings");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettings = document.getElementById("closeSettings");

    const themeToggle = document.getElementById("themeToggle");
    const fontSelect = document.getElementById("fontSelect");
    const soundToggle = document.getElementById("soundToggle");

    const btnSmall = document.getElementById("btnSizeSmall");
    const btnNormal = document.getElementById("btnSizeNormal");
    const btnLarge = document.getElementById("btnSizeLarge");


    // ==========================================
    // VALORES
    // ==========================================

    let temaGuardado = "light";
    let fuenteGuardada = "'Poppins', sans-serif";
    let escalaGuardada = "1rem";
    let sonidoGuardado = "off";


    // ==========================================
    // LEER LOCALSTORAGE
    // ==========================================

    function cargarConfiguracionGuardada() {

        temaGuardado =
            localStorage.getItem("harvestx-tema") || "light";

        fuenteGuardada =
            localStorage.getItem("harvestx-fuente") ||
            "'Poppins', sans-serif";

        escalaGuardada =
            localStorage.getItem("harvestx-escala") ||
            "1rem";

        sonidoGuardado =
            localStorage.getItem("harvestx-sonido") ||
            "off";
    }


    // ==========================================
    // ACTUALIZAR BOTÓN ACTIVO
    // ==========================================

    function actualizarBotonActivo() {

        [btnSmall, btnNormal, btnLarge].forEach(btn => {

            if (btn) {
                btn.classList.remove("active");
            }

        });


        if (
            escalaGuardada === "0.85rem" &&
            btnSmall
        ) {

            btnSmall.classList.add("active");

        } else if (
            escalaGuardada === "1.15rem" &&
            btnLarge
        ) {

            btnLarge.classList.add("active");

        } else if (btnNormal) {

            btnNormal.classList.add("active");

        }
    }


    // ==========================================
    // ACTUALIZAR CONTROLES
    // ==========================================

    function actualizarControles() {

        if (themeToggle) {

            themeToggle.checked =
                temaGuardado === "dark";

        }


        if (fontSelect) {

            fontSelect.value =
                fuenteGuardada;

        }


        if (soundToggle) {

            soundToggle.checked =
                sonidoGuardado === "on";

        }


        actualizarBotonActivo();
    }


    // ==========================================
    // APLICAR CONFIGURACIÓN
    // ==========================================

    function aplicarConfiguracion() {

        // IMPORTANTE:
        // Siempre volver a leer LocalStorage
        cargarConfiguracionGuardada();


        // TEMA
        if (temaGuardado === "dark") {

            root.setAttribute(
                "data-theme",
                "dark"
            );

        } else {

            root.removeAttribute(
                "data-theme"
            );

        }


        // FUENTE
        root.style.setProperty(
            "--fuente-actual",
            fuenteGuardada
        );


        // TAMAÑO
        root.style.setProperty(
            "--escala-texto",
            escalaGuardada
        );


        // Actualizar controles
        actualizarControles();
    }


    // ==========================================
    // APLICAR AL CARGAR
    // ==========================================

    aplicarConfiguracion();


    // ==========================================
    // ABRIR CONFIGURACIÓN
    // ==========================================

    if (openSettings && settingsModal) {

        openSettings.addEventListener("click", (e) => {

            e.preventDefault();

            cargarConfiguracionGuardada();

            actualizarControles();

            settingsModal.classList.add("active");

        });

    }


    // ==========================================
    // CERRAR CONFIGURACIÓN
    // ==========================================

    if (closeSettings && settingsModal) {

        closeSettings.addEventListener("click", () => {

            settingsModal.classList.remove("active");

        });

    }


    // ==========================================
    // CERRAR AL HACER CLICK AFUERA
    // ==========================================

    if (settingsModal) {

        settingsModal.addEventListener("click", (e) => {

            if (e.target === settingsModal) {

                settingsModal.classList.remove("active");

            }

        });

    }


    // ==========================================
    // TEMA
    // ==========================================

    if (themeToggle) {

        themeToggle.addEventListener("change", (e) => {

            temaGuardado =
                e.target.checked
                    ? "dark"
                    : "light";


            localStorage.setItem(
                "harvestx-tema",
                temaGuardado
            );


            aplicarConfiguracion();

        });

    }


    // ==========================================
    // FUENTE
    // ==========================================

    if (fontSelect) {

        fontSelect.addEventListener("change", (e) => {

            fuenteGuardada =
                e.target.value;


            localStorage.setItem(
                "harvestx-fuente",
                fuenteGuardada
            );


            aplicarConfiguracion();

        });

    }


    // ==========================================
    // TAMAÑO
    // ==========================================

    const botones = [
        btnSmall,
        btnNormal,
        btnLarge
    ];


    botones.forEach(btn => {

        if (!btn) return;


        btn.addEventListener("click", () => {

            if (btn.id === "btnSizeSmall") {

                escalaGuardada = "0.85rem";

            }

            else if (btn.id === "btnSizeNormal") {

                escalaGuardada = "1rem";

            }

            else if (btn.id === "btnSizeLarge") {

                escalaGuardada = "1.15rem";

            }


            localStorage.setItem(
                "harvestx-escala",
                escalaGuardada
            );


            aplicarConfiguracion();

        });

    });


    // ==========================================
    // SONIDO
    // ==========================================

    if (soundToggle) {

        soundToggle.addEventListener("change", (e) => {

            sonidoGuardado =
                e.target.checked
                    ? "on"
                    : "off";


            localStorage.setItem(
                "harvestx-sonido",
                sonidoGuardado
            );

        });

    }


    // ==========================================
    // SINCRONIZACIÓN ENTRE PESTAÑAS
    // ==========================================

    window.addEventListener("storage", (e) => {

        if (
            e.key === "harvestx-tema" ||
            e.key === "harvestx-fuente" ||
            e.key === "harvestx-escala" ||
            e.key === "harvestx-sonido"
        ) {

            aplicarConfiguracion();

        }

    });

});