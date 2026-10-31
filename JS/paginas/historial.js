/* =========================================================
   HARVESTX — HISTORIAL DE ACTIVIDADES
   Conectado a Flask y MySQL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const API_URL = "http://127.0.0.1:5000";

    const usuario = JSON.parse(
        localStorage.getItem("usuarioHarvestX") || "{}"
    );

    const usuarioId = Number(
        usuario.id || usuario.usuario_id
    );

    // =====================================================
    // ELEMENTOS
    // =====================================================

    const filtroTipo = document.getElementById("filtroTipo");
    const filtroFecha = document.getElementById("filtroFecha");
    const filtroEstado = document.getElementById("filtroEstado");

    const limpiarFiltros = document.getElementById("limpiarFiltros");
    const actualizarHistorial = document.getElementById("actualizarHistorial");

    const lista = document.getElementById("activityHistoryList");
    const historialVacio = document.getElementById("historialVacio");

    const contador = document.getElementById("contadorActividades");

    const statHoy = document.getElementById("actividadesHoy");
    const statSemana = document.getElementById("actividadesSemana");
    const statRiegos = document.getElementById("riegosRealizados");
    const statAlertas = document.getElementById("alertasAtendidas");

    // =====================================================
    // ESTADO
    // =====================================================

    let actividades = [];
    let cargando = false;

    // =====================================================
    // UTILIDADES
    // =====================================================

    function escaparHTML(valor) {

        return String(valor ?? "").replace(
            /[&<>"']/g,
            caracter => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[caracter]
        );

    }

    function fechaLocal(fechaTexto) {

        if (!fechaTexto) {
            return null;
        }

        const fecha = new Date(fechaTexto);

        if (Number.isNaN(fecha.getTime())) {
            return null;
        }

        return fecha;

    }

    function formatearFecha(fechaTexto) {

        const fecha = fechaLocal(fechaTexto);

        if (!fecha) {
            return "Fecha no disponible";
        }

        return fecha.toLocaleDateString(
            "es-GT",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }

    function formatearHora(fechaTexto) {

        const fecha = fechaLocal(fechaTexto);

        if (!fecha) {
            return "";
        }

        return fecha.toLocaleTimeString(
            "es-GT",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }

    function obtenerNombreTipo(tipo) {

        const nombres = {
            riego: "Riego",
            cultivo: "Cultivo",
            labor: "Labor",
            alerta: "Alerta",
            clima: "Clima",
            finca: "Finca",
            usuario: "Usuario"
        };

        return nombres[tipo] || "Actividad";

    }

    function obtenerNombreEstado(estado) {

        const nombres = {
            completada: "Completada",
            pendiente: "Pendiente",
            atendida: "Atendida"
        };

        return nombres[estado] || estado;

    }

    // =====================================================
    // NOTIFICACIONES
    // =====================================================

    function mostrarNotificacion(mensaje, tipo = "success") {

        const anterior = document.querySelector(
            ".historial-toast"
        );

        if (anterior) {
            anterior.remove();
        }

        const toast = document.createElement("div");

        toast.className = "historial-toast";

        const icono = tipo === "error"
            ? "fa-circle-exclamation"
            : "fa-circle-check";

        toast.innerHTML = `
            <i class="fas ${icono}"></i>
            <span>${escaparHTML(mensaje)}</span>
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => toast.remove(), 300);

        }, 2800);

    }

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    function actualizarEstadisticas(datos) {

        if (statHoy) {
            statHoy.textContent = datos.actividades_hoy ?? 0;
        }

        if (statSemana) {
            statSemana.textContent = datos.actividades_semana ?? 0;
        }

        if (statRiegos) {
            statRiegos.textContent = datos.riegos_realizados ?? 0;
        }

        if (statAlertas) {
            statAlertas.textContent = datos.alertas_atendidas ?? 0;
        }

    }

    // =====================================================
    // CREAR TARJETA DE ACTIVIDAD
    // =====================================================

    function crearTarjeta(actividad) {

        const tipo = actividad.tipo || "actividad";
        const estado = actividad.estado || "completada";

        const iconos = {
            riego: "fa-droplet",
            cultivo: "fa-seedling",
            labor: "fa-tractor",
            alerta: "fa-bell",
            clima: "fa-cloud-sun",
            finca: "fa-house",
            usuario: "fa-user"
        };

        const icono = iconos[tipo] || "fa-clock";

        const fecha = formatearFecha(actividad.fecha);
        const hora = formatearHora(actividad.fecha);

        const tarjeta = document.createElement("article");

        tarjeta.className = "history-item";

        tarjeta.dataset.tipo = tipo;
        tarjeta.dataset.estado = estado;
        tarjeta.dataset.fecha = actividad.fecha || "";

        tarjeta.innerHTML = `

            <div class="history-icon history-${escaparHTML(tipo)}">
                <i class="fas ${icono}"></i>
            </div>

            <div class="history-content">

                <div class="history-main">

                    <h4>
                        ${escaparHTML(actividad.titulo)}
                    </h4>

                    <span class="history-type type-${escaparHTML(tipo)}">
                        ${escaparHTML(obtenerNombreTipo(tipo))}
                    </span>

                </div>

                <p>
                    ${escaparHTML(actividad.descripcion)}
                </p>

                <div class="history-meta">

                    <span>
                        <i class="fas fa-calendar"></i>
                        ${escaparHTML(fecha)}
                    </span>

                    <span>
                        <i class="fas fa-clock"></i>
                        ${escaparHTML(hora || "Hora no disponible")}
                    </span>

                    <span>
                        <i class="fas fa-user"></i>
                        ${escaparHTML(actividad.usuario || "Sistema")}
                    </span>

                </div>

            </div>

            <span class="history-status status-${escaparHTML(estado)}">
                ${escaparHTML(obtenerNombreEstado(estado))}
            </span>

        `;

        return tarjeta;

    }

    // =====================================================
    // MOSTRAR ACTIVIDADES
    // =====================================================

    function mostrarActividades(datos) {

        if (!lista) {
            return;
        }

        lista.innerHTML = "";

        if (!datos.length) {

            if (historialVacio) {
                historialVacio.style.display = "flex";
            }

            actualizarContador(0);

            return;
        }

        if (historialVacio) {
            historialVacio.style.display = "none";
        }

        const fragmento = document.createDocumentFragment();

        datos.forEach(actividad => {

            fragmento.appendChild(
                crearTarjeta(actividad)
            );

        });

        lista.appendChild(fragmento);

        filtrarActividades();

    }

    // =====================================================
    // FILTRAR ACTIVIDADES
    // =====================================================

    function filtrarActividades() {

        if (!lista) {
            return;
        }

        const tipoSeleccionado = filtroTipo?.value || "todos";
        const fechaSeleccionada = filtroFecha?.value || "todas";
        const estadoSeleccionado = filtroEstado?.value || "todos";

        const tarjetas = lista.querySelectorAll(".history-item");

        let visibles = 0;

        tarjetas.forEach(tarjeta => {

            const tipo = tarjeta.dataset.tipo;
            const estado = tarjeta.dataset.estado;
            const fecha = tarjeta.dataset.fecha;

            let mostrar = true;

            if (
                tipoSeleccionado !== "todos" &&
                tipo !== tipoSeleccionado
            ) {
                mostrar = false;
            }

            if (
                estadoSeleccionado !== "todos" &&
                estado !== estadoSeleccionado
            ) {
                mostrar = false;
            }

            if (
                fechaSeleccionada !== "todas" &&
                !coincideFecha(fecha, fechaSeleccionada)
            ) {
                mostrar = false;
            }

            tarjeta.style.display = mostrar ? "" : "none";

            if (mostrar) {
                visibles++;
            }

        });

        actualizarContador(visibles);

        if (historialVacio) {
            historialVacio.style.display =
                visibles === 0 ? "flex" : "none";
        }

    }

    // =====================================================
    // FILTROS DE FECHA
    // =====================================================

    function coincideFecha(fechaTexto, filtro) {

        const fecha = fechaLocal(fechaTexto);

        if (!fecha) {
            return false;
        }

        const ahora = new Date();

        const inicioHoy = new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate()
        );

        const inicioActividad = new Date(
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate()
        );

        if (filtro === "hoy") {

            return inicioActividad.getTime() === inicioHoy.getTime();

        }

        if (filtro === "semana") {

            const inicioSemana = new Date(inicioHoy);

            const diferencia = (
                inicioSemana.getDay() === 0
                    ? 6
                    : inicioSemana.getDay() - 1
            );

            inicioSemana.setDate(
                inicioSemana.getDate() - diferencia
            );

            return inicioActividad >= inicioSemana &&
                   inicioActividad <= inicioHoy;

        }

        if (filtro === "mes") {

            return (
                fecha.getMonth() === ahora.getMonth() &&
                fecha.getFullYear() === ahora.getFullYear()
            );

        }

        if (filtro === "año") {

            return fecha.getFullYear() === ahora.getFullYear();

        }

        return true;

    }

    // =====================================================
    // CONTADOR
    // =====================================================

    function actualizarContador(cantidad) {

        if (!contador) {
            return;
        }

        contador.textContent =
            `${cantidad} ${cantidad === 1 ? "actividad" : "actividades"}`;

    }

    // =====================================================
    // LIMPIAR FILTROS
    // =====================================================

    function resetearFiltros() {

        if (filtroTipo) {
            filtroTipo.value = "todos";
        }

        if (filtroFecha) {
            filtroFecha.value = "todas";
        }

        if (filtroEstado) {
            filtroEstado.value = "todos";
        }

        filtrarActividades();

    }

    // =====================================================
    // CARGAR HISTORIAL DESDE FLASK
    // =====================================================

    async function cargarHistorial(mostrarMensaje = false) {

        if (cargando) {
            return;
        }

        if (!usuarioId || !Number.isInteger(usuarioId)) {

            mostrarNotificacion(
                "No se pudo identificar al usuario.",
                "error"
            );

            return;
        }

        cargando = true;

        if (actualizarHistorial) {
            actualizarHistorial.disabled = true;
        }

        if (lista) {
            lista.classList.add("historial-refreshing");
        }

        try {

            const respuesta = await fetch(
                `${API_URL}/api/historial-actividades?usuario_id=${usuarioId}`
            );

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exito) {

                throw new Error(
                    datos.mensaje || "No se pudo cargar el historial."
                );

            }

            actividades = Array.isArray(datos.actividades)
                ? datos.actividades
                : [];

            actualizarEstadisticas(
                datos.estadisticas || {}
            );

            mostrarActividades(actividades);

            if (mostrarMensaje) {

                mostrarNotificacion(
                    "Historial actualizado correctamente."
                );

            }

        } catch (error) {

            console.error(
                "Error al cargar historial:",
                error
            );

            if (lista) {

                lista.innerHTML = `
                    <div class="historial-empty">
                        <i class="fas fa-triangle-exclamation"></i>
                        <h3>No se pudo cargar el historial</h3>
                        <p>
                            Comprueba que el servidor de HarvestX
                            esté funcionando e inténtalo nuevamente.
                        </p>
                    </div>
                `;

            }

            actualizarContador(0);

            if (historialVacio) {
                historialVacio.style.display = "none";
            }

            mostrarNotificacion(
                "Error al conectar con el servidor.",
                "error"
            );

        } finally {

            cargando = false;

            if (actualizarHistorial) {
                actualizarHistorial.disabled = false;
            }

            if (lista) {

                lista.classList.remove(
                    "historial-refreshing"
                );

            }

        }

    }

    // =====================================================
    // EVENTOS
    // =====================================================

    filtroTipo?.addEventListener(
        "change",
        filtrarActividades
    );

    filtroFecha?.addEventListener(
        "change",
        filtrarActividades
    );

    filtroEstado?.addEventListener(
        "change",
        filtrarActividades
    );

    limpiarFiltros?.addEventListener(
        "click",
        resetearFiltros
    );

    actualizarHistorial?.addEventListener(
        "click",
        () => cargarHistorial(true)
    );

    // =====================================================
    // INICIALIZACIÓN
    // =====================================================

    cargarHistorial();

});