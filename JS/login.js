document.addEventListener("DOMContentLoaded", () => {
    const menuIcon = document.getElementById("menu-icon");
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll("#navbar a");

    // Abrir/Cerrar menú
    menuIcon.addEventListener("click", () => {
        navbar.classList.toggle("active");
        
        if (navbar.classList.contains("active")) {
            menuIcon.classList.replace("fa-bars", "fa-xmark");
        } else {
            menuIcon.classList.replace("fa-xmark", "fa-bars");
        }
    });

    // Cerrar el menú al hacer clic en un enlace (Móviles)
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navbar.classList.remove("active");
            menuIcon.classList.replace("fa-xmark", "fa-bars");
        });
    });

    // Cerrar si se hace clic fuera del header
    document.addEventListener("click", (e) => {
        const header = document.getElementById("header");
        if (!header.contains(e.target)) {
            navbar.classList.remove("active");
            menuIcon.classList.replace("fa-xmark", "fa-bars");
        }
    });

    // EFECTO NAVBAR (SCROLL)
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // ANIMACIONES SCROLL (OBSERVER)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementosAnimados = document.querySelectorAll('.fade-up, .fade-in');
    elementosAnimados.forEach(el => observer.observe(el));

    // SCROLL SUAVE (BOTÓN SABER MÁS)
    const btnSaberMas = document.getElementById("btnSaberMas");
    if (btnSaberMas) {
        btnSaberMas.addEventListener("click", () => {
            document.getElementById("seccion-cards").scrollIntoView({ behavior: "smooth" });
        });
    }

    // MODAL DE LOGIN
    const modal = document.getElementById("modal");
    const abrirLogin = document.getElementById("abrirLogin"); // Botón del hero
    const btnLogin = document.getElementById("btnLogin"); // Botón del nav
    const cerrar = document.getElementById("cerrar");
    
    const ingresar = document.getElementById("ingresar");
    const usuario = document.getElementById("usuario");
    const password = document.getElementById("password");
    const mensajeError = document.getElementById("mensaje-error");

    const USER = "Planta";
    const PASS = "4422";

    function abrirModal() {
        modal.classList.add("active");
        mensajeError.textContent = "";
        usuario.value = "";
        password.value = "";
        
        // Cierra el menú hamburguesa si está abierto
        navbar.classList.remove("active");
        menuIcon.classList.replace("fa-xmark", "fa-bars");

        setTimeout(() => usuario.focus(), 100); 
    }

    function cerrarModal() {
        modal.classList.remove("active");
    }

    if(abrirLogin) abrirLogin.addEventListener("click", abrirModal);
    if(btnLogin) btnLogin.addEventListener("click", abrirModal);
    cerrar.addEventListener("click", cerrarModal);

    window.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });

    //  LOGIN
    function iniciarSesion() {
        const user = usuario.value.trim();
        const pass = password.value.trim();

        if (user === "") {
            mostrarError("Por favor, ingrese su usuario.");
            usuario.focus();
            return;
        }

        if (pass === "") {
            mostrarError("Por favor, ingrese la contraseña.");
            password.focus();
            return;
        }

        if (user === USER && pass === PASS) {
            mensajeError.style.color = "#4CAF50";
            mensajeError.textContent = "¡Credenciales correctas!";
            ingresar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ingresando...';
            ingresar.disabled = true;

            setTimeout(() => {
                window.location.href = "inicio.html";
            }, 1200);
        } else {
            mostrarError("Usuario o contraseña incorrectos.");
            password.value = "";
            password.focus();
        }
    }

    function mostrarError(mensaje) {
        mensajeError.style.color = "#f44336";
        mensajeError.textContent = mensaje;
        
        // Animación de error
        const loginBox = document.querySelector(".login");
        loginBox.style.transform = "translateX(-10px)";
        setTimeout(() => loginBox.style.transform = "translateX(10px)", 50);
        setTimeout(() => loginBox.style.transform = "translateX(-10px)", 100);
        setTimeout(() => loginBox.style.transform = "translateX(10px)", 150);
        setTimeout(() => loginBox.style.transform = "translateX(0)", 200);
    }

    ingresar.addEventListener("click", iniciarSesion);

    usuario.addEventListener("keypress", (e) => {
        if (e.key === "Enter") password.focus();
    });

    password.addEventListener("keypress", (e) => {
        if (e.key === "Enter") iniciarSesion();
    });
});