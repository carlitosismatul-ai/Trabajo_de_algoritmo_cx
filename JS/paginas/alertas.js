// ==========================================================
// HARVESTX - ALERTAS
// ==========================================================

const API_URL = "http://127.0.0.1:5000";

// ==========================================================
// VARIABLES
// ==========================================================

let todasLasAlertas = [];


// ==========================================================
// INICIAR
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    cargarAlertas();

    configurarBuscador();

    configurarFiltroNivel();

    configurarBotonResolverTodas();

    configurarCampana();

});


// ==========================================================
// CARGAR ALERTAS DESDE MYSQL
// ==========================================================

async function cargarAlertas() {

    const lista = document.getElementById("alertsList");

    if (!lista) {
        return;
    }

    try {

        mostrarCargando();

        const respuesta = await fetch(
            `${API_URL}/api/alertas`
        );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener las alertas."
            );

        }

        const datos = await respuesta.json();

        if (datos.status !== "ok") {

            throw new Error(
                datos.mensaje ||
                "Error al cargar las alertas."
            );

        }

        todasLasAlertas = datos.alertas || [];

        actualizarResumen();

        actualizarCampana();

        aplicarFiltros();

    } catch (error) {

        console.error(
            "Error al cargar alertas:",
            error
        );

        mostrarError();

    }

}


// ==========================================================
// MOSTRAR CARGANDO
// ==========================================================

function mostrarCargando() {

    const lista = document.getElementById(
        "alertsList"
    );

    if (!lista) {
        return;
    }

    lista.innerHTML = `
        <div class="alerts-empty">
            <div class="empty-icon">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </div>

            <h3>Cargando alertas...</h3>

            <p>
                Consultando la información de HarvestX.
            </p>
        </div>
    `;

}


// ==========================================================
// MOSTRAR ERROR
// ==========================================================

function mostrarError() {

    const lista = document.getElementById(
        "alertsList"
    );

    if (!lista) {
        return;
    }

    lista.innerHTML = `
        <div class="alerts-empty">
            <div class="empty-icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h3>No se pudieron cargar las alertas</h3>

            <p>
                Verifica que Flask y MySQL estén funcionando.
            </p>
        </div>
    `;

}


// ==========================================================
// RESUMEN
// ==========================================================

function actualizarResumen() {

    const criticas = todasLasAlertas.filter(
        alerta =>
            alerta.estado === "Activa" &&
            alerta.nivel === "Alto"
    ).length;

    const advertencias = todasLasAlertas.filter(
        alerta =>
            alerta.estado === "Activa" &&
            alerta.nivel === "Medio"
    ).length;

    const preventivas = todasLasAlertas.filter(
        alerta =>
            alerta.estado === "Activa" &&
            alerta.nivel === "Bajo"
    ).length;

    const resueltas = todasLasAlertas.filter(
        alerta =>
            alerta.estado === "Resuelta"
    ).length;


    const criticalCount =
        document.getElementById(
            "criticalCount"
        );

    const warningCount =
        document.getElementById(
            "warningCount"
        );

    const preventiveCount =
        document.getElementById(
            "preventiveCount"
        );

    const resolvedCount =
        document.getElementById(
            "resolvedCount"
        );


    if (criticalCount) {
        criticalCount.textContent = criticas;
    }

    if (warningCount) {
        warningCount.textContent = advertencias;
    }

    if (preventiveCount) {
        preventiveCount.textContent = preventivas;
    }

    if (resolvedCount) {
        resolvedCount.textContent = resueltas;
    }

}


// ==========================================================
// CAMPANA DE NOTIFICACIONES
// ==========================================================

function actualizarCampana() {

    const badge = document.getElementById(
        "notificationBadge"
    );

    if (!badge) {
        return;
    }

    const activas = todasLasAlertas.filter(
        alerta =>
            alerta.estado === "Activa"
    ).length;

    badge.textContent = activas;

    if (activas === 0) {

        badge.style.display = "none";

    } else {

        badge.style.display = "flex";

    }

}


// ==========================================================
// CONFIGURAR CAMPANA
// ==========================================================

function configurarCampana() {

    const boton =
        document.getElementById(
            "notificationsButton"
        );

    if (!boton) {
        return;
    }


    boton.addEventListener(
        "click",
        (evento) => {

            evento.stopPropagation();

            alternarPanelNotificaciones();

        }
    );


    boton.addEventListener(
        "keydown",
        (evento) => {

            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {

                evento.preventDefault();

                alternarPanelNotificaciones();

            }

        }
    );


    document.addEventListener(
        "click",
        (evento) => {

            const panel =
                document.getElementById(
                    "notificationsPanel"
                );

            if (!panel) {
                return;
            }


            if (
                !boton.contains(evento.target) &&
                !panel.contains(evento.target)
            ) {

                cerrarPanelNotificaciones();

            }

        }
    );

}


