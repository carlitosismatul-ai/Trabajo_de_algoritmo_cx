document.addEventListener("DOMContentLoaded", () => {
    const menuIcon = document.getElementById("menu-icon");
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll("#navbar a");

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
        const header = document.getElementById("header");
        if (!header.contains(e.target) && !navbar.contains(e.target) && e.target !== menuIcon) {
            navbar.classList.remove("active");
            menuIcon.classList.replace("fa-xmark", "fa-bars");
        }
    });

    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

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

    const btnSaberMas = document.getElementById("btnSaberMas");
    if (btnSaberMas) {
        btnSaberMas.addEventListener("click", () => {
            document.getElementById("seccion-cards").scrollIntoView({ behavior: "smooth" });
        });
    }

    const modal = document.getElementById("modal");
    const abrirLogin = document.getElementById("abrirLogin"); 
    const btnLogin = document.getElementById("btnLogin"); 
    const cerrar = document.getElementById("cerrar");
    
    const vistaPerfiles = document.getElementById("vista-perfiles");
    const vistaLogin = document.getElementById("vista-login");
    const perfilesItems = document.querySelectorAll(".perfil-item");
    const btnVolver = document.getElementById("btn-volver");
    const textoPerfilSeleccionado = document.getElementById("texto-perfil-seleccionado");
    let perfilActivo = ""; 

    const ingresar = document.getElementById("ingresar");
    const usuario = document.getElementById("usuario");
    const password = document.getElementById("password");
    const mensajeError = document.getElementById("mensaje-error");

    const USER = "Planta";
    const PASS = "4422";

    function abrirModal() {
        modal.classList.add("active");
        mostrarVistaPerfiles(); 
        
        navbar.classList.remove("active");
        menuIcon.classList.replace("fa-xmark", "fa-bars");
    }

    function cerrarModal() {
        modal.classList.remove("active");
    }

    if(abrirLogin) abrirLogin.addEventListener("click", abrirModal);
    if(btnLogin) btnLogin.addEventListener("click", abrirModal);
    if(cerrar) cerrar.addEventListener("click", cerrarModal);

    window.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });

    function mostrarVistaPerfiles() {
        mensajeError.textContent = "";
        usuario.value = "";
        password.value = "";

        vistaLogin.classList.remove("vista-activa");
        vistaLogin.classList.add("vista-oculta");
        
        vistaPerfiles.classList.remove("vista-oculta");
        vistaPerfiles.classList.add("vista-activa");
    }

    function mostrarVistaLogin(nombrePerfil) {
        perfilActivo = nombrePerfil;
        textoPerfilSeleccionado.textContent = nombrePerfil; 

        vistaPerfiles.classList.remove("vista-activa");
        vistaPerfiles.classList.add("vista-oculta");
        
        vistaLogin.classList.remove("vista-oculta");
        vistaLogin.classList.add("vista-activa");

        setTimeout(() => usuario.focus(), 300); 
    }

    perfilesItems.forEach(item => {
        item.addEventListener("click", () => {
            const nombrePerfil = item.getAttribute("data-perfil");
            mostrarVistaLogin(nombrePerfil);
        });
    });

    if (btnVolver) {
        btnVolver.addEventListener("click", mostrarVistaPerfiles);
    }

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
            mensajeError.textContent = `¡Credenciales correctas para ${perfilActivo}!`;
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