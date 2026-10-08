/* =========================================================
   HARVESTX - SISTEMA GLOBAL DE NOTIFICACIONES
   Campanita compartida entre todos los módulos
========================================================= */

const NOTIFICACIONES_API = "http://127.0.0.1:5000";

let alertasGlobales = [];

let panelNotificaciones = null;


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    iniciarSistemaNotificaciones();

});


/* =========================================================
   INICIAR SISTEMA
========================================================= */

function iniciarSistemaNotificaciones() {

    const botonCampana =
        document.getElementById("notificationsButton");

    if (!botonCampana) {

        console.warn(
            "HarvestX: No se encontró la campanita en esta página."
        );

        return;

    }


    configurarCampana(botonCampana);

    cargarAlertasGlobales();

}


/* =========================================================
   CONFIGURAR CAMPANITA
========================================================= */

function configurarCampana(botonCampana) {

    botonCampana.addEventListener("click", (evento) => {

        evento.stopPropagation();

        alternarPanelNotificaciones();

    });


    botonCampana.addEventListener("keydown", (evento) => {

        if (
            evento.key === "Enter" ||
            evento.key === " "
        ) {

            evento.preventDefault();

            alternarPanelNotificaciones();

        }

    });


    document.addEventListener("click", (evento) => {

        if (
            panelNotificaciones &&
            !panelNotificaciones.contains(evento.target) &&
            !botonCampana.contains(evento.target)
        ) {

            cerrarPanelNotificaciones();

        }

    });

}


/* =========================================================
   CARGAR ALERTAS DESDE MYSQL
========================================================= */

async function cargarAlertasGlobales() {

    try {

        const respuesta = await fetch(
            `${NOTIFICACIONES_API}/api/alertas`
        );


        if (!respuesta.ok) {

            throw new Error(
                `Error HTTP ${respuesta.status}`
            );

        }


        const datos = await respuesta.json();


        if (
            datos.status !== "ok" ||
            !Array.isArray(datos.alertas)
        ) {

            throw new Error(
                "La respuesta de alertas no tiene el formato esperado."
            );

        }


        alertasGlobales = datos.alertas;


        actualizarBadge();

        actualizarPanelNotificaciones();


    } catch (error) {

        console.error(
            "HarvestX - Error cargando notificaciones:",
            error
        );

    }

}


/* =========================================================
   ACTUALIZAR BADGE
========================================================= */

function actualizarBadge() {

    const badge =
        document.getElementById("notificationBadge");


    if (!badge) {

        return;

    }


    const alertasActivas =
        alertasGlobales.filter(
            alerta =>
                String(alerta.estado).toLowerCase() === "activa"
        );


    const cantidad =
        alertasActivas.length;


    badge.textContent = cantidad;


    if (cantidad === 0) {

        badge.style.display = "none";

    } else {

        badge.style.display = "flex";

    }


    /*
       Si existen demasiadas alertas,
       mostramos 99+ para evitar que
       el badge crezca demasiado.
    */

    if (cantidad > 99) {

        badge.textContent = "99+";

    }

}


/* =========================================================
   ABRIR / CERRAR PANEL
========================================================= */

function alternarPanelNotificaciones() {

    if (!panelNotificaciones) {

        crearPanelNotificaciones();

    }


    if (
        panelNotificaciones.style.display === "none" ||
        panelNotificaciones.style.display === ""
    ) {

        abrirPanelNotificaciones();

    } else {

        cerrarPanelNotificaciones();

    }

}


/* =========================================================
   CREAR PANEL
========================================================= */

function crearPanelNotificaciones() {

    const botonCampana =
        document.getElementById("notificationsButton");


    if (!botonCampana) {

        return;

    }


    panelNotificaciones =
        document.createElement("div");


    panelNotificaciones.id =
        "notificationsPanel";


    panelNotificaciones.className =
        "notifications-panel";


    panelNotificaciones.innerHTML = `

        <div class="notifications-panel-header">

            <div>

                <h3>
                    Notificaciones
                </h3>

                <span id="notificationsPanelCount">
                    0 alertas activas
                </span>

            </div>


            <i class="fa-solid fa-bell"></i>

        </div>


        <div
            class="notifications-panel-list"
            id="notificationsPanelList">

        </div>


        <div class="notifications-panel-footer">

            <button
                type="button"
                id="viewAllNotifications">

                Ver todas las alertas

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </div>

    `;


    const contenedorCampana =
        botonCampana.parentElement;


    if (contenedorCampana) {

        contenedorCampana.style.position =
            "relative";

        contenedorCampana.appendChild(
            panelNotificaciones
        );

    }


    const botonVerTodas =
        panelNotificaciones.querySelector(
            "#viewAllNotifications"
        );


    if (botonVerTodas) {

        botonVerTodas.addEventListener(
            "click",
            () => {

                window.location.href =
                    "alertas.html";

            }
        );

    }


    actualizarPanelNotificaciones();

}


/* =========================================================
   ABRIR PANEL
========================================================= */

function abrirPanelNotificaciones() {

    if (!panelNotificaciones) {

        return;

    }


    actualizarPanelNotificaciones();


    panelNotificaciones.style.display =
        "block";

}


/* =========================================================
   CERRAR PANEL
========================================================= */

function cerrarPanelNotificaciones() {

    if (!panelNotificaciones) {

        return;

    }


    panelNotificaciones.style.display =
        "none";

}


/* =========================================================
   ACTUALIZAR PANEL
========================================================= */

