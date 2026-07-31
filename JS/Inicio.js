document.addEventListener("DOMContentLoaded", () => {
    
    // 1. GESTIÓN DEL LOADER AL ENTRAR AL DASHBOARD
    const loader = document.getElementById("loader");
    
    // El loader dura 1 segundo para mostrar transición elegante
    setTimeout(() => {
        loader.classList.add("hidden");
        activarAnimaciones();
    }, 1000);

    // 2. ACTIVAR LAS ANIMACIONES FADE-UP
    function activarAnimaciones() {
        const elementos = document.querySelectorAll(".fade-up");
        elementos.forEach((el) => {
            el.classList.add("visible");
        });
    }

    // 3. MENÚ LATERAL EN MÓVILES (SIDEBAR)
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const closeSidebar = document.getElementById("closeSidebar");

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.add("active");
        });
    }

    if (closeSidebar) {
        closeSidebar.addEventListener("click", () => {
            sidebar.classList.remove("active");
        });
    }

    // Cerrar sidebar al hacer clic fuera en móviles
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove("active");
            }
        }
    });

});