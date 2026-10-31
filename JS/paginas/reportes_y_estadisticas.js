/* =========================================================
   HARVESTX — REPORTES Y ESTADÍSTICAS
   Datos desde Flask + MySQL.
   Generación de reportes PDF con jsPDF.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const API = "http://127.0.0.1:5000";
    const $ = id => document.getElementById(id);

    const elementos = {
        fecha: $("fechaActual"),
        cultivos: $("totalCultivos"),
        produccion: $("produccionTotal"),
        agua: $("consumoAgua"),
        fincas: $("totalFincas"),

        periodoAgua: $("waterPeriod"),

        tipo: $("reportType"),
        periodo: $("reportPeriod"),
        cultivo: $("reportCrop"),
        finca: $("reportFarm"),

        fechas: $("customDateFields"),
        inicio: $("startDate"),
        fin: $("endDate"),

        generar: $("generateReport"),
        imprimir: $("printReport"),
        descargar: $("downloadLastReport"),

        nombreReporte: $("lastReportName"),
        fechaReporte: $("lastReportDate"),

        graficoCultivos: $("productionChart"),
        graficoDistribucion: $("distributionChart"),
        graficoAgua: $("waterChart"),
        graficoActividad: $("activityChart")
    };

    const datos = {
        usuarioId: null,
        usuario: {},
        cultivos: [],
        fincas: [],
        riegos: [],
        ultimoReporte: null,
        pdfBlob: null,
        pdfNombre: null
    };

    /* =====================================================
       USUARIO
       ===================================================== */

    function obtenerUsuario() {
        try {
            const usuario = JSON.parse(
                localStorage.getItem("usuarioHarvestX")
            );

            const id = Number(usuario?.id || usuario?.usuario_id);

            if (!Number.isFinite(id) || id <= 0) {
                return null;
            }

            datos.usuario = usuario;

            return id;
        } catch {
            return null;
        }
    }

    /* =====================================================
       API
       ===================================================== */

    async function consultarAPI(ruta) {
        const respuesta = await fetch(`${API}${ruta}`);

        let resultado;

        try {
            resultado = await respuesta.json();
        } catch {
            throw new Error("El servidor devolvió una respuesta inválida.");
        }

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                `Error HTTP ${respuesta.status}`
            );
        }

        return resultado;
    }

    async function cargarDatos() {
        datos.usuarioId = obtenerUsuario();

        if (!datos.usuarioId) {
            throw new Error(
                "No se encontró el usuario. Inicia sesión nuevamente."
            );
        }

        const id = encodeURIComponent(datos.usuarioId);

        const [cultivos, fincas, riegos] = await Promise.all([
            consultarAPI(`/cultivos?usuario_id=${id}`),
            consultarAPI(`/fincas?usuario_id=${id}`),
            consultarAPI(`/api/riego/historial?usuario_id=${id}`)
        ]);

        datos.cultivos = Array.isArray(cultivos)
            ? cultivos
            : [];

        datos.fincas = Array.isArray(fincas.fincas)
            ? fincas.fincas
            : [];

        datos.riegos = Array.isArray(riegos.historial)
            ? riegos.historial
            : [];

        cargarFiltros();
        actualizarResumen();
        actualizarGraficoCultivos();
        actualizarDistribucion();
        actualizarGraficoAgua();
        actualizarActividad();
    }

    /* =====================================================
       UTILIDADES
       ===================================================== */

    function numero(valor) {
        const resultado = Number(valor);

        return Number.isFinite(resultado) ? resultado : 0;
    }

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

    function convertirFecha(valor) {
        if (!valor) return null;

        const texto = String(valor);

        const soloFecha = texto.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        if (soloFecha) {
            return new Date(
                Number(soloFecha[1]),
                Number(soloFecha[2]) - 1,
                Number(soloFecha[3])
            );
        }

        const fecha = new Date(texto.replace(" ", "T"));

        return Number.isNaN(fecha.getTime())
            ? null
            : fecha;
    }

    function obtenerFechaInput(fecha) {
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    function fechaLegible(valor) {
        const fecha = convertirFecha(valor);

        return fecha
            ? fecha.toLocaleDateString("es-GT")
            : "No disponible";
    }

    function mostrarMensaje(texto, tipo = "success") {
        document.querySelector(".report-toast")?.remove();

        const toast = document.createElement("div");

        toast.className = `report-toast ${tipo}`;

        const icono = document.createElement("i");

        icono.className = tipo === "warning"
            ? "fas fa-triangle-exclamation"
            : tipo === "error"
                ? "fas fa-circle-exclamation"
                : "fas fa-circle-check";

        const mensaje = document.createElement("span");
        mensaje.textContent = texto;

        toast.append(icono, mensaje);
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("hide");

            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function mostrarVacio(contenedor, mensaje) {
        if (!contenedor) return;

        contenedor.innerHTML = "";

        const elemento = document.createElement("div");
        elemento.className = "chart-empty";
        elemento.textContent = mensaje;

        contenedor.appendChild(elemento);
    }

    /* =====================================================
       FECHA ACTUAL
       ===================================================== */

    function actualizarFecha() {
        if (!elementos.fecha) return;

        const texto = new Date().toLocaleDateString(
            "es-GT",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

        elementos.fecha.textContent =
            texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    /* =====================================================
       RESUMEN
       ===================================================== */

    function actualizarResumen() {
        const activos = datos.cultivos.filter(c =>
            String(c.estado || "").toLowerCase() === "activo"
        ).length;

        const agua = datos.riegos.reduce(
            (total, registro) =>
                total + Math.max(0, numero(registro.agua_utilizada)),
            0
        );

        if (elementos.cultivos) {
            elementos.cultivos.textContent =
                activos.toLocaleString("es-GT");
        }

        if (elementos.produccion) {
            elementos.produccion.textContent = "No disponible";
        }

        if (elementos.agua) {
            elementos.agua.textContent =
                `${agua.toLocaleString("es-GT", {
                    maximumFractionDigits: 2
                })} L`;
        }

        if (elementos.fincas) {
            elementos.fincas.textContent =
                datos.fincas.length.toLocaleString("es-GT");
        }
    }

    /* =====================================================
       GRÁFICOS DE BARRAS
       ===================================================== */

    function crearGraficoBarras(contenedor, registros, unidad = "") {
        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (
            !registros.length ||
            registros.every(r => r.valor <= 0)
        ) {
            mostrarVacio(
                contenedor,
                "Todavía no hay registros disponibles."
            );

            return;
        }

        const maximo = Math.max(
            ...registros.map(r => r.valor),
            1
        );

        const grafico = document.createElement("div");
        grafico.className = "simple-bar-chart";

        registros.forEach(registro => {
            const columna = document.createElement("div");
            columna.className = "bar-column";

            const valor = document.createElement("span");
            valor.className = "bar-value";
            valor.textContent =
                `${registro.valor.toLocaleString("es-GT")}${unidad}`;

            const area = document.createElement("div");
            area.className = "bar-area";

            const barra = document.createElement("div");
            barra.className = "chart-bar";

            barra.style.height =
                `${Math.max((registro.valor / maximo) * 100, 3)}%`;

            area.appendChild(barra);

            const etiqueta = document.createElement("span");
            etiqueta.className = "bar-label";
            etiqueta.textContent = registro.nombre;

            columna.append(valor, area, etiqueta);
            grafico.appendChild(columna);
        });

        contenedor.appendChild(grafico);
    }

    /* =====================================================
       CULTIVOS POR TIPO
       ===================================================== */

    function actualizarGraficoCultivos() {
        const agrupados = {};

        datos.cultivos.forEach(cultivo => {
            const tipo = cultivo.tipo || "Sin tipo";
            agrupados[tipo] = (agrupados[tipo] || 0) + 1;
        });

        const registros = Object.entries(agrupados)
            .map(([nombre, valor]) => ({ nombre, valor }))
            .sort((a, b) => b.valor - a.valor);

        crearGraficoBarras(
            elementos.graficoCultivos,
            registros
        );
    }

    /* =====================================================
       DISTRIBUCIÓN
       ===================================================== */

    function actualizarDistribucion() {
        const contenedor = elementos.graficoDistribucion;

        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (!datos.cultivos.length) {
            mostrarVacio(
                contenedor,
                "Todavía no hay cultivos registrados."
            );
            return;
        }

        const agrupados = {};

        datos.cultivos.forEach(cultivo => {
            const nombre = cultivo.nombre || "Sin nombre";
            agrupados[nombre] = (agrupados[nombre] || 0) + 1;
        });

        const registros = Object.entries(agrupados)
            .sort((a, b) => b[1] - a[1]);

        const colores = [
            "#43a047",
            "#2196f3",
            "#ffc107",
            "#7e57c2",
            "#ef6c5b",
            "#26a69a"
        ];

        const total = datos.cultivos.length;
        let acumulado = 0;

        const segmentos = registros.map(
            ([nombre, cantidad], indice) => {
                const inicio = acumulado;
                acumulado += cantidad / total * 100;

                return `${colores[indice % colores.length]} ${inicio}% ${acumulado}%`;
            }
        );

        const wrapper = document.createElement("div");
        wrapper.className = "distribution-wrapper";

        const circulo = document.createElement("div");
        circulo.className = "distribution-circle";
        circulo.style.background =
            `conic-gradient(${segmentos.join(",")})`;

        const centro = document.createElement("div");
        centro.className = "distribution-center";

        centro.innerHTML = `
            <strong>${total}</strong>
            <span>Cultivos</span>
        `;

        circulo.appendChild(centro);

        const lista = document.createElement("div");
        lista.className = "distribution-list";

        registros.slice(0, 6).forEach(
            ([nombre, cantidad], indice) => {
                const item = document.createElement("div");
                item.className = "distribution-item";

                const info = document.createElement("div");
                info.className = "distribution-info";

                const punto = document.createElement("span");
                punto.className = "distribution-dot";
                punto.style.background =
                    colores[indice % colores.length];

                const texto = document.createElement("span");
                texto.textContent = nombre;

                info.append(punto, texto);

                const porcentaje = document.createElement("strong");
                porcentaje.textContent =
                    `${Math.round(cantidad / total * 100)}%`;

                item.append(info, porcentaje);
                lista.appendChild(item);
            }
        );

        wrapper.append(circulo, lista);
        contenedor.appendChild(wrapper);
    }

    /* =====================================================
       CONSUMO DE AGUA
       ===================================================== */

    function obtenerInicioPeriodo(periodo) {
        const hoy = new Date();

        const inicio = new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            hoy.getDate()
        );

        if (periodo === "week") {
            inicio.setDate(inicio.getDate() - 6);
        }

        if (periodo === "month") {
            inicio.setDate(inicio.getDate() - 29);
        }

        if (periodo === "year") {
            inicio.setDate(inicio.getDate() - 364);
        }

        return inicio;
    }

    function actualizarGraficoAgua() {
        const periodo = elementos.periodoAgua?.value || "week";
        const inicio = obtenerInicioPeriodo(periodo);
        const grupos = {};

        datos.riegos.forEach(registro => {
            const fecha = convertirFecha(registro.fecha_riego);

            if (!fecha || fecha < inicio) return;

            let clave;
            let etiqueta;

            if (periodo === "year") {
                clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;

                etiqueta = fecha.toLocaleDateString(
                    "es-GT",
                    { month: "short" }
                );
            } else {
                clave = obtenerFechaInput(fecha);

                etiqueta = fecha.toLocaleDateString(
                    "es-GT",
                    {
                        day: "numeric",
                        month: "short"
                    }
                );
            }

            if (!grupos[clave]) {
                grupos[clave] = {
                    nombre: etiqueta,
                    valor: 0
                };
            }

            grupos[clave].valor += Math.max(
                0,
                numero(registro.agua_utilizada)
            );
        });

        const registros = Object.keys(grupos)
            .sort()
            .map(clave => grupos[clave]);

        crearGraficoBarras(
            elementos.graficoAgua,
            registros,
            " L"
        );
    }

    /* =====================================================
       ACTIVIDAD
       ===================================================== */

    function actualizarActividad() {
        const contenedor = elementos.graficoActividad;

        if (!contenedor) return;

        contenedor.innerHTML = "";

        const agrupados = {};

        datos.riegos.forEach(registro => {
            const estado = registro.estado || "Sin estado";
            agrupados[estado] = (agrupados[estado] || 0) + 1;
        });

        const registros = Object.entries(agrupados)
            .sort((a, b) => b[1] - a[1]);

        if (!registros.length) {
            mostrarVacio(
                contenedor,
                "No hay registros en el historial de riego."
            );
            return;
        }

        const maximo = Math.max(
            ...registros.map(r => r[1]),
            1
        );

        const lista = document.createElement("div");
        lista.className = "activity-list";

        registros.forEach(([estado, cantidad]) => {
            const item = document.createElement("div");
            item.className = "activity-item";

            item.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-droplet"></i>
                </div>

                <div class="activity-info">
                    <span></span>
                    <div class="activity-progress">
                        <div class="activity-progress-bar"></div>
                    </div>
                </div>

                <strong>${cantidad}</strong>
            `;

            item.querySelector(".activity-info span").textContent =
                `Riegos: ${estado}`;

            item.querySelector(
                ".activity-progress-bar"
            ).style.width = `${cantidad / maximo * 100}%`;

            lista.appendChild(item);
        });

        contenedor.appendChild(lista);
    }

    /* =====================================================
       FILTROS
       ===================================================== */

    function cargarOpciones(select, registros, textoTodos) {
        if (!select) return;

        const valorAnterior = select.value;

        select.innerHTML = "";

        const opcion = document.createElement("option");
        opcion.value = "all";
        opcion.textContent = textoTodos;

        select.appendChild(opcion);

        registros.forEach(registro => {
            const option = document.createElement("option");

            option.value = String(registro.id);
            option.textContent = registro.nombre || "Sin nombre";

            select.appendChild(option);
        });

        if (
            [...select.options].some(
                option => option.value === valorAnterior
            )
        ) {
            select.value = valorAnterior;
        }
    }

    function cargarFiltros() {
        cargarOpciones(
            elementos.cultivo,
            datos.cultivos,
            "Todos los cultivos"
        );

        cargarOpciones(
            elementos.finca,
            datos.fincas,
            "Todas las fincas"
        );
    }

    /* =====================================================
       FECHAS PERSONALIZADAS
       ===================================================== */

    function controlarFechas() {
        if (!elementos.periodo || !elementos.fechas) return;

        const personalizado =
            elementos.periodo.value === "custom";

        elementos.fechas.hidden = !personalizado;

        if (personalizado) {
            const hoy = new Date();

            if (!elementos.inicio.value) {
                const inicio = new Date(hoy);
                inicio.setDate(inicio.getDate() - 6);

                elementos.inicio.value =
                    obtenerFechaInput(inicio);
            }

            if (!elementos.fin.value) {
                elementos.fin.value =
                    obtenerFechaInput(hoy);
            }
        }
    }

    function validarFechas() {
        if (elementos.periodo.value !== "custom") {
            return true;
        }

        if (!elementos.inicio.value || !elementos.fin.value) {
            mostrarMensaje("Selecciona ambas fechas.", "warning");
            return false;
        }

        if (elementos.inicio.value > elementos.fin.value) {
            mostrarMensaje(
                "La fecha inicial no puede ser posterior a la final.",
                "warning"
            );
            return false;
        }

        return true;
    }

    /* =====================================================
       FILTRAR DATOS
       ===================================================== */

    function obtenerRangoFechas() {
        let inicio;
        let fin = new Date();

        if (elementos.periodo.value === "custom") {
            inicio = convertirFecha(elementos.inicio.value);
            fin = convertirFecha(elementos.fin.value);

            if (fin) {
                fin.setHours(23, 59, 59, 999);
            }
        } else {
            inicio = obtenerInicioPeriodo(elementos.periodo.value);
        }

        return { inicio, fin };
    }

    function filtrarRiegos() {
        const { inicio, fin } = obtenerRangoFechas();

        let registros = [...datos.riegos];

        registros = registros.filter(registro => {
            const fecha = convertirFecha(registro.fecha_riego);

            if (!fecha) return false;

            return (
                (!inicio || fecha >= inicio) &&
                (!fin || fecha <= fin)
            );
        });

        if (elementos.cultivo.value !== "all") {
            registros = registros.filter(
                registro =>
                    String(registro.cultivo_id) ===
                    elementos.cultivo.value
            );
        }

        if (elementos.finca.value !== "all") {
            registros = registros.filter(registro => {
                const cultivo = datos.cultivos.find(
                    c => Number(c.id) === Number(registro.cultivo_id)
                );

                return cultivo &&
                    String(cultivo.finca_id) === elementos.finca.value;
            });
        }

        return registros;
    }

    function filtrarCultivos() {
        let registros = [...datos.cultivos];

        if (elementos.cultivo.value !== "all") {
            registros = registros.filter(
                c => String(c.id) === elementos.cultivo.value
            );
        }

        if (elementos.finca.value !== "all") {
            registros = registros.filter(
                c => String(c.finca_id || "") === elementos.finca.value
            );
        }

        return registros;
    }

    function filtrarFincas() {
        let registros = [...datos.fincas];

        if (elementos.finca.value !== "all") {
            registros = registros.filter(
                f => String(f.id) === elementos.finca.value
            );
        }

        return registros;
    }

    /* =====================================================
       PREPARAR REPORTE
       ===================================================== */

    function obtenerNombreReporte() {
        const tipo = elementos.tipo.selectedOptions[0].textContent;
        const periodo = elementos.periodo.selectedOptions[0].textContent;

        return `HarvestX - ${tipo} - ${periodo}`;
    }

    function prepararReporte() {
        if (!validarFechas()) return false;

        if (!datos.usuarioId) {
            mostrarMensaje(
                "No hay una sesión de usuario válida.",
                "error"
            );
            return false;
        }

        const tipo = elementos.tipo.value;

        datos.ultimoReporte = {
            nombre: obtenerNombreReporte(),
            tipo,
            periodo: elementos.periodo.selectedOptions[0].textContent,
            fechaGeneracion: new Date(),
            fechaInicio: elementos.periodo.value === "custom"
                ? elementos.inicio.value
                : obtenerFechaInput(obtenerInicioPeriodo(elementos.periodo.value)),
            fechaFin: elementos.periodo.value === "custom"
                ? elementos.fin.value
                : obtenerFechaInput(new Date()),
            cultivos: filtrarCultivos(),
            fincas: filtrarFincas(),
            riegos: filtrarRiegos()
        };

        elementos.nombreReporte.textContent =
            datos.ultimoReporte.nombre;

        elementos.fechaReporte.textContent =
            `Generado el ${new Date().toLocaleString("es-GT")}`;

        return true;
    }

    /* =====================================================
       CREACIÓN DE PDF
       ===================================================== */

    function comprobarBibliotecasPDF() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error(
                "No se pudo cargar jsPDF. Comprueba tu conexión a internet."
            );
        }

        if (typeof window.html2canvas !== "function") {
            throw new Error(
                "No se pudo cargar html2canvas para capturar los gráficos."
            );
        }
    }

    function agregarEncabezadoPDF(doc, reporte) {
        const ancho = doc.internal.pageSize.getWidth();

        doc.setFillColor(29, 79, 55);
        doc.rect(0, 0, ancho, 36, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);

        doc.text("HarvestX", 15, 17);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        doc.text(
            "Sistema Inteligente de Gestión Agrícola",
            15,
            25
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);

        doc.text(
            "REPORTE Y ESTADÍSTICAS",
            ancho - 15,
            17,
            { align: "right" }
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
            "Documento generado desde HarvestX",
            ancho - 15,
            25,
            { align: "right" }
        );

        doc.setTextColor(35, 60, 48);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);

        doc.text(reporte.nombre, 15, 47);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        doc.text(
            `Período: ${reporte.periodo}`,
            15,
            55
        );

        doc.text(
            `Desde: ${fechaLegible(reporte.fechaInicio)}   Hasta: ${fechaLegible(reporte.fechaFin)}`,
            15,
            62
        );

        doc.text(
            `Generado: ${reporte.fechaGeneracion.toLocaleString("es-GT")}`,
            15,
            69
        );

        doc.setDrawColor(210, 225, 215);
        doc.line(15, 75, ancho - 15, 75);
    }

    function agregarPiePagina(doc) {
        const paginas = doc.internal.getNumberOfPages();

        for (let pagina = 1; pagina <= paginas; pagina++) {
            doc.setPage(pagina);

            const ancho = doc.internal.pageSize.getWidth();
            const alto = doc.internal.pageSize.getHeight();

            doc.setDrawColor(210, 225, 215);
            doc.line(15, alto - 15, ancho - 15, alto - 15);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(110, 125, 115);

            doc.text(
                "HarvestX | Reportes y Estadísticas",
                15,
                alto - 9
            );

            doc.text(
                `Página ${pagina} de ${paginas}`,
                ancho - 15,
                alto - 9,
                { align: "right" }
            );
        }
    }

    function agregarTabla(doc, titulo, columnas, filas, y) {
        const ancho = doc.internal.pageSize.getWidth();

        if (y > 250) {
            doc.addPage();
            y = 25;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(29, 79, 55);

        doc.text(titulo, 15, y);

        doc.autoTable({
            startY: y + 5,
            head: [columnas],
            body: filas.length
                ? filas
                : [["No hay registros disponibles.", ...Array(Math.max(0, columnas.length - 1)).fill("")]],
            theme: "grid",
            margin: {
                left: 15,
                right: 15
            },
            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 3,
                overflow: "linebreak",
                textColor: [45, 60, 50],
                lineColor: [220, 230, 220]
            },
            headStyles: {
                fillColor: [29, 79, 55],
                textColor: [255, 255, 255],
                fontStyle: "bold"
            },
            alternateRowStyles: {
                fillColor: [242, 249, 239]
            }
        });

        return doc.lastAutoTable.finalY + 14;
    }

    function agregarResumen(doc, reporte, y) {
        const ancho = doc.internal.pageSize.getWidth();

        const totalAgua = reporte.riegos.reduce(
            (total, r) =>
                total + Math.max(0, numero(r.agua_utilizada)),
            0
        );

        const activos = reporte.cultivos.filter(
            c => String(c.estado || "").toLowerCase() === "activo"
        ).length;

        const tarjetas = [
            {
                titulo: "Cultivos",
                valor: reporte.cultivos.length
            },
            {
                titulo: "Cultivos activos",
                valor: activos
            },
            {
                titulo: "Fincas",
                valor: reporte.fincas.length
            },
            {
                titulo: "Registros de riego",
                valor: reporte.riegos.length
            },
            {
                titulo: "Agua utilizada",
                valor: `${totalAgua.toLocaleString("es-GT")} L`
            }
        ];

        const espacio = (ancho - 30) / tarjetas.length;

        tarjetas.forEach((tarjeta, indice) => {
            const x = 15 + indice * espacio;

            doc.setFillColor(242, 249, 239);
            doc.roundedRect(
                x,
                y,
                espacio - 3,
                24,
                2,
                2,
                "F"
            );

            doc.setTextColor(80, 105, 85);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);

            doc.text(
                tarjeta.titulo,
                x + 3,
                y + 8
            );

            doc.setTextColor(29, 79, 55);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);

            doc.text(
                String(tarjeta.valor),
                x + 3,
                y + 18
            );
        });

        return y + 34;
    }

    async function agregarGraficosPDF(doc, reporte, y) {
        const graficos = [
            {
                id: "distributionChart",
                titulo: "Distribución de cultivos"
            },
            {
                id: "productionChart",
                titulo: "Cultivos por tipo"
            },
            {
                id: "waterChart",
                titulo: "Consumo de agua"
            },
            {
                id: "activityChart",
                titulo: "Actividad de riego"
            }
        ];

        for (const grafico of graficos) {
            const elemento = $(grafico.id);

            if (!elemento || !elemento.children.length) continue;

            if (
                elemento.querySelector(".chart-empty") ||
                elemento.textContent.trim().length === 0
            ) {
                continue;
            }

            try {
                const canvas = await html2canvas(elemento, {
                    scale: 1.5,
                    backgroundColor: "#FFFFFF",
                    useCORS: true,
                    logging: false
                });

                const imagen = canvas.toDataURL("image/png");

                const anchoPagina = doc.internal.pageSize.getWidth();
                const anchoImagen = anchoPagina - 30;

                const altoImagen = Math.min(
                    canvas.height * anchoImagen / canvas.width,
                    85
                );

                if (y + altoImagen + 15 > 270) {
                    doc.addPage();
                    y = 25;
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(29, 79, 55);

                doc.text(grafico.titulo, 15, y);

                y += 5;

                doc.addImage(
                    imagen,
                    "PNG",
                    15,
                    y,
                    anchoImagen,
                    altoImagen
                );

                y += altoImagen + 12;

            } catch (error) {
                console.warn(
                    `No se pudo capturar el gráfico ${grafico.id}:`,
                    error
                );
            }
        }

        return y;
    }

    async function crearPDF(reporte) {
        comprobarBibliotecasPDF();

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true
        });

        agregarEncabezadoPDF(doc, reporte);

        let y = 84;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(29, 79, 55);

        doc.text("Resumen general", 15, y);

        y += 7;

        y = agregarResumen(doc, reporte, y);

        const tipo = reporte.tipo;

        if (tipo === "general" || tipo === "cultivos") {
            const filas = reporte.cultivos.map(cultivo => {
                const finca = datos.fincas.find(
                    f => Number(f.id) === Number(cultivo.finca_id)
                );

                return [
                    cultivo.id ?? "",
                    cultivo.nombre || "Sin nombre",
                    cultivo.tipo || "Sin tipo",
                    cultivo.estado || "Sin estado",
                    cultivo.agua || "No especificado",
                    cultivo.cosecha || "No especificada",
                    finca?.nombre || "Sin finca"
                ];
            });

            y = agregarTabla(
                doc,
                "Detalle de cultivos",
                [
                    "ID",
                    "Nombre",
                    "Tipo",
                    "Estado",
                    "Agua",
                    "Cosecha",
                    "Finca"
                ],
                filas,
                y
            );
        }

        if (tipo === "general" || tipo === "fincas") {
            const filas = reporte.fincas.map(finca => [
                finca.id ?? "",
                finca.nombre || "Sin nombre",
                finca.ubicacion || "No disponible",
                finca.area_total ?? "No disponible"
            ]);

            y = agregarTabla(
                doc,
                "Detalle de fincas",
                [
                    "ID",
                    "Nombre",
                    "Ubicación",
                    "Área total"
                ],
                filas,
                y
            );
        }

        if (tipo === "general" || tipo === "riego") {
            const filas = reporte.riegos.map(riego => {
                const cultivo = datos.cultivos.find(
                    c => Number(c.id) === Number(riego.cultivo_id)
                );

                return [
                    riego.id ?? "",
                    riego.cultivo_nombre || cultivo?.nombre || "No disponible",
                    fechaLegible(riego.fecha_riego),
                    riego.duracion ?? "No disponible",
                    riego.agua_utilizada ?? "No disponible",
                    riego.estado || "Sin estado"
                ];
            });

            y = agregarTabla(
                doc,
                "Historial de riego",
                [
                    "ID",
                    "Cultivo",
                    "Fecha",
                    "Duración",
                    "Agua utilizada (L)",
                    "Estado"
                ],
                filas,
                y
            );
        }

        if (tipo === "general") {
            if (y + 30 > 270) {
                doc.addPage();
                y = 25;
            }

            y = await agregarGraficosPDF(doc, reporte, y);
        }

        agregarPiePagina(doc);

        const nombreArchivo = `${reporte.nombre
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9_-]+/g, "_")}.pdf`;

        const blob = doc.output("blob");

        datos.pdfBlob = blob;
        datos.pdfNombre = nombreArchivo;

        return {
            blob,
            nombre: nombreArchivo
        };
    }

    /* =====================================================
       DESCARGAR PDF
       ===================================================== */

    function descargarBlob(blob, nombre) {
        const url = URL.createObjectURL(blob);

        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = nombre;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    async function generarReporte() {
        if (!prepararReporte()) return;

        const boton = elementos.generar;

        try {
            boton.disabled = true;

            boton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Generando PDF...
            `;

            const resultado = await crearPDF(datos.ultimoReporte);

            descargarBlob(
                resultado.blob,
                resultado.nombre
            );

            elementos.descargar.disabled = false;

            mostrarMensaje(
                "El reporte PDF se generó y descargó correctamente."
            );

        } catch (error) {
            console.error("Error generando PDF:", error);

            mostrarMensaje(
                error.message || "No se pudo generar el PDF.",
                "error"
            );

        } finally {
            boton.disabled = false;

            boton.innerHTML = `
                <i class="fa-solid fa-file-pdf"></i>
                Generar PDF
            `;
        }
    }

    function descargarUltimoReporte() {
        if (!datos.pdfBlob || !datos.pdfNombre) {
            mostrarMensaje(
                "Primero genera un reporte PDF.",
                "warning"
            );
            return;
        }

        descargarBlob(
            datos.pdfBlob,
            datos.pdfNombre
        );
    }

    /* =====================================================
       IMPRESIÓN
       ===================================================== */

    function imprimirReporte() {
        if (!datos.ultimoReporte) {
            mostrarMensaje(
                "Primero genera un reporte.",
                "warning"
            );
            return;
        }

        window.print();
    }

    /* =====================================================
       EVENTOS
       ===================================================== */

    elementos.periodoAgua?.addEventListener(
        "change",
        actualizarGraficoAgua
    );

    elementos.periodo?.addEventListener(
        "change",
        controlarFechas
    );

    elementos.generar?.addEventListener(
        "click",
        generarReporte
    );

    elementos.descargar?.addEventListener(
        "click",
        descargarUltimoReporte
    );

    elementos.imprimir?.addEventListener(
        "click",
        imprimirReporte
    );

    /* =====================================================
       INICIALIZACIÓN
       ===================================================== */

    actualizarFecha();
    controlarFechas();

    cargarDatos().catch(error => {
        console.error("Error en reportes:", error);

        mostrarMensaje(
            error.message || "No se pudieron cargar los datos.",
            "error"
        );

        [
            elementos.cultivos,
            elementos.fincas,
            elementos.agua
        ].forEach(elemento => {
            if (elemento) elemento.textContent = "—";
        });

        if (elementos.produccion) {
            elementos.produccion.textContent = "No disponible";
        }

        mostrarVacio(
            elementos.graficoCultivos,
            "No se pudieron cargar los cultivos."
        );

        mostrarVacio(
            elementos.graficoDistribucion,
            "No se pudieron cargar los cultivos."
        );

        mostrarVacio(
            elementos.graficoAgua,
            "No se pudo cargar el historial de riego."
        );

        mostrarVacio(
            elementos.graficoActividad,
            "No se pudo cargar el historial de riego."
        );
    });
});

