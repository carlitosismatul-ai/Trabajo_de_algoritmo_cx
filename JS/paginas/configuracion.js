document.addEventListener("DOMContentLoaded", () => {

    const root = document.documentElement;

    // ==========================================
    // CONFIGURACIÓN GUARDADA
    // ==========================================

    const temaGuardado =
        localStorage.getItem("harvestx-tema") || "light";

   const fuenteGuardada =
    localStorage.getItem("harvestx-fuente") ||
    "Poppins";

    const escalaGuardada =
        localStorage.getItem("harvestx-escala") ||
        "1rem";

    const sonidoGuardado =
        localStorage.getItem("harvestx-sonido") || "off";


    // ==========================================
    // APLICAR TEMA
    // ==========================================

    if (temaGuardado === "dark") {
        root.setAttribute("data-theme", "dark");
    } else {
        root.removeAttribute("data-theme");
    }


    // ==========================================
    // APLICAR FUENTE
    // ==========================================

    root.style.setProperty(
        "--fuente-actual",
        fuenteGuardada
    );


    // ==========================================
    // APLICAR TAMAÑO DE TEXTO
    // ==========================================

    root.style.setProperty(
        "--escala-texto",
        escalaGuardada
    );


    // ==========================================
    // CONTROLES DEL MODAL
    // ==========================================

    const themeToggle =
        document.getElementById("themeToggle");

    const fontSelect =
        document.getElementById("fontSelect");

    const soundToggle =
        document.getElementById("soundToggle");

    const btnSmall =
        document.getElementById("btnSizeSmall");

    const btnNormal =
        document.getElementById("btnSizeNormal");

    const btnLarge =
        document.getElementById("btnSizeLarge");


    // ==========================================
    // TEMA
    // ==========================================

    if (themeToggle) {

        themeToggle.checked =
            temaGuardado === "dark";

        themeToggle.addEventListener("change", (e) => {

            if (e.target.checked) {

                root.setAttribute(
                    "data-theme",
                    "dark"
                );

                localStorage.setItem(
                    "harvestx-tema",
                    "dark"
                );

            } else {

                root.removeAttribute(
                    "data-theme"
                );

                localStorage.setItem(
                    "harvestx-tema",
                    "light"
                );

            }

        });

    }


    // ==========================================
    // FUENTE
    // ==========================================

    if (fontSelect) {

        fontSelect.value = fuenteGuardada;

        fontSelect.addEventListener("change", (e) => {

            const nuevaFuente =
                e.target.value;

            root.style.setProperty(
                "--fuente-actual",
                nuevaFuente
            );

            localStorage.setItem(
                "harvestx-fuente",
                nuevaFuente
            );

        });

    }


    // ==========================================
    // TAMAÑO DE TEXTO
    // ==========================================

    const botones = [
        btnSmall,
        btnNormal,
        btnLarge
    ];


    function actualizarBotonActivo() {

        botones.forEach(btn => {

            if (btn) {
                btn.classList.remove("active");
            }

        });


        if (
            escalaGuardada === "0.85rem" &&
            btnSmall
        ) {

            btnSmall.classList.add("active");

        }

        else if (
            escalaGuardada === "1.15rem" &&
            btnLarge
        ) {

            btnLarge.classList.add("active");

        }

        else if (btnNormal) {

            btnNormal.classList.add("active");

        }

    }


    actualizarBotonActivo();


    botones.forEach(btn => {

        if (!btn) return;

        btn.addEventListener("click", () => {

            botones.forEach(b => {

                if (b) {
                    b.classList.remove("active");
                }

            });

            btn.classList.add("active");


            let escala = "1rem";


            if (btn.id === "btnSizeSmall") {
                escala = "0.85rem";
            }

            else if (btn.id === "btnSizeNormal") {
                escala = "1rem";
            }

            else if (btn.id === "btnSizeLarge") {
                escala = "1.15rem";
            }


            root.style.setProperty(
                "--escala-texto",
                escala
            );


            localStorage.setItem(
                "harvestx-escala",
                escala
            );

        });

    });


    // ==========================================
    // SONIDO
    // ==========================================

    if (soundToggle) {

        soundToggle.checked =
            sonidoGuardado === "on";

        soundToggle.addEventListener("change", (e) => {

            const estado =
                e.target.checked ? "on" : "off";

            localStorage.setItem(
                "harvestx-sonido",
                estado
            );

        });

    }

// ==========================================
// ABRIR / CERRAR CONFIGURACIÓN
// ==========================================

const openSettings =
    document.getElementById("openSettings");

const settingsModal =
    document.getElementById("settingsModal");

const closeSettings =
    document.getElementById("closeSettings");


if (openSettings && settingsModal) {

    openSettings.addEventListener("click", (e) => {

        e.preventDefault();

        settingsModal.classList.add("active");

    });

}


if (closeSettings && settingsModal) {

    closeSettings.addEventListener("click", () => {

        settingsModal.classList.remove("active");

    });

}


// Cerrar haciendo clic fuera del modal

if (settingsModal) {

    settingsModal.addEventListener("click", (e) => {

        if (e.target === settingsModal) {

            settingsModal.classList.remove("active");

        }

    });

}

});