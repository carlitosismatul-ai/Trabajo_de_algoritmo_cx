document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       MENÚ DE NAVEGACIÓN
    ========================================================= */

    const menuIcon = document.getElementById("menu-icon");
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll("#navbar a");
    const header = document.getElementById("header");

    if (menuIcon && navbar) {

        menuIcon.addEventListener("click", () => {
            navbar.classList.toggle("active");

            if (navbar.classList.contains("active")) {
                menuIcon.classList.replace("fa-bars", "fa-xmark");
            } else {
                menuIcon.classList.replace("fa-xmark", "fa-bars");
            }
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navbar.classList.remove("active");
                menuIcon.classList.replace("fa-xmark", "fa-bars");
            });
        });

        document.addEventListener("click", (e) => {

            if (
                header &&
                !header.contains(e.target) &&
                !navbar.contains(e.target) &&
                e.target !== menuIcon
            ) {
                navbar.classList.remove("active");
                menuIcon.classList.replace("fa-xmark", "fa-bars");
            }

        });
    }


    /* =========================================================
       HEADER AL HACER SCROLL
    ========================================================= */

    if (header) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }

        });

    }


    /* =========================================================
       ANIMACIONES
    ========================================================= */

    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }

        });

    }, observerOptions);

    const elementosAnimados =
        document.querySelectorAll(".fade-up, .fade-in");

    elementosAnimados.forEach(el => {
        observer.observe(el);
    });


    /* =========================================================
       BOTÓN SABER MÁS
    ========================================================= */

    const btnSaberMas = document.getElementById("btnSaberMas");

    if (btnSaberMas) {

        btnSaberMas.addEventListener("click", () => {

            const seccionCards =
                document.getElementById("seccion-cards");

            if (seccionCards) {
                seccionCards.scrollIntoView({
                    behavior: "smooth"
                });
            }

        });

    }


    /* =========================================================
       ELEMENTOS DEL LOGIN
    ========================================================= */

    const modal = document.getElementById("modal");

    const abrirLogin =
        document.getElementById("abrirLogin");

    const btnLogin =
        document.getElementById("btnLogin");

    const cerrar =
        document.getElementById("cerrar");

    const vistaPerfiles =
        document.getElementById("vista-perfiles");

    const vistaLogin =
        document.getElementById("vista-login");

    const perfilesItems =
        document.querySelectorAll(".perfil-item");

    const btnVolver =
        document.getElementById("btn-volver");

    const textoPerfilSeleccionado =
        document.getElementById("texto-perfil-seleccionado");

    const ingresar =
        document.getElementById("ingresar");

    const usuario =
        document.getElementById("usuario");

    const password =
        document.getElementById("password");

    const mensajeError =
        document.getElementById("mensaje-error");


    /* =========================================================
       PERFIL ACTUAL
    ========================================================= */

    let perfilActivo = "";


    /* =========================================================
       USUARIOS DEL SISTEMA
       
       Cada perfil tiene:
       - usuario
       - contraseña
       - ruta
    ========================================================= */

    const usuarios = {

        administrador: {
            usuario: "admin",
            password: "1234",
            ruta: "Perfiles/administrador/inicio.html"
        },

        agricultor: {
            usuario: "agricultor",
            password: "1234",
            ruta: "Perfiles/agricultor/inicio.html"
        },

        supervisor: {
            usuario: "supervisor",
            password: "1234",
            ruta: "Perfiles/supervisor/inicio.html"
        },

        tecnico: {
            usuario: "tecnico",
            password: "1234",
            ruta: "Perfiles/tecnico/inicio.html"
        },

        invitado: {
            usuario: "invitado",
            password: "1234",
            ruta: "Perfiles/invitado/inicio.html"
        }

    };


    /* =========================================================
       ABRIR MODAL
    ========================================================= */

    function abrirModal() {

        if (!modal) return;

        modal.classList.add("active");

        mostrarVistaPerfiles();

        if (navbar && menuIcon) {

            navbar.classList.remove("active");

            menuIcon.classList.replace(
                "fa-xmark",
                "fa-bars"
            );

        }

    }


    /* =========================================================
       CERRAR MODAL
    ========================================================= */

    function cerrarModal() {

        if (!modal) return;

        modal.classList.remove("active");

    }


    /* =========================================================
       EVENTOS DEL MODAL
    ========================================================= */

    if (abrirLogin) {
        abrirLogin.addEventListener(
            "click",
            abrirModal
        );
    }

    if (btnLogin) {
        btnLogin.addEventListener(
            "click",
            abrirModal
        );
    }

    if (cerrar) {
        cerrar.addEventListener(
            "click",
            cerrarModal
        );
    }


    /* =========================================================
       CERRAR MODAL AL HACER CLICK FUERA
    ========================================================= */

    if (modal) {

        window.addEventListener("click", (e) => {

            if (e.target === modal) {
                cerrarModal();
            }

        });

    }


    /* =========================================================
       MOSTRAR PERFILES
    ========================================================= */

    function mostrarVistaPerfiles() {

        if (mensajeError) {
            mensajeError.textContent = "";
        }

        if (usuario) {
            usuario.value = "";
        }

        if (password) {
            password.value = "";
        }

        if (vistaLogin) {

            vistaLogin.classList.remove(
                "vista-activa"
            );

            vistaLogin.classList.add(
                "vista-oculta"
            );

        }

        if (vistaPerfiles) {

            vistaPerfiles.classList.remove(
                "vista-oculta"
            );

            vistaPerfiles.classList.add(
                "vista-activa"
            );

        }

        perfilActivo = "";

    }


    /* =========================================================
       MOSTRAR LOGIN DEL PERFIL SELECCIONADO
    ========================================================= */

    function mostrarVistaLogin(nombrePerfil) {

        perfilActivo = nombrePerfil.toLowerCase();

        if (textoPerfilSeleccionado) {
            textoPerfilSeleccionado.textContent =
                nombrePerfil;
        }

        if (vistaPerfiles) {

            vistaPerfiles.classList.remove(
                "vista-activa"
            );

            vistaPerfiles.classList.add(
                "vista-oculta"
            );

        }

        if (vistaLogin) {

            vistaLogin.classList.remove(
                "vista-oculta"
            );

            vistaLogin.classList.add(
                "vista-activa"
            );

        }

        setTimeout(() => {

            if (usuario) {
                usuario.focus();
            }

        }, 300);

    }


    /* =========================================================
       SELECCIONAR PERFIL
    ========================================================= */

    perfilesItems.forEach(item => {

        item.addEventListener("click", () => {

            const nombrePerfil =
                item.getAttribute("data-perfil");

            if (nombrePerfil) {
                mostrarVistaLogin(nombrePerfil);
            }

        });

    });


    /* =========================================================
       BOTÓN VOLVER
    ========================================================= */

    if (btnVolver) {

        btnVolver.addEventListener(
            "click",
            mostrarVistaPerfiles
        );

    }


    /* =========================================================
       INICIAR SESIÓN
    ========================================================= */

    function iniciarSesion() {

        if (!usuario || !password) {
            return;
        }

        const user =
            usuario.value.trim();

        const pass =
            password.value.trim();


        /* -----------------------------------------
           VALIDAR USUARIO
        ----------------------------------------- */

        if (user === "") {

            mostrarError(
                "Por favor, ingrese su usuario."
            );

            usuario.focus();

            return;
        }


        /* -----------------------------------------
           VALIDAR CONTRASEÑA
        ----------------------------------------- */

        if (pass === "") {

            mostrarError(
                "Por favor, ingrese la contraseña."
            );

            password.focus();

            return;
        }


        /* -----------------------------------------
           BUSCAR PERFIL
        ----------------------------------------- */

        const datosUsuario =
            usuarios[perfilActivo];


        if (!datosUsuario) {

            mostrarError(
                "El perfil seleccionado no es válido."
            );

            return;
        }


        /* -----------------------------------------
           COMPROBAR CREDENCIALES
        ----------------------------------------- */

        if (
            user === datosUsuario.usuario &&
            pass === datosUsuario.password
        ) {

            /* -------------------------------
               CREDENCIALES CORRECTAS
            -------------------------------- */

            if (mensajeError) {

                mensajeError.style.color =
                    "#4CAF50";

                mensajeError.textContent =
                    `Credenciales correctas para ${perfilActivo}.`;

            }


            if (ingresar) {

                ingresar.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Ingresando...';

                ingresar.disabled = true;

            }


            /* -------------------------------
               REDIRECCIONAR
            -------------------------------- */

            setTimeout(() => {

                window.location.href =
                    datosUsuario.ruta;

            }, 1200);


        } else {

            /* -------------------------------
               CREDENCIALES INCORRECTAS
            -------------------------------- */

            mostrarError(
                "Usuario o contraseña incorrectos."
            );

            password.value = "";

            password.focus();

        }

    }


    /* =========================================================
       MOSTRAR ERROR
    ========================================================= */

    function mostrarError(mensaje) {

        if (!mensajeError) return;

        mensajeError.style.color =
            "#f44336";

        mensajeError.textContent =
            mensaje;


        const loginBox =
            document.querySelector(".login");


        if (loginBox) {

            loginBox.style.transform =
                "translateX(-10px)";

            setTimeout(() => {

                loginBox.style.transform =
                    "translateX(10px)";

            }, 50);

            setTimeout(() => {

                loginBox.style.transform =
                    "translateX(-10px)";

            }, 100);

            setTimeout(() => {

                loginBox.style.transform =
                    "translateX(10px)";

            }, 150);

            setTimeout(() => {

                loginBox.style.transform =
                    "translateX(0)";

            }, 200);

        }

    }


    /* =========================================================
       BOTÓN INGRESAR
    ========================================================= */

    if (ingresar) {

        ingresar.addEventListener(
            "click",
            iniciarSesion
        );

    }


    /* =========================================================
       ENTER EN USUARIO
    ========================================================= */

    if (usuario) {

        usuario.addEventListener(
            "keypress",
            (e) => {

                if (e.key === "Enter") {

                    if (password) {
                        password.focus();
                    }

                }

            }
        );

    }


    /* =========================================================
       ENTER EN CONTRASEÑA
    ========================================================= */

    if (password) {

        password.addEventListener(
            "keypress",
            (e) => {

                if (e.key === "Enter") {
                    iniciarSesion();
                }

            }
        );

    }

});