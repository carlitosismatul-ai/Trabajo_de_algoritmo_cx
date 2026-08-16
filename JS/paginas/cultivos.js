// ==========================================
// ELEMENTOS DEL MODAL
// ==========================================

const btnAgregarCultivo = document.getElementById("btnAgregarCultivo");
const modalCultivo = document.getElementById("modalCultivo");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const btnCancelarCultivo = document.getElementById("btnCancelarCultivo");
const formCultivo = document.getElementById("formCultivo");
let cultivoEditando = null;

const tituloModalCultivo = document.getElementById("tituloModalCultivo");
const btnGuardarCultivo = document.getElementById("btnGuardarCultivo");

// ==========================================
// ABRIR MODAL
// ==========================================

btnAgregarCultivo.addEventListener("click", function () {

    cultivoEditando = null;

    tituloModalCultivo.innerHTML = `
        <i class="fa-solid fa-seedling"></i>
        Agregar cultivo
    `;

    btnGuardarCultivo.innerHTML = `
        <i class="fa-solid fa-plus"></i>
        Guardar cultivo
    `;

    formCultivo.reset();

    modalCultivo.classList.add("activo");

});

// ==========================================
// CERRAR MODAL
// ==========================================

btnCerrarModal.addEventListener("click", cerrarModal);
btnCancelarCultivo.addEventListener("click", cerrarModal);

function cerrarModal() {

    modalCultivo.classList.remove("activo");

    formCultivo.reset();

    cultivoEditando = null;

}


// ==========================================
// CERRAR AL HACER CLICK FUERA
// ==========================================

modalCultivo.addEventListener("click", function (evento) {

    if (evento.target === modalCultivo) {
        cerrarModal();
    }

});


// ==========================================
// GUARDAR CULTIVO EN MYSQL
// ==========================================

// ==========================================
// GUARDAR / EDITAR CULTIVO
// ==========================================

formCultivo.addEventListener("submit", async function (evento) {

    evento.preventDefault();

    const nombre = document.getElementById("nombreCultivo").value;
    const tipo = document.getElementById("tipoCultivo").value;
    const agua = document.getElementById("aguaCultivo").value;
    const cosecha = document.getElementById("cosechaCultivo").value;

    try {

        let url = "http://127.0.0.1:5000/cultivos";
        let metodo = "POST";

        // Si existe un cultivo en edición
        if (cultivoEditando !== null) {

            url = `http://127.0.0.1:5000/cultivos/${cultivoEditando}`;
            metodo = "PUT";

        }

        const respuesta = await fetch(url, {

            method: metodo,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nombre: nombre,
                tipo: tipo,
                agua: agua,
                cosecha: cosecha
            })

        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {

    cerrarModal();

    location.reload();

}

            else {

            alert("Error: " + resultado.mensaje);

        }

    } catch (error) {

        console.error(error);

        alert("No se pudo conectar con el servidor de HarvestX ❌");

    }

});
// ==========================================
// CARGAR CULTIVOS DESDE MYSQL
// ==========================================

async function cargarCultivos() {

    try {

        const respuesta = await fetch("http://127.0.0.1:5000/cultivos");

        const cultivos = await respuesta.json();

        const contenedor = document.querySelector(".cultivos-container");

        // Limpiar las tarjetas actuales
        contenedor.innerHTML = "";

        // Crear una tarjeta por cada cultivo
        cultivos.forEach(cultivo => {

            const cultivoCard = document.createElement("div");

            cultivoCard.className = "cultivo-card";

            cultivoCard.innerHTML = `

                <div class="cultivo-icono">
                    <i class="fa-solid fa-seedling text-dark-green"></i>
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
                        Tipo: ${cultivo.tipo}
                    </p>

                    <div class="cultivo-datos">

                        <span class="dato-cultivo">

                            <i class="fa-solid fa-droplet text-blue"></i>

                            Agua: ${cultivo.agua}

                        </span>

                        <span class="dato-cultivo">

                            <i class="fa-solid fa-calendar text-green"></i>

                            Cosecha: ${cultivo.cosecha}

                        </span>

                    </div>

                </div>

                <div class="cultivo-acciones">

                    <button
                        class="btn-cultivo btn-editar"
                        title="Editar cultivo"
                        data-id="${cultivo.id}"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn-cultivo btn-eliminar"
                        title="Eliminar cultivo"
                        data-id="${cultivo.id}"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            `;

            contenedor.appendChild(cultivoCard);

        });

    } catch (error) {

        console.error("Error al cargar cultivos:", error);

    }

}

// ==========================================
// EDITAR CULTIVO
// ==========================================

document.addEventListener("click", async function (evento) {

    const botonEditar = evento.target.closest(".btn-editar");

    if (!botonEditar) {
        return;
    }

    const id = botonEditar.dataset.id;

    try {

        const respuesta = await fetch(
            `http://127.0.0.1:5000/cultivos/${id}`
        );

        const cultivo = await respuesta.json();

        if (!respuesta.ok) {

            alert("No se pudo obtener el cultivo.");

            return;

        }

        // Guardar ID del cultivo que estamos editando
        cultivoEditando = id;

        // Cambiar título
        tituloModalCultivo.innerHTML = `
            <i class="fa-solid fa-pen"></i>
            Editar cultivo
        `;

        // Cambiar botón
        btnGuardarCultivo.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Guardar cambios
        `;

        // Cargar datos en el formulario
        document.getElementById("nombreCultivo").value = cultivo.nombre;
        document.getElementById("tipoCultivo").value = cultivo.tipo;
        document.getElementById("aguaCultivo").value = cultivo.agua;
        document.getElementById("cosechaCultivo").value = cultivo.cosecha;

        // Abrir modal
        modalCultivo.classList.add("activo");

    } catch (error) {

        console.error("Error al obtener cultivo:", error);

        alert("No se pudo conectar con el servidor de HarvestX ❌");

    }

});
// ==========================================
// ELIMINAR CULTIVO
// ==========================================

document.addEventListener("click", async function (evento) {

    const botonEliminar = evento.target.closest(".btn-eliminar");

    if (!botonEliminar) {
        return;
    }

    const id = botonEliminar.dataset.id;

    // Confirmación antes de eliminar
    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este cultivo?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `http://127.0.0.1:5000/cultivos/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await respuesta.json();

        if (respuesta.ok) {

            alert("Cultivo eliminado correctamente 🌱");

            // Volver a cargar la lista
            cargarCultivos();

        } else {

            alert("Error: " + resultado.mensaje);

        }

    } catch (error) {

        console.error("Error al eliminar cultivo:", error);

        alert(
            "No se pudo conectar con el servidor de HarvestX ❌"
        );

    }

});
cargarCultivos();