function actualizarPanelNotificaciones() {

    if (!panelNotificaciones) {

        return;

    }


    const lista =
        document.getElementById(
            "notificationsPanelList"
        );


    const contador =
        document.getElementById(
            "notificationsPanelCount"
        );


    if (!lista) {

        return;

    }


    const alertasActivas =
        alertasGlobales
            .filter(
                alerta =>
                    String(alerta.estado).toLowerCase()
                    === "activa"
            )
            .sort(
                (a, b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)
            );


    if (contador) {

        contador.textContent =
            `${alertasActivas.length} ${
                alertasActivas.length === 1
                    ? "alerta activa"
                    : "alertas activas"
            }`;

    }


    lista.innerHTML = "";


    if (alertasActivas.length === 0) {

        lista.innerHTML = `

            <div class="notifications-empty">

                <div class="notifications-empty-icon">

                    <i class="fa-solid fa-check"></i>

                </div>


                <h4>
                    Todo está en orden
                </h4>


                <p>
                    No tienes alertas pendientes.
                </p>

            </div>

        `;

        return;

    }


    /*
       Mostramos máximo 5 alertas
       en el panel.
    */

    alertasActivas
        .slice(0, 5)
        .forEach(alerta => {

            lista.appendChild(
                crearNotificacion(alerta)
            );

        });

}


/* =========================================================
   CREAR NOTIFICACIÓN
========================================================= */

function crearNotificacion(alerta) {

    const nivel =
        obtenerClaseNivel(alerta.nivel);


    const elemento =
        document.createElement("div");


    elemento.className =
        `notification-preview ${nivel}`;


    elemento.innerHTML = `

        <div class="notification-preview-icon">

            <i class="${obtenerIcono(alerta.tipo)}"></i>

        </div>


        <div class="notification-preview-content">

            <div class="notification-preview-top">

                <h4 class="notification-preview-title">

                    ${escaparHTML(
                        obtenerTitulo(alerta.tipo)
                    )}

                </h4>


                <span class="notification-preview-level">

                    ${escaparHTML(
                        alerta.nivel || ""
                    )}

                </span>

            </div>


            <p class="notification-preview-message">

                ${escaparHTML(
                    alerta.mensaje || ""
                )}

            </p>


            <span class="notification-preview-time">

                <i class="fa-regular fa-clock"></i>

                ${formatearFecha(
                    alerta.fecha
                )}

            </span>

        </div>

    `;


    return elemento;

}


/* =========================================================
   CLASE SEGÚN NIVEL
========================================================= */

function obtenerClaseNivel(nivel) {

    switch (
        String(nivel || "").toLowerCase()
    ) {

        case "alto":
            return "critical";


        case "medio":
            return "warning";


        case "bajo":
            return "preventive";


        default:
            return "preventive";

    }

}


/* =========================================================
   ICONOS
========================================================= */

function obtenerIcono(tipo) {

    const texto =
        String(tipo || "").toLowerCase();


    if (
        texto.includes("humedad")
    ) {

        return "fa-solid fa-droplet";

    }


    if (
        texto.includes("temperatura") ||
        texto.includes("calor")
    ) {

        return "fa-solid fa-temperature-high";

    }


    if (
        texto.includes("lluvia") ||
        texto.includes("clima")
    ) {

        return "fa-solid fa-cloud-rain";

    }


    if (
        texto.includes("riego") ||
        texto.includes("agua")
    ) {

        return "fa-solid fa-faucet-drip";

    }


    if (
        texto.includes("cultivo") ||
        texto.includes("planta")
    ) {

        return "fa-solid fa-seedling";

    }


    if (
        texto.includes("finca")
    ) {

        return "fa-solid fa-mountain-sun";

    }


    return "fa-solid fa-bell";

}


/* =========================================================
   TÍTULO
========================================================= */

function obtenerTitulo(tipo) {

    if (!tipo) {

        return "Nueva alerta";

    }


    return String(tipo);

}


/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatearFecha(fecha) {

    if (!fecha) {

        return "Fecha desconocida";

    }


    const fechaObjeto =
        new Date(
            String(fecha).replace(" ", "T")
        );


    if (Number.isNaN(fechaObjeto.getTime())) {

        return String(fecha);

    }


    const ahora =
        new Date();


    const diferencia =
        ahora - fechaObjeto;


    const minutos =
        Math.floor(
            diferencia / 60000
        );


    if (minutos < 1) {

        return "Ahora mismo";

    }


    if (minutos < 60) {

        return `Hace ${minutos} ${
            minutos === 1
                ? "minuto"
                : "minutos"
        }`;

    }


    const horas =
        Math.floor(
            minutos / 60
        );


    if (horas < 24) {

        return `Hace ${horas} ${
            horas === 1
                ? "hora"
                : "horas"
        }`;

    }


    const dias =
        Math.floor(
            horas / 24
        );


    if (dias < 7) {

        return `Hace ${dias} ${
            dias === 1
                ? "día"
                : "días"
        }`;

    }


    return fechaObjeto.toLocaleDateString(
        "es-GT",
        {
            day: "2-digit",
            month: "short"
        }
    );

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   ACTUALIZACIÓN AUTOMÁTICA
========================================================= */

/*
   Revisamos las alertas cada 30 segundos.

   Así si otro módulo crea una alerta,
   la campanita se actualiza sin tener
   que recargar la página.
*/

setInterval(() => {

    cargarAlertasGlobales();

}, 30000);