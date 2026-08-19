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

                menuIcon.classList.replace(
                    "fa-xmark",
                    "fa-bars"
                );

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

                menuIcon.classList.replace(
                    "fa-xmark",
                    "fa-bars"
                );

            }

        });

    }


    /* =========================================================
       HEADER SCROLL
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

    const observer = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        observerOptions
    );

    const elementosAnimados =
        document.querySelectorAll(".fade-up, .fade-in");

    elementosAnimados.forEach(el => {

        observer.observe(el);

    });


    /* =========================================================
       BOTÓN SABER MÁS
    ========================================================= */

    const btnSaberMas =
        document.getElementById("btnSaberMas");

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

    const modal =
        document.getElementById("modal");

    const abrirLogin =
        document.getElementById("abrirLogin");

    const btnLogin =
        document.getElementById("btnLogin");

    const cerrar =
        document.getElementById("cerrar");

    const ingresar =
        document.getElementById("ingresar");

    const usuario =
        document.getElementById("usuario");

    const password =
        document.getElementById("password");

    const mensajeError =
        document.getElementById("mensaje-error");

    const btnRegistro =
        document.getElementById("btnRegistro");


    /* =========================================================
       ELEMENTOS DEL REGISTRO
    ========================================================= */

    const registroNombre =
        document.getElementById("registroNombre");

    const registroUsuario =
        document.getElementById("registroUsuario");

    const registroPassword =
        document.getElementById("registroPassword");

    const registroPasswordConfirmar =
        document.getElementById("registroPasswordConfirmar");

    const mensajeRegistro =
        document.getElementById("mensaje-registro");

    const btnCrearCuenta =
        document.getElementById("btnCrearCuenta");

    const btnVolverRegistro =
        document.getElementById("btnVolverRegistro");


    /* =========================================================
       ABRIR MODAL
    ========================================================= */

    function abrirModal() {

        if (!modal) return;

        modal.classList.add("active");

        if (navbar && menuIcon) {

            navbar.classList.remove("active");

            menuIcon.classList.replace(
                "fa-xmark",
                "fa-bars"
            );

        }

        mostrarLogin();

        setTimeout(() => {

            if (usuario) {

                usuario.focus();

            }

        }, 300);

    }


    /* =========================================================
       CERRAR MODAL
    ========================================================= */

    function cerrarModal() {

        if (!modal) return;

        modal.classList.remove("active");

        limpiarTodo();

    }


    /* =========================================================
       LIMPIAR TODO
    ========================================================= */

    function limpiarTodo() {

        limpiarLogin();
        limpiarRegistro();

    }


    /* =========================================================
       LIMPIAR LOGIN
    ========================================================= */

    function limpiarLogin() {

        if (usuario) {

            usuario.value = "";

        }

        if (password) {

            password.value = "";

        }

        if (mensajeError) {

            mensajeError.textContent = "";
            mensajeError.style.color = "";

        }

        restaurarBotonLogin();

    }


    /* =========================================================
       LIMPIAR REGISTRO
    ========================================================= */

    function limpiarRegistro() {

        if (registroNombre) {

            registroNombre.value = "";

        }

        if (registroUsuario) {

            registroUsuario.value = "";

        }

        if (registroPassword) {

            registroPassword.value = "";

        }

        if (registroPasswordConfirmar) {

            registroPasswordConfirmar.value = "";

        }

        if (mensajeRegistro) {

            mensajeRegistro.textContent = "";
            mensajeRegistro.style.color = "";

        }

        restaurarBotonRegistro();

    }


    /* =========================================================
       MOSTRAR LOGIN
    ========================================================= */

    function mostrarLogin() {

        const vistaLogin =
            document.getElementById("vista-login");

        const vistaRegistro =
            document.getElementById("vista-registro");

        if (vistaRegistro) {

            vistaRegistro.classList.remove(
                "vista-activa"
            );

            vistaRegistro.classList.add(
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

        limpiarRegistro();

        if (mensajeError) {

            mensajeError.textContent = "";

        }

    }


    /* =========================================================
       MOSTRAR REGISTRO
    ========================================================= */

    function mostrarRegistro() {

        const vistaLogin =
            document.getElementById("vista-login");

        const vistaRegistro =
            document.getElementById("vista-registro");

        if (vistaLogin) {

            vistaLogin.classList.remove(
                "vista-activa"
            );

            vistaLogin.classList.add(
                "vista-oculta"
            );

        }

        if (vistaRegistro) {

            vistaRegistro.classList.remove(
                "vista-oculta"
            );

            vistaRegistro.classList.add(
                "vista-activa"
            );

        }

        limpiarLogin();

        setTimeout(() => {

            if (registroNombre) {

                registroNombre.focus();

            }

        }, 300);

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
       CERRAR AL HACER CLICK FUERA
    ========================================================= */

    if (modal) {

        window.addEventListener("click", (e) => {

            if (e.target === modal) {

                cerrarModal();

            }

        });

    }


    /* =========================================================
       INICIAR SESIÓN
       
       FLASK + MYSQL
    ========================================================= */

    async function iniciarSesion() {

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
           MOSTRAR CARGANDO
        ----------------------------------------- */

        if (ingresar) {

            ingresar.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';

            ingresar.disabled = true;

        }


        try {

            const respuesta = await fetch(
                "http://127.0.0.1:5000/login",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        usuario: user,

                        contrasena: pass

                    })

                }
            );


            const datos =
                await respuesta.json();


            /* -------------------------------------
               LOGIN CORRECTO
            ------------------------------------- */

            if (
                respuesta.ok &&
                datos.exito
            ) {

                if (mensajeError) {

                    mensajeError.style.color =
                        "#4CAF50";

                    mensajeError.textContent =
                        datos.mensaje;

                }


                const usuarioLogueado =
                    datos.usuario;


                /* ---------------------------------
                   GUARDAR SESIÓN
                --------------------------------- */

                localStorage.setItem(
                    "usuarioHarvestX",
                    JSON.stringify(
                        usuarioLogueado
                    )
                );


                /* ---------------------------------
                   DETERMINAR RUTA SEGÚN ROL
                --------------------------------- */

                let ruta = "";


                if (
                    usuarioLogueado.rol ===
                    "administrador"
                ) {

                    ruta =
                        "Perfiles/administrador/inicio.html";

                }

                else if (
                    usuarioLogueado.rol ===
                    "usuario"
                ) {

                    ruta =
                        "Perfiles/Usuarios/inicio.html";

                }

                else {

                    mostrarError(
                        "El rol del usuario no es válido."
                    );

                    restaurarBotonLogin();

                    return;

                }


                /* ---------------------------------
                   REDIRECCIÓN
                --------------------------------- */

                setTimeout(() => {

                    window.location.href =
                        ruta;

                }, 700);

            }


            /* -------------------------------------
               LOGIN INCORRECTO
            ------------------------------------- */

            else {

                mostrarError(
                    datos.mensaje ||
                    "Usuario o contraseña incorrectos."
                );

                password.value = "";

                password.focus();

                restaurarBotonLogin();

            }

        }


        /* -----------------------------------------
           ERROR DE CONEXIÓN
        ----------------------------------------- */

        catch (error) {

            console.error(
                "Error al conectar con Flask:",
                error
            );

            mostrarError(
                "No se pudo conectar con el servidor."
            );

            restaurarBotonLogin();

        }

    }


    /* =========================================================
       REGISTRAR USUARIO
       
       FLASK + MYSQL
    ========================================================= */

    async function registrarUsuario() {

        if (
            !registroNombre ||
            !registroUsuario ||
            !registroPassword ||
            !registroPasswordConfirmar
        ) {

            console.error(
                "No se encontraron todos los campos del registro."
            );

            return;

        }


        const nombre =
            registroNombre.value.trim();

        const user =
            registroUsuario.value.trim();

        const pass =
            registroPassword.value.trim();

        const confirmar =
            registroPasswordConfirmar.value.trim();


        /* -----------------------------------------
           VALIDAR NOMBRE
        ----------------------------------------- */

        if (nombre === "") {

            mostrarErrorRegistro(
                "Por favor, ingrese su nombre."
            );

            registroNombre.focus();

            return;

        }


        /* -----------------------------------------
           VALIDAR USUARIO
        ----------------------------------------- */

        if (user === "") {

            mostrarErrorRegistro(
                "Por favor, ingrese un nombre de usuario."
            );

            registroUsuario.focus();

            return;

        }


        /* -----------------------------------------
           VALIDAR CONTRASEÑA
        ----------------------------------------- */

        if (pass === "") {

            mostrarErrorRegistro(
                "Por favor, ingrese una contraseña."
            );

            registroPassword.focus();

            return;

        }


        /* -----------------------------------------
           LONGITUD MÍNIMA
        ----------------------------------------- */

        if (pass.length < 4) {

            mostrarErrorRegistro(
                "La contraseña debe tener al menos 4 caracteres."
            );

            registroPassword.focus();

            return;

        }


        /* -----------------------------------------
           CONFIRMAR CONTRASEÑA
        ----------------------------------------- */

        if (confirmar === "") {

            mostrarErrorRegistro(
                "Por favor, confirme su contraseña."
            );

            registroPasswordConfirmar.focus();

            return;

        }


        /* -----------------------------------------
           COMPROBAR CONTRASEÑAS
        ----------------------------------------- */

        if (pass !== confirmar) {

            mostrarErrorRegistro(
                "Las contraseñas no coinciden."
            );

            registroPasswordConfirmar.value = "";

            registroPasswordConfirmar.focus();

            return;

        }


        /* -----------------------------------------
           MOSTRAR CARGANDO
        ----------------------------------------- */

        if (btnCrearCuenta) {

            btnCrearCuenta.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Creando cuenta...';

            btnCrearCuenta.disabled = true;

        }

        if (mensajeRegistro) {

            mensajeRegistro.textContent = "";

        }


        try {

            /* -------------------------------------
               ENVIAR REGISTRO A FLASK
            ------------------------------------- */

            const respuesta = await fetch(
                "http://127.0.0.1:5000/registro",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        nombre: nombre,

                        usuario: user,

                        contrasena: pass

                    })

                }
            );


            const datos =
                await respuesta.json();


            /* -------------------------------------
               REGISTRO CORRECTO
            ------------------------------------- */

            if (
                respuesta.ok &&
                datos.exito
            ) {

                if (mensajeRegistro) {

                    mensajeRegistro.style.color =
                        "#4CAF50";

                    mensajeRegistro.textContent =
                        datos.mensaje;

                }


                if (btnCrearCuenta) {

                    btnCrearCuenta.innerHTML =
                        '<i class="fa-solid fa-check"></i> Cuenta creada';

                }


                /* ---------------------------------
                   USUARIO CREADO
                --------------------------------- */

                const usuarioCreado =
                    datos.usuario;


                /* ---------------------------------
                   GUARDAR SESIÓN
                --------------------------------- */

                localStorage.setItem(
                    "usuarioHarvestX",
                    JSON.stringify(
                        usuarioCreado
                    )
                );


                /* ---------------------------------
                   DETERMINAR RUTA SEGÚN ROL
                --------------------------------- */

                let ruta = "";


                if (
                    usuarioCreado.rol ===
                    "administrador"
                ) {

                    ruta =
                        "Perfiles/administrador/inicio.html";

                }

                else if (
                    usuarioCreado.rol ===
                    "usuario"
                ) {

                    ruta =
                        "Perfiles/Usuarios/inicio.html";

                }

                else {

                    mostrarErrorRegistro(
                        "El rol del usuario no es válido."
                    );

                    restaurarBotonRegistro();

                    return;

                }


                /* ---------------------------------
                   REDIRECCIÓN
                --------------------------------- */

                setTimeout(() => {

                    window.location.href =
                        ruta;

                }, 700);

            }


            /* -------------------------------------
               ERROR DE REGISTRO
            ------------------------------------- */

            else {

                mostrarErrorRegistro(
                    datos.mensaje ||
                    "No se pudo crear la cuenta."
                );

                restaurarBotonRegistro();

            }

        }


        /* -----------------------------------------
           ERROR DE CONEXIÓN
        ----------------------------------------- */

        catch (error) {

            console.error(
                "Error al registrar usuario:",
                error
            );

            mostrarErrorRegistro(
                "No se pudo conectar con el servidor."
            );

            restaurarBotonRegistro();

        }

    }


    /* =========================================================
       RESTAURAR BOTÓN LOGIN
    ========================================================= */

    function restaurarBotonLogin() {

        if (ingresar) {

            ingresar.innerHTML =
                '<i class="fa-solid fa-right-to-bracket"></i> Ingresar';

            ingresar.disabled = false;

        }

    }


    /* =========================================================
       RESTAURAR BOTÓN REGISTRO
    ========================================================= */

    function restaurarBotonRegistro() {

        if (btnCrearCuenta) {

            btnCrearCuenta.innerHTML =
                '<i class="fa-solid fa-user-plus"></i> Crear cuenta';

            btnCrearCuenta.disabled = false;

        }

    }


    /* =========================================================
       MOSTRAR ERROR LOGIN
    ========================================================= */

    function mostrarError(mensaje) {

        if (!mensajeError) return;

        mensajeError.style.color =
            "#f44336";

        mensajeError.textContent =
            mensaje;

        animarLogin();

    }


    /* =========================================================
       MOSTRAR ERROR REGISTRO
    ========================================================= */

    function mostrarErrorRegistro(mensaje) {

        if (!mensajeRegistro) return;

        mensajeRegistro.style.color =
            "#f44336";

        mensajeRegistro.textContent =
            mensaje;

        animarLogin();

    }


    /* =========================================================
       ANIMACIÓN DE ERROR
    ========================================================= */

    function animarLogin() {

        const loginBox =
            document.querySelector(".login");

        if (!loginBox) return;

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
       BOTÓN "CREAR UNA CUENTA"
       
       LOGIN → REGISTRO
    ========================================================= */

    if (btnRegistro) {

        btnRegistro.addEventListener(
            "click",
            mostrarRegistro
        );

    }


    /* =========================================================
       BOTÓN "CREAR CUENTA"
       
       FORMULARIO → FLASK
    ========================================================= */

    if (btnCrearCuenta) {

        btnCrearCuenta.addEventListener(
            "click",
            registrarUsuario
        );

    }


    /* =========================================================
       BOTÓN VOLVER AL LOGIN
    ========================================================= */

    if (btnVolverRegistro) {

        btnVolverRegistro.addEventListener(
            "click",
            mostrarLogin
        );

    }


    /* =========================================================
       ENTER EN USUARIO
    ========================================================= */

    if (usuario) {

        usuario.addEventListener(
            "keydown",
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
            "keydown",
            (e) => {

                if (e.key === "Enter") {

                    iniciarSesion();

                }

            }
        );

    }


    /* =========================================================
       ENTER EN CAMPOS DE REGISTRO
    ========================================================= */

    const camposRegistro = [

        registroNombre,
        registroUsuario,
        registroPassword,
        registroPasswordConfirmar

    ];


    camposRegistro.forEach((campo, indice) => {

        if (!campo) return;

        campo.addEventListener(
            "keydown",
            (e) => {

                if (e.key === "Enter") {

                    e.preventDefault();


                    if (
                        indice ===
                        camposRegistro.length - 1
                    ) {

                        registrarUsuario();

                    } else {

                        const siguiente =
                            camposRegistro[indice + 1];

                        if (siguiente) {

                            siguiente.focus();

                        }

                    }

                }

            }
        );

    });

});