const bgMusic = new Audio("song/mc.mp3");
bgMusic.loop = true; 

document.addEventListener("DOMContentLoaded", () => {
    
    const loader = document.getElementById("loader");
    setTimeout(() => {
        if (loader) loader.classList.add("hidden");
        document.querySelectorAll(".fade-up").forEach(el => el.classList.add("visible"));
    }, 1000);

    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
    const toggleSidebarDesktop = document.getElementById("toggleSidebarDesktop");

    if (toggleSidebarDesktop) {
        toggleSidebarDesktop.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
            mainContent.classList.toggle("expanded");
        });
    }

    const menuToggleMobile = document.getElementById("menuToggleMobile");
    const closeSidebarMobile = document.getElementById("closeSidebarMobile");

    if (menuToggleMobile) {
        menuToggleMobile.addEventListener("click", () => {
            sidebar.classList.add("active");
        });
    }

    if (closeSidebarMobile) {
        closeSidebarMobile.addEventListener("click", () => {
            sidebar.classList.remove("active");
        });
    }

    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            if (sidebar && menuToggleMobile && !sidebar.contains(e.target) && !menuToggleMobile.contains(e.target)) {
                sidebar.classList.remove("active");
            }
        }
    });

    const settingsModal = document.getElementById("settingsModal");
    const openSettings = document.getElementById("openSettings");
    const closeSettings = document.getElementById("closeSettings");

    // Abrir / Cerrar Modal
    if (openSettings) {
        openSettings.addEventListener("click", (e) => {
            e.preventDefault();
            settingsModal.classList.add("active");
        });
    }
    
    if (closeSettings) {
        closeSettings.addEventListener("click", () => {
            settingsModal.classList.remove("active");
        });
    }

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("change", (e) => {
            if (e.target.checked) {
                document.documentElement.setAttribute("data-theme", "dark");
            } else {
                document.documentElement.removeAttribute("data-theme");
            }
        });
    }

    const soundToggle = document.getElementById("soundToggle");
    if (soundToggle) {
        soundToggle.addEventListener("change", (e) => {
            if (e.target.checked) {
                bgMusic.play().catch(error => {
                    console.error("Error al reproducir el audio local:", error);
                });
            } else {
                bgMusic.pause();
            }
        });
    }

    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        fontSelect.addEventListener("change", (e) => {
            document.documentElement.style.setProperty('--fuente-actual', e.target.value);
        });
    }

    const btnsSize = document.querySelectorAll(".btn-size");
    const htmlElement = document.documentElement;
    
    btnsSize.forEach(btn => {
        btn.addEventListener("click", (e) => {
            btnsSize.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");

            const sizeId = e.target.id;
            if (sizeId === "btnSizeSmall") {
                htmlElement.style.setProperty('--escala-texto', '0.85rem');
            } else if (sizeId === "btnSizeNormal") {
                htmlElement.style.setProperty('--escala-texto', '1rem');
            } else if (sizeId === "btnSizeLarge") {
                htmlElement.style.setProperty('--escala-texto', '1.15rem');
            }
        });
    });

    const navLinks = document.querySelectorAll(".sidebar-nav .nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            navLinks.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

});