/* =========================================================
   HARVESTX - REPORTES Y ESTADÍSTICAS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
       ===================================================== */

    const fechaActual = document.getElementById("fechaActual");

    const totalCultivos = document.getElementById("totalCultivos");
    const produccionTotal = document.getElementById("produccionTotal");
    const consumoAgua = document.getElementById("consumoAgua");
    const totalFincas = document.getElementById("totalFincas");

    const productionPeriod = document.getElementById("productionPeriod");
    const waterPeriod = document.getElementById("waterPeriod");

    const reportType = document.getElementById("reportType");
    const reportPeriod = document.getElementById("reportPeriod");
    const reportCrop = document.getElementById("reportCrop");
    const reportFarm = document.getElementById("reportFarm");

    const customDateFields = document.getElementById("customDateFields");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");

    const generateReport = document.getElementById("generateReport");
    const printReport = document.getElementById("printReport");
    const downloadLastReport = document.getElementById("downloadLastReport");

    const lastReportName = document.getElementById("lastReportName");
    const lastReportDate = document.getElementById("lastReportDate");

    const productionChart = document.getElementById("productionChart");
    const distributionChart = document.getElementById("distributionChart");
    const waterChart = document.getElementById("waterChart");
    const activityChart = document.getElementById("activityChart");


    /* =====================================================
       DATOS DE DEMOSTRACIÓN
       ===================================================== */

    const datosDemo = {

        resumen: {
            cultivos: 12,
            produccion: "8.4 t",
            agua: "24,500 L",
            fincas: 5
        },

        produccion: {

            week: [
                { nombre: "Brócoli", valor: 1.8 },
                { nombre: "Tomate", valor: 2.4 },
                { nombre: "Limón", valor: 1.2 },
                { nombre: "Otros", valor: 0.9 }
            ],

            month: [
                { nombre: "Brócoli", valor: 3.2 },
                { nombre: "Tomate", valor: 4.5 },
                { nombre: "Limón", valor: 2.1 },
                { nombre: "Otros", valor: 1.7 }
            ],

            year: [
                { nombre: "Brócoli", valor: 14 },
                { nombre: "Tomate", valor: 19 },
                { nombre: "Limón", valor: 11 },
                { nombre: "Otros", valor: 8 }
            ]
        },

        agua: {

            week: [
                { nombre: "Lun", valor: 3200 },
                { nombre: "Mar", valor: 4100 },
                { nombre: "Mié", valor: 3500 },
                { nombre: "Jue", valor: 2900 },
                { nombre: "Vie", valor: 4200 },
                { nombre: "Sáb", valor: 3100 },
                { nombre: "Dom", valor: 2800 }
            ],

            month: [
                { nombre: "Sem. 1", valor: 8200 },
                { nombre: "Sem. 2", valor: 9100 },
                { nombre: "Sem. 3", valor: 7600 },
                { nombre: "Sem. 4", valor: 9600 }
            ],

            year: [
                { nombre: "Ene", valor: 21000 },
                { nombre: "Feb", valor: 23500 },
                { nombre: "Mar", valor: 25000 },
                { nombre: "Abr", valor: 22800 },
                { nombre: "May", valor: 27100 },
                { nombre: "Jun", valor: 24500 }
            ]
        }
    };


    /* =====================================================
       FECHA ACTUAL
       ===================================================== */

    function actualizarFecha() {

        if (!fechaActual) return;

        const fecha = new Date();

        const opciones = {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        };

        let texto = fecha.toLocaleDateString(
            "es-GT",
            opciones
        );

        texto =
            texto.charAt(0).toUpperCase() +
            texto.slice(1);

        fechaActual.textContent = texto;
    }


    /* =====================================================
       RESUMEN ESTADÍSTICO
       ===================================================== */

    function cargarResumen() {

        if (totalCultivos) {
            totalCultivos.textContent =
                datosDemo.resumen.cultivos;
        }

        if (produccionTotal) {
            produccionTotal.textContent =
                datosDemo.resumen.produccion;
        }

        if (consumoAgua) {
            consumoAgua.textContent =
                datosDemo.resumen.agua;
        }

        if (totalFincas) {
            totalFincas.textContent =
                datosDemo.resumen.fincas;
        }
    }


    /* =====================================================
       CREAR BARRAS PARA GRÁFICOS
       ===================================================== */

    function crearGraficoBarras(
        contenedor,
        datos,
        unidad = ""
    ) {

        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (!datos || datos.length === 0) {

            contenedor.innerHTML = `
                <div class="chart-empty">
                    No hay datos disponibles.
                </div>
            `;

            return;
        }

        const maximo = Math.max(
            ...datos.map(item => item.valor)
        );

        const chart =
            document.createElement("div");

        chart.className =
            "simple-bar-chart";

        datos.forEach(item => {

            const columna =
                document.createElement("div");

            columna.className =
                "bar-column";


            /* VALOR */

            const valor =
                document.createElement("span");

            valor.className =
                "bar-value";

            valor.textContent =
                `${item.valor}${unidad}`;


            /* ÁREA DE BARRA */

            const barraArea =
                document.createElement("div");

            barraArea.className =
                "bar-area";


            /* BARRA */

            const barra =
                document.createElement("div");

            barra.className =
                "chart-bar";

            const porcentaje =
                maximo > 0
                    ? (item.valor / maximo) * 100
                    : 0;

            barra.style.height =
                `${Math.max(porcentaje, 8)}%`;


            /* ETIQUETA */

            const etiqueta =
                document.createElement("span");

            etiqueta.className =
                "bar-label";

            etiqueta.textContent =
                item.nombre;


            barraArea.appendChild(barra);

            columna.appendChild(valor);
            columna.appendChild(barraArea);
            columna.appendChild(etiqueta);

            chart.appendChild(columna);
        });

        contenedor.appendChild(chart);
    }


    /* =====================================================
       GRÁFICO DE PRODUCCIÓN
       ===================================================== */

    function actualizarGraficoProduccion() {

        if (!productionPeriod) return;

        const periodo =
            productionPeriod.value;

        const datos =
            datosDemo.produccion[periodo];

        crearGraficoBarras(
            productionChart,
            datos,
            " t"
        );
    }


    /* =====================================================
       GRÁFICO DE AGUA
       ===================================================== */

    function actualizarGraficoAgua() {

        if (!waterPeriod) return;

        const periodo =
            waterPeriod.value;

        const datos =
            datosDemo.agua[periodo];

        crearGraficoBarras(
            waterChart,
            datos,
            " L"
        );
    }


    /* =====================================================
       DISTRIBUCIÓN DE CULTIVOS
       ===================================================== */

    function crearDistribucionCultivos() {

        if (!distributionChart) return;

        const cultivos = [

            {
                nombre: "Brócoli",
                porcentaje: 35
            },

            {
                nombre: "Tomate",
                porcentaje: 30
            },

            {
                nombre: "Limón",
                porcentaje: 20
            },

            {
                nombre: "Otros",
                porcentaje: 15
            }
        ];

        distributionChart.innerHTML = "";


        /* CONTENEDOR */

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "distribution-wrapper";


        /* CÍRCULO */

        const circulo =
            document.createElement("div");

        circulo.className =
            "distribution-circle";

        circulo.innerHTML = `
            <div class="distribution-center">
                <strong>100%</strong>
                <span>Cultivos</span>
            </div>
        `;


        /* LISTA */

        const lista =
            document.createElement("div");

        lista.className =
            "distribution-list";


        cultivos.forEach(cultivo => {

            const item =
                document.createElement("div");

            item.className =
                "distribution-item";

            item.innerHTML = `
                <div class="distribution-info">

                    <span class="distribution-dot"></span>

                    <span>
                        ${cultivo.nombre}
                    </span>

                </div>

                <strong>
                    ${cultivo.porcentaje}%
                </strong>
            `;

            lista.appendChild(item);
        });


        wrapper.appendChild(circulo);
        wrapper.appendChild(lista);

        distributionChart.appendChild(wrapper);
    }


    /* =====================================================
       ACTIVIDAD AGRÍCOLA
       ===================================================== */

    function crearActividadAgricola() {

        if (!activityChart) return;

        const actividades = [

            {
                nombre: "Riego",
                cantidad: 42,
                icono: "fa-droplet"
            },

            {
                nombre: "Labores",
                cantidad: 28,
                icono: "fa-tractor"
            },

            {
                nombre: "Monitoreos",
                cantidad: 19,
                icono: "fa-cloud-sun"
            },

            {
                nombre: "Alertas atendidas",
                cantidad: 11,
                icono: "fa-bell"
            }
        ];

        activityChart.innerHTML = "";


        const lista =
            document.createElement("div");

        lista.className =
            "activity-list";


        actividades.forEach(actividad => {

            const item =
                document.createElement("div");

            item.className =
                "activity-item";

            item.innerHTML = `

                <div class="activity-icon">

                    <i class="fas ${actividad.icono}"></i>

                </div>


                <div class="activity-info">

                    <span>
                        ${actividad.nombre}
                    </span>

                    <div class="activity-progress">

                        <div
                            class="activity-progress-bar"
                            style="width: ${actividad.cantidad}%">
                        </div>

                    </div>

                </div>


                <strong>
                    ${actividad.cantidad}
                </strong>
            `;

            lista.appendChild(item);
        });

        activityChart.appendChild(lista);
    }


    /* =====================================================
       MOSTRAR / OCULTAR FECHAS PERSONALIZADAS
       ===================================================== */

    function controlarFechasPersonalizadas() {

        if (
            !reportPeriod ||
            !customDateFields
        ) {
            return;
        }


        /* PERSONALIZADO */

        if (
            reportPeriod.value === "custom"
        ) {

            customDateFields.hidden = false;

            customDateFields.style.display =
                "grid";


            /* FECHA INICIAL */

            if (
                startDate &&
                !startDate.value
            ) {

                startDate.value =
                    obtenerFechaInput(
                        new Date()
                    );
            }


            /* FECHA FINAL */

            if (
                endDate &&
                !endDate.value
            ) {

                endDate.value =
                    obtenerFechaInput(
                        new Date()
                    );
            }


        } else {

            customDateFields.hidden = true;

            customDateFields.style.display =
                "none";
        }
    }


    /* =====================================================
       FECHA PARA INPUT DATE
       ===================================================== */

    function obtenerFechaInput(fecha) {

        const año =
            fecha.getFullYear();

        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                fecha.getDate()
            ).padStart(2, "0");

        return `${año}-${mes}-${dia}`;
    }


    /* =====================================================
       VALIDAR REPORTE
       ===================================================== */

    function validarReporte() {

        if (!reportPeriod) {
            return true;
        }


        /* SOLO VALIDAMOS SI ES PERSONALIZADO */

        if (
            reportPeriod.value !== "custom"
        ) {
            return true;
        }


        /* FECHAS VACÍAS */

        if (
            !startDate ||
            !endDate ||
            !startDate.value ||
            !endDate.value
        ) {

            mostrarMensaje(
                "Selecciona la fecha inicial y final.",
                "warning"
            );

            return false;
        }


        /* COMPARAR FECHAS */

        const inicio =
            new Date(startDate.value);

        const fin =
            new Date(endDate.value);


        if (inicio > fin) {

            mostrarMensaje(
                "La fecha inicial no puede ser posterior a la fecha final.",
                "warning"
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       GENERAR REPORTE
       ===================================================== */

    function generarReporte() {

        if (!validarReporte()) {
            return;
        }


        const tipo =
            obtenerTextoSelect(reportType);

        const periodo =
            obtenerTextoSelect(reportPeriod);

        const cultivo =
            obtenerTextoSelect(reportCrop);

        const finca =
            obtenerTextoSelect(reportFarm);


        /* NOMBRE BASE */

        let nombreReporte =
            `Reporte ${tipo}`;


        /* PERÍODO */

        if (periodo) {

            nombreReporte +=
                ` — ${periodo}`;
        }


        /* CULTIVO */

        if (
            reportCrop &&
            reportCrop.value !== "all"
        ) {

            nombreReporte +=
                ` — ${cultivo}`;
        }


        /* FINCA */

        if (
            reportFarm &&
            reportFarm.value !== "all"
        ) {

            nombreReporte +=
                ` — ${finca}`;
        }


        /* FECHAS PERSONALIZADAS */

        if (
            reportPeriod &&
            reportPeriod.value === "custom" &&
            startDate &&
            endDate
        ) {

            nombreReporte +=
                ` — ${startDate.value} a ${endDate.value}`;
        }


        const ahora =
            new Date();


        /* ÚLTIMO REPORTE */

        if (lastReportName) {

            lastReportName.textContent =
                nombreReporte;
        }


        if (lastReportDate) {

            lastReportDate.textContent =
                `Generado el ${
                    ahora.toLocaleDateString("es-GT")
                } a las ${
                    ahora.toLocaleTimeString(
                        "es-GT",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
                }`;
        }


        /* ACTIVAR DESCARGA */

        if (downloadLastReport) {

            downloadLastReport.disabled =
                false;
        }


        /* MENSAJE */

        mostrarMensaje(
            "Reporte generado correctamente.",
            "success"
        );
    }


    /* =====================================================
       OBTENER TEXTO DEL SELECT
       ===================================================== */

    function obtenerTextoSelect(select) {

        if (
            !select ||
            select.selectedIndex < 0
        ) {
            return "";
        }

        return select.options[
            select.selectedIndex
        ].text;
    }


    /* =====================================================
       MENSAJES
       ===================================================== */

    function mostrarMensaje(
        texto,
        tipo = "success"
    ) {

        const anterior =
            document.querySelector(
                ".report-toast"
            );


        if (anterior) {
            anterior.remove();
        }


        const toast =
            document.createElement("div");

        toast.className =
            `report-toast ${tipo}`;


        let icono =
            "fa-circle-check";


        if (tipo === "warning") {

            icono =
                "fa-triangle-exclamation";
        }


        toast.innerHTML = `
            <i class="fas ${icono}"></i>

            <span>
                ${texto}
            </span>
        `;


        document.body.appendChild(toast);


        setTimeout(() => {

            toast.classList.add("hide");


            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 3000);
    }


    /* =====================================================
       DESCARGAR REPORTE DEMO
       ===================================================== */

    function descargarReporte() {

        if (!lastReportName) {
            return;
        }


        const nombre =
            lastReportName.textContent;


        if (
            !nombre ||
            nombre ===
                "Aún no se ha generado ningún reporte"
        ) {

            mostrarMensaje(
                "Primero debes generar un reporte.",
                "warning"
            );

            return;
        }


        /*
         * =================================================
         * DEMO
         * =================================================
         *
         * Por ahora se genera un TXT.
         *
         * Más adelante será reemplazado por:
         *
         * Flask + MySQL + generación real de PDF.
         *
         * =================================================
         */

        const contenido = `

HARVESTX
========================================

${nombre}

${
    lastReportDate
        ? lastReportDate.textContent
        : ""
}

----------------------------------------
RESUMEN
----------------------------------------

Cultivos activos:
${datosDemo.resumen.cultivos}

Producción total:
${datosDemo.resumen.produccion}

Consumo de agua:
${datosDemo.resumen.agua}

Fincas registradas:
${datosDemo.resumen.fincas}

----------------------------------------

Este archivo corresponde a una versión
de demostración del módulo de reportes.

La generación de reportes oficiales
se conectará posteriormente con Flask
y la base de datos MySQL de HarvestX.

        `.trim();


        const archivo =
            new Blob(
                [contenido],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                archivo
            );


        const enlace =
            document.createElement("a");


        enlace.href = url;


        enlace.download =
            "HarvestX_" +

            nombre
                .replace(
                    /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g,
                    ""
                )
                .replace(
                    /\s+/g,
                    "_"
                ) +

            ".txt";


        document.body.appendChild(
            enlace
        );


        enlace.click();


        enlace.remove();


        URL.revokeObjectURL(
            url
        );


        mostrarMensaje(
            "Reporte de demostración descargado.",
            "success"
        );
    }


    /* =====================================================
       IMPRIMIR
       ===================================================== */

    function imprimirReporte() {

        window.print();
    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    if (productionPeriod) {

        productionPeriod.addEventListener(
            "change",
            actualizarGraficoProduccion
        );
    }


    if (waterPeriod) {

        waterPeriod.addEventListener(
            "change",
            actualizarGraficoAgua
        );
    }


    if (reportPeriod) {

        reportPeriod.addEventListener(
            "change",
            controlarFechasPersonalizadas
        );
    }


    if (generateReport) {

        generateReport.addEventListener(
            "click",
            generarReporte
        );
    }


    if (printReport) {

        printReport.addEventListener(
            "click",
            imprimirReporte
        );
    }


    if (downloadLastReport) {

        downloadLastReport.addEventListener(
            "click",
            descargarReporte
        );
    }


    /* =====================================================
       INICIALIZACIÓN
       ===================================================== */

    actualizarFecha();

    cargarResumen();

    actualizarGraficoProduccion();

    actualizarGraficoAgua();

    crearDistribucionCultivos();

    crearActividadAgricola();

    controlarFechasPersonalizadas();

});