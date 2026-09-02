/* =========================================================
HARVESTX — PROGRAMACIÓN DE RIEGO
Calendario interactivo + programación + múltiples riegos + historial
========================================================= */

const estadoRiego = {
    autoActivo: true,
    mesActual: 8, // Septiembre = 8 (0 = Enero, 8 = Septiembre)
    anioActual: 2026,
    fechaSeleccionada: null,
    programaciones: [
        { fecha: "2026-09-25", cultivo: "Tomate", hora: "06:00", duracion: 45 },
        { fecha: "2026-09-25", cultivo: "Lechuga", hora: "18:00", duracion: 30 }, // Múltiples riegos en un día
        { fecha: "2026-09-26", cultivo: "Lechuga", hora: "06:30", duracion: 40 },
        { fecha: "2026-09-27", cultivo: "Chile pimiento", hora: "07:00", duracion: 50 }
    ],
    historial: [
        { fecha: "30/08/2026", hora: "06:10 AM", duracion: "40 min", agua: "120 L" },
        { fecha: "28/08/2026", hora: "06:00 AM", duracion: "45 min", agua: "130 L" }
    ]
};

const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

document.addEventListener("DOMContentLoaded", () => {
    iniciarModuloRiego();
});

function iniciarModuloRiego() {
    console.log("🌱 HarvestX — Módulo de Riego Iniciado");
    
    // Fecha predeterminada de hoy
    const hoy = new Date();
    const fechaInput = document.getElementById("riegoFecha");
    if (fechaInput) {
        fechaInput.value = formatearFechaInput(hoy);
    }

    crearControlesCalendario();
    renderizarCalendario();
    renderizarHistorial();
    configurarEventos();
}

function configurarEventos() {
    const form = document.getElementById("formRiego");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            guardarProgramacion();
        });
    }

    const btnAuto = document.getElementById("btnToggleAuto");
    if (btnAuto) {
        btnAuto.addEventListener("click", alternarRiegoAutomatico);
    }
}

/* =========================================================
CONTROLES Y MESES DEL CALENDARIO
========================================================= */
function crearControlesCalendario() {
    const panel = document.querySelector(".cal-panel");
    if (!panel || document.getElementById("calendarioControles")) return;

    const controles = document.createElement("div");
    controles.id = "calendarioControles";
    controles.className = "calendario-controles";

    const btnAnterior = document.createElement("button");
    btnAnterior.type = "button";
    btnAnterior.className = "cal-nav-btn";
    btnAnterior.innerHTML = '&#10094;';
    btnAnterior.title = "Mes anterior";
    btnAnterior.addEventListener("click", () => cambiarMes(-1));

    const titulo = document.createElement("div");
    titulo.id = "calMesTitulo";
    titulo.className = "cal-mes-navegacion";

    const btnSiguiente = document.createElement("button");
    btnSiguiente.type = "button";
    btnSiguiente.className = "cal-nav-btn";
    btnSiguiente.innerHTML = '&#10095;';
    btnSiguiente.title = "Mes siguiente";
    btnSiguiente.addEventListener("click", () => cambiarMes(1));

    const btnAgregar = document.createElement("button");
    btnAgregar.type = "button";
    btnAgregar.className = "cal-add-btn";
    btnAgregar.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar riego';
    btnAgregar.addEventListener("click", () => {
        const inputFecha = document.getElementById("riegoFecha");
        if (inputFecha) inputFecha.focus();
    });

    controles.appendChild(btnAnterior);
    controles.appendChild(titulo);
    controles.appendChild(btnSiguiente);
    controles.appendChild(btnAgregar);

    const tituloPanel = panel.querySelector("h3");
    if (tituloPanel) {
        tituloPanel.insertAdjacentElement("afterend", controles);
    }
    actualizarTituloCalendario();
}

function cambiarMes(direccion) {
    estadoRiego.mesActual += direccion;
    if (estadoRiego.mesActual < 0) {
        estadoRiego.mesActual = 11;
        estadoRiego.anioActual--;
    } else if (estadoRiego.mesActual > 11) {
        estadoRiego.mesActual = 0;
        estadoRiego.anioActual++;
    }
    actualizarTituloCalendario();
    renderizarCalendario();
}

function actualizarTituloCalendario() {
    const titulo = document.getElementById("calMesTitulo");
    if (titulo) {
        titulo.textContent = `${nombresMeses[estadoRiego.mesActual]} ${estadoRiego.anioActual}`;
    }
}

