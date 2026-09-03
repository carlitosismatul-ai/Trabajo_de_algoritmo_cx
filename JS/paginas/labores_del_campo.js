/* =========================================================
   HARVESTX - LABORES DEL CAMPO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTOS
    // =====================================================

    const filtroTipo = document.getElementById("filtroTipoLabor");
    const filtroCultivo = document.getElementById("filtroCultivoLabor");
    const filtroEstado = document.getElementById("filtroEstadoLabor");
    const filtroFecha = document.getElementById("filtroFechaLabor");

    const limpiarFiltros = document.getElementById("limpiarFiltros");
    const actualizarLabores = document.getElementById("actualizarLabores");
    const btnNuevaLabor = document.getElementById("btnNuevaLabor");

    const laboresList = document.getElementById("laboresList");
    const laboresVacio = document.getElementById("laboresVacio");
    const contadorLabores = document.getElementById("contadorLabores");

    const totalLabores = document.getElementById("totalLabores");
    const laboresCompletadas = document.getElementById("laboresCompletadas");
    const laboresPendientes = document.getElementById("laboresPendientes");
    const laboresSemana = document.getElementById("laboresSemana");

    const labores = document.querySelectorAll(".labor-item");


    // =====================================================
    // FECHA ACTUAL
    // =====================================================

    const fechaActual = new Date(2026, 8, 2);


    // =====================================================
    // MOSTRAR NOTIFICACIÓN
    // =====================================================

    function mostrarToast(mensaje, tipo = "normal") {

        const toastAnterior = document.querySelector(".labores-toast");

        if (toastAnterior) {
            toastAnterior.remove();
        }

        const toast = document.createElement("div");

        toast.className = `labores-toast ${tipo}`;

        toast.innerHTML = `
            <i class="fas fa-circle-check"></i>
            <span>${mensaje}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("mostrar");
        }, 50);

        setTimeout(() => {
            toast.classList.remove("mostrar");

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 2500);
    }


    // =====================================================
    // CONVERTIR FECHA
    // =====================================================

    function obtenerFecha(fecha) {
        const partes = fecha.split("-");

        return new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );
    }


    // =====================================================
    // VERIFICAR FILTRO DE FECHA
    // =====================================================

    function coincideFecha(fechaLabor, filtro) {

        if (filtro === "todas") {
            return true;
        }

        const fecha = obtenerFecha(fechaLabor);

        // HOY
        if (filtro === "hoy") {

            return (
                fecha.getFullYear() === fechaActual.getFullYear() &&
                fecha.getMonth() === fechaActual.getMonth() &&
                fecha.getDate() === fechaActual.getDate()
            );
        }


        // ESTA SEMANA
        if (filtro === "semana") {

            const inicioSemana = new Date(fechaActual);
            const diaSemana = fechaActual.getDay();

            const diferencia = diaSemana === 0 ? 6 : diaSemana - 1;

            inicioSemana.setDate(
                fechaActual.getDate() - diferencia
            );

            inicioSemana.setHours(0, 0, 0, 0);

            const finSemana = new Date(inicioSemana);

            finSemana.setDate(
                inicioSemana.getDate() + 6
            );

            finSemana.setHours(23, 59, 59, 999);

            return fecha >= inicioSemana && fecha <= finSemana;
        }


        // ESTE MES
        if (filtro === "mes") {

            return (
                fecha.getFullYear() === fechaActual.getFullYear() &&
                fecha.getMonth() === fechaActual.getMonth()
            );
        }

        return true;
    }


    // =====================================================
    // FILTRAR LABORES
    // =====================================================

    function filtrarLabores() {

        const tipoSeleccionado = filtroTipo.value;
        const cultivoSeleccionado = filtroCultivo.value;
        const estadoSeleccionado = filtroEstado.value;
        const fechaSeleccionada = filtroFecha.value;

        let visibles = 0;

        labores.forEach(labor => {

            const tipo = labor.dataset.tipo;
            const cultivo = labor.dataset.cultivo;
            const estado = labor.dataset.estado;
            const fecha = labor.dataset.fecha;


            const coincideTipo =
                tipoSeleccionado === "todos" ||
                tipo === tipoSeleccionado;


            const coincideCultivo =
                cultivoSeleccionado === "todos" ||
                cultivo === cultivoSeleccionado;


            const coincideEstado =
                estadoSeleccionado === "todos" ||
                estado === estadoSeleccionado;


            const coincideFechaFiltro =
                coincideFecha(fecha, fechaSeleccionada);


            const mostrar =
                coincideTipo &&
                coincideCultivo &&
                coincideEstado &&
                coincideFechaFiltro;


            if (mostrar) {

                labor.style.display = "flex";
                visibles++;

            } else {

                labor.style.display = "none";

            }

        });


        // =================================================
        // CONTADOR
        // =================================================

        contadorLabores.textContent =
            `${visibles} ${visibles === 1 ? "labor encontrada" : "labores encontradas"}`;


        // =================================================
        // ESTADO VACÍO
        // =================================================

        if (visibles === 0) {

            laboresVacio.style.display = "flex";

        } else {

            laboresVacio.style.display = "none";

        }
    }


    // =====================================================
    // ACTUALIZAR ESTADÍSTICAS
    // =====================================================

    function actualizarEstadisticas() {

        let completadas = 0;
        let pendientes = 0;
        let semana = 0;


        labores.forEach(labor => {

            const estado = labor.dataset.estado;
            const fecha = labor.dataset.fecha;


            if (estado === "completada") {
                completadas++;
            }


            if (estado === "pendiente") {
                pendientes++;
            }


            if (coincideFecha(fecha, "semana")) {
                semana++;
            }

        });


        totalLabores.textContent = labores.length;
        laboresCompletadas.textContent = completadas;
        laboresPendientes.textContent = pendientes;
        laboresSemana.textContent = semana;
    }


    // =====================================================
    // LIMPIAR FILTROS
    // =====================================================

    function limpiarTodosLosFiltros() {

        filtroTipo.value = "todos";
        filtroCultivo.value = "todos";
        filtroEstado.value = "todos";
        filtroFecha.value = "todas";

        filtrarLabores();

        mostrarToast("Filtros limpiados");
    }


    // =====================================================
    // ACTUALIZAR LABORES
    // =====================================================

    function actualizarLista() {

        if (!laboresList) return;

        laboresList.classList.add("labores-refreshing");

        setTimeout(() => {

            laboresList.classList.remove("labores-refreshing");

            filtrarLabores();

            mostrarToast("Lista de labores actualizada");

        }, 500);
    }


    // =====================================================
    // NUEVA LABOR
    // =====================================================

    function nuevaLabor() {

        mostrarToast(
            "El registro de nuevas labores estará disponible próximamente."
        );
    }


    // =====================================================
    // EVENTOS DE FILTROS
    // =====================================================

    filtroTipo.addEventListener("change", filtrarLabores);

    filtroCultivo.addEventListener("change", filtrarLabores);

    filtroEstado.addEventListener("change", filtrarLabores);

    filtroFecha.addEventListener("change", filtrarLabores);


    // =====================================================
    // EVENTOS DE BOTONES
    // =====================================================

    limpiarFiltros.addEventListener(
        "click",
        limpiarTodosLosFiltros
    );

    actualizarLabores.addEventListener(
        "click",
        actualizarLista
    );

    btnNuevaLabor.addEventListener(
        "click",
        nuevaLabor
    );


    // =====================================================
    // INICIALIZACIÓN
    // =====================================================

    actualizarEstadisticas();

    filtrarLabores();

});