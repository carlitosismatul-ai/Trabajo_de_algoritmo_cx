// =========================================================
// HARVESTX — USUARIOS
// JavaScript del módulo
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("HarvestX | Módulo Usuarios cargado.");

    // =========================================================
    // CONFIGURACIÓN DEL SERVIDOR
    // =========================================================

    const API_URL = "http://127.0.0.1:5000";


    // =========================================================
    // ELEMENTOS DEL MÓDULO
    // =========================================================

    const editarInformacion =
        document.getElementById("editarInformacion");

    const cambiarContrasena =
        document.getElementById("cambiarContrasena");

    const preferenciaTema =
        document.getElementById("preferenciaTema");

    const preferenciaSonido =
        document.getElementById("preferenciaSonido");

    const preferenciaNotificaciones =
        document.getElementById("preferenciaNotificaciones");

    const preferenciaTexto =
        document.getElementById("preferenciaTexto");


    // =========================================================
    // CARGAR INFORMACIÓN DEL USUARIO
    // =========================================================

    cargarInformacionUsuario();


    // =========================================================
    // EDITAR INFORMACIÓN
    // =========================================================

    if (editarInformacion) {

        editarInformacion.addEventListener("click", () => {

            const profileModal =
                document.getElementById("profileModal");

            if (profileModal) {
                profileModal.classList.add("active");
            }

            const openProfile =
                document.getElementById("openProfile");

            if (openProfile) {
                openProfile.click();
            }

        });

    }


    // =========================================================
    // CAMBIAR CONTRASEÑA
    // =========================================================

    if (cambiarContrasena) {

        cambiarContrasena.addEventListener("click", () => {

            alert(
                "La función para cambiar la contraseña se conectará próximamente con tu cuenta de HarvestX."
            );

        });

    }


    // =========================================================
    // PREFERENCIA DE TEMA
    // =========================================================

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
                    window.matchMedia(
                        "(prefers-color-scheme: dark)"
                    ).matches;

                document.body.classList.toggle(
                    "dark-mode",
                    prefersDark
                );

            }

        });

    }


    // =========================================================
    // PREFERENCIA DE SONIDO
    // =========================================================

    if (preferenciaSonido) {

        preferenciaSonido.addEventListener("change", () => {

            const sonidoActivado =
                preferenciaSonido.checked;

            localStorage.setItem(
                "harvestx_sonido",
                sonidoActivado ? "true" : "false"
            );

        });

    }


    // =========================================================
    // PREFERENCIA DE NOTIFICACIONES
    // =========================================================

    if (preferenciaNotificaciones) {

        preferenciaNotificaciones.addEventListener(
            "change",
            () => {

                const notificacionesActivadas =
                    preferenciaNotificaciones.checked;

                localStorage.setItem(
                    "harvestx_notificaciones",
                    notificacionesActivadas
                        ? "true"
                        : "false"
                );

            }
        );

    }


    // =========================================================
    // PREFERENCIA DE TEXTO
    // =========================================================

    if (preferenciaTexto) {

        preferenciaTexto.addEventListener("change", () => {

            const tamañoTexto =
                preferenciaTexto.value;

            document.documentElement.dataset.textSize =
                tamañoTexto;

            localStorage.setItem(
                "harvestx_texto",
                tamañoTexto
            );

        });

    }


    // =========================================================
    // CARGAR PREFERENCIAS
    // =========================================================

    cargarPreferencias();

});


// =========================================================
// OBTENER USUARIO ACTUAL
// =========================================================

function obtenerUsuarioActual() {

    const usuarioGuardado =
        localStorage.getItem("usuarioHarvestX");

    if (!usuarioGuardado) {

        console.warn(
            "HarvestX | No existe usuarioHarvestX en localStorage."
        );

        return null;

    }

    try {

        const usuario =
            JSON.parse(usuarioGuardado);

        return usuario;

    }

    catch (error) {

        console.error(
            "HarvestX | Error al leer usuarioHarvestX:",
            error
        );

        return null;

    }

}


// =========================================================
// CARGAR INFORMACIÓN DESDE MYSQL
// =========================================================

async function cargarInformacionUsuario() {

    const usuarioLocal =
        obtenerUsuarioActual();

    if (!usuarioLocal) {

        console.warn(
            "HarvestX | No se pudo identificar al usuario actual."
        );

        return;

    }

    if (!usuarioLocal.id) {

        console.warn(
            "HarvestX | El usuario guardado no tiene ID."
        );

        return;

    }

    try {

        const respuesta = await fetch(
            `http://127.0.0.1:5000/usuarios/${usuarioLocal.id}`
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.exito) {

            console.error(
                "HarvestX | No se pudo obtener la información del usuario:",
                datos
            );

            return;

        }

        const usuario =
            datos.usuario;

        console.log(
            "HarvestX | Usuario obtenido desde MySQL:",
            usuario
        );


        // =====================================================
        // ACTUALIZAR INFORMACIÓN PRINCIPAL
        // =====================================================

        const cuentaNombre =
            document.getElementById("cuentaNombre");

        const cuentaUsuario =
            document.getElementById("cuentaUsuario");

        const cuentaRol =
            document.getElementById("cuentaRol");

        const estadoCuenta =
            document.getElementById("estadoCuenta");

        const fechaCreacion =
            document.getElementById("fechaCreacion");

        const tipoCuenta =
            document.getElementById("tipoCuenta");


        if (cuentaNombre) {

            cuentaNombre.textContent =
                usuario.nombre || "Sin nombre";

        }


        if (cuentaUsuario) {

            cuentaUsuario.textContent =
                usuario.usuario || "Sin usuario";

        }


        if (cuentaRol) {

            cuentaRol.textContent =
                usuario.rol || "Sin rol";

        }


        if (estadoCuenta) {

            estadoCuenta.textContent =
                usuario.estado || "Sin estado";

        }


        if (fechaCreacion) {

            if (usuario.fecha_creacion) {

                const fecha =
                    new Date(usuario.fecha_creacion);

                fechaCreacion.textContent =
                    fecha.toLocaleDateString(
                        "es-GT",
                        {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        }
                    );

            }

            else {

                fechaCreacion.textContent =
                    "Sin información";

            }

        }


        if (tipoCuenta) {

            tipoCuenta.textContent =
                usuario.rol === "administrador"
                    ? "Administrador"
                    : "Usuario";

        }


        // =====================================================
        // ACTUALIZAR INFORMACIÓN DEL TOPBAR
        // =====================================================

        const nombreUsuario =
            document.getElementById("nombreUsuario");

        const rolUsuario =
            document.getElementById("rolUsuario");

        const avatarImagen =
            document.getElementById("avatarImagen");


        if (nombreUsuario) {

            nombreUsuario.textContent =
                usuario.nombre || "Usuario";

        }


        if (rolUsuario) {

            rolUsuario.textContent =
                usuario.rol || "usuario";

        }


        if (
            avatarImagen &&
            usuario.foto
        ) {

            let rutaFoto =
                usuario.foto;

            if (!rutaFoto.startsWith("/")) {

                rutaFoto =
                    "/" + rutaFoto;

            }

            avatarImagen.src =
                `http://127.0.0.1:5000${rutaFoto}`;

        }


        // =====================================================
        // ACTUALIZAR LOCALSTORAGE
        // =====================================================

        localStorage.setItem(
            "usuarioHarvestX",
            JSON.stringify(usuario)
        );


    }

    catch (error) {

        console.error(
            "HarvestX | Error al conectar con Flask:",
            error
        );

    }

}


// =========================================================
// CARGAR PREFERENCIAS
// =========================================================

function cargarPreferencias() {

    const sonido =
        localStorage.getItem("harvestx_sonido");

    const preferenciaSonido =
        document.getElementById("preferenciaSonido");

    if (
        preferenciaSonido &&
        sonido !== null
    ) {

        preferenciaSonido.checked =
            sonido === "true";

    }


    const notificaciones =
        localStorage.getItem(
            "harvestx_notificaciones"
        );

    const preferenciaNotificaciones =
        document.getElementById(
            "preferenciaNotificaciones"
        );

    if (
        preferenciaNotificaciones &&
        notificaciones !== null
    ) {

        preferenciaNotificaciones.checked =
            notificaciones === "true";

    }


    const texto =
        localStorage.getItem("harvestx_texto");

    const preferenciaTexto =
        document.getElementById("preferenciaTexto");

    if (
        preferenciaTexto &&
        texto
    ) {

        preferenciaTexto.value =
            texto;

        document.documentElement.dataset.textSize =
            texto;

    }

}