/* =========================================================
RENDERIZAR DIAS DEL CALENDARIO
========================================================= */
function renderizarCalendario() {

    const calGrid = document.getElementById("calGrid");

    if (!calGrid) return;

    calGrid.innerHTML = "";

    const anio = estadoRiego.anioActual;
    const mes = estadoRiego.mesActual;

    const primerDia = new Date(anio, mes, 1).getDay();

    // Convertimos domingo=0 a formato lunes=0
    const primerDiaAjustado =
        primerDia === 0 ? 6 : primerDia - 1;

    const diasMes =
        new Date(anio, mes + 1, 0).getDate();

    const diasMesAnterior =
        new Date(anio, mes, 0).getDate();


    /* ==========================
       DÍAS DEL MES ANTERIOR
       ========================== */

    for (let i = primerDiaAjustado - 1; i >= 0; i--) {

        const dia = diasMesAnterior - i;

        const div = crearDiaElemento(
            dia,
            "other-month"
        );

        calGrid.appendChild(div);
    }


    /* ==========================
       DÍAS DEL MES ACTUAL
       ========================== */

    const hoy = new Date();

    for (let dia = 1; dia <= diasMes; dia++) {

        const fechaStr =
            `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        const div =
            crearDiaElemento(dia, "", fechaStr);


        // HOY
        if (
            dia === hoy.getDate() &&
            mes === hoy.getMonth() &&
            anio === hoy.getFullYear()
        ) {
            div.classList.add("hoy");
        }


        // Buscar riegos programados
        const riegosEnFecha =
            estadoRiego.programaciones.filter(
                p => p.fecha === fechaStr
            );


        if (riegosEnFecha.length > 0) {

            div.classList.add("programado");

            // Más de un riego
            if (riegosEnFecha.length > 1) {

                const badge =
                    document.createElement("span");

                badge.className =
                    "cal-day-badge";

                badge.textContent =
                    riegosEnFecha.length;

                div.appendChild(badge);
            }
        }


        // Día seleccionado
        if (
            estadoRiego.fechaSeleccionada === fechaStr
        ) {
            div.classList.add("seleccionado");
        }


        // Seleccionar fecha
        div.addEventListener(
            "click",
            () => seleccionarFecha(fechaStr)
        );


        calGrid.appendChild(div);
    }


    /* ==========================
       DÍAS DEL MES SIGUIENTE
       ========================== */

    const totalCeldas =
        primerDiaAjustado + diasMes;

    const diasFaltantes =
        (7 - (totalCeldas % 7)) % 7;


    for (
        let dia = 1;
        dia <= diasFaltantes;
        dia++
    ) {

        const div =
            crearDiaElemento(
                dia,
                "other-month"
            );

        calGrid.appendChild(div);
    }
}
function crearDiaElemento(numero, claseExtra = "", fechaStr = null) {
    const div = document.createElement("div");
    div.className = `cal-day ${claseExtra}`.trim();
    div.textContent = numero;
    if (fechaStr) div.dataset.fecha = fechaStr;
    return div;
}

function seleccionarFecha(fechaStr) {
    estadoRiego.fechaSeleccionada = fechaStr;
    const inputFecha = document.getElementById("riegoFecha");
    if (inputFecha) {
        inputFecha.value = fechaStr;
    }
    renderizarCalendario();
}

/* =========================================================
GUARDAR RIEGO (PERMITE MÚLTIPLES RIEGOS)
========================================================= */
function guardarProgramacion() {
    const cultivo = document.getElementById("riegoCultivo").value;
    const fecha = document.getElementById("riegoFecha").value;
    const hora = document.getElementById("riegoHora").value;
    const duracion = parseInt(document.getElementById("riegoDuracion").value, 10);

    if (!fecha || !hora || !duracion) return;

    // Agregar nueva programación permitiendo múltiples registros en el mismo día
    const nuevaProgramacion = { fecha, cultivo, hora, duracion };
    estadoRiego.programaciones.push(nuevaProgramacion);

    // Agregar también al historial
    const partesFecha = fecha.split("-");
    const fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;
    const aguaEstimada = `${duracion * 3} L`; // Cálculo aproximado de agua

    estadoRiego.historial.unshift({
        fecha: fechaFormateada,
        hora: hora,
        duracion: `${duracion} min`,
        agua: aguaEstimada
    });

    // Actualizar vista del calendario e historial
    renderizarCalendario();
    renderizarHistorial();

    alert(`✅ Riego de ${cultivo} programado con éxito para la fecha ${fecha}`);
}

/* =========================================================
HISTORIAL DE RIEGOS
========================================================= */
function renderizarHistorial() {
    const tbody = document.getElementById("historialRiegoBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    estadoRiego.historial.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.fecha}</td>
            <td>${item.hora}</td>
            <td>${item.duracion}</td>
            <td>${item.agua}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* =========================================================
AUTOMATIZACIÓN
========================================================= */
function alternarRiegoAutomatico() {
    estadoRiego.autoActivo = !estadoRiego.autoActivo;
    const btn = document.getElementById("btnToggleAuto");
    const icon = document.getElementById("autoStatusIcon");
    const title = document.getElementById("autoStatusTitle");
    const desc = document.getElementById("autoStatusDesc");

    if (estadoRiego.autoActivo) {
        btn.textContent = "Desactivar";
        btn.classList.remove("inactivo");
        icon.classList.remove("inactivo");
        title.textContent = "Sistema activo";
        desc.textContent = "El sistema regará automáticamente según la programación de los sensores.";
    } else {
        btn.textContent = "Activar";
        btn.classList.add("inactivo");
        icon.classList.add("inactivo");
        title.textContent = "Sistema pausado";
        desc.textContent = "El modo automático está apagado. El riego funcionará manualmente.";
    }
}

function formatearFechaInput(fecha) {
    const a = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${a}-${m}-${d}`;
}