// ==========================================================
// ABRIR / CERRAR PANEL
// ==========================================================

function alternarPanelNotificaciones() {

    let panel =
        document.getElementById(
            "notificationsPanel"
        );


    if (!panel) {

        panel =
            crearPanelNotificaciones();

    }


    if (
        panel.style.display === "none" ||
        panel.style.display === ""
    ) {

        actualizarPanelNotificaciones();

        panel.style.display = "block";

    } else {

        panel.style.display = "none";

    }

}


// ==========================================================
// CERRAR PANEL
// ==========================================================

function cerrarPanelNotificaciones() {

    const panel =
        document.getElementById(
            "notificationsPanel"
        );

    if (!panel) {
        return;
    }

    panel.style.display = "none";

}


// ==========================================================
// CREAR PANEL DE NOTIFICACIONES
// ==========================================================

function crearPanelNotificaciones() {

    const boton =
        document.getElementById(
            "notificationsButton"
        );

    if (!boton) {
        return null;
    }


    const panel =
        document.createElement("div");


    panel.id =
        "notificationsPanel";


    panel.className =
        "notifications-panel";


    panel.innerHTML = `

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


    const contenedor =
        boton.parentElement;


    contenedor.style.position =
        "relative";


    contenedor.appendChild(panel);


    const botonTodas =
        document.getElementById(
            "viewAllNotifications"
        );


    if (botonTodas) {

        botonTodas.addEventListener(
            "click",
            () => {

                window.location.href =
                    "alertas.html";

            }
        );

    }


    return panel;

}


// ==========================================================
// ACTUALIZAR PANEL
// ==========================================================

function actualizarPanelNotificaciones() {

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
        todasLasAlertas
            .filter(
                alerta =>
                    alerta.estado === "Activa"
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.fecha
                    ) -
                    new Date(
                        a.fecha
                    )
            );


    if (contador) {

        contador.textContent =
            alertasActivas.length === 1
                ? "1 alerta activa"
                : `${alertasActivas.length} alertas activas`;

    }


    if (alertasActivas.length === 0) {

        lista.innerHTML = `

            <div class="notification-empty">

                <i class="fa-solid fa-circle-check"></i>

                <strong>
                    Todo está en orden
                </strong>

                <span>
                    No tienes alertas pendientes.
                </span>

            </div>

        `;

        return;

    }


    lista.innerHTML =
        alertasActivas
            .slice(0, 5)
            .map(
                alerta =>
                    crearNotificacion(
                        alerta
                    )
            )
            .join("");


    const elementos =
        lista.querySelectorAll(
            ".notification-preview"
        );


    elementos.forEach(
        elemento => {

            elemento.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "alertas.html";

                }
            );

        }
    );

}


// ==========================================================
// CREAR NOTIFICACIÓN
// ==========================================================

function crearNotificacion(
    alerta
) {

    let clase =
        "notification-low";

    let icono =
        "fa-solid fa-clock";

    let nivel =
        "PREVENTIVA";


    if (
        alerta.nivel ===
        "Alto"
    ) {

        clase =
            "notification-high";

        icono =
            obtenerIcono(
                alerta.tipo
            );

        nivel =
            "CRÍTICA";

    } else if (
        alerta.nivel ===
        "Medio"
    ) {

        clase =
            "notification-medium";

        icono =
            obtenerIcono(
                alerta.tipo
            );

        nivel =
            "ADVERTENCIA";

    } else {

        icono =
            obtenerIcono(
                alerta.tipo
            );

    }


    return `

        <div
            class="notification-preview ${clase}"
            data-id="${alerta.id}"
        >

            <div class="notification-preview-icon">

                <i class="${icono}"></i>

            </div>


            <div class="notification-preview-content">

                <div class="notification-preview-top">

                    <strong>
                        ${escaparHTML(
                            obtenerTitulo(
                                alerta.tipo
                            )
                        )}
                    </strong>

                    <span>
                        ${nivel}
                    </span>

                </div>


                <p>
                    ${escaparHTML(
                        alerta.mensaje || ""
                    )}
                </p>


                <small>

                    <i class="fa-regular fa-clock"></i>

                    ${formatearFechaCorta(
                        alerta.fecha
                    )}

                </small>

            </div>

        </div>

    `;

}


// ==========================================================
// FECHA CORTA
// ==========================================================

function formatearFechaCorta(
    fecha
) {

    if (!fecha) {
        return "Fecha desconocida";
    }


    const fechaObjeto =
        new Date(
            fecha.replace(
                " ",
                "T"
            )
        );


    if (
        Number.isNaN(
            fechaObjeto.getTime()
        )
    ) {

        return fecha;

    }


    return fechaObjeto.toLocaleString(
        "es-GT",
        {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================================
// FILTROS
// ==========================================================

function configurarBuscador() {

    const buscador =
        document.getElementById(
            "alertSearch"
        );

    if (!buscador) {
        return;
    }

    buscador.addEventListener(
        "input",
        aplicarFiltros
    );

}


function configurarFiltroNivel() {

    const filtro =
        document.getElementById(
            "alertLevelFilter"
        );

    if (!filtro) {
        return;
    }

    filtro.addEventListener(
        "change",
        aplicarFiltros
    );

}


// ==========================================================
// APLICAR FILTROS
// ==========================================================

function aplicarFiltros() {

    const buscador =
        document.getElementById(
            "alertSearch"
        );

    const filtro =
        document.getElementById(
            "alertLevelFilter"
        );


    const texto =
        buscador
            ? buscador.value
                .trim()
                .toLowerCase()
            : "";


    const nivelSeleccionado =
        filtro
            ? filtro.value
            : "todas";


    let alertasFiltradas =
        todasLasAlertas.filter(
            alerta => {

                const coincideTexto =
                    !texto ||
                    String(
                        alerta.tipo || ""
                    )
                        .toLowerCase()
                        .includes(texto) ||

                    String(
                        alerta.mensaje || ""
                    )
                        .toLowerCase()
                        .includes(texto);


                if (!coincideTexto) {
                    return false;
                }


                if (
                    nivelSeleccionado ===
                    "todas"
                ) {

                    return true;

                }


                if (
                    nivelSeleccionado ===
                    "critica"
                ) {

                    return (
                        alerta.nivel ===
                        "Alto"
                    );

                }


                if (
                    nivelSeleccionado ===
                    "advertencia"
                ) {

                    return (
                        alerta.nivel ===
                        "Medio"
                    );

                }


                if (
                    nivelSeleccionado ===
                    "preventiva"
                ) {

                    return (
                        alerta.nivel ===
                        "Bajo"
                    );

                }


                if (
                    nivelSeleccionado ===
                    "resuelta"
                ) {

                    return (
                        alerta.estado ===
                        "Resuelta"
                    );

                }


                return true;

            }
        );


    renderizarAlertas(
        alertasFiltradas
    );

}


// ==========================================================
// RENDERIZAR ALERTAS
// ==========================================================

function renderizarAlertas(
    alertas
) {

    const lista =
        document.getElementById(
            "alertsList"
        );

    if (!lista) {
        return;
    }


    if (alertas.length === 0) {

        lista.innerHTML = `
            <div class="alerts-empty">
                <div class="empty-icon">
                    <i class="fa-solid fa-circle-check"></i>
                </div>

                <h3>No hay alertas</h3>

                <p>
                    No se encontraron alertas
                    con los filtros actuales.
                </p>
            </div>
        `;

        return;

    }


    lista.innerHTML =
        alertas
            .map(
                alerta =>
                    crearTarjetaAlerta(
                        alerta
                    )
            )
            .join("");


    agregarEventosResolver();

}


// ==========================================================
// CREAR TARJETA
// ==========================================================

function crearTarjetaAlerta(
    alerta
) {

    const resuelta =
        alerta.estado === "Resuelta";


    let claseNivel =
        "preventive";

    let textoNivel =
        "PREVENTIVA";


    if (
        alerta.nivel ===
        "Alto"
    ) {

        claseNivel = "critical";
        textoNivel = "CRÍTICA";

    } else if (
        alerta.nivel ===
        "Medio"
    ) {

        claseNivel = "warning";
        textoNivel = "ADVERTENCIA";

    }


    if (resuelta) {

        claseNivel = "resolved";
        textoNivel = "RESUELTA";

    }


    const icono =
        obtenerIcono(
            alerta.tipo
        );


    const titulo =
        obtenerTitulo(
            alerta.tipo
        );


    const fecha =
        formatearFecha(
            alerta.fecha
        );


    return `
        <article
            class="alert-item ${claseNivel}"
            data-id="${alerta.id}"
            data-level="${claseNivel}"
        >

            <div class="alert-item-icon">
                <i class="${icono}"></i>
            </div>


            <div class="alert-item-content">

                <div class="alert-item-top">

                    <div>

                        <h3>
                            ${escaparHTML(titulo)}
                        </h3>

                        <span
                            class="alert-level ${claseNivel}"
                        >
                            ${textoNivel}
                        </span>

                    </div>

                </div>


                <p>
                    ${escaparHTML(
                        alerta.mensaje || ""
                    )}
                </p>


                <div class="alert-item-meta">

                    <span>
                        <i class="fa-regular fa-clock"></i>
                        ${fecha}
                    </span>

                    <span>
                        <i class="fa-solid fa-tag"></i>
                        ${escaparHTML(
                            alerta.tipo || "General"
                        )}
                    </span>

                </div>

            </div>


            <div class="alert-item-action">

                ${
                    resuelta

                    ? `
                        <span class="resolved-status">
                            <i class="fa-solid fa-circle-check"></i>
                            Resuelta
                        </span>
                    `

                    : `
                        <button
                            type="button"
                            class="resolve-alert-btn"
                            data-id="${alerta.id}"
                        >
                            <i class="fa-solid fa-check"></i>
                            Resolver
                        </button>
                    `
                }

            </div>

        </article>
    `;

}


// ==========================================================
// ICONOS
// ==========================================================

function obtenerIcono(tipo) {

    const texto =
        String(
            tipo || ""
        ).toLowerCase();


    if (
        texto.includes("agua") ||
        texto.includes("riego") ||
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
        texto.includes("clima") ||
        texto.includes("lluvia")
    ) {

        return "fa-solid fa-cloud-rain";

    }


    if (
        texto.includes("plaga") ||
        texto.includes("enfermedad")
    ) {

        return "fa-solid fa-bug";

    }


    if (
        texto.includes("cultivo")
    ) {

        return "fa-solid fa-seedling";

    }


    if (
        texto.includes("finca")
    ) {

        return "fa-solid fa-tractor";

    }


    return "fa-solid fa-bell";

}


// ==========================================================
// TÍTULO
// ==========================================================

function obtenerTitulo(tipo) {

    if (!tipo) {
        return "Alerta de HarvestX";
    }


    const texto =
        String(tipo)
            .trim();


    return texto.charAt(0).toUpperCase()
        + texto.slice(1);

}


// ==========================================================
// FORMATEAR FECHA
// ==========================================================

function formatearFecha(
    fecha
) {

    if (!fecha) {
        return "Fecha desconocida";
    }


    const fechaObjeto =
        new Date(
            fecha.replace(
                " ",
                "T"
            )
        );


    if (
        Number.isNaN(
            fechaObjeto.getTime()
        )
    ) {

        return fecha;

    }


    return fechaObjeto.toLocaleString(
        "es-GT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================================
// RESOLVER UNA ALERTA
// ==========================================================

function agregarEventosResolver() {

    const botones =
        document.querySelectorAll(
            ".resolve-alert-btn"
        );


    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                async () => {

                    const id =
                        boton.dataset.id;

                    await resolverAlerta(
                        id
                    );

                }
            );

        }
    );

}


// ==========================================================
// RESOLVER ALERTA
// ==========================================================

async function resolverAlerta(
    id
) {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/alertas/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        estado: "Resuelta"
                    })

                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            datos.status !== "ok"
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo resolver la alerta."
            );

        }


        await cargarAlertas();

        actualizarPanelNotificaciones();


    } catch (error) {

        console.error(
            "Error al resolver alerta:",
            error
        );

        alert(
            "No se pudo resolver la alerta."
        );

    }

}


// ==========================================================
// RESOLVER TODAS
// ==========================================================

function configurarBotonResolverTodas() {

    const boton =
        document.getElementById(
            "markAllReadButton"
        );


    if (!boton) {
        return;
    }


    boton.addEventListener(
        "click",
        async () => {

            const activas =
                todasLasAlertas.filter(
                    alerta =>
                        alerta.estado ===
                        "Activa"
                );


            if (activas.length === 0) {

                return;

            }


            const confirmar =
                confirm(
                    "¿Deseas marcar todas las alertas activas como resueltas?"
                );


            if (!confirmar) {
                return;
            }


            try {

                const respuesta =
                    await fetch(
                        `${API_URL}/api/alertas/resolver-todas`,
                        {
                            method: "PUT"
                        }
                    );


                const datos =
                    await respuesta.json();


                if (
                    !respuesta.ok ||
                    datos.status !== "ok"
                ) {

                    throw new Error(
                        datos.mensaje ||
                        "No se pudieron resolver las alertas."
                    );

                }


                await cargarAlertas();

                actualizarPanelNotificaciones();


            } catch (error) {

                console.error(
                    "Error al resolver todas:",
                    error
                );

                alert(
                    "No se pudieron resolver las alertas."
                );

            }

        }
    );

}


// ==========================================================
// ESCAPAR HTML
// ==========================================================

function escaparHTML(
    texto
) {

    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}