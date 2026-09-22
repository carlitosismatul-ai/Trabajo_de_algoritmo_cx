// ==========================================
// CONFIGURACIÓN DEL SERVIDOR
// ==========================================

const API = "http://127.0.0.1:5000";


// ==========================================
// OBTENER USUARIO ACTUAL
// ==========================================

function obtenerUsuarioActual() {

    const usuarioGuardado = localStorage.getItem(
        "usuarioHarvestX"
    );

    if (!usuarioGuardado) {
        return null;
    }

    try {

        return JSON.parse(usuarioGuardado);

    } catch (error) {

        console.error(
            "Error al leer usuarioHarvestX:",
            error
        );

        return null;
    }
}


// ==========================================
// USUARIO ACTUAL
// ==========================================

const usuarioActual = obtenerUsuarioActual();


// ==========================================
// COMPROBAR SESIÓN
// ==========================================

if (!usuarioActual || !usuarioActual.id) {

    console.warn(
        "No hay un usuario autenticado en HarvestX."
    );

}


// ==========================================
// ELEMENTOS DEL MODAL
// ==========================================

const btnAgregarCultivo =
    document.getElementById("btnAgregarCultivo");

const modalCultivo =
    document.getElementById("modalCultivo");

const btnCerrarModal =
    document.getElementById("btnCerrarModal");

const btnVolverBusquedaCultivo =
    document.getElementById("btnVolverBusquedaCultivo");

const vistaBusquedaCultivo =
    document.getElementById("vistaBusquedaCultivo");

const vistaPersonalizadoCultivo =
    document.getElementById("vistaPersonalizadoCultivo");

const btnPersonalizadoCultivo =
    document.getElementById("btnPersonalizadoCultivo");

const formCultivo =
    document.getElementById("formCultivo");

const tituloModalCultivo =
    document.getElementById("tituloModalCultivo");

const btnGuardarCultivo =
    document.getElementById("btnGuardarCultivo");

const buscarCultivo =
    document.getElementById("buscarCultivo");

const resultadosCultivos =
    document.getElementById("resultadosCultivos");


// ==========================================
// VARIABLES
// ==========================================

let cultivoEditando = null;

let catalogoCultivoSeleccionado = null;


// ==========================================
// ABRIR MODAL PARA AGREGAR
// ==========================================

if (btnAgregarCultivo) {

    btnAgregarCultivo.addEventListener(
        
        "click",
        function () {
        
            cultivoEditando = null;

            catalogoCultivoSeleccionado = null;

            if (tituloModalCultivo) {

                tituloModalCultivo.innerHTML = `
                    <i class="fa-solid fa-seedling"></i>
                    Agregar cultivo
                `;

            }

            if (btnGuardarCultivo) {

                btnGuardarCultivo.innerHTML = `
                    <i class="fa-solid fa-plus"></i>
                    Guardar cultivo
                `;

            }

            if (formCultivo) {
                formCultivo.reset();
            }

            if (vistaBusquedaCultivo) {

                vistaBusquedaCultivo.style.display =
                    "block";

            }

            if (vistaPersonalizadoCultivo) {

                vistaPersonalizadoCultivo.style.display =
                    "none";

            }

            abrirModalCultivo();

        }
    );

}


// ==========================================
// FUNCIÓN PARA ABRIR MODAL
// ==========================================

function abrirModalCultivo() {

    if (!modalCultivo) {

        console.error(
            "No se encontró #modalCultivo"
        );

        return;

    }

    modalCultivo.classList.add("activo");

}


// ==========================================
// CERRAR MODAL
// ==========================================

if (btnCerrarModal) {

    btnCerrarModal.addEventListener(
        "click",
        cerrarModal
    );

}


function cerrarModal() {

    if (!modalCultivo) {
        return;
    }

    modalCultivo.classList.remove("activo");

    if (formCultivo) {
        formCultivo.reset();
    }

    cultivoEditando = null;

    catalogoCultivoSeleccionado = null;

    if (vistaBusquedaCultivo) {

        vistaBusquedaCultivo.style.display =
            "block";

    }

    if (vistaPersonalizadoCultivo) {

        vistaPersonalizadoCultivo.style.display =
            "none";

    }

    if (tituloModalCultivo) {

        tituloModalCultivo.innerHTML = `
            <i class="fa-solid fa-seedling"></i>
            Agregar cultivo
        `;

    }

    if (btnGuardarCultivo) {

        btnGuardarCultivo.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            Guardar cultivo
        `;

    }

}


// ==========================================
// CERRAR AL HACER CLICK FUERA
// ==========================================

if (modalCultivo) {

    modalCultivo.addEventListener(
        "click",
        function (evento) {

            if (evento.target === modalCultivo) {

                cerrarModal();

            }

        }
    );

}


// ==========================================
// CERRAR CON ESC
// ==========================================

document.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Escape" &&
            modalCultivo &&
            modalCultivo.classList.contains("activo")
        ) {

            cerrarModal();

        }

    }
);


// ==========================================
// REGISTRO PERSONALIZADO
// ==========================================

if (btnPersonalizadoCultivo) {

    btnPersonalizadoCultivo.addEventListener(
        "click",
        function () {

            if (vistaBusquedaCultivo) {

                vistaBusquedaCultivo.style.display =
                    "none";

            }

            if (vistaPersonalizadoCultivo) {

                vistaPersonalizadoCultivo.style.display =
                    "block";

            }

        }
    );

}


// ==========================================
// VOLVER A BÚSQUEDA
// ==========================================

if (btnVolverBusquedaCultivo) {

    btnVolverBusquedaCultivo.addEventListener(
        "click",
        function () {

            if (vistaPersonalizadoCultivo) {

                vistaPersonalizadoCultivo.style.display =
                    "none";

            }

            if (vistaBusquedaCultivo) {

                vistaBusquedaCultivo.style.display =
                    "block";

            }

        }
    );

}


// ==========================================
// GUARDAR / EDITAR CULTIVO
// ==========================================

if (formCultivo) {

    formCultivo.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            // ======================================
            // COMPROBAR USUARIO
            // ======================================

            if (
                !usuarioActual ||
                !usuarioActual.id
            ) {

                alert(
                    "No se pudo identificar al usuario actual."
                );

                return;

            }


            // ======================================
            // OBTENER DATOS
            // ======================================

            const nombre =
                document.getElementById(
                    "nombreCultivo"
                ).value.trim();

            const tipo =
                document.getElementById(
                    "tipoCultivo"
                ).value.trim();

            const agua =
                document.getElementById(
                    "aguaCultivo"
                ).value.trim();

            const cosecha =
                document.getElementById(
                    "cosechaCultivo"
                ).value.trim();


            // ======================================
            // VALIDAR DATOS
            // ======================================

            if (
                nombre === "" ||
                tipo === "" ||
                agua === "" ||
                cosecha === ""
            ) {

                alert(
                    "Completa todos los campos del cultivo."
                );

                return;

            }


            // ======================================
            // CONFIGURAR PETICIÓN
            // ======================================

            let url =
                `${API}/cultivos`;

            let metodo =
                "POST";


            // ======================================
            // SI ESTAMOS EDITANDO
            // ======================================

            if (
                cultivoEditando !== null
            ) {

                url =
                    `${API}/cultivos/${cultivoEditando}`;

                metodo =
                    "PUT";

            }


            try {

                const respuesta =
                    await fetch(
                        url,
                        {

                            method: metodo,

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                nombre:
                                    nombre,

                                tipo:
                                    tipo,

                                agua:
                                    agua,

                                cosecha:
                                    cosecha,

                                catalogo_cultivo_id:
                                    catalogoCultivoSeleccionado,

                                usuario_id:
                                    usuarioActual.id

                            })

                        }
                    );


                const resultado =
                    await respuesta.json();


                if (respuesta.ok) {

                    cerrarModal();

                    await cargarCultivos();

                } else {

                    alert(
                        "Error: " +
                        (
                            resultado.mensaje ||
                            "No se pudo guardar el cultivo."
                        )
                    );

                }


            } catch (error) {

                console.error(
                    "Error al guardar cultivo:",
                    error
                );

                alert(
                    "No se pudo conectar con el servidor de HarvestX."
                );

            }

        }
    );

}


// ==========================================
// CARGAR CULTIVOS DEL USUARIO
// ==========================================

async function cargarCultivos() {

    if (
        !usuarioActual ||
        !usuarioActual.id
    ) {

        return;

    }


    try {

        const respuesta =
            await fetch(
                `${API}/cultivos?usuario_id=${usuarioActual.id}`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los cultivos."
            );

        }


        const cultivos =
            await respuesta.json();


        const contenedor =
            document.querySelector(
                ".cultivos-container"
            );


        if (!contenedor) {

            console.error(
                "No se encontró .cultivos-container"
            );

            return;

        }


        // ======================================
        // LIMPIAR TARJETAS
        // ======================================

        contenedor.innerHTML = "";


        // ======================================
        // SI NO HAY CULTIVOS
        // ======================================

        if (
            cultivos.length === 0
        ) {

            contenedor.innerHTML = `

                <div class="mensaje-busqueda">

                    <i class="fa-solid fa-seedling"></i>

                    <p>
                        Este usuario todavía no tiene cultivos registrados.
                    </p>

                </div>

            `;

            return;

        }


        // ======================================
        // CREAR TARJETAS
        // ======================================

        cultivos.forEach(
            cultivo => {

                const cultivoCard =
                    document.createElement(
                        "div"
                    );


                cultivoCard.className =
                    "cultivo-card";


                cultivoCard.innerHTML = `

                    <div class="cultivo-icono">

                        ${
                            cultivo.imagen

                            ?

                            `

                                <img
                                    src="../../IMG/cultivos/${cultivo.imagen}"
                                    alt="${cultivo.nombre}"
                                    class="cultivo-imagen"
                                >

                            `

                            :

                            `

                                <i class="fa-solid fa-seedling text-dark-green"></i>

                            `
                        }

                    </div>


                    <div class="cultivo-info">

                        <div class="cultivo-header">

                            <h4>
                                ${cultivo.nombre}
                            </h4>

                            <span class="estado-activo">

                                ● ${cultivo.estado}

                            </span>

                        </div>


                        <p class="cultivo-tipo">

                            Tipo:
                            ${cultivo.tipo}

                        </p>


                        <div class="cultivo-datos">

                            <span class="dato-cultivo">

                                <i class="fa-solid fa-droplet text-blue"></i>

                                Agua:
                                ${cultivo.agua}

                            </span>


                            <span class="dato-cultivo">

                                <i class="fa-solid fa-calendar text-green"></i>

                                Cosecha:
                                ${cultivo.cosecha}

                            </span>

                        </div>

                    </div>


                    <div class="cultivo-acciones">

                        <button
                            type="button"
                            class="btn-cultivo btn-editar"
                            title="Editar cultivo"
                            data-id="${cultivo.id}"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="btn-cultivo btn-eliminar"
                            title="Eliminar cultivo"
                            data-id="${cultivo.id}"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                `;


                contenedor.appendChild(
                    cultivoCard
                );

            }
        );


    } catch (error) {

        console.error(
            "Error al cargar cultivos:",
            error
        );

    }

}


// ==========================================
// BUSCAR CULTIVOS DEL CATÁLOGO
// ==========================================

if (buscarCultivo) {

    buscarCultivo.addEventListener(
        "input",
        async function () {

            const texto =
                buscarCultivo.value.trim();


            // ==================================
            // BUSCADOR VACÍO
            // ==================================

            if (
                texto === ""
            ) {

                resultadosCultivos.innerHTML = `

                    <div class="mensaje-busqueda">

                        <i class="fa-solid fa-seedling"></i>

                        <p>
                            Escribe el nombre de un cultivo para buscar.
                        </p>

                    </div>

                `;

                return;

            }


            try {

                const respuesta =
                    await fetch(
                        `${API}/catalogo-cultivos?buscar=${encodeURIComponent(texto)}`
                    );


                if (!respuesta.ok) {

                    throw new Error(
                        "No se pudo consultar el catálogo."
                    );

                }


                const cultivos =
                    await respuesta.json();


                resultadosCultivos.innerHTML =
                    "";


                // ==================================
                // SIN RESULTADOS
                // ==================================

                if (
                    cultivos.length === 0
                ) {

                    resultadosCultivos.innerHTML = `

                        <div class="mensaje-busqueda">

                            <i class="fa-solid fa-circle-exclamation"></i>

                            <p>
                                No se encontraron cultivos.
                            </p>

                        </div>

                    `;

                    return;

                }


                // ==================================
                // MOSTRAR RESULTADOS
                // ==================================

                cultivos.forEach(
                    cultivo => {

                        const resultado =
                            document.createElement(
                                "div"
                            );


                        resultado.className =
                            "resultado-cultivo";


                        resultado.innerHTML = `

                            <img
                                src="../../IMG/cultivos/${cultivo.imagen}"
                                alt="${cultivo.nombre}"
                            >


                            <div class="resultado-cultivo-info">

                                <h4>
                                    ${cultivo.nombre}
                                </h4>


                                <p>
                                    Tipo:
                                    ${cultivo.tipo}
                                </p>


                                <p>
                                    Agua:
                                    ${cultivo.agua}
                                </p>


                                <p>
                                    Cosecha:
                                    ${cultivo.cosecha}
                                </p>


                                <p class="descripcion">
                                    ${cultivo.descripcion || ""}
                                </p>

                            </div>


                            <div class="resultado-cultivo-flecha">

                                <i class="fa-solid fa-chevron-right"></i>

                            </div>

                        `;


                        resultado.addEventListener(
                            "click",
                            function () {

                                seleccionarCultivoCatalogo(
                                    cultivo
                                );

                            }
                        );


                        resultadosCultivos.appendChild(
                            resultado
                        );

                    }
                );


            } catch (error) {

                console.error(
                    "Error al buscar cultivos:",
                    error
                );


                resultadosCultivos.innerHTML = `

                    <div class="mensaje-busqueda">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                        <p>
                            No se pudo conectar con el catálogo.
                        </p>

                    </div>

                `;

            }

        }
    );

}


// ==========================================
// SELECCIONAR CULTIVO DEL CATÁLOGO
// ==========================================

function seleccionarCultivoCatalogo(
    cultivo
) {

    // ======================================
    // GUARDAR ID DEL CATÁLOGO
    // ======================================

    catalogoCultivoSeleccionado =
        cultivo.id;


    // ======================================
    // PASAR DATOS AL FORMULARIO
    // ======================================

    document.getElementById(
        "nombreCultivo"
    ).value =
        cultivo.nombre;


    document.getElementById(
        "tipoCultivo"
    ).value =
        cultivo.tipo;


    document.getElementById(
        "aguaCultivo"
    ).value =
        cultivo.agua;


    document.getElementById(
        "cosechaCultivo"
    ).value =
        cultivo.cosecha;


    // ======================================
    // MOSTRAR FORMULARIO
    // ======================================

    if (vistaBusquedaCultivo) {

        vistaBusquedaCultivo.style.display =
            "none";

    }

    if (vistaPersonalizadoCultivo) {

        vistaPersonalizadoCultivo.style.display =
            "block";

    }

}


// ==========================================
// EDITAR CULTIVO
// ==========================================

document.addEventListener(
    "click",
    async function (evento) {

        const botonEditar =
            evento.target.closest(
                ".btn-editar"
            );


        if (!botonEditar) {

            return;

        }


        // ======================================
        // COMPROBAR USUARIO
        // ======================================

        if (
            !usuarioActual ||
            !usuarioActual.id
        ) {

            alert(
                "No se pudo identificar al usuario actual."
            );

            return;

        }


        const id =
            botonEditar.dataset.id;


        if (!id) {

            console.error(
                "El botón de editar no tiene data-id."
            );

            return;

        }


        try {

            const respuesta =
                await fetch(
                    `${API}/cultivos/${id}?usuario_id=${usuarioActual.id}`
                );


            const cultivo =
                await respuesta.json();


            if (!respuesta.ok) {

                alert(
                    cultivo.mensaje ||
                    "No se pudo obtener el cultivo."
                );

                return;

            }


            // ==================================
            // GUARDAR ID
            // ==================================

            cultivoEditando =
                id;


            // ==================================
            // GUARDAR CATÁLOGO
            // ==================================

            catalogoCultivoSeleccionado =
                cultivo.catalogo_cultivo_id ||
                null;


            // ==================================
            // CAMBIAR TÍTULO
            // ==================================

            if (tituloModalCultivo) {

                tituloModalCultivo.innerHTML = `

                    <i class="fa-solid fa-pen"></i>

                    Editar cultivo

                `;

            }


            // ==================================
            // CAMBIAR BOTÓN
            // ==================================

            if (btnGuardarCultivo) {

                btnGuardarCultivo.innerHTML = `

                    <i class="fa-solid fa-floppy-disk"></i>

                    Guardar cambios

                `;

            }


            // ==================================
            // CARGAR DATOS
            // ==================================

            document.getElementById(
                "nombreCultivo"
            ).value =
                cultivo.nombre || "";


            document.getElementById(
                "tipoCultivo"
            ).value =
                cultivo.tipo || "";


            document.getElementById(
                "aguaCultivo"
            ).value =
                cultivo.agua || "";


            document.getElementById(
                "cosechaCultivo"
            ).value =
                cultivo.cosecha || "";


            // ==================================
            // MOSTRAR FORMULARIO
            // ==================================

            if (vistaBusquedaCultivo) {

                vistaBusquedaCultivo.style.display =
                    "none";

            }

            if (vistaPersonalizadoCultivo) {

                vistaPersonalizadoCultivo.style.display =
                    "block";

            }


            // ==================================
            // ABRIR MODAL
            // ==================================

            abrirModalCultivo();


        } catch (error) {

            console.error(
                "Error al obtener cultivo:",
                error
            );


            alert(
                "No se pudo conectar con el servidor de HarvestX."
            );

        }

    }
);


// ==========================================
// ELIMINAR CULTIVO
// ==========================================

document.addEventListener(
    "click",
    async function (evento) {

        const botonEliminar =
            evento.target.closest(
                ".btn-eliminar"
            );


        if (!botonEliminar) {

            return;

        }


        // ======================================
        // COMPROBAR USUARIO
        // ======================================

        if (
            !usuarioActual ||
            !usuarioActual.id
        ) {

            alert(
                "No se pudo identificar al usuario actual."
            );

            return;

        }


        const id =
            botonEliminar.dataset.id;


        // ======================================
        // CONFIRMAR
        // ======================================

        const confirmar =
            confirm(
                "¿Estás seguro de que deseas eliminar este cultivo?"
            );


        if (!confirmar) {

            return;

        }


        try {

            const respuesta =
                await fetch(
                    `${API}/cultivos/${id}?usuario_id=${usuarioActual.id}`,
                    {
                        method: "DELETE"
                    }
                );


            const resultado =
                await respuesta.json();


            if (respuesta.ok) {

                alert(
                    "Cultivo eliminado correctamente 🌱"
                );


                await cargarCultivos();


            } else {

                alert(
                    "Error: " +
                    (
                        resultado.mensaje ||
                        "No se pudo eliminar el cultivo."
                    )
                );

            }


        } catch (error) {

            console.error(
                "Error al eliminar cultivo:",
                error
            );


            alert(
                "No se pudo conectar con el servidor de HarvestX."
            );

        }

    }
);


// ==========================================
// INICIAR
// ==========================================

cargarCultivos();