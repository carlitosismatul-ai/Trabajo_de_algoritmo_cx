// =========================================================
// HARVESTX — USUARIOS / MI CUENTA
// Integración con Flask + MySQL
// =========================================================

(() => {
"use strict";


const API_URL = "http://127.0.0.1:5000";

// Preferencias compartidas con configuracion.js
const CLAVES = {
    tema: "temaHarvestX",
    fuente: "fuenteHarvestX",
    escala: "escalaHarvestX",
    sonido: "sonidoHarvestX",
    notificaciones: "notificacionesHarvestX"
};

let usuarioActual = null;

document.addEventListener("DOMContentLoaded", iniciarModulo);

// =====================================================
// INICIALIZACIÓN
// =====================================================

function iniciarModulo() {
    console.log("HarvestX | Módulo Mi Cuenta iniciado.");

    usuarioActual = obtenerUsuarioLocal();

    configurarBotones();
    configurarPreferencias();
    cargarPreferencias();
    cargarInformacionUsuario();
    cargarEstadisticas();

    window.addEventListener("storage", evento => {
        if (Object.values(CLAVES).includes(evento.key)) {
            cargarPreferencias();
        }
    });
}

// =====================================================
// SESIÓN DEL USUARIO
// =====================================================

function obtenerUsuarioLocal() {
    const posiblesClaves = [
        "usuarioHarvestX",
        "usuario",
        "usuarioActual"
    ];

    for (const clave of posiblesClaves) {
        const valor = localStorage.getItem(clave);

        if (!valor) continue;

        try {
            const usuario = JSON.parse(valor);

            if (usuario && typeof usuario === "object") {
                return usuario;
            }
        } catch (error) {
            console.warn(
                `HarvestX | No se pudo leer ${clave} del almacenamiento.`,
                error
            );
        }
    }

    return null;
}

function obtenerIdUsuario() {
    const id = Number(
        usuarioActual?.id ??
        usuarioActual?.usuario_id ??
        usuarioActual?.id_usuario
    );

    return Number.isInteger(id) && id > 0 ? id : null;
}

// =====================================================
// DATOS REALES DE LA CUENTA
// =====================================================

async function cargarInformacionUsuario() {
    const idUsuario = obtenerIdUsuario();

    if (!idUsuario) {
        console.warn(
            "HarvestX | No se encontró el ID del usuario en la sesión."
        );
        return;
    }

    try {
        const respuesta = await fetch(
            `${API_URL}/usuarios/${idUsuario}`
        );

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP ${respuesta.status} al cargar la cuenta.`
            );
        }

        const datos = await respuesta.json();

        if (datos.exito === false || !datos.usuario) {
            throw new Error(
                datos.mensaje || "No se encontró la información del usuario."
            );
        }

        usuarioActual = {
            ...usuarioActual,
            ...datos.usuario
        };

        guardarUsuarioLocal(usuarioActual);
        mostrarInformacionUsuario(usuarioActual);

    } catch (error) {
        console.error(
            "HarvestX | Error al cargar los datos de la cuenta:",
            error
        );
    }
}

function guardarUsuarioLocal(usuario) {
    try {
        localStorage.setItem(
            "usuarioHarvestX",
            JSON.stringify(usuario)
        );
    } catch (error) {
        console.warn(
            "HarvestX | No se pudo actualizar la sesión local.",
            error
        );
    }
}

function mostrarInformacionUsuario(usuario) {
    const nombre = usuario.nombre || usuario.usuario || "Usuario";
    const nombreUsuario = usuario.usuario || "Sin usuario";
    const rol = usuario.rol || "Usuario";
    const estado = usuario.estado || "Sin estado";

    establecerTexto("cuentaNombre", nombre);
    establecerTexto("cuentaUsuario", nombreUsuario);
    establecerTexto("cuentaRol", rol);
    establecerTexto("estadoCuenta", estado);
    establecerTexto(
        "fechaCreacion",
        formatearFecha(usuario.fecha_creacion)
    );

    establecerTexto(
        "tipoCuenta",
        formatearTexto(rol)
    );

    // Información de la barra superior.
    establecerTexto("nombreUsuario", nombre);
    establecerTexto("rolUsuario", formatearTexto(rol));

    // Actualizar imagen del perfil sin eliminar el avatar existente.
    const avatar = document.getElementById("avatarImagen");

    if (avatar && usuario.foto) {
        const ruta = obtenerRutaFoto(usuario.foto);

        if (ruta) {
            avatar.onerror = () => {
                avatar.style.display = "none";
            };

            avatar.onload = () => {
                avatar.style.display = "";
            };

            avatar.src = ruta;
        }
    }

    // Otros posibles elementos que muestran el nombre.
    establecerTexto("profileNombre", nombre);
}

function establecerTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento && valor !== undefined && valor !== null) {
        elemento.textContent = String(valor);
    }
}

function formatearFecha(fecha) {
    if (!fecha) return "No disponible";

    const fechaValida = new Date(fecha);

    if (Number.isNaN(fechaValida.getTime())) {
        return String(fecha);
    }

    return fechaValida.toLocaleDateString("es-GT", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatearTexto(texto) {
    if (!texto) return "Usuario";

    return String(texto)
        .replaceAll("_", " ")
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

// =====================================================
// RUTA DE LA FOTO DE PERFIL
// =====================================================

function obtenerRutaFoto(foto) {
    if (!foto) return null;

    const ruta = String(foto).trim();

    if (/^https?:\/\//i.test(ruta)) {
        return ruta;
    }

    const rutaNormalizada = ruta.replace(/\\/g, "/");

    if (rutaNormalizada.startsWith("/")) {
        return `${API_URL}${rutaNormalizada}`;
    }

    if (/^(IMG|Perfiles)\//i.test(rutaNormalizada)) {
        return `${API_URL}/${rutaNormalizada
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`;
    }

    return `${API_URL}/IMG/${encodeURIComponent(rutaNormalizada)}`;
}

// =====================================================
// ESTADÍSTICAS DE LA CUENTA
// =====================================================

async function cargarEstadisticas() {
    const idUsuario = obtenerIdUsuario();

    if (!idUsuario) return;

    await Promise.allSettled([
        cargarCantidadCultivos(idUsuario),
        cargarEstadisticasFincas(idUsuario),
        cargarCantidadAlertas()
    ]);
}

async function cargarCantidadCultivos(idUsuario) {
    try {
        const respuesta = await fetch(
            `${API_URL}/cultivos?usuario_id=${encodeURIComponent(idUsuario)}`
        );

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}.`);
        }

        const datos = await respuesta.json();

        // El endpoint actual devuelve un arreglo de cultivos.
        if (Array.isArray(datos)) {
            establecerTexto("misCultivos", datos.length);
        } else if (Array.isArray(datos.cultivos)) {
            establecerTexto("misCultivos", datos.cultivos.length);
        } else {
            console.warn(
                "HarvestX | La respuesta de cultivos tiene un formato inesperado."
            );
        }
    } catch (error) {
        console.error(
            "HarvestX | No se pudieron cargar los cultivos:",
            error
        );
    }
}

async function cargarEstadisticasFincas(idUsuario) {
    try {
        const respuesta = await fetch(
            `${API_URL}/fincas/estadisticas?usuario_id=${encodeURIComponent(idUsuario)}`
        );

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}.`);
        }

        const datos = await respuesta.json();

        if (datos.exito === false) {
            throw new Error(
                datos.mensaje || "No se pudieron cargar las estadísticas."
            );
        }

        const estadisticas = datos.estadisticas || {};

        if (estadisticas.total_fincas !== undefined) {
            establecerTexto(
                "misFincas",
                estadisticas.total_fincas
            );
        }
    } catch (error) {
        console.error(
            "HarvestX | No se pudieron cargar las fincas:",
            error
        );
    }
}

async function cargarCantidadAlertas() {
    try {
        const respuesta = await fetch(`${API_URL}/api/alertas`);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}.`);
        }

        const datos = await respuesta.json();
        const alertas = Array.isArray(datos.alertas)
            ? datos.alertas
            : [];

        // El endpoint de alertas es global, no por usuario.
        // Solo mostramos las activas si el servidor devuelve su estado.
        const activas = alertas.filter(alerta => {
            const estado = String(alerta.estado || "")
                .trim()
                .toLowerCase();

            return estado !== "resuelta" &&
                   estado !== "resuelto" &&
                   estado !== "resuelta";
        });

        establecerTexto("misAlertas", activas.length);
    } catch (error) {
        console.error(
            "HarvestX | No se pudieron cargar las alertas:",
            error
        );
    }
}

// =====================================================
// BOTONES DEL MÓDULO
// =====================================================

function configurarBotones() {
    const editarInformacion =
        document.getElementById("editarInformacion");

    const cambiarContrasena =
        document.getElementById("cambiarContrasena");

    if (editarInformacion) {
        editarInformacion.addEventListener("click", () => {
            const openProfile = document.getElementById("openProfile");

            // administrador.js ya controla el modal del perfil.
            if (openProfile) {
                openProfile.click();
                return;
            }

            const profileModal =
                document.getElementById("profileModal");

            if (profileModal) {
                profileModal.classList.add("active");
                profileModal.setAttribute("aria-hidden", "false");
            }
        });
    }

    if (cambiarContrasena) {
        cambiarContrasena.addEventListener("click", () => {
            alert(
                "La pantalla de cambio de contraseña todavía necesita conectarse con el endpoint correspondiente de Flask."
            );
        });
    }
}

// =====================================================
// PREFERENCIAS
// =====================================================

function configurarPreferencias() {
const preferenciaTema =
document.getElementById("preferenciaTema");


const preferenciaSonido =
    document.getElementById("preferenciaSonido");

const preferenciaNotificaciones =
    document.getElementById("preferenciaNotificaciones");

const preferenciaTexto =
    document.getElementById("preferenciaTexto");

// ==========================================
// TEMA: CLARO / OSCURO
// ==========================================

if (preferenciaTema) {
    preferenciaTema.addEventListener("click", () => {
        const temaActual =
            localStorage.getItem(CLAVES.tema) ||
            localStorage.getItem("harvestx-tema") ||
            "light";

        const temaNuevo =
            temaActual === "dark" || temaActual === "oscuro"
                ? "light"
                : "dark";

        if (window.HarvestXConfig) {
            window.HarvestXConfig.guardarPreferencia(
                "tema",
                temaNuevo
            );

            window.HarvestXConfig.aplicarTema(temaNuevo);
        } else {
            localStorage.setItem(CLAVES.tema, temaNuevo);

            document.documentElement.setAttribute(
                "data-theme",
                temaNuevo
            );

            document.body.classList.toggle(
                "dark-mode",
                temaNuevo === "dark"
            );
        }

        actualizarBotonTema(temaNuevo);
    });
}

// ==========================================
// SONIDO
// ==========================================

if (preferenciaSonido) {
    preferenciaSonido.addEventListener("change", () => {
        const sonido = preferenciaSonido.checked ? "on" : "off";

        if (window.HarvestXConfig) {
            window.HarvestXConfig.guardarPreferencia(
                "sonido",
                sonido
            );

            window.HarvestXConfig.aplicarSonido(sonido);
        } else {
            localStorage.setItem(CLAVES.sonido, sonido);
        }
    });
}

// ==========================================
// NOTIFICACIONES
// ==========================================

if (preferenciaNotificaciones) {
    preferenciaNotificaciones.addEventListener("change", () => {
        localStorage.setItem(
            CLAVES.notificaciones,
            String(preferenciaNotificaciones.checked)
        );
    });
}

// ==========================================
// TAMAÑO DEL TEXTO
// PEQUEÑO / NORMAL / GRANDE
// ==========================================

if (preferenciaTexto) {
    preferenciaTexto.addEventListener("click", () => {
        const escalaActual =
            localStorage.getItem(CLAVES.escala) ||
            localStorage.getItem("harvestx-escala") ||
            "1rem";

        const ordenEscalas = [
            "1rem",
            "1.15rem",
            "0.85rem"
        ];

        const indiceActual =
            ordenEscalas.indexOf(escalaActual);

        const escalaNueva =
            ordenEscalas[
                (indiceActual + 1) % ordenEscalas.length
            ];

        if (window.HarvestXConfig) {
            window.HarvestXConfig.guardarPreferencia(
                "escala",
                escalaNueva
            );

            window.HarvestXConfig.aplicarEscala(escalaNueva);
        } else {
            localStorage.setItem(
                CLAVES.escala,
                escalaNueva
            );

            document.documentElement.style.setProperty(
                "--escala-texto",
                escalaNueva
            );

            document.documentElement.style.setProperty(
                "--font-size-base",
                escalaNueva
            );
        }

        actualizarBotonTexto(escalaNueva);
    });
}

// Mostrar las preferencias actuales al iniciar.
actualizarBotonTema(
    localStorage.getItem(CLAVES.tema) ||
    localStorage.getItem("harvestx-tema") ||
    "light"
);

actualizarBotonTexto(
    localStorage.getItem(CLAVES.escala) ||
    localStorage.getItem("harvestx-escala") ||
    "1rem"
);


}

// ==========================================
// TEXTO DEL BOTÓN DEL TEMA
// ==========================================

function actualizarBotonTema(tema) {
const boton = document.getElementById("preferenciaTema");


if (!boton) return;

const texto = boton.querySelector("span");

if (texto) {
    texto.textContent =
        tema === "dark" || tema === "oscuro"
            ? "Oscuro"
            : "Claro";
}

const icono = boton.querySelector("i");

if (icono) {
    icono.className =
        tema === "dark" || tema === "oscuro"
            ? "fa-solid fa-moon"
            : "fa-solid fa-sun";
}


}

// ==========================================
// TEXTO DEL BOTÓN DEL TAMAÑO
// ==========================================

function actualizarBotonTexto(escala) {
const boton = document.getElementById("preferenciaTexto");


if (!boton) return;

const texto = boton.querySelector("span");

if (!texto) return;

const nombres = {
    "0.85rem": "Pequeño",
    "1rem": "Normal",
    "1.15rem": "Grande"
};

texto.textContent = nombres[escala] || "Normal";


}


function guardarPreferencia(clave, valor) {
    localStorage.setItem(clave, valor);
}

function cargarPreferencias() {
    const tema = localStorage.getItem(CLAVES.tema) || "light";
    const sonido = localStorage.getItem(CLAVES.sonido) || "off";
    const notificaciones =
        localStorage.getItem(CLAVES.notificaciones) || "true";
    const escala = localStorage.getItem(CLAVES.escala) || "1rem";

    aplicarTema(tema);
    aplicarEscala(escala);

    const preferenciaSonido =
        document.getElementById("preferenciaSonido");

    if (preferenciaSonido) {
        preferenciaSonido.checked =
            sonido === "on" || sonido === "true";
    }

    const preferenciaNotificaciones =
        document.getElementById("preferenciaNotificaciones");

    if (preferenciaNotificaciones) {
        preferenciaNotificaciones.checked =
            notificaciones === "true";
    }

    const preferenciaTexto =
        document.getElementById("preferenciaTexto");

    if (preferenciaTexto &&
        preferenciaTexto.tagName.toLowerCase() === "select") {
        preferenciaTexto.value = escala;
    }
}

function aplicarTema(tema) {
    const esOscuro = tema === "dark" || tema === "oscuro";

    document.documentElement.setAttribute(
        "data-theme",
        esOscuro ? "dark" : "light"
    );

    document.body.classList.toggle("dark-mode", esOscuro);
}

function aplicarEscala(escala) {
    const escalasPermitidas = {
        pequena: "0.85rem",
        pequena_alt: "0.85rem",
        normal: "1rem",
        grande: "1.15rem",
        "0.85rem": "0.85rem",
        "1rem": "1rem",
        "1.15rem": "1.15rem"
    };

    const escalaValida =
        escalasPermitidas[escala] || "1rem";

    document.documentElement.style.setProperty(
        "--escala-texto",
        escalaValida
    );

    document.documentElement.style.setProperty(
        "--font-size-base",
        escalaValida
    );

    document.documentElement.dataset.textSize = escalaValida;
}

function siguienteEscala(escalaActual) {
    const orden = ["0.85rem", "1rem", "1.15rem"];
    const indice = orden.indexOf(escalaActual);

    return orden[(indice + 1) % orden.length];
}


})();
