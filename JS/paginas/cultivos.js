// ==========================================
// ELEMENTOS DEL MODAL
// ==========================================

const btnAgregarCultivo = document.getElementById("btnAgregarCultivo");
const modalCultivo = document.getElementById("modalCultivo");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const btnCancelarCultivo = document.getElementById("btnCancelarCultivo");
const formCultivo = document.getElementById("formCultivo");


// ==========================================
// ABRIR MODAL
// ==========================================

btnAgregarCultivo.addEventListener("click", function () {
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

formCultivo.addEventListener("submit", async function (evento) {

    evento.preventDefault();

    // Obtener datos
    const nombre = document.getElementById("nombreCultivo").value;
    const tipo = document.getElementById("tipoCultivo").value;
    const agua = document.getElementById("aguaCultivo").value;
    const cosecha = document.getElementById("cosechaCultivo").value;


    try {

        const respuesta = await fetch("http://127.0.0.1:5000/cultivos", {

            method: "POST",

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

            alert("Cultivo agregado correctamente 🌱");

            cerrarModal();

            location.reload();

        } else {

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
// EJECUTAR AL CARGAR LA PÁGINA
// ==========================================

cargarCultivos();