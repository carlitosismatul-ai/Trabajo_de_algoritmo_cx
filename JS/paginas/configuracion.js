/* ==========================================================
   HARVESTX — CONFIGURACIÓN GLOBAL
   Archivo: JS/paginas/configuracion.js

   Funciones:
   - Tema claro y oscuro.
   - Selección de fuente.
   - Tamaño del texto.
   - Preferencia de sonido.
   - Persistencia de preferencias.
   - Compatibilidad con las claves antiguas.
   - Sincronización entre pestañas.
   - Modal de configuración.
   ========================================================== */

(() => {
    "use strict";

    const CONFIG = {
        tema: "temaHarvestX",
        fuente: "fuenteHarvestX",
        escala: "escalaHarvestX",
        sonido: "sonidoHarvestX"
    };

    const CLAVES_ANTIGUAS = {
        tema: "harvestx-tema",
        fuente: "harvestx-fuente",
        escala: "harvestx-escala",
        sonido: "harvestx-sonido"
    };

    const VALORES_PREDETERMINADOS = {
        tema: "light",
        fuente: "'Poppins', sans-serif",
        escala: "1rem",
        sonido: "off"
    };

    let elementos = {};

    /* ======================================================
       OBTENER VALORES GUARDADOS
       ====================================================== */

    function obtenerPreferencia(tipo) {
        const claveActual = CONFIG[tipo];
        const claveAntigua = CLAVES_ANTIGUAS[tipo];

        const valorActual = localStorage.getItem(claveActual);

        if (valorActual !== null) {
            return valorActual;
        }

        const valorAntiguo = localStorage.getItem(claveAntigua);

        if (valorAntiguo !== null) {
            return valorAntiguo;
        }

        return VALORES_PREDETERMINADOS[tipo];
    }

    /* ======================================================
       GUARDAR PREFERENCIAS
       ====================================================== */

    function guardarPreferencia(tipo, valor) {
        const claveActual = CONFIG[tipo];
        const claveAntigua = CLAVES_ANTIGUAS[tipo];

        try {
            localStorage.setItem(claveActual, valor);
            localStorage.setItem(claveAntigua, valor);
        } catch (error) {
            console.error(
                `HarvestX: no se pudo guardar la preferencia "${tipo}".`,
                error
            );
        }
    }

    /* ======================================================
       APLICAR TEMA
       ====================================================== */

    function aplicarTema(tema) {
        const temaValido = tema === "dark" ? "dark" : "light";

        document.documentElement.setAttribute(
            "data-theme",
            temaValido
        );

        document.body?.classList.toggle(
            "dark-mode",
            temaValido === "dark"
        );

        if (elementos.themeToggle) {
            elementos.themeToggle.checked = temaValido === "dark";
        }

        return temaValido;
    }

    /* ======================================================
       APLICAR FUENTE
       ====================================================== */

    function aplicarFuente(fuente) {
        const fuenteValida =
            typeof fuente === "string" && fuente.trim() !== ""
                ? fuente
                : VALORES_PREDETERMINADOS.fuente;

        document.documentElement.style.setProperty(
            "--fuente-actual",
            fuenteValida
        );

        document.body.style.fontFamily = fuenteValida;

        if (elementos.fontSelect) {
            elementos.fontSelect.value = fuenteValida;
        }

        return fuenteValida;
    }

    /* ======================================================
       APLICAR TAMAÑO DEL TEXTO
       ====================================================== */

    function aplicarEscala(escala) {
        const escalasPermitidas = [
            "0.85rem",
            "1rem",
            "1.15rem"
        ];

        const escalaValida = escalasPermitidas.includes(escala)
            ? escala
            : VALORES_PREDETERMINADOS.escala;

        document.documentElement.style.setProperty(
            "--escala-texto",
            escalaValida
        );

        document.documentElement.style.setProperty(
            "--font-size-base",
            escalaValida
        );

        actualizarBotonesEscala(escalaValida);

        return escalaValida;
    }

    function actualizarBotonesEscala(escala) {
        const botones = [
            {
                elemento: elementos.btnSizeSmall,
                valor: "0.85rem"
            },
            {
                elemento: elementos.btnSizeNormal,
                valor: "1rem"
            },
            {
                elemento: elementos.btnSizeLarge,
                valor: "1.15rem"
            }
        ];

        botones.forEach(({ elemento, valor }) => {
            if (!elemento) return;

            const seleccionado = valor === escala;

            elemento.classList.toggle("active", seleccionado);
            elemento.setAttribute(
                "aria-pressed",
                String(seleccionado)
            );
        });
    }

    /* ======================================================
       APLICAR SONIDO
       ====================================================== */

    function aplicarSonido(sonido) {
        const sonidoValido = sonido === "on" ? "on" : "off";

        if (elementos.soundToggle) {
            elementos.soundToggle.checked = sonidoValido === "on";
        }

        return sonidoValido;
    }

    /* ======================================================
       APLICAR TODAS LAS PREFERENCIAS
       ====================================================== */

    function aplicarTodasLasPreferencias() {
        const tema = obtenerPreferencia("tema");
        const fuente = obtenerPreferencia("fuente");
        const escala = obtenerPreferencia("escala");
        const sonido = obtenerPreferencia("sonido");

        aplicarTema(tema);
        aplicarFuente(fuente);
        aplicarEscala(escala);
        aplicarSonido(sonido);

        return {
            tema,
            fuente,
            escala,
            sonido
        };
    }

    /* ======================================================
       MODAL DE CONFIGURACIÓN
       ====================================================== */

    function abrirConfiguracion() {
        if (!elementos.settingsModal) return;

        elementos.settingsModal.classList.add("active");
        elementos.settingsModal.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarConfiguracion() {
        if (!elementos.settingsModal) return;

        elementos.settingsModal.classList.remove("active");
        elementos.settingsModal.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    /* ======================================================
       REGISTRAR EVENTOS
       ====================================================== */

    function registrarEventos() {
        /* Abrir configuración */

        elementos.openSettings?.addEventListener(
            "click",
            (evento) => {
                evento.preventDefault();
                abrirConfiguracion();
            }
        );

        /* Cerrar configuración */

        elementos.closeSettings?.addEventListener(
            "click",
            cerrarConfiguracion
        );

        /* Cerrar al hacer clic fuera del contenido */

        elementos.settingsModal?.addEventListener(
            "click",
            (evento) => {
                if (evento.target === elementos.settingsModal) {
                    cerrarConfiguracion();
                }
            }
        );

        /* Cambiar tema */

        elementos.themeToggle?.addEventListener(
            "change",
            () => {
                const tema = elementos.themeToggle.checked
                    ? "dark"
                    : "light";

                guardarPreferencia("tema", tema);
                aplicarTema(tema);
            }
        );

        /* Cambiar fuente */

        elementos.fontSelect?.addEventListener(
            "change",
            () => {
                const fuente = elementos.fontSelect.value;

                guardarPreferencia("fuente", fuente);
                aplicarFuente(fuente);
            }
        );

        /* Cambiar tamaño del texto */

        elementos.btnSizeSmall?.addEventListener(
            "click",
            () => cambiarEscala("0.85rem")
        );

        elementos.btnSizeNormal?.addEventListener(
            "click",
            () => cambiarEscala("1rem")
        );

        elementos.btnSizeLarge?.addEventListener(
            "click",
            () => cambiarEscala("1.15rem")
        );

        /* Activar o desactivar sonido */

        elementos.soundToggle?.addEventListener(
            "change",
            () => {
                const sonido = elementos.soundToggle.checked
                    ? "on"
                    : "off";

                guardarPreferencia("sonido", sonido);
                aplicarSonido(sonido);
            }
        );

        /* Sincronizar preferencias entre pestañas */

        window.addEventListener("storage", (evento) => {
            if (!evento.key) return;

            const clavesTema = [
                CONFIG.tema,
                CLAVES_ANTIGUAS.tema
            ];

            const clavesFuente = [
                CONFIG.fuente,
                CLAVES_ANTIGUAS.fuente
            ];

            const clavesEscala = [
                CONFIG.escala,
                CLAVES_ANTIGUAS.escala
            ];

            const clavesSonido = [
                CONFIG.sonido,
                CLAVES_ANTIGUAS.sonido
            ];

            if (clavesTema.includes(evento.key)) {
                aplicarTema(
                    evento.newValue ??
                    VALORES_PREDETERMINADOS.tema
                );
            }

            if (clavesFuente.includes(evento.key)) {
                aplicarFuente(
                    evento.newValue ??
                    VALORES_PREDETERMINADOS.fuente
                );
            }

            if (clavesEscala.includes(evento.key)) {
                aplicarEscala(
                    evento.newValue ??
                    VALORES_PREDETERMINADOS.escala
                );
            }

            if (clavesSonido.includes(evento.key)) {
                aplicarSonido(
                    evento.newValue ??
                    VALORES_PREDETERMINADOS.sonido
                );
            }
        });
    }

    function cambiarEscala(escala) {
        guardarPreferencia("escala", escala);
        aplicarEscala(escala);
    }

    /* ======================================================
       INICIALIZACIÓN
       ====================================================== */

    function iniciarConfiguracion() {
        elementos = {
            openSettings: document.getElementById("openSettings"),
            settingsModal: document.getElementById("settingsModal"),
            closeSettings: document.getElementById("closeSettings"),
            themeToggle: document.getElementById("themeToggle"),
            fontSelect: document.getElementById("fontSelect"),
            soundToggle: document.getElementById("soundToggle"),
            btnSizeSmall: document.getElementById("btnSizeSmall"),
            btnSizeNormal: document.getElementById("btnSizeNormal"),
            btnSizeLarge: document.getElementById("btnSizeLarge")
        };

        aplicarTodasLasPreferencias();
        registrarEventos();

        /* API compartida para otros módulos de HarvestX */

        window.HarvestXConfig = {
            obtenerPreferencia,
            guardarPreferencia,
            aplicarTema,
            aplicarFuente,
            aplicarEscala,
            aplicarSonido,
            aplicarTodasLasPreferencias,
            abrirConfiguracion,
            cerrarConfiguracion
        };

        console.log(
            "HarvestX: configuración global inicializada correctamente."
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarConfiguracion,
            { once: true }
        );
    } else {
        iniciarConfiguracion();
    }
})();