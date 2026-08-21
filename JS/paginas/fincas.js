// ==========================================================
// HARVESTX - MÓDULO FINCAS
// ==========================================================


// ==========================================================
// CONFIGURACIÓN
// ==========================================================

const API_URL = "http://127.0.0.1:5000";


// ==========================================================
// ELEMENTOS DEL DOM
// ==========================================================

const modalFinca = document.getElementById("modalFinca");
const btnNuevaFinca = document.getElementById("btnNuevaFinca");
const cerrarModal = document.getElementById("cerrarModal");
const cancelarModal = document.getElementById("cancelarModal");
const formFinca = document.getElementById("formFinca");
const fincasContainer = document.getElementById("fincasContainer");
const mensajeSinFincas = document.getElementById("mensajeSinFincas");

const fincaId = document.getElementById("fincaId");
const nombreFinca = document.getElementById("nombreFinca");
const ubicacionFinca = document.getElementById("ubicacionFinca");
const extensionFinca = document.getElementById("extensionFinca");
const descripcionFinca = document.getElementById("descripcionFinca");

const tituloModalFinca = document.getElementById("tituloModalFinca");
const descripcionModalFinca = document.getElementById("descripcionModalFinca");
const guardarFinca = document.getElementById("guardarFinca");

const totalFincas = document.getElementById("totalFincas");
const areaTotal = document.getElementById("areaTotal");
const cultivosActivos = document.getElementById("cultivosActivos");


// ==========================================================
// OBTENER USUARIO ACTUAL
// ==========================================================

function obtenerUsuarioActual() {

    const usuarioGuardado = localStorage.getItem("usuarioHarvestX");

    if (!usuarioGuardado) {

        console.warn(
            "No existe un usuario guardado en localStorage."
        );

        return null;
    }

    try {

        const datos = JSON.parse(usuarioGuardado);

        /*
         * El login.js actual guarda directamente:
         *
         * {
         *   id: 1,
         *   nombre: "...",
         *   usuario: "carlos",
         *   rol: "administrador",
         *   ...
         * }
         *
         * Por eso NO debemos buscar usuario.usuario
         * como si fuera otro objeto.
         */

        if (!datos || typeof datos !== "object") {

            console.warn(
                "El contenido de usuarioHarvestX no es válido."
            );

            return null;
        }

        /*
         * Compatibilidad por si en algún momento
         * el objeto viene dentro de otra propiedad.
         */

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
// OBTENER ID DEL USUARIO
// ==========================================================

function obtenerUsuarioId() {

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        return null;
    }

    const id = Number(usuario.id);

    if (!Number.isInteger(id) || id <= 0) {

        console.warn(
            "ID de usuario inválido:",
            usuario.id
        );

        return null;
    }

    return id;
}


// ==========================================================
// VERIFICAR SESIÓN
// ==========================================================

function verificarSesion() {

    const usuario = obtenerUsuarioActual();

    if (!usuario) {

        console.warn(
            "No hay una sesión válida."
        );

        return false;
    }

    const usuarioId = Number(usuario.id);

    if (
        !Number.isInteger(usuarioId) ||
        usuarioId <= 0
    ) {

        console.warn(
            "La sesión existe, pero el ID del usuario no es válido:",
            usuario
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
// MOSTRAR MODAL
// ==========================================================

function abrirModalNuevaFinca() {

    if (!modalFinca || !formFinca) {
        return;
    }

    formFinca.reset();

    if (fincaId) {
        fincaId.value = "";
    }

    if (tituloModalFinca) {

        tituloModalFinca.textContent =
            "Nueva finca";
    }

    if (descripcionModalFinca) {

        descripcionModalFinca.textContent =
            "Registra una nueva finca.";
    }

    if (guardarFinca) {

        guardarFinca.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Guardar finca
        `;
    }

    modalFinca.classList.add("active");
}


// ==========================================================
// CERRAR MODAL
// ==========================================================

function cerrarModalFinca() {

    if (!modalFinca) {
        return;
    }

    modalFinca.classList.remove("active");

    if (formFinca) {
        formFinca.reset();
    }

    if (fincaId) {
        fincaId.value = "";
    }
}


// ==========================================================
// EVENTOS DEL MODAL
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


// ==========================================================
// CERRAR MODAL HACIENDO CLICK FUERA
// ==========================================================

if (modalFinca) {

    modalFinca.addEventListener(
        "click",
        function(event) {

            if (event.target === modalFinca) {

                cerrarModalFinca();
            }
        }
    );
}


// ==========================================================
// CERRAR MODAL CON ESC
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
        }
    }
);


// ==========================================================
// CARGAR FINCAS
// ==========================================================

async function cargarFincas() {

    const usuarioId = obtenerUsuarioId();

    if (!usuarioId) {

        console.warn(
            "No se pudo obtener el ID del usuario."
        );

        mostrarEstadoVacio(
            "No se pudo identificar al usuario."
        );

        return;
    }

    console.log(
        `Cargando fincas del usuario ID: ${usuarioId}`
    );

    try {

        const respuesta = await fetch(
            `${API_URL}/fincas?usuario_id=${usuarioId}`
        );

        const datos = await respuesta.json();

        console.log(
            "Respuesta /fincas:",
            datos
        );

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                `Error HTTP: ${respuesta.status}`
            );
        }

        if (!datos.exito) {

            throw new Error(
                datos.mensaje ||
                "No se pudieron obtener las fincas."
            );
        }

        const fincas = datos.fincas || [];

        renderizarFincas(fincas);

        cargarEstadisticas();

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
// MOSTRAR FINCAS
// ==========================================================

function renderizarFincas(fincas) {

    if (!fincasContainer) {
        return;
    }

    fincasContainer.innerHTML = "";

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
        function(finca) {

            const tarjeta =
                crearTarjetaFinca(finca);

            fincasContainer.appendChild(
                tarjeta
            );
        }
    );
}


// ==========================================================
// CREAR TARJETA DE FINCA
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
            Number(finca.id) % iconos.length
        ];

    const area =
        Number(finca.area_total || 0);

    const areaTexto =
        Number.isInteger(area)
            ? area.toString()
            : area.toFixed(1);

    const descripcion =
        finca.descripcion
            ? String(finca.descripcion)
            : "Sin descripción";

    article.innerHTML = `

        <div class="finca-card-header">

            <div class="finca-icon">

                <i class="fa-solid ${icono}"></i>

            </div>

            <div class="finca-actions">

                <button
                    class="btn-icon"
                    title="Editar finca"
                    data-id="${finca.id}"
                    data-action="editar">

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    class="btn-icon delete"
                    title="Eliminar finca"
                    data-id="${finca.id}"
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

                ${escaparHTML(finca.ubicacion)}

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
                        Descripción
                    </span>

                    <strong
                        title="${escaparHTML(descripcion)}">

                        ${escaparHTML(
                            descripcion.length > 25
                                ? descripcion.substring(0, 25) + "..."
                                : descripcion
                        )}

                    </strong>

                </div>

            </div>

        </div>

    `;


    const botonEditar =
        article.querySelector(
            '[data-action="editar"]'
        );


    if (botonEditar) {

        botonEditar.addEventListener(
            "click",
            function() {

                editarFinca(finca.id);
            }
        );
    }


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


    return article;
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
// MOSTRAR ESTADO VACÍO
// ==========================================================

function mostrarEstadoVacio(
    mensajePersonalizado = null
) {

    if (!fincasContainer) {
        return;
    }

    if (mensajeSinFincas) {

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
                    "Crea tu primera finca para comenzar.";
            }
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


    guardarFinca.disabled = true;

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
                            descripcion || null
                    })
                }
            );


        const datos =
            await respuesta.json();


        console.log(
            "Respuesta crear finca:",
            datos
        );


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo guardar la finca."
            );
        }


        alert(
            "Finca creada correctamente. 🌱"
        );


        cerrarModalFinca();

        await cargarFincas();


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

        guardarFinca.disabled = false;

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


        console.log(
            "Finca recibida:",
            datos
        );


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


    guardarFinca.disabled = true;

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
                            descripcion || null
                    })
                }
            );


        const datos =
            await respuesta.json();


        console.log(
            "Respuesta actualizar finca:",
            datos
        );


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo actualizar la finca."
            );
        }


        alert(
            "Finca actualizada correctamente. 🌱"
        );


        cerrarModalFinca();

        await cargarFincas();


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

        guardarFinca.disabled = false;

        guardarFinca.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Guardar cambios
        `;
    }
}


// ==========================================================
// GUARDAR FORMULARIO
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
            `¿Estás seguro de eliminar la finca "${nombre}"?\n\n` +
            "Esta acción no se puede deshacer."
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


        console.log(
            "Respuesta eliminar finca:",
            datos
        );


        if (
            !respuesta.ok ||
            !datos.exito
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar la finca."
            );
        }


        alert(
            "Finca eliminada correctamente."
        );


        await cargarFincas();


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


        console.log(
            "Estadísticas:",
            datos
        );


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

            const area =
                Number(
                    estadisticas.area_total || 0
                );


            const areaTexto =
                Number.isInteger(area)
                    ? area.toString()
                    : area.toFixed(1);


            areaTotal.textContent =
                `${areaTexto} ha`;
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
    function() {

        console.log(
            "🌱 HarvestX - Fincas iniciado."
        );


        /*
         * Esperamos a que el DOM esté completamente
         * cargado y comprobamos la sesión.
         */

        const sesionValida =
            verificarSesion();


        if (!sesionValida) {

            console.warn(
                "No hay una sesión válida."
            );

            return;
        }


        /*
         * Mostrar en consola el usuario que se está usando.
         * Esto nos ayudará a comprobar que el ID llega correctamente.
         */

        console.log(
            "👤 Usuario actual:",
            obtenerUsuarioActual()
        );

        console.log(
            "🆔 ID utilizado para Fincas:",
            obtenerUsuarioId()
        );


        /*
         * Cargar fincas.
         */

        cargarFincas();

    }
);