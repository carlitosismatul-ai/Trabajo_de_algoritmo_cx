/* =========================================================
   HARVESTX - HISTORIAL DE ACTIVIDADES
   Prototipo funcional
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
       ===================================================== */

    const filtroTipo = document.getElementById("filtroTipo");
    const filtroFecha = document.getElementById("filtroFecha");
    const filtroEstado = document.getElementById("filtroEstado");
    const limpiarFiltros = document.getElementById("limpiarFiltros");

    const actualizarHistorial = document.getElementById("actualizarHistorial");
    const activityHistoryList = document.getElementById("activityHistoryList");
    const historialVacio = document.getElementById("historialVacio");
    const contadorActividades = document.getElementById("contadorActividades");

    const actividades = Array.from(
        document.querySelectorAll(".history-item")
    );


    /* =====================================================
       FILTRAR ACTIVIDADES
       ===================================================== */

    function filtrarActividades() {

        const tipoSeleccionado = filtroTipo.value;
        const fechaSeleccionada = filtroFecha.value;
        const estadoSeleccionado = filtroEstado.value;

        let visibles = 0;

        actividades.forEach(actividad => {

            const tipo = actividad.dataset.tipo;
            const estado = actividad.dataset.estado;
            const fecha = actividad.dataset.fecha;

            let mostrar = true;


            // FILTRO POR TIPO
            if (
                tipoSeleccionado !== "todos" &&
                tipo !== tipoSeleccionado
            ) {
                mostrar = false;
            }


            // FILTRO POR FECHA
            if (
                fechaSeleccionada !== "todas" &&
                !coincideFecha(fecha, fechaSeleccionada)
            ) {
                mostrar = false;
            }


            // FILTRO POR ESTADO
            if (
                estadoSeleccionado !== "todos" &&
                estado !== estadoSeleccionado
            ) {
                mostrar = false;
            }


            // MOSTRAR / OCULTAR
            if (mostrar) {
                actividad.style.display = "";
                visibles++;
            } else {
                actividad.style.display = "none";
            }

        });


        actualizarContador(visibles);
        mostrarEstadoVacio(visibles);

    }


    /* =====================================================
       COMPARAR FECHAS
       ===================================================== */

    function coincideFecha(fechaActividad, filtro) {

        if (!fechaActividad) {
            return false;
        }

        const fecha = new Date(fechaActividad + "T12:00:00");
        const ahora = new Date();

        // HOY
        if (filtro === "hoy") {

            return (
                fecha.getFullYear() === ahora.getFullYear() &&
                fecha.getMonth() === ahora.getMonth() &&
                fecha.getDate() === ahora.getDate()
            );

        }


        // ESTA SEMANA
        if (filtro === "semana") {

            const inicioSemana = new Date(ahora);
            const dia = inicioSemana.getDay();

            const diferencia = dia === 0 ? 6 : dia - 1;

            inicioSemana.setDate(
                ahora.getDate() - diferencia
            );

            inicioSemana.setHours(0, 0, 0, 0);


            const finSemana = new Date(inicioSemana);

            finSemana.setDate(
                inicioSemana.getDate() + 6
            );

            finSemana.setHours(23, 59, 59, 999);


            return (
                fecha >= inicioSemana &&
                fecha <= finSemana
            );

        }


        // ESTE MES
        if (filtro === "mes") {

            return (
                fecha.getFullYear() === ahora.getFullYear() &&
                fecha.getMonth() === ahora.getMonth()
            );

        }


        // ESTE AÑO
        if (filtro === "año") {

            return (
                fecha.getFullYear() === ahora.getFullYear()
            );

        }


        return true;
    }


    /* =====================================================
       ACTUALIZAR CONTADOR
       ===================================================== */

    function actualizarContador(cantidad) {

        if (!contadorActividades) {
            return;
        }

        contadorActividades.textContent =
            `${cantidad} ${cantidad === 1 ? "actividad" : "actividades"}`;

    }


    /* =====================================================
       ESTADO VACÍO
       ===================================================== */

    function mostrarEstadoVacio(cantidad) {

        if (!historialVacio) {
            return;
        }

        if (cantidad === 0) {
            historialVacio.style.display = "flex";
        } else {
            historialVacio.style.display = "none";
        }

    }


    /* =====================================================
       LIMPIAR FILTROS
       ===================================================== */

    function resetearFiltros() {

        filtroTipo.value = "todos";
        filtroFecha.value = "todas";
        filtroEstado.value = "todos";

        filtrarActividades();

    }


    /* =====================================================
       ACTUALIZAR HISTORIAL
       ===================================================== */

    function refrescarHistorial() {

        // Pequeña animación visual
        if (activityHistoryList) {

            activityHistoryList.classList.add("historial-refreshing");

            setTimeout(() => {
                activityHistoryList.classList.remove(
                    "historial-refreshing"
                );
            }, 400);

        }

        filtrarActividades();

        mostrarNotificacion(
            "Historial actualizado correctamente."
        );

    }


    /* =====================================================
       NOTIFICACIÓN
       ===================================================== */

    function mostrarNotificacion(mensaje) {

        const anterior =
            document.querySelector(".historial-toast");

        if (anterior) {
            anterior.remove();
        }


        const toast = document.createElement("div");

        toast.className = "historial-toast";

        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${mensaje}</span>
        `;


        document.body.appendChild(toast);


        setTimeout(() => {
            toast.classList.add("show");
        }, 50);


        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 2500);

    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    if (filtroTipo) {
        filtroTipo.addEventListener(
            "change",
            filtrarActividades
        );
    }


    if (filtroFecha) {
        filtroFecha.addEventListener(
            "change",
            filtrarActividades
        );
    }


    if (filtroEstado) {
        filtroEstado.addEventListener(
            "change",
            filtrarActividades
        );
    }


    if (limpiarFiltros) {

        limpiarFiltros.addEventListener(
            "click",
            resetearFiltros
        );

    }


    if (actualizarHistorial) {

        actualizarHistorial.addEventListener(
            "click",
            refrescarHistorial
        );

    }


    /* =====================================================
       INICIALIZACIÓN
       ===================================================== */

    filtrarActividades();

});