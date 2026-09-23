// =========================================================
// HARVESTX — USUARIOS
// JavaScript del módulo
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("HarvestX | Módulo Usuarios cargado.");

    // =====================================================
    // ELEMENTOS DEL MÓDULO
    // =====================================================

    const editarInformacion = document.getElementById("editarInformacion");
    const cambiarContrasena = document.getElementById("cambiarContrasena");

    const preferenciaTema = document.getElementById("preferenciaTema");
    const preferenciaSonido = document.getElementById("preferenciaSonido");
    const preferenciaNotificaciones = document.getElementById("preferenciaNotificaciones");
    const preferenciaTexto = document.getElementById("preferenciaTexto");


    // =====================================================
    // EDITAR INFORMACIÓN
    // =====================================================

    if (editarInformacion) {

        editarInformacion.addEventListener("click", () => {

            // El perfil ya tiene un modal existente en el sistema.
            // Aprovechamos ese modal para no duplicar funciones.

            const profileModal = document.getElementById("profileModal");

            if (profileModal) {
                profileModal.classList.add("active");
            }

            // También intentamos usar el botón global
            // si administrador.js ya lo controla.
            const openProfile = document.getElementById("openProfile");

            if (openProfile) {
                openProfile.click();
            }

        });

    }


    // =====================================================
    // CAMBIAR CONTRASEÑA
    // =====================================================

    if (cambiarContrasena) {

        cambiarContrasena.addEventListener("click", () => {

            alert(
                "La función para cambiar la contraseña se conectará próximamente con tu cuenta de HarvestX."
            );

        });

    }


    // =====================================================
    // PREFERENCIA DE TEMA
    // =====================================================

    if (preferenciaTema) {

        preferenciaTema.addEventListener("change", () => {

            const tema = preferenciaTema.value;

            if (tema === "oscuro") {
                document.body.classList.add("dark-mode");
            }

            else if (tema === "claro") {
                document.body.classList.remove("dark-mode");
            }

            else if (tema === "sistema") {

                const prefersDark =
                    window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches;

                document.body.classList.toggle("dark-mode", prefersDark);
            }

        });

    }


    // =====================================================
    // PREFERENCIA DE SONIDO
    // =====================================================

    if (preferenciaSonido) {

        preferenciaSonido.addEventListener("change", () => {

            const sonidoActivado = preferenciaSonido.checked;

            localStorage.setItem(
                "harvestx_sonido",
                sonidoActivado ? "true" : "false"
            );

            console.log(
                "HarvestX | Sonido:",
                sonidoActivado ? "activado" : "desactivado"
            );

        });

    }


    // =====================================================
    // PREFERENCIA DE NOTIFICACIONES
    // =====================================================

    if (preferenciaNotificaciones) {

        preferenciaNotificaciones.addEventListener("change", () => {

            const notificacionesActivadas =
                preferenciaNotificaciones.checked;

            localStorage.setItem(
                "harvestx_notificaciones",
                notificacionesActivadas ? "true" : "false"
            );

            console.log(
                "HarvestX | Notificaciones:",
                notificacionesActivadas
                    ? "activadas"
                    : "desactivadas"
            );

        });

    }


    // =====================================================
    // PREFERENCIA DE TEXTO
    // =====================================================

    if (preferenciaTexto) {

        preferenciaTexto.addEventListener("change", () => {

            const tamañoTexto = preferenciaTexto.value;

            document.documentElement.dataset.textSize = tamañoTexto;

            localStorage.setItem(
                "harvestx_texto",
                tamañoTexto
            );

        });

    }


    // =====================================================
    // CARGAR PREFERENCIAS GUARDADAS
    // =====================================================

    cargarPreferencias();


    // =====================================================
    // FUNCIONES FUTURAS
    // =====================================================

    /*
        MÁS ADELANTE AQUÍ CONECTAREMOS:

        1. Datos reales del usuario
           ↓
           Flask + MySQL

        2. Nombre
        3. Usuario
        4. Rol
        5. Estado
        6. Fecha de creación

        7. Cambiar contraseña

        8. Preferencias guardadas en MySQL

        9. Cantidad de cultivos
        10. Cantidad de fincas
        11. Actividades
        12. Alertas

        No inventamos endpoints todavía porque primero
        necesitamos conectar este módulo con el backend real.
    */

});


// =========================================================
// CARGAR PREFERENCIAS
// =========================================================

function cargarPreferencias() {

    // -----------------------------
    // SONIDO
    // -----------------------------

    const sonido = localStorage.getItem("harvestx_sonido");

    const preferenciaSonido =
        document.getElementById("preferenciaSonido");

    if (preferenciaSonido && sonido !== null) {

        preferenciaSonido.checked =
            sonido === "true";

    }


    // -----------------------------
    // NOTIFICACIONES
    // -----------------------------

    const notificaciones =
        localStorage.getItem("harvestx_notificaciones");

    const preferenciaNotificaciones =
        document.getElementById("preferenciaNotificaciones");

    if (
        preferenciaNotificaciones &&
        notificaciones !== null
    ) {

        preferenciaNotificaciones.checked =
            notificaciones === "true";

    }


    // -----------------------------
    // TAMAÑO DEL TEXTO
    // -----------------------------

    const texto =
        localStorage.getItem("harvestx_texto");

    const preferenciaTexto =
        document.getElementById("preferenciaTexto");

    if (preferenciaTexto && texto) {

        preferenciaTexto.value = texto;

        document.documentElement.dataset.textSize =
            texto;

    }

}