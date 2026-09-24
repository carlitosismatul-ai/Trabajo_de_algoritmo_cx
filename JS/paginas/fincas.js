// ==========================================================
// HARVESTX - MÓDULO FINCAS
// ==========================================================

const API_URL = "http://127.0.0.1:5000";

// ==========================================================
// ELEMENTOS DEL DOM
// ==========================================================

const modalFinca =
    document.getElementById("modalFinca");

const btnNuevaFinca =
    document.getElementById("btnNuevaFinca");

const cerrarModal =
    document.getElementById("cerrarModal");

const cancelarModal =
    document.getElementById("cancelarModal");

const formFinca =
    document.getElementById("formFinca");

const fincasContainer =
    document.getElementById("fincasContainer");

const mensajeSinFincas =
    document.getElementById("mensajeSinFincas");

const fincaId =
    document.getElementById("fincaId");

const nombreFinca =
    document.getElementById("nombreFinca");

const ubicacionFinca =
    document.getElementById("ubicacionFinca");

const extensionFinca =
    document.getElementById("extensionFinca");

const descripcionFinca =
    document.getElementById("descripcionFinca");

const tituloModalFinca =
    document.getElementById("tituloModalFinca");

const descripcionModalFinca =
    document.getElementById("descripcionModalFinca");

const guardarFinca =
    document.getElementById("guardarFinca");

const totalFincas =
    document.getElementById("totalFincas");

const areaTotal =
    document.getElementById("areaTotal");

const cultivosActivos =
    document.getElementById("cultivosActivos");


// ==========================================================
// ELEMENTOS MODAL CULTIVOS
// ==========================================================

const modalAsignarCultivo =
    document.getElementById("modalAsignarCultivo");

const selectCultivoFinca =
    document.getElementById("selectCultivoFinca");

const cerrarModalAsignarCultivoBtn =
    document.getElementById("cerrarModalAsignarCultivo");

const cancelarAsignacionCultivo =
    document.getElementById("cancelarAsignacionCultivo");

const btnGuardarAsignacion =
    document.getElementById("btnGuardarAsignacion");

const textoFincaAsignacion =
    document.getElementById("textoFincaAsignacion");

const nombreFincaAsignacion =
    document.getElementById("nombreFincaAsignacion");

const ubicacionFincaAsignacion =
    document.getElementById("ubicacionFincaAsignacion");


// ==========================================================
// VARIABLES
// ==========================================================

let cultivosUsuario = [];

let fincasUsuario = [];

let fincaDestinoCultivo = null;


// ==========================================================
// OBTENER USUARIO ACTUAL
// ==========================================================

function obtenerUsuarioActual() {

    const usuarioGuardado =
        localStorage.getItem("usuarioHarvestX");

    if (!usuarioGuardado) {
        return null;
    }

    try {

        const datos =
            JSON.parse(usuarioGuardado);

        if (
            !datos ||
            typeof datos !== "object"
        ) {
            return null;
        }

        if (
            datos.usuario &&
            typeof datos.usuario === "object"
        ) {
            return datos.usuario;
        }

        return datos;

    } catch (error) {

        console.error(
            "Error leyendo usuarioHarvestX:",
            error
        );

        return null;
    }
}


// ==========================================================
// OBTENER ID USUARIO
// ==========================================================

function obtenerUsuarioId() {

    const usuario =
        obtenerUsuarioActual();

    if (!usuario) {
        return null;
    }

    const id =
        Number(usuario.id);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return null;
    }

    return id;
}


// ==========================================================
// VERIFICAR SESIÓN
// ==========================================================

function verificarSesion() {

    const usuario =
        obtenerUsuarioActual();

    if (!usuario) {

        console.warn(
            "No existe una sesión válida."
        );

        return false;
    }

    const id =
        Number(usuario.id);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        console.warn(
            "ID de usuario inválido."
        );

        return false;
    }

    console.log(
        "Sesión válida:",
        {
            id: usuario.id,
            usuario: usuario.usuario,
            nombre: usuario.nombre,
            rol: usuario.rol
        }
    );

    return true;
}


// ==========================================================
// MOSTRAR ERROR
// ==========================================================

function mostrarError(mensaje) {

    console.error(
        "HarvestX:",
        mensaje
    );

    alert(mensaje);
}


// ==========================================================
// ESCAPAR HTML
// ==========================================================

function escaparHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================================
// FORMATEAR ÁREA
// ==========================================================

function formatearArea(area) {

    const numero =
        Number(area || 0);

    if (Number.isInteger(numero)) {

        return numero.toString();

    }

    return numero.toFixed(1);
}


// ==========================================================
// OBTENER NOMBRE FINCA
// ==========================================================

function obtenerNombreFincaPorId(id) {

    const finca =
        fincasUsuario.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    return finca
        ? finca.nombre
        : null;
}


// ==========================================================
// MODAL NUEVA FINCA
// ==========================================================

function abrirModalNuevaFinca() {

    if (
        !modalFinca ||
        !formFinca
    ) {
        return;
    }

    formFinca.reset();

    fincaId.value = "";

    tituloModalFinca.textContent =
        "Nueva finca";

    descripcionModalFinca.textContent =
        "Registra una nueva finca.";

    guardarFinca.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Guardar finca
    `;

    modalFinca.classList.add("active");
}


// ==========================================================
// CERRAR MODAL FINCA
// ==========================================================

function cerrarModalFinca() {

    if (!modalFinca) {
        return;
    }

    modalFinca.classList.remove(
        "active"
    );

    if (formFinca) {
        formFinca.reset();
    }

    if (fincaId) {
        fincaId.value = "";
    }
}


// ==========================================================
// EVENTOS MODAL FINCA
// ==========================================================

if (btnNuevaFinca) {

    btnNuevaFinca.addEventListener(
        "click",
        abrirModalNuevaFinca
    );
}

if (cerrarModal) {

    cerrarModal.addEventListener(
        "click",
        cerrarModalFinca
    );
}

if (cancelarModal) {

    cancelarModal.addEventListener(
        "click",
        cerrarModalFinca
    );
}

if (modalFinca) {

    modalFinca.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                modalFinca
            ) {

                cerrarModalFinca();

            }

        }
    );
}


// ==========================================================
// CERRAR MODALES CON ESC
// ==========================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            modalFinca &&
            modalFinca.classList.contains("active")
        ) {

            cerrarModalFinca();

            return;
        }

        if (
            event.key === "Escape" &&
            modalAsignarCultivo &&
            modalAsignarCultivo.classList.contains("active")
        ) {

            cerrarModalAsignarCultivo();

        }

    }
);


// ==========================================================
// CARGAR FINCAS
// ==========================================================

async function cargarFincas() {

    const usuarioId =
        obtenerUsuarioId();

    if (!usuarioId) {

        mostrarEstadoVacio(
            "No se pudo identificar al usuario."
        );

        return;
    }

    try {

        const respuesta =
            await fetch(
                `${API_URL}/fincas?usuario_id=${usuarioId}`
            );

        const datos =
            await respuesta.json();

        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                `Error HTTP: ${respuesta.status}`
            );
        }

        fincasUsuario =
            datos.fincas || [];

        await cargarCultivosUsuario();

        renderizarFincas(
            fincasUsuario
        );

        await cargarEstadisticas();

    } catch (error) {

        console.error(
            "Error cargando fincas:",
            error
        );

        mostrarEstadoVacio(
            "No se pudieron cargar las fincas. Verifica que Flask esté ejecutándose."
        );
    }
}


// ==========================================================
// CARGAR CULTIVOS
// ==========================================================

async function cargarCultivosUsuario() {

    const usuarioId =
        obtenerUsuarioId();

    if (!usuarioId) {
        return [];
    }

    try {

        const respuesta =
            await fetch(
                `${API_URL}/cultivos?usuario_id=${usuarioId}`
            );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                `Error HTTP: ${respuesta.status}`
            );
        }

        if (Array.isArray(datos)) {

            cultivosUsuario =
                datos;

        } else if (
            datos &&
            Array.isArray(datos.cultivos)
        ) {

            cultivosUsuario =
                datos.cultivos;

        } else {

            cultivosUsuario = [];

        }

        return cultivosUsuario;

    } catch (error) {

        console.error(
            "Error cargando cultivos:",
            error
        );

        cultivosUsuario = [];

        return [];
    }
}


// ==========================================================
// RENDERIZAR FINCAS
// ==========================================================

function renderizarFincas(fincas) {

    if (!fincasContainer) {
        return;
    }

    const tarjetas =
        fincasContainer.querySelectorAll(
            ".finca-card"
        );

    tarjetas.forEach(
        tarjeta => tarjeta.remove()
    );


    if (
        !fincas ||
        fincas.length === 0
    ) {

        mostrarEstadoVacio();

        return;
    }


    if (mensajeSinFincas) {

        mensajeSinFincas.style.display =
            "none";

    }


    fincas.forEach(
        finca => {

            const tarjeta =
                crearTarjetaFinca(
                    finca
                );

            fincasContainer.appendChild(
                tarjeta
            );

        }
    );
}


// ==========================================================
// CREAR TARJETA FINCA
// ==========================================================

function crearTarjetaFinca(finca) {

    const article =
        document.createElement("article");

    article.className =
        "finca-card";


    const iconos = [
        "fa-mountain-sun",
        "fa-seedling",
        "fa-wheat-awn",
        "fa-tree"
    ];


    const icono =
        iconos[
            Number(finca.id) %
            iconos.length
        ];


    const areaTexto =
        formatearArea(
            finca.area_total
        );


    const descripcion =
        finca.descripcion
            ? String(finca.descripcion)
            : "Sin descripción";


    const cultivosFinca =
        cultivosUsuario.filter(
            cultivo =>
                Number(cultivo.finca_id) ===
                Number(finca.id)
        );


    article.innerHTML = `

        <div class="finca-card-header">

            <div class="finca-icon">

                <i class="fa-solid ${icono}"></i>

            </div>


            <div class="finca-actions">

                <button
                    type="button"
                    class="btn-icon"
                    title="Editar finca"
                    data-action="editar">

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="btn-icon delete"
                    title="Eliminar finca"
                    data-action="eliminar">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>


        <div class="finca-card-body">

            <h3>
                ${escaparHTML(finca.nombre)}
            </h3>


            <p class="finca-location">

                <i class="fa-solid fa-location-dot"></i>

                ${escaparHTML(
                    finca.ubicacion ||
                    "Sin ubicación"
                )}

            </p>


            <div class="finca-info">

                <div>

                    <span>
                        Extensión
                    </span>

                    <strong>
                        ${areaTexto} ha
                    </strong>

                </div>


                <div>

                    <span>
                        Cultivos
                    </span>

                    <strong>
                        ${cultivosFinca.length}
                    </strong>

                </div>

            </div>


            <div class="finca-description">

                <span>
                    Descripción
                </span>

                <p title="${escaparHTML(descripcion)}">
                    ${escaparHTML(descripcion)}
                </p>

            </div>


            <!-- CULTIVOS -->

            <div class="finca-cultivos-section">

                <div class="finca-cultivos-header">

                    <div>

                        <span class="finca-cultivos-kicker">
                            PRODUCCIÓN
                        </span>

                        <h4>
                            Cultivos asociados
                        </h4>

                    </div>


                    <button
                        type="button"
                        class="finca-btn-agregar-cultivo"
                        data-action="agregar-cultivo"
                        title="Agregar o cambiar cultivo"
                        aria-label="Agregar o cambiar cultivo">

                        <i class="fa-solid fa-plus"></i>

                    </button>

                </div>


                <div class="finca-cultivos-list">

                    ${generarHTMLCultivos(
                        cultivosFinca
                    )}

                </div>

            </div>

        </div>

    `;


    // ======================================================
    // EDITAR
    // ======================================================

    const botonEditar =
        article.querySelector(
            '[data-action="editar"]'
        );

    if (botonEditar) {

        botonEditar.addEventListener(
            "click",
            function() {

                editarFinca(
                    finca.id
                );

            }
        );
    }


    // ======================================================
    // ELIMINAR
    // ======================================================

    const botonEliminar =
        article.querySelector(
            '[data-action="eliminar"]'
        );

    if (botonEliminar) {

        botonEliminar.addEventListener(
            "click",
            function() {

                eliminarFinca(
                    finca.id,
                    finca.nombre
                );

            }
        );
    }


    // ======================================================
    // AGREGAR CULTIVO
    // ======================================================

    const botonAgregarCultivo =
        article.querySelector(
            '[data-action="agregar-cultivo"]'
        );

    if (botonAgregarCultivo) {

        botonAgregarCultivo.addEventListener(
            "click",
            function() {

                abrirModalAsignarCultivo(
                    finca
                );

            }
        );
    }


    // ======================================================
    // QUITAR CULTIVO
    // ======================================================

    article
        .querySelectorAll(
            "[data-cultivo-quitar]"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function() {

                        const cultivoId =
                            Number(
                                boton.dataset.cultivoQuitar
                            );


                        const cultivo =
                            cultivosUsuario.find(
                                item =>
                                    Number(item.id) ===
                                    cultivoId
                            );


                        if (cultivo) {

                            quitarCultivoDeFinca(
                                cultivo,
                                finca
                            );

                        }

                    }
                );

            }
        );


    return article;
}


// ==========================================================
// GENERAR HTML CULTIVOS
// ==========================================================

function generarHTMLCultivos(
    cultivos
) {

    if (
        !cultivos ||
        cultivos.length === 0
    ) {

        return `

            <div class="finca-sin-cultivos">

                <div class="finca-sin-cultivos-icon">

                    <i class="fa-solid fa-seedling"></i>

                </div>

                <div>

                    <strong>
                        Sin cultivos asociados
                    </strong>

                    <span>
                        Agrega un cultivo para comenzar.
                    </span>

                </div>

            </div>

        `;
    }


    return cultivos
        .map(
            cultivo => {

                const nombre =
                    cultivo.nombre ||
                    "Cultivo";


                const tipo =
                    cultivo.tipo ||
                    "Sin tipo";


                const estado =
                    cultivo.estado ||
                    "Activo";


                const imagen =
                    cultivo.imagen
                        ? `${API_URL}/IMG/${cultivo.imagen}`
                        : null;


                const icono =
                    obtenerIconoCultivo(
                        tipo
                    );


                return `

                    <div class="finca-cultivo-item">

                        <div class="finca-cultivo-info">

                            ${
                                imagen
                                ? `
                                    <div class="finca-cultivo-image">

                                        <img
                                            src="${escaparHTML(imagen)}"
                                            alt="${escaparHTML(nombre)}"
                                            onerror="this.parentElement.innerHTML='<i class=&quot;fa-solid ${icono}&quot;></i>'">

                                    </div>
                                `
                                : `
                                    <div class="finca-cultivo-icon">

                                        <i class="fa-solid ${icono}"></i>

                                    </div>
                                `
                            }


                            <div class="finca-cultivo-text">

                                <strong>
                                    ${escaparHTML(nombre)}
                                </strong>

                                <span>
                                    ${escaparHTML(tipo)}
                                </span>

                            </div>

                        </div>


                        <div class="finca-cultivo-right">

                            <span class="finca-cultivo-estado">
                                ${escaparHTML(estado)}
                            </span>


                            <button
                                type="button"
                                class="btn-quitar-cultivo"
                                data-cultivo-quitar="${cultivo.id}"
                                title="Quitar cultivo de esta finca"
                                aria-label="Quitar cultivo de esta finca">

                                <i class="fa-solid fa-xmark"></i>

                            </button>

                        </div>

                    </div>

                `;

            }
        )
        .join("");
}


// ==========================================================
// ICONO SEGÚN TIPO
// ==========================================================

function obtenerIconoCultivo(tipo) {

    const texto =
        String(tipo || "")
            .toLowerCase();


    if (
        texto.includes("fruta") ||
        texto.includes("frut")
    ) {

        return "fa-apple-whole";
    }


    if (
        texto.includes("hort") ||
        texto.includes("verd")
    ) {

        return "fa-carrot";
    }


    if (
        texto.includes("cereal") ||
        texto.includes("grano")
    ) {

        return "fa-wheat-awn";
    }


    if (
        texto.includes("legum")
    ) {

        return "fa-seedling";
    }


    return "fa-seedling";
}


// ==========================================================
// ABRIR MODAL ASIGNAR CULTIVO
// ==========================================================

async function abrirModalAsignarCultivo(
    finca
) {

    fincaDestinoCultivo =
        finca;


    if (!modalAsignarCultivo) {
        return;
    }


    // ======================================================
    // INFORMACIÓN FINCA
    // ======================================================

    if (nombreFincaAsignacion) {

        nombreFincaAsignacion.textContent =
            finca.nombre ||
            "Finca seleccionada";

    }


    if (ubicacionFincaAsignacion) {

        ubicacionFincaAsignacion.textContent =
            finca.ubicacion ||
            "Sin ubicación registrada";

    }


    if (textoFincaAsignacion) {

        textoFincaAsignacion.textContent =
            "Elige el cultivo que quieres asociar a esta finca.";

    }


    // ======================================================
    // CARGANDO
    // ======================================================

    if (selectCultivoFinca) {

        selectCultivoFinca.innerHTML = `

            <option value="">
                Cargando cultivos...
            </option>

        `;

    }


    modalAsignarCultivo.classList.add(
        "active"
    );


    // ======================================================
    // CARGAR CULTIVOS
    // ======================================================

    const cultivos =
        await cargarCultivosUsuario();


    if (!selectCultivoFinca) {
        return;
    }


    selectCultivoFinca.innerHTML = `

        <option value="">
            Selecciona un cultivo
        </option>

    `;


    if (
        !cultivos ||
        cultivos.length === 0
    ) {

        selectCultivoFinca.innerHTML = `

            <option value="">
                No tienes cultivos registrados
            </option>

        `;

        return;
    }


    // ======================================================
    // OPCIONES
    // ======================================================

    cultivos.forEach(
        cultivo => {

            const option =
                document.createElement("option");


            option.value =
                cultivo.id;


            let estadoFinca =
                "Sin finca";


            if (cultivo.finca_id) {

                const nombreFinca =
                    obtenerNombreFincaPorId(
                        cultivo.finca_id
                    );


                estadoFinca =
                    nombreFinca ||
                    `Finca #${cultivo.finca_id}`;

            }


            option.textContent =
                `${cultivo.nombre} · ${estadoFinca}`;


            // ==================================================
            // YA PERTENECE A ESTA FINCA
            // ==================================================

            if (
                Number(cultivo.finca_id) ===
                Number(finca.id)
            ) {

                option.textContent +=
                    " · Ya asociado";

                option.selected =
                    true;

            }


            selectCultivoFinca.appendChild(
                option
            );

        }
    );

}


// ==========================================================
// CERRAR MODAL ASIGNACIÓN
// ==========================================================

function cerrarModalAsignarCultivo() {

    if (!modalAsignarCultivo) {
        return;
    }


    modalAsignarCultivo.classList.remove(
        "active"
    );


    fincaDestinoCultivo =
        null;


    if (selectCultivoFinca) {

        selectCultivoFinca.innerHTML = `

            <option value="">
                Selecciona un cultivo
            </option>

        `;

        selectCultivoFinca.value = "";

    }


    if (nombreFincaAsignacion) {

        nombreFincaAsignacion.textContent =
            "—";

    }


    if (ubicacionFincaAsignacion) {

        ubicacionFincaAsignacion.textContent =
            "Selecciona una finca";

    }

}


// ==========================================================
// EVENTOS MODAL ASIGNACIÓN
// ==========================================================

if (cerrarModalAsignarCultivoBtn) {

    cerrarModalAsignarCultivoBtn.addEventListener(
        "click",
        cerrarModalAsignarCultivo
    );
}


if (cancelarAsignacionCultivo) {

    cancelarAsignacionCultivo.addEventListener(
        "click",
        cerrarModalAsignarCultivo
    );
}


if (modalAsignarCultivo) {

    modalAsignarCultivo.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                modalAsignarCultivo
            ) {

                cerrarModalAsignarCultivo();

            }

        }
    );
}


// ==========================================================
// ASIGNAR CULTIVO
// ==========================================================

if (btnGuardarAsignacion) {

    btnGuardarAsignacion.addEventListener(
        "click",
        guardarAsignacionCultivo
    );
}


async function guardarAsignacionCultivo() {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {

        mostrarError(
            "No se pudo identificar al usuario."
        );

        return;
    }


    if (!fincaDestinoCultivo) {

        mostrarError(
            "No se identificó la finca."
        );

        return;
    }


    if (
        !selectCultivoFinca ||
        !selectCultivoFinca.value
    ) {

        alert(
            "Selecciona un cultivo."
        );

        return;
    }


    const cultivoId =
        Number(
            selectCultivoFinca.value
        );


    const cultivo =
        cultivosUsuario.find(
            item =>
                Number(item.id) ===
                cultivoId
        );


    if (!cultivo) {

        mostrarError(
            "No se encontró el cultivo seleccionado."
        );

        return;
    }


    if (
        Number(cultivo.finca_id) ===
        Number(fincaDestinoCultivo.id)
    ) {

        alert(
            "Este cultivo ya pertenece a esta finca."
        );

        return;
    }


    btnGuardarAsignacion.disabled =
        true;


    btnGuardarAsignacion.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Guardando...

    `;


    try {

        const respuestaCultivo =
            await fetch(
                `${API_URL}/cultivos/${cultivoId}?usuario_id=${usuarioId}`
            );


        const datosCultivo =
            await respuestaCultivo.json();


        if (!respuestaCultivo.ok) {

            throw new Error(
                datosCultivo.mensaje ||
                "No se pudo obtener el cultivo."
            );

        }


        const cultivoCompleto =
            datosCultivo.cultivo ||
            datosCultivo;


        const respuesta =
            await fetch(
                `${API_URL}/cultivos/${cultivoId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuario_id:
                            usuarioId,

                        nombre:
                            cultivoCompleto.nombre,

                        tipo:
                            cultivoCompleto.tipo,

                        agua:
                            cultivoCompleto.agua,

                        cosecha:
                            cultivoCompleto.cosecha,

                        finca_id:
                            Number(
                                fincaDestinoCultivo.id
                            ),

                        catalogo_cultivo_id:
                            cultivoCompleto.catalogo_cultivo_id
                                ? Number(
                                    cultivoCompleto.catalogo_cultivo_id
                                )
                                : null

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo asignar el cultivo."
            );

        }


        const nombreCultivo =
            cultivoCompleto.nombre;

        const nombreFinca =
            fincaDestinoCultivo.nombre;


        cerrarModalAsignarCultivo();


        await cargarFincas();


        alert(
            `"${nombreCultivo}" ahora pertenece a "${nombreFinca}".`
        );


    } catch (error) {

        console.error(
            "Error asignando cultivo:",
            error
        );


        mostrarError(
            error.message ||
            "No se pudo asignar el cultivo."
        );


    } finally {

        btnGuardarAsignacion.disabled =
            false;


        btnGuardarAsignacion.innerHTML = `

            <i class="fa-solid fa-link"></i>

            Asociar cultivo

        `;

    }

}


// ==========================================================
// QUITAR CULTIVO DE FINCA
// ==========================================================

async function quitarCultivoDeFinca(
    cultivo,
    finca
) {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {

        mostrarError(
            "No se pudo identificar al usuario."
        );

        return;
    }


    const confirmar =
        confirm(
            `¿Quieres quitar "${cultivo.nombre}" de "${finca.nombre}"?\n\nEl cultivo no será eliminado. Solo quedará sin finca asignada.`
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuestaCultivo =
            await fetch(
                `${API_URL}/cultivos/${cultivo.id}?usuario_id=${usuarioId}`
            );


        const datosCultivo =
            await respuestaCultivo.json();


        if (!respuestaCultivo.ok) {

            throw new Error(
                datosCultivo.mensaje ||
                "No se pudo obtener el cultivo."
            );

        }


        const cultivoCompleto =
            datosCultivo.cultivo ||
            datosCultivo;


        const respuesta =
            await fetch(
                `${API_URL}/cultivos/${cultivo.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuario_id:
                            usuarioId,

                        nombre:
                            cultivoCompleto.nombre,

                        tipo:
                            cultivoCompleto.tipo,

                        agua:
                            cultivoCompleto.agua,

                        cosecha:
                            cultivoCompleto.cosecha,

                        finca_id:
                            null,

                        catalogo_cultivo_id:
                            cultivoCompleto.catalogo_cultivo_id
                                ? Number(
                                    cultivoCompleto.catalogo_cultivo_id
                                )
                                : null

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo quitar el cultivo."
            );

        }


        await cargarFincas();


        alert(
            `"${cultivo.nombre}" quedó sin finca asignada.`
        );


    } catch (error) {

        console.error(
            "Error quitando cultivo:",
            error
        );


        mostrarError(
            error.message ||
            "No se pudo quitar el cultivo."
        );

    }

}


// ==========================================================
// ESTADO VACÍO
// ==========================================================

function mostrarEstadoVacio(
    mensajePersonalizado = null
) {

    if (!mensajeSinFincas) {
        return;
    }


    mensajeSinFincas.style.display =
        "block";


    const titulo =
        mensajeSinFincas.querySelector("h3");


    const texto =
        mensajeSinFincas.querySelector("p");


    if (mensajePersonalizado) {

        if (titulo) {

            titulo.textContent =
                "No se pudieron cargar las fincas";

        }


        if (texto) {

            texto.textContent =
                mensajePersonalizado;

        }

    } else {

        if (titulo) {

            titulo.textContent =
                "No tienes fincas registradas";

        }


        if (texto) {

            texto.textContent =
                "Crea tu primera finca para comenzar a administrar tus propiedades.";

        }

    }

}


// ==========================================================
// CREAR FINCA
// ==========================================================

async function crearFinca() {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {

        mostrarError(
            "No se pudo identificar al usuario."
        );

        return;
    }


    const nombre =
        nombreFinca.value.trim();


    const ubicacion =
        ubicacionFinca.value.trim();


    const area =
        extensionFinca.value;


    const descripcion =
        descripcionFinca.value.trim();


    if (!nombre) {

        alert(
            "Escribe el nombre de la finca."
        );

        nombreFinca.focus();

        return;
    }


    if (!ubicacion) {

        alert(
            "Escribe la ubicación de la finca."
        );

        ubicacionFinca.focus();

        return;
    }


    if (!area) {

        alert(
            "Escribe el área de la finca."
        );

        extensionFinca.focus();

        return;
    }


    const areaNumero =
        Number(area);


    if (
        Number.isNaN(areaNumero) ||
        areaNumero <= 0
    ) {

        alert(
            "El área debe ser mayor que 0."
        );

        extensionFinca.focus();

        return;
    }


    guardarFinca.disabled =
        true;


    guardarFinca.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Guardando...

    `;


    try {

        const respuesta =
            await fetch(
                `${API_URL}/fincas`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuario_id:
                            usuarioId,

                        nombre:
                            nombre,

                        ubicacion:
                            ubicacion,

                        area_total:
                            areaNumero,

                        descripcion:
                            descripcion ||
                            null

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo guardar la finca."
            );

        }


        cerrarModalFinca();


        await cargarFincas();


        alert(
            "Finca creada correctamente."
        );


    } catch (error) {

        console.error(
            "Error creando finca:",
            error
        );


        mostrarError(
            error.message ||
            "No se pudo guardar la finca."
        );


    } finally {

        guardarFinca.disabled =
            false;


        guardarFinca.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            Guardar finca

        `;

    }

}


// ==========================================================
// EDITAR FINCA
// ==========================================================

async function editarFinca(id) {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {

        mostrarError(
            "No se pudo identificar al usuario."
        );

        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/fincas/${id}?usuario_id=${usuarioId}`
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo obtener la finca."
            );

        }


        const finca =
            datos.finca;


        fincaId.value =
            finca.id;


        nombreFinca.value =
            finca.nombre || "";


        ubicacionFinca.value =
            finca.ubicacion || "";


        extensionFinca.value =
            finca.area_total || "";


        descripcionFinca.value =
            finca.descripcion || "";


        tituloModalFinca.textContent =
            "Editar finca";


        descripcionModalFinca.textContent =
            "Modifica los datos de tu finca.";


        guardarFinca.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            Guardar cambios

        `;


        modalFinca.classList.add(
            "active"
        );


    } catch (error) {

        console.error(
            "Error obteniendo finca:",
            error
        );


        mostrarError(
            error.message ||
            "No se pudo cargar la finca."
        );

    }

}


// ==========================================================
// ACTUALIZAR FINCA
// ==========================================================

async function actualizarFinca() {

    const usuarioId =
        obtenerUsuarioId();


    const id =
        fincaId.value;


    if (!usuarioId) {

        mostrarError(
            "No se pudo identificar al usuario."
        );

        return;
    }


    if (!id) {

        await crearFinca();

        return;
    }


    const nombre =
        nombreFinca.value.trim();


    const ubicacion =
        ubicacionFinca.value.trim();


    const area =
        extensionFinca.value;


    const descripcion =
        descripcionFinca.value.trim();


    if (!nombre) {

        alert(
            "Escribe el nombre de la finca."
        );

        nombreFinca.focus();

        return;
    }


    if (!ubicacion) {

        alert(
            "Escribe la ubicación de la finca."
        );

        ubicacionFinca.focus();

        return;
    }


    if (!area) {

        alert(
            "Escribe el área de la finca."
        );

        extensionFinca.focus();

        return;
    }


    const areaNumero =
        Number(area);


    if (
        Number.isNaN(areaNumero) ||
        areaNumero <= 0
    ) {

        alert(
            "El área debe ser mayor que 0."
        );

        extensionFinca.focus();

        return;
    }


    guardarFinca.disabled =
        true;


    guardarFinca.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Guardando...

    `;


    try {

        const respuesta =
            await fetch(
                `${API_URL}/fincas/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuario_id:
                            usuarioId,

                        nombre:
                            nombre,

                        ubicacion:
                            ubicacion,

                        area_total:
                            areaNumero,

                        descripcion:
                            descripcion ||
                            null

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo actualizar la finca."
            );

        }


        cerrarModalFinca();


        await cargarFincas();


        alert(
            "Finca actualizada correctamente."
        );


    } catch (error) {

        console.error(
            "Error actualizando finca:",
            error
        );


        mostrarError(
            error.message ||
            "No se pudo actualizar la finca."
        );


    } finally {

        guardarFinca.disabled =
            false;


        guardarFinca.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            Guardar cambios

        `;

    }

}


// ==========================================================
// FORMULARIO FINCA
// ==========================================================

if (formFinca) {

    formFinca.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (fincaId.value) {

                await actualizarFinca();

            } else {

                await crearFinca();

            }

        }
    );

}


// ==========================================================
// ELIMINAR FINCA
// ==========================================================

async function eliminarFinca(
    id,
    nombre
) {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {

        mostrarError(
            "No se pudo identificar al usuario."
        );

        return;
    }


    const confirmar =
        confirm(
            `¿Estás seguro de eliminar la finca "${nombre}"?\n\nLos cultivos asociados NO serán eliminados. Quedarán sin finca asignada.`
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/fincas/${id}?usuario_id=${usuarioId}`,
                {
                    method: "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar la finca."
            );

        }


        await cargarFincas();


        alert(
            "Finca eliminada correctamente."
        );


    } catch (error) {

        console.error(
            "Error eliminando finca:",
            error
        );


        mostrarError(
            error.message ||
            "No se pudo eliminar la finca."
        );

    }

}


// ==========================================================
// ESTADÍSTICAS
// ==========================================================

async function cargarEstadisticas() {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/fincas/estadisticas?usuario_id=${usuarioId}`
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudieron obtener las estadísticas."
            );

        }


        const estadisticas =
            datos.estadisticas;


        if (totalFincas) {

            totalFincas.textContent =
                estadisticas.total_fincas ?? 0;

        }


        if (areaTotal) {

            areaTotal.textContent =
                `${formatearArea(
                    estadisticas.area_total
                )} ha`;

        }


        if (cultivosActivos) {

            cultivosActivos.textContent =
                estadisticas.cultivos_activos ?? 0;

        }


    } catch (error) {

        console.error(
            "Error cargando estadísticas:",
            error
        );

    }

}


// ==========================================================
// INICIALIZACIÓN
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "🌱 HarvestX - Fincas iniciado."
        );


        if (!verificarSesion()) {
            return;
        }


        await cargarFincas();

    }
);