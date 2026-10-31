/* =========================================================
   HARVESTX - LABORES DEL CAMPO
   Versión 2.0
   - Registro de labores
   - Edición y eliminación
   - Filtros dinámicos
   - Estadísticas automáticas
   - Persistencia local
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    // =====================================================
    // ELEMENTOS
    // =====================================================

    const $ = (id) => document.getElementById(id);

    const filtroTipo = $("filtroTipoLabor");
    const filtroCultivo = $("filtroCultivoLabor");
    const filtroEstado = $("filtroEstadoLabor");
    const filtroFecha = $("filtroFechaLabor");

    const limpiarFiltros = $("limpiarFiltros");
    const actualizarLabores = $("actualizarLabores");
    const btnNuevaLabor = $("btnNuevaLabor");

    const laboresList = $("laboresList");
    const laboresVacio = $("laboresVacio");
    const contadorLabores = $("contadorLabores");

    const totalLabores = $("totalLabores");
    const laboresCompletadas = $("laboresCompletadas");
    const laboresPendientes = $("laboresPendientes");
    const laboresSemana = $("laboresSemana");

    if (!laboresList) return;


    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const STORAGE_KEY = "harvestX_labores_v2";

    const TIPOS = {
        preparacion: {
            nombre: "Preparación del terreno",
            icono: "fa-mountain-sun",
            clase: "labor-preparacion"
        },

        siembra: {
            nombre: "Siembra",
            icono: "fa-seedling",
            clase: "labor-siembra"
        },

        fertilizacion: {
            nombre: "Fertilización",
            icono: "fa-flask",
            clase: "labor-fertilizacion"
        },

        poda: {
            nombre: "Poda",
            icono: "fa-scissors",
            clase: "labor-poda"
        },

        cosecha: {
            nombre: "Cosecha",
            icono: "fa-basket-shopping",
            clase: "labor-cosecha"
        },

        mantenimiento: {
            nombre: "Mantenimiento",
            icono: "fa-wrench",
            clase: "labor-mantenimiento"
        }
    };


    // =====================================================
    // FECHAS
    // =====================================================

    function fechaLocal(fecha = new Date()) {

        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, "0");
        const day = String(fecha.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function convertirFecha(valor) {

        if (!valor) return new Date(NaN);

        const [year, month, day] = valor.split("-").map(Number);

        return new Date(year, month - 1, day);
    }


    function formatearFecha(valor) {

        const fecha = convertirFecha(valor);

        if (Number.isNaN(fecha.getTime())) return valor;

        return fecha.toLocaleDateString("es-GT", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    function inicioSemana(fecha) {

        const resultado = new Date(fecha);

        const diferencia = resultado.getDay() === 0
            ? 6
            : resultado.getDay() - 1;

        resultado.setDate(resultado.getDate() - diferencia);
        resultado.setHours(0, 0, 0, 0);

        return resultado;
    }


    function coincideFecha(fechaLabor, filtro) {

        if (filtro === "todas") return true;

        const fecha = convertirFecha(fechaLabor);
        const hoy = convertirFecha(fechaLocal());

        if (Number.isNaN(fecha.getTime())) return false;

        if (filtro === "hoy") {
            return fechaLabor === fechaLocal();
        }

        if (filtro === "semana") {

            const inicio = inicioSemana(hoy);

            const fin = new Date(inicio);

            fin.setDate(fin.getDate() + 7);

            return fecha >= inicio && fecha < fin;
        }

        if (filtro === "mes") {

            return (
                fecha.getFullYear() === hoy.getFullYear() &&
                fecha.getMonth() === hoy.getMonth()
            );
        }

        return true;
    }


    // =====================================================
    // DATOS INICIALES
    // =====================================================

    function obtenerDatosIniciales() {

        return [...laboresList.querySelectorAll(".labor-item")]
            .map((elemento, index) => {

                const texto = (selector) =>
                    elemento.querySelector(selector)?.textContent.trim() || "";

                return {

                    id: `inicial-${index + 1}`,

                    titulo: texto(".labor-main h4"),

                    tipo: elemento.dataset.tipo || "mantenimiento",

                    cultivo: elemento.dataset.cultivo || "",

                    estado: elemento.dataset.estado || "pendiente",

                    fecha: elemento.dataset.fecha || fechaLocal(),

                    descripcion: texto(".labor-description"),

                    finca: elemento.querySelectorAll(".labor-meta span")[1]
                        ?.textContent.trim() || "",

                    responsable: elemento.querySelectorAll(".labor-meta span")[3]
                        ?.textContent.trim() || "Usuario"

                };

            });

    }


    function cargarLabores() {

        try {

            const guardadas = localStorage.getItem(STORAGE_KEY);

            if (guardadas !== null) {

                const datos = JSON.parse(guardadas);

                if (Array.isArray(datos)) return datos;
            }

        } catch (error) {

            console.error("Error cargando labores:", error);

        }

        return obtenerDatosIniciales();
    }


    let labores = cargarLabores();

    let laborEditando = null;


    function guardarLabores() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(labores)
            );

        } catch (error) {

            console.error("No se pudieron guardar las labores:", error);

            mostrarToast(
                "No se pudieron guardar los cambios.",
                "error"
            );

        }
    }


    // =====================================================
    // NOTIFICACIONES
    // =====================================================

    function mostrarToast(mensaje, tipo = "normal") {

        document.querySelector(".labores-toast")?.remove();

        const toast = document.createElement("div");

        toast.className = `labores-toast ${tipo}`;

        const icono = document.createElement("i");

        icono.className = tipo === "error"
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-circle-check";

        const texto = document.createElement("span");

        texto.textContent = mensaje;

        toast.append(icono, texto);

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
    // MODAL DE NUEVA LABOR
    // =====================================================

    function crearModal() {

        if ($("modalNuevaLabor")) return;

        const overlay = document.createElement("div");

        overlay.id = "modalNuevaLabor";
        overlay.className = "labor-modal-overlay";

        overlay.innerHTML = `
            <div class="labor-modal" role="dialog"
                 aria-modal="true"
                 aria-labelledby="tituloModalLabor">

                <div class="labor-modal-header">

                    <div>
                        <h2 id="tituloModalLabor">Nueva labor</h2>
                        <p>Registra una actividad de tu finca.</p>
                    </div>

                    <button type="button"
                            class="labor-modal-close"
                            id="cerrarModalLabor"
                            aria-label="Cerrar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                </div>

                <form id="formNuevaLabor">

                    <div class="labor-form-grid">

                        <div class="labor-form-group full">
                            <label for="laborTitulo">Nombre de la actividad *</label>
                            <input type="text"
                                   id="laborTitulo"
                                   maxlength="100"
                                   placeholder="Ej. Fertilización de tomate"
                                   required>
                        </div>

                        <div class="labor-form-group">
                            <label for="laborTipo">Tipo de labor *</label>
                            <select id="laborTipo" required>
                                <option value="">Seleccionar</option>
                                ${Object.entries(TIPOS).map(([valor, tipo]) =>
                                    `<option value="${valor}">${tipo.nombre}</option>`
                                ).join("")}
                            </select>
                        </div>

                        <div class="labor-form-group">
                            <label for="laborCultivo">Cultivo *</label>
                            <select id="laborCultivo" required>
                                <option value="">Seleccionar</option>
                                <option value="brocoli">Brócoli</option>
                                <option value="tomate">Tomate</option>
                                <option value="limon">Limón</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div class="labor-form-group">
                            <label for="laborFecha">Fecha *</label>
                            <input type="date"
                                   id="laborFecha"
                                   required>
                        </div>

                        <div class="labor-form-group">
                            <label for="laborEstado">Estado *</label>
                            <select id="laborEstado" required>
                                <option value="pendiente">Pendiente</option>
                                <option value="completada">Completada</option>
                            </select>
                        </div>

                        <div class="labor-form-group full">
                            <label for="laborFinca">Finca</label>
                            <input type="text"
                                   id="laborFinca"
                                   maxlength="100"
                                   placeholder="Nombre de la finca">
                        </div>

                        <div class="labor-form-group full">
                            <label for="laborDescripcion">Descripción</label>
                            <textarea id="laborDescripcion"
                                      rows="3"
                                      maxlength="500"
                                      placeholder="Describe brevemente la actividad..."></textarea>
                        </div>

                    </div>

                    <div class="labor-modal-actions">

                        <button type="button"
                                class="labor-btn-cancelar"
                                id="cancelarModalLabor">
                            Cancelar
                        </button>

                        <button type="submit"
                                class="labor-btn-guardar">
                            <i class="fa-solid fa-floppy-disk"></i>
                            Guardar labor
                        </button>

                    </div>

                </form>

            </div>
        `;

        document.body.appendChild(overlay);


        $("cerrarModalLabor").addEventListener("click", cerrarModal);

        $("cancelarModalLabor").addEventListener("click", cerrarModal);

        $("formNuevaLabor").addEventListener("submit", guardarLabor);

        overlay.addEventListener("click", (event) => {

            if (event.target === overlay) cerrarModal();

        });

    }


    function abrirModal(labor = null) {

        crearModal();

        laborEditando = labor ? labor.id : null;

        $("formNuevaLabor").reset();

        $("tituloModalLabor").textContent = labor
            ? "Editar labor"
            : "Nueva labor";

        $("laborFecha").value = fechaLocal();

        if (labor) {

            $("laborTitulo").value = labor.titulo;
            $("laborTipo").value = labor.tipo;
            $("laborCultivo").value = labor.cultivo;
            $("laborFecha").value = labor.fecha;
            $("laborEstado").value = labor.estado;
            $("laborFinca").value = labor.finca;
            $("laborDescripcion").value = labor.descripcion;

        }

        $("modalNuevaLabor").classList.add("visible");

        setTimeout(() => $("laborTitulo").focus(), 100);

    }


    function cerrarModal() {

        $("modalNuevaLabor")?.classList.remove("visible");

        laborEditando = null;

    }


    // =====================================================
    // GUARDAR LABOR
    // =====================================================

    function guardarLabor(event) {

        event.preventDefault();

        const nueva = {

            id: laborEditando || `labor-${Date.now()}`,

            titulo: $("laborTitulo").value.trim(),

            tipo: $("laborTipo").value,

            cultivo: $("laborCultivo").value,

            fecha: $("laborFecha").value,

            estado: $("laborEstado").value,

            finca: $("laborFinca").value.trim() || "Sin finca",

            descripcion: $("laborDescripcion").value.trim(),

            responsable: "Usuario"

        };


        if (
            !nueva.titulo ||
            !nueva.tipo ||
            !nueva.cultivo ||
            !nueva.fecha
        ) {

            mostrarToast("Completa los campos obligatorios.", "error");

            return;
        }


        if (laborEditando) {

            const indice = labores.findIndex(
                labor => labor.id === laborEditando
            );

            if (indice !== -1) {

                nueva.responsable = labores[indice].responsable;

                labores[indice] = nueva;

            }

            mostrarToast("Labor actualizada correctamente.");

        } else {

            labores.unshift(nueva);

            mostrarToast("Nueva labor registrada correctamente.");

        }


        guardarLabores();

        renderizarLabores();

        cerrarModal();

    }


    // =====================================================
    // CREAR TARJETA
    // =====================================================

    function crearTarjeta(labor) {

        const tipo = TIPOS[labor.tipo] || TIPOS.mantenimiento;

        const articulo = document.createElement("article");

        articulo.className = "labor-item";

        articulo.dataset.tipo = labor.tipo;
        articulo.dataset.cultivo = labor.cultivo;
        articulo.dataset.estado = labor.estado;
        articulo.dataset.fecha = labor.fecha;


        const icono = document.createElement("div");

        icono.className = `labor-icon ${tipo.clase}`;

        icono.innerHTML = `<i class="fa-solid ${tipo.icono}"></i>`;


        const contenido = document.createElement("div");

        contenido.className = "labor-content";


        const principal = document.createElement("div");

        principal.className = "labor-main";


        const titulo = document.createElement("div");

        const categoria = document.createElement("span");

        categoria.className = "labor-type";
        categoria.textContent = tipo.nombre;


        const nombre = document.createElement("h4");

        nombre.textContent = labor.titulo;


        titulo.append(categoria, nombre);


        const estado = document.createElement("span");

        estado.className = labor.estado === "completada"
            ? "labor-status status-completada"
            : "labor-status status-pendiente";

        estado.textContent = labor.estado === "completada"
            ? "Completada"
            : "Pendiente";


        principal.append(titulo, estado);


        const descripcion = document.createElement("p");

        descripcion.className = "labor-description";

        descripcion.textContent = labor.descripcion || "Sin descripción.";


        const meta = document.createElement("div");

        meta.className = "labor-meta";


        const cultivoNombre = {
            brocoli: "Brócoli",
            tomate: "Tomate",
            limon: "Limón",
            otro: "Otro"
        }[labor.cultivo] || labor.cultivo;


        const datosMeta = [
            ["fa-seedling", cultivoNombre],
            ["fa-mountain-sun", labor.finca || "Sin finca"],
            ["fa-calendar", formatearFecha(labor.fecha)],
            ["fa-user", labor.responsable || "Usuario"]
        ];


        datosMeta.forEach(([iconoMeta, textoMeta]) => {

            const elemento = document.createElement("span");

            elemento.innerHTML = `<i class="fa-solid ${iconoMeta}"></i>`;

            elemento.appendChild(
                document.createTextNode(" " + textoMeta)
            );

            meta.appendChild(elemento);

        });


        const acciones = document.createElement("div");

        acciones.className = "labor-actions";


        const editar = document.createElement("button");

        editar.type = "button";
        editar.className = "labor-action-btn editar";

        editar.innerHTML = '<i class="fa-solid fa-pen"></i> Editar';

        editar.addEventListener("click", () => abrirModal(labor));


        const eliminar = document.createElement("button");

        eliminar.type = "button";
        eliminar.className = "labor-action-btn eliminar";

        eliminar.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar';

        eliminar.addEventListener("click", () => eliminarLabor(labor.id));


        acciones.append(editar, eliminar);

        contenido.append(principal, descripcion, meta, acciones);

        articulo.append(icono, contenido);

        return articulo;

    }


    // =====================================================
    // RENDERIZAR LABORES
    // =====================================================

    function renderizarLabores() {

        laboresList.innerHTML = "";

        labores.forEach(labor => {

            laboresList.appendChild(crearTarjeta(labor));

        });

        actualizarEstadisticas();

        filtrarLabores();

    }


    // =====================================================
    // ELIMINAR LABOR
    // =====================================================

    function eliminarLabor(id) {

        const confirmar = confirm(
            "¿Estás seguro de que deseas eliminar esta labor?"
        );

        if (!confirmar) return;

        labores = labores.filter(labor => labor.id !== id);

        guardarLabores();

        renderizarLabores();

        mostrarToast("Labor eliminada correctamente.");

    }


    // =====================================================
    // FILTROS
    // =====================================================

    function filtrarLabores() {

        const tipo = filtroTipo.value;
        const cultivo = filtroCultivo.value;
        const estado = filtroEstado.value;
        const fecha = filtroFecha.value;

        let visibles = 0;


        document.querySelectorAll(".labor-item").forEach(elemento => {

            const coincideTipo =
                tipo === "todos" || elemento.dataset.tipo === tipo;

            const coincideCultivo =
                cultivo === "todos" || elemento.dataset.cultivo === cultivo;

            const coincideEstado =
                estado === "todos" || elemento.dataset.estado === estado;

            const coincideFechaFiltro =
                coincideFecha(elemento.dataset.fecha, fecha);


            const mostrar =
                coincideTipo &&
                coincideCultivo &&
                coincideEstado &&
                coincideFechaFiltro;


            elemento.style.display = mostrar ? "flex" : "none";

            if (mostrar) visibles++;

        });


        contadorLabores.textContent =
            `${visibles} ${visibles === 1 ? "labor encontrada" : "labores encontradas"}`;


        laboresVacio.style.display = visibles === 0 ? "flex" : "none";

    }


    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    function actualizarEstadisticas() {

        const total = labores.length;

        const completadas = labores.filter(
            labor => labor.estado === "completada"
        ).length;

        const pendientes = labores.filter(
            labor => labor.estado === "pendiente"
        ).length;

        const semana = labores.filter(
            labor => coincideFecha(labor.fecha, "semana")
        ).length;


        totalLabores.textContent = total;

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

        mostrarToast("Filtros limpiados.");

    }


    // =====================================================
    // ACTUALIZAR LISTA
    // =====================================================

    function actualizarLista() {

        laboresList.classList.add("labores-refreshing");

        setTimeout(() => {

            renderizarLabores();

            laboresList.classList.remove("labores-refreshing");

            mostrarToast("Lista actualizada.");

        }, 350);

    }


    // =====================================================
    // EVENTOS
    // =====================================================

    filtroTipo.addEventListener("change", filtrarLabores);

    filtroCultivo.addEventListener("change", filtrarLabores);

    filtroEstado.addEventListener("change", filtrarLabores);

    filtroFecha.addEventListener("change", filtrarLabores);

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
        () => abrirModal()
    );


    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            $("modalNuevaLabor")?.classList.contains("visible")
        ) {
            cerrarModal();
        }

    });


    // =====================================================
    // INICIALIZACIÓN
    // =====================================================

    crearModal();

    renderizarLabores();

});