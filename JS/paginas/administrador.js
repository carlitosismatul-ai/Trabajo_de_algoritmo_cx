// ==========================================
// HARVESTX - JAVASCRIPT ADMINISTRADOR
// ==========================================


// ==========================================
// VOZ DEL ASISTENTE HARVESTX
// ==========================================

const vozBienvenida =
    new Audio("../../song/bienvenida.mp3");

vozBienvenida.volume = 1;


// ==========================================
// REPRODUCIR BIENVENIDA
// ==========================================

function reproducirBienvenida() {

    vozBienvenida.pause();
    vozBienvenida.currentTime = 0;

    vozBienvenida.play()
        .catch(error => {

            console.warn(
                "No se pudo reproducir la voz de bienvenida:",
                error
            );

        });

}


// ==========================================
// DETENER BIENVENIDA
// ==========================================

function detenerBienvenida() {

    vozBienvenida.pause();
    vozBienvenida.currentTime = 0;

}


// ==========================================
// BIENVENIDA ADMINISTRADOR
// ==========================================

function bienvenidaAdministrador() {

    reproducirBienvenida();

}


// ==========================================
// CONFIGURAR AVATAR
// ==========================================

function configurarAvatar(usuario) {

    const avatar =
        document.getElementById("openProfile");

    const avatarImg =
        document.getElementById("avatarImagen");

    if (!avatar || !avatarImg) {
        return;
    }

    const nombre =
        usuario.nombre || "Usuario";

    const inicial =
        nombre
            .trim()
            .charAt(0)
            .toUpperCase();


    // ==========================================
    // FOTO DEL USUARIO
    // ==========================================

    const foto =
        usuario.foto || null;


    if (foto) {

        const rutaFoto =
            `http://127.0.0.1:5000/IMG/${foto}`;


        avatarImg.src =
            rutaFoto;


        avatarImg.alt =
            `Foto de perfil de ${nombre}`;


        avatarImg.style.display =
            "block";


        avatar.style.display =
            "flex";


        avatar.style.alignItems =
            "center";


        avatar.style.justifyContent =
            "center";


        avatar.style.fontSize =
            "";


        avatar.style.fontWeight =
            "";


        avatar.style.backgroundImage =
            "none";


        avatarImg.onerror = () => {

            console.error(
                "No se pudo cargar la imagen:",
                rutaFoto
            );


            avatarImg.style.display =
                "none";


            mostrarInicial(
                avatar,
                inicial
            );

        };


        return;

    }


    // ==========================================
    // SIN FOTO
    // ==========================================

    avatarImg.src =
        "";


    avatarImg.style.display =
        "none";


    mostrarInicial(
        avatar,
        inicial
    );

}


// ==========================================
// MOSTRAR INICIAL
// ==========================================

function mostrarInicial(
    avatar,
    inicial
) {

    if (!avatar) {
        return;
    }


    const avatarImg =
        document.getElementById("avatarImagen");


    if (avatarImg) {

        avatarImg.style.display =
            "none";

    }


    avatar.textContent =
        inicial;


    avatar.style.backgroundImage =
        "none";


    avatar.style.display =
        "flex";


    avatar.style.alignItems =
        "center";


    avatar.style.justifyContent =
        "center";


    avatar.style.fontWeight =
        "700";


    avatar.style.fontSize =
        "20px";

}


// ==========================================
// INICIO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ==========================================
        // USUARIO LOGUEADO
        // ==========================================

        const usuarioGuardado =
            localStorage.getItem(
                "usuarioHarvestX"
            );


        // ==========================================
        // NO HAY SESIÓN
        // ==========================================

        if (!usuarioGuardado) {

            console.warn(
                "No hay una sesión activa."
            );


            window.location.href =
                "../../login.html";


            return;

        }


        // ==========================================
        // LEER USUARIO
        // ==========================================

        let usuarioActual;


        try {

            usuarioActual =
                JSON.parse(
                    usuarioGuardado
                );

        }

        catch (error) {

            console.error(
                "Error al leer los datos del usuario:",
                error
            );


            localStorage.removeItem(
                "usuarioHarvestX"
            );


            sessionStorage.removeItem(
                "bienvenidaHarvestX"
            );


            window.location.href =
                "../../login.html";


            return;

        }


        // ==========================================
        // VERIFICAR ROL
        // ==========================================

        if (
            !usuarioActual.rol ||
            usuarioActual.rol.toLowerCase() !==
            "administrador"
        ) {

            console.warn(
                "El usuario no tiene permisos de administrador."
            );


            localStorage.removeItem(
                "usuarioHarvestX"
            );


            sessionStorage.removeItem(
                "bienvenidaHarvestX"
            );


            window.location.href =
                "../../login.html";


            return;

        }


        // ==========================================
        // MOSTRAR NOMBRE
        // ==========================================

        const nombreBienvenida =
            document.getElementById(
                "nombreBienvenida"
            );


        const nombreUsuario =
            document.getElementById(
                "nombreUsuario"
            );


        if (nombreBienvenida) {

            nombreBienvenida.textContent =
                `¡Bienvenido, ${usuarioActual.nombre || "Usuario"}! 👋`;

        }


        if (nombreUsuario) {

            nombreUsuario.textContent =
                usuarioActual.nombre || "Usuario";

        }


        // ==========================================
        // MOSTRAR ROL
        // ==========================================

        const rolUsuario =
            document.getElementById(
                "rolUsuario"
            );


        const rolTexto =
            document.querySelector(
                ".user-details .role"
            );


        const rol =
            usuarioActual.rol || "usuario";


        const rolFormateado =
            rol.charAt(0).toUpperCase() +
            rol.slice(1);


        if (rolUsuario) {

            rolUsuario.textContent =
                rolFormateado;

        }


        if (rolTexto) {

            rolTexto.textContent =
                rolFormateado;

        }


        // ==========================================
        // CONFIGURAR AVATAR
        // ==========================================

        configurarAvatar(
            usuarioActual
        );


        // ==========================================
        // CONFIGURACIÓN
        // ==========================================

        const htmlElement =
            document.documentElement;


        const temaGuardado =
            localStorage.getItem(
                "temaHarvestX"
            );


        const fuenteGuardada =
            localStorage.getItem(
                "fuenteHarvestX"
            );


        const escalaGuardada =
            localStorage.getItem(
                "escalaHarvestX"
            );


        // ==========================================
        // TEMA
        // ==========================================

        if (
            temaGuardado ===
            "dark"
        ) {

            htmlElement.setAttribute(
                "data-theme",
                "dark"
            );

        }

        else {

            htmlElement.removeAttribute(
                "data-theme"
            );

        }


        // ==========================================
        // FUENTE
        // ==========================================

        if (fuenteGuardada) {

            htmlElement.style.setProperty(
                "--fuente-actual",
                fuenteGuardada
            );

        }


        // ==========================================
        // TAMAÑO
        // ==========================================

        if (escalaGuardada) {

            htmlElement.style.setProperty(
                "--escala-texto",
                escalaGuardada
            );

        }


        // ==========================================
        // LOADER
        // ==========================================

        const loader =
            document.getElementById(
                "loader"
            );


        setTimeout(() => {

            if (loader) {

                loader.classList.add(
                    "hidden"
                );

            }


            document
                .querySelectorAll(".fade-up")
                .forEach(el => {

                    el.classList.add(
                        "visible"
                    );

                });


            initCharts();


            // ======================================
            // VOZ DE BIENVENIDA
            // ======================================

            const sonidoActivado =
                localStorage.getItem(
                    "sonidoHarvestX"
                ) === "on";


            const bienvenidaReproducida =
                sessionStorage.getItem(
                    "bienvenidaHarvestX"
                ) === "si";


            /*
             * La bienvenida se reproduce solamente
             * una vez durante la sesión actual.
             *
             * sessionStorage permanece al cambiar
             * entre las páginas del sistema.
             */

            if (
                sonidoActivado &&
                !bienvenidaReproducida
            ) {

                sessionStorage.setItem(
                    "bienvenidaHarvestX",
                    "si"
                );


                setTimeout(() => {

                    bienvenidaAdministrador();

                }, 500);

            }


        }, 1000);


        // ==========================================
        // SIDEBAR
        // ==========================================

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const mainContent =
            document.getElementById(
                "mainContent"
            );


        const toggleSidebarDesktop =
            document.getElementById(
                "toggleSidebarDesktop"
            );


        if (toggleSidebarDesktop) {

            toggleSidebarDesktop.addEventListener(
                "click",
                () => {

                    if (sidebar) {

                        sidebar.classList.toggle(
                            "collapsed"
                        );

                    }


                    if (mainContent) {

                        mainContent.classList.toggle(
                            "expanded"
                        );

                    }

                }
            );

        }


        // ==========================================
        // MENÚ MÓVIL
        // ==========================================

        const menuToggleMobile =
            document.getElementById(
                "menuToggleMobile"
            );


        const closeSidebarMobile =
            document.getElementById(
                "closeSidebarMobile"
            );


        if (menuToggleMobile) {

            menuToggleMobile.addEventListener(
                "click",
                () => {

                    if (sidebar) {

                        sidebar.classList.add(
                            "active"
                        );

                    }

                }
            );

        }


        if (closeSidebarMobile) {

            closeSidebarMobile.addEventListener(
                "click",
                () => {

                    if (sidebar) {

                        sidebar.classList.remove(
                            "active"
                        );

                    }

                }
            );

        }


        // ==========================================
        // CERRAR SIDEBAR AL HACER CLICK AFUERA
        // ==========================================

        document.addEventListener(
            "click",
            (e) => {

                if (
                    window.innerWidth <=
                    768
                ) {

                    if (
                        sidebar &&
                        sidebar.classList.contains(
                            "active"
                        ) &&
                        menuToggleMobile
                    ) {

                        if (
                            !sidebar.contains(
                                e.target
                            ) &&
                            !menuToggleMobile.contains(
                                e.target
                            )
                        ) {

                            sidebar.classList.remove(
                                "active"
                            );

                        }

                    }

                }

            }
        );


        // ==========================================
        // MODAL PERFIL
        // ==========================================

        const profileModal =
            document.getElementById(
                "profileModal"
            );


        const openProfile =
            document.getElementById(
                "openProfile"
            );


        const closeProfile =
            document.getElementById(
                "closeProfile"
            );


        const cancelProfile =
            document.getElementById(
                "cancelProfile"
            );


        // ==========================================
        // CAMPOS DEL PERFIL
        // ==========================================

        const profileNombre =
            document.getElementById(
                "profileNombre"
            );


        const profileUsuario =
            document.getElementById(
                "profileUsuario"
            );


        const profileRol =
            document.getElementById(
                "profileRol"
            );


        const profilePhotoPreview =
            document.getElementById(
                "profilePhotoPreview"
            );


        const profilePhotoInput =
            document.getElementById(
                "profilePhotoInput"
            );


        const saveProfile =
            document.getElementById(
                "saveProfile"
            );


        // ==========================================
        // ABRIR PERFIL
        // ==========================================

        if (openProfile) {

            openProfile.addEventListener(
                "click",
                () => {

                    if (!profileModal) {
                        return;
                    }


                    // --------------------------------------
                    // CARGAR NOMBRE
                    // --------------------------------------

                    if (profileNombre) {

                        profileNombre.value =
                            usuarioActual.nombre || "";

                    }


                    // --------------------------------------
                    // CARGAR USUARIO
                    // --------------------------------------

                    if (profileUsuario) {

                        profileUsuario.value =
                            usuarioActual.usuario || "";

                    }


                    // --------------------------------------
                    // CARGAR ROL
                    // --------------------------------------

                    if (profileRol) {

                        profileRol.value =
                            rolFormateado;

                    }


                    // --------------------------------------
                    // CARGAR FOTO
                    // --------------------------------------

                    cargarFotoPerfil(
                        usuarioActual
                    );


                    profileModal.classList.add(
                        "active"
                    );

                }
            );

        }


        // ==========================================
        // CERRAR PERFIL
        // ==========================================

        function cerrarPerfil() {

            if (profileModal) {

                profileModal.classList.remove(
                    "active"
                );

            }

        }


        if (closeProfile) {

            closeProfile.addEventListener(
                "click",
                cerrarPerfil
            );

        }


        if (cancelProfile) {

            cancelProfile.addEventListener(
                "click",
                cerrarPerfil
            );

        }


        // ==========================================
        // CERRAR PERFIL AL HACER CLICK AFUERA
        // ==========================================

        if (profileModal) {

            profileModal.addEventListener(
                "click",
                (e) => {

                    if (
                        e.target ===
                        profileModal
                    ) {

                        cerrarPerfil();

                    }

                }
            );

        }


        // ==========================================
        // CARGAR FOTO EN EL MODAL
        // ==========================================

        function cargarFotoPerfil(usuario) {

            if (!profilePhotoPreview) {
                return;
            }


            const nombre =
                usuario.nombre ||
                "Usuario";


            const inicial =
                nombre
                    .trim()
                    .charAt(0)
                    .toUpperCase();


            profilePhotoPreview.textContent =
                inicial;


            profilePhotoPreview.style.backgroundImage =
                "none";


            const foto =
                usuario.foto || null;


            if (!foto) {
                return;
            }


            let rutaFoto =
                foto;


            if (
                !foto.startsWith("../") &&
                !foto.startsWith("http") &&
                !foto.startsWith("/")
            ) {

                rutaFoto =
                    `http://127.0.0.1:5000/IMG/${foto}`;

            }


            profilePhotoPreview.textContent =
                "";


            profilePhotoPreview.style.backgroundImage =
                `url("${rutaFoto}")`;


            profilePhotoPreview.style.backgroundSize =
                "cover";


            profilePhotoPreview.style.backgroundPosition =
                "center";

        }


        // ==========================================
        // PREVISUALIZAR NUEVA FOTO
        // ==========================================

        if (profilePhotoInput) {

            profilePhotoInput.addEventListener(
                "change",
                (e) => {

                    const archivo =
                        e.target.files[0];


                    if (!archivo) {
                        return;
                    }


                    // --------------------------------------
                    // VALIDAR TIPO
                    // --------------------------------------

                    const tiposPermitidos = [
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    ];


                    if (
                        !tiposPermitidos.includes(
                            archivo.type
                        )
                    ) {

                        alert(
                            "Selecciona una imagen JPG, JPEG, PNG o WEBP."
                        );


                        profilePhotoInput.value =
                            "";


                        return;

                    }


                    // --------------------------------------
                    // PREVISUALIZAR
                    // --------------------------------------

                    const lector =
                        new FileReader();


                    lector.onload =
                        function(evento) {

                            if (profilePhotoPreview) {

                                profilePhotoPreview.textContent =
                                    "";


                                profilePhotoPreview.style.backgroundImage =
                                    `url("${evento.target.result}")`;


                                profilePhotoPreview.style.backgroundSize =
                                    "cover";


                                profilePhotoPreview.style.backgroundPosition =
                                    "center";

                            }

                        };


                    lector.readAsDataURL(
                        archivo
                    );

                }
            );

        }


        // ==========================================
        // GUARDAR CAMBIOS DEL PERFIL
        // ==========================================

        if (saveProfile) {

            saveProfile.addEventListener(
                "click",
                async () => {

                    // ==========================================
                    // VALIDAR USUARIO
                    // ==========================================

                    if (
                        !usuarioActual ||
                        !usuarioActual.id
                    ) {

                        alert(
                            "No se pudo identificar al usuario."
                        );


                        return;

                    }


                    // ==========================================
                    // OBTENER NOMBRE
                    // ==========================================

                    const nombre =
                        profileNombre
                            ? profileNombre.value.trim()
                            : "";


                    if (!nombre) {

                        alert(
                            "El nombre es obligatorio."
                        );


                        return;

                    }


                    // ==========================================
                    // EVITAR DOBLE CLICK
                    // ==========================================

                    saveProfile.disabled =
                        true;


                    const textoOriginal =
                        saveProfile.innerHTML;


                    saveProfile.innerHTML =
                        "Guardando...";


                    try {

                        // ==========================================
                        // CREAR FORMDATA
                        // ==========================================

                        const formData =
                            new FormData();


                        formData.append(
                            "nombre",
                            nombre
                        );


                        // ==========================================
                        // AGREGAR FOTO
                        // ==========================================

                        if (
                            profilePhotoInput &&
                            profilePhotoInput.files &&
                            profilePhotoInput.files.length > 0
                        ) {

                            const archivo =
                                profilePhotoInput.files[0];


                            const tiposPermitidos = [
                                "image/jpeg",
                                "image/png",
                                "image/webp"
                            ];


                            if (
                                !tiposPermitidos.includes(
                                    archivo.type
                                )
                            ) {

                                throw new Error(
                                    "Selecciona una imagen JPG, JPEG, PNG o WEBP."
                                );

                            }


                            formData.append(
                                "foto",
                                archivo
                            );

                        }


                        // ==========================================
                        // ENVIAR AL BACKEND
                        // ==========================================

                        const respuesta =
                            await fetch(
                                `http://127.0.0.1:5000/usuarios/${usuarioActual.id}/perfil`,
                                {
                                    method: "PUT",
                                    body: formData
                                }
                            );


                        // ==========================================
                        // LEER RESPUESTA
                        // ==========================================

                        const resultado =
                            await respuesta.json();


                        // ==========================================
                        // VERIFICAR RESPUESTA
                        // ==========================================

                        if (
                            !respuesta.ok ||
                            !resultado.exito
                        ) {

                            throw new Error(
                                resultado.mensaje ||
                                "No se pudo actualizar el perfil."
                            );

                        }


                        // ==========================================
                        // ACTUALIZAR USUARIO
                        // ==========================================

                        usuarioActual =
                            resultado.usuario;


                        // ==========================================
                        // GUARDAR EN LOCALSTORAGE
                        // ==========================================

                        localStorage.setItem(
                            "usuarioHarvestX",
                            JSON.stringify(
                                usuarioActual
                            )
                        );


                        // ==========================================
                        // ACTUALIZAR NOMBRE
                        // ==========================================

                        if (nombreBienvenida) {

                            nombreBienvenida.textContent =
                                `¡Bienvenido, ${usuarioActual.nombre || "Usuario"}! 👋`;

                        }


                        if (nombreUsuario) {

                            nombreUsuario.textContent =
                                usuarioActual.nombre || "Usuario";

                        }


                        // ==========================================
                        // ACTUALIZAR AVATAR
                        // ==========================================

                        configurarAvatar(
                            usuarioActual
                        );


                        // ==========================================
                        // ACTUALIZAR FOTO DEL MODAL
                        // ==========================================

                        cargarFotoPerfil(
                            usuarioActual
                        );


                        // ==========================================
                        // LIMPIAR INPUT
                        // ==========================================

                        if (profilePhotoInput) {

                            profilePhotoInput.value =
                                "";

                        }


                        // ==========================================
                        // CERRAR MODAL
                        // ==========================================

                        cerrarPerfil();


                        // ==========================================
                        // MENSAJE
                        // ==========================================

                        alert(
                            "Perfil actualizado correctamente."
                        );

                    }


                    catch (error) {

                        console.error(
                            "Error al actualizar el perfil:",
                            error
                        );


                        alert(
                            error.message ||
                            "Ocurrió un error al actualizar el perfil."
                        );

                    }


                    finally {

                        saveProfile.disabled =
                            false;


                        saveProfile.innerHTML =
                            textoOriginal;

                    }

                }
            );

        }


        // ==========================================
        // MODAL CONFIGURACIÓN
        // ==========================================

        const settingsModal =
            document.getElementById(
                "settingsModal"
            );


        const openSettings =
            document.getElementById(
                "openSettings"
            );


        const closeSettings =
            document.getElementById(
                "closeSettings"
            );


        if (openSettings) {

            openSettings.addEventListener(
                "click",
                (e) => {

                    e.preventDefault();


                    if (settingsModal) {

                        settingsModal.classList.add(
                            "active"
                        );

                    }

                }
            );

        }


        if (closeSettings) {

            closeSettings.addEventListener(
                "click",
                () => {

                    if (settingsModal) {

                        settingsModal.classList.remove(
                            "active"
                        );

                    }

                }
            );

        }


        // ==========================================
        // CERRAR CONFIGURACIÓN AFUERA
        // ==========================================

        if (settingsModal) {

            settingsModal.addEventListener(
                "click",
                (e) => {

                    if (
                        e.target ===
                        settingsModal
                    ) {

                        settingsModal.classList.remove(
                            "active"
                        );

                    }

                }
            );

        }


        // ==========================================
        // TEMA OSCURO
        // ==========================================

        const themeToggle =
            document.getElementById(
                "themeToggle"
            );


        if (themeToggle) {

            themeToggle.checked =
                localStorage.getItem(
                    "temaHarvestX"
                ) === "dark";


            themeToggle.addEventListener(
                "change",
                (e) => {

                    if (e.target.checked) {

                        htmlElement.setAttribute(
                            "data-theme",
                            "dark"
                        );


                        localStorage.setItem(
                            "temaHarvestX",
                            "dark"
                        );

                    }

                    else {

                        htmlElement.removeAttribute(
                            "data-theme"
                        );


                        localStorage.setItem(
                            "temaHarvestX",
                            "light"
                        );

                    }

                }
            );

        }


        // ==========================================
        // SONIDO
        // ==========================================

        const soundToggle =
            document.getElementById(
                "soundToggle"
            );


        if (soundToggle) {

            soundToggle.checked =
                localStorage.getItem(
                    "sonidoHarvestX"
                ) === "on";


            soundToggle.addEventListener(
                "change",
                (e) => {

                    if (e.target.checked) {

                        localStorage.setItem(
                            "sonidoHarvestX",
                            "on"
                        );


                        bienvenidaAdministrador();

                    }

                    else {

                        localStorage.setItem(
                            "sonidoHarvestX",
                            "off"
                        );


                        detenerBienvenida();

                    }

                }
            );

        }


        // ==========================================
        // BOTÓN PROBAR VOZ
        // ==========================================

        const testVoiceButton =
            document.getElementById(
                "testVoiceButton"
            );


        if (testVoiceButton) {

            testVoiceButton.addEventListener(
                "click",
                () => {

                    bienvenidaAdministrador();

                }
            );

        }


        // ==========================================
        // FUENTE
        // ==========================================

        const fontSelect =
            document.getElementById(
                "fontSelect"
            );


        if (fontSelect) {

            if (fuenteGuardada) {

                fontSelect.value =
                    fuenteGuardada;

            }


            fontSelect.addEventListener(
                "change",
                (e) => {

                    const nuevaFuente =
                        e.target.value;


                    htmlElement.style.setProperty(
                        "--fuente-actual",
                        nuevaFuente
                    );


                    localStorage.setItem(
                        "fuenteHarvestX",
                        nuevaFuente
                    );

                }
            );

        }


        // ==========================================
        // TAMAÑO DE LETRA
        // ==========================================

        const btnsSize =
            document.querySelectorAll(
                ".btn-size"
            );


        btnsSize.forEach(btn => {

            btn.addEventListener(
                "click",
                (e) => {

                    btnsSize.forEach(b => {

                        b.classList.remove(
                            "active"
                        );

                    });


                    e.currentTarget.classList.add(
                        "active"
                    );


                    const sizeId =
                        e.currentTarget.id;


                    let nuevoTamano;


                    if (
                        sizeId ===
                        "btnSizeSmall"
                    ) {

                        nuevoTamano =
                            "0.85rem";

                    }

                    else if (
                        sizeId ===
                        "btnSizeNormal"
                    ) {

                        nuevoTamano =
                            "1rem";

                    }

                    else if (
                        sizeId ===
                        "btnSizeLarge"
                    ) {

                        nuevoTamano =
                            "1.15rem";

                    }


                    if (nuevoTamano) {

                        htmlElement.style.setProperty(
                            "--escala-texto",
                            nuevoTamano
                        );


                        localStorage.setItem(
                            "escalaHarvestX",
                            nuevoTamano
                        );

                    }

                }
            );

        });


        // ==========================================
        // ENLACES SIDEBAR
        // ==========================================

        const navLinks =
            document.querySelectorAll(
                ".sidebar-nav .nav-link"
            );


        navLinks.forEach(link => {

            link.addEventListener(
                "click",
                function() {

                    navLinks.forEach(nav => {

                        nav.classList.remove(
                            "active"
                        );

                    });


                    this.classList.add(
                        "active"
                    );

                }
            );

        });


        // ==========================================
        // CERRAR SESIÓN
        // ==========================================

        const cerrarSesion =
            document.getElementById(
                "cerrarSesion"
            );


        if (cerrarSesion) {

            cerrarSesion.addEventListener(
                "click",
                () => {

                    detenerBienvenida();


                    localStorage.removeItem(
                        "usuarioHarvestX"
                    );


                    sessionStorage.removeItem(
                        "bienvenidaHarvestX"
                    );

                }
            );

        }


        // ==========================================
        // CHART.JS
        // ==========================================

        function initCharts() {

            if (
                typeof Chart ===
                "undefined"
            ) {

                return;

            }


            Chart.defaults.font.family =
                getComputedStyle(
                    document.documentElement
                ).getPropertyValue(
                    "--fuente-actual"
                );


            Chart.defaults.color =
                "#636e72";


            // ======================================
            // PRODUCCIÓN
            // ======================================

            const ctxProduction =
                document.getElementById(
                    "productionChart"
                );


            if (ctxProduction) {

                new Chart(
                    ctxProduction,
                    {

                        type: "doughnut",

                        data: {

                            labels: [
                                "Tomate 45%",
                                "Maíz 30%",
                                "Café 15%",
                                "Lechuga 10%"
                            ],

                            datasets: [{

                                data: [
                                    45,
                                    30,
                                    15,
                                    10
                                ],

                                backgroundColor: [
                                    "#4CAF50",
                                    "#fbc02d",
                                    "#81c784",
                                    "#64b5f6"
                                ],

                                borderWidth: 0,

                                hoverOffset: 4

                            }]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            cutout: "65%",

                            plugins: {

                                legend: {

                                    position: "right",

                                    labels: {

                                        boxWidth: 10,

                                        usePointStyle:
                                            true

                                    }

                                }

                            }

                        }

                    }
                );

            }


            // ======================================
            // RENDIMIENTO
            // ======================================

            const ctxYield =
                document.getElementById(
                    "yieldChart"
                );


            if (ctxYield) {

                new Chart(
                    ctxYield,
                    {

                        type: "line",

                        data: {

                            labels: [
                                "Ene",
                                "Feb",
                                "Mar",
                                "Abr",
                                "May",
                                "Jun"
                            ],

                            datasets: [{

                                label:
                                    "Rendimiento",

                                data: [
                                    1000,
                                    3000,
                                    4000,
                                    3800,
                                    6000,
                                    8000
                                ],

                                borderColor:
                                    "#2196F3",

                                backgroundColor:
                                    "#2196F3",

                                borderWidth: 2,

                                tension: 0.4,

                                pointBackgroundColor:
                                    "#fff",

                                pointBorderColor:
                                    "#2196F3",

                                pointRadius: 4

                            }]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {

                                    display: false

                                }

                            }

                        }

                    }
                );

            }


            // ======================================
            // HUMEDAD
            // ======================================

            const ctxMoisture =
                document.getElementById(
                    "moistureChart"
                );


            if (ctxMoisture) {

                new Chart(
                    ctxMoisture,
                    {

                        type: "bar",

                        data: {

                            labels: [
                                "Sector A",
                                "Sector B",
                                "Sector C",
                                "Sector D"
                            ],

                            datasets: [{

                                label:
                                    "Humedad",

                                data: [
                                    75,
                                    60,
                                    80,
                                    45
                                ],

                                backgroundColor: [
                                    "#2196F3",
                                    "#4CAF50",
                                    "#1976D2",
                                    "#fbc02d"
                                ],

                                borderRadius: 4,

                                barPercentage: 0.5

                            }]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {

                                    display: false

                                }

                            }

                        }

                    }
                );

            }

        }

    }
);