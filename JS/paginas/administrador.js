const bgMusic = new Audio("song/mc.mp3");
bgMusic.loop = true;

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // CONFIGURACIÓN PERMANENTE
    // ==========================================

    const htmlElement = document.documentElement;

    // Recuperar configuración guardada
    const temaGuardado = localStorage.getItem("temaHarvestX");
    const fuenteGuardada = localStorage.getItem("fuenteHarvestX");
    const escalaGuardada = localStorage.getItem("escalaHarvestX");
    const sonidoGuardado = localStorage.getItem("sonidoHarvestX");

    // Tema
    if (temaGuardado === "dark") {
        htmlElement.setAttribute("data-theme", "dark");
    } else {
        htmlElement.removeAttribute("data-theme");
    }

    // Fuente
    if (fuenteGuardada) {
        htmlElement.style.setProperty(
            "--fuente-actual",
            fuenteGuardada
        );
    }

    // Tamaño
    if (escalaGuardada) {
        htmlElement.style.setProperty(
            "--escala-texto",
            escalaGuardada
        );
    }


    // ==========================================
    // LOADER
    // ==========================================

    const loader = document.getElementById("loader");

    setTimeout(() => {

        if (loader) {
            loader.classList.add("hidden");
        }

        document
            .querySelectorAll(".fade-up")
            .forEach(el => el.classList.add("visible"));

        initCharts();

    }, 1000);


    // ==========================================
    // SIDEBAR
    // ==========================================

    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
    const toggleSidebarDesktop =
        document.getElementById("toggleSidebarDesktop");

    if (toggleSidebarDesktop) {

        toggleSidebarDesktop.addEventListener("click", () => {

            sidebar.classList.toggle("collapsed");
            mainContent.classList.toggle("expanded");

        });

    }


    const menuToggleMobile =
        document.getElementById("menuToggleMobile");

    const closeSidebarMobile =
        document.getElementById("closeSidebarMobile");


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


    // Cerrar sidebar móvil al hacer clic afuera

    document.addEventListener("click", (e) => {

        if (window.innerWidth <= 768) {

            if (
                sidebar &&
                sidebar.classList.contains("active") &&
                menuToggleMobile
            ) {

                if (
                    !sidebar.contains(e.target) &&
                    !menuToggleMobile.contains(e.target)
                ) {

                    sidebar.classList.remove("active");

                }

            }

        }

    });


    // ==========================================
    // MODAL CONFIGURACIÓN
    // ==========================================

    const settingsModal =
        document.getElementById("settingsModal");

    const openSettings =
        document.getElementById("openSettings");

    const closeSettings =
        document.getElementById("closeSettings");


    if (openSettings) {

        openSettings.addEventListener("click", (e) => {

            e.preventDefault();

            if (settingsModal) {
                settingsModal.classList.add("active");
            }

        });

    }


    if (closeSettings) {

        closeSettings.addEventListener("click", () => {

            if (settingsModal) {
                settingsModal.classList.remove("active");
            }

        });

    }


    // ==========================================
    // TEMA OSCURO
    // ==========================================

    const themeToggle =
        document.getElementById("themeToggle");


    if (themeToggle) {

        // Mostrar estado guardado

        themeToggle.checked =
            localStorage.getItem("temaHarvestX") === "dark";


        themeToggle.addEventListener("change", (e) => {

            if (e.target.checked) {

                htmlElement.setAttribute(
                    "data-theme",
                    "dark"
                );

                localStorage.setItem(
                    "temaHarvestX",
                    "dark"
                );

            } else {

                htmlElement.removeAttribute(
                    "data-theme"
                );

                localStorage.setItem(
                    "temaHarvestX",
                    "light"
                );

            }

        });

    }


    // ==========================================
    // SONIDO
    // ==========================================

    const soundToggle =
        document.getElementById("soundToggle");


    if (soundToggle) {

        soundToggle.checked =
            localStorage.getItem("sonidoHarvestX") === "on";


        soundToggle.addEventListener("change", (e) => {

            if (e.target.checked) {

                localStorage.setItem(
                    "sonidoHarvestX",
                    "on"
                );

                bgMusic.play().catch(error => {

                    console.error(
                        "Error al reproducir el audio:",
                        error
                    );

                });

            } else {

                localStorage.setItem(
                    "sonidoHarvestX",
                    "off"
                );

                bgMusic.pause();

            }

        });

    }


    // ==========================================
    // FUENTE
    // ==========================================

    const fontSelect =
        document.getElementById("fontSelect");


    if (fontSelect) {

        if (fuenteGuardada) {
            fontSelect.value = fuenteGuardada;
        }


        fontSelect.addEventListener("change", (e) => {

            const nuevaFuente = e.target.value;

            htmlElement.style.setProperty(
                "--fuente-actual",
                nuevaFuente
            );

            localStorage.setItem(
                "fuenteHarvestX",
                nuevaFuente
            );

        });

    }


    // ==========================================
    // TAMAÑO DE LETRA
    // ==========================================

    const btnsSize =
        document.querySelectorAll(".btn-size");


    btnsSize.forEach(btn => {

        btn.addEventListener("click", (e) => {

            btnsSize.forEach(b =>
                b.classList.remove("active")
            );

            e.currentTarget.classList.add("active");


            const sizeId =
                e.currentTarget.id;

            let nuevoTamano;


            if (sizeId === "btnSizeSmall") {

                nuevoTamano = "0.85rem";

            }

            else if (sizeId === "btnSizeNormal") {

                nuevoTamano = "1rem";

            }

            else if (sizeId === "btnSizeLarge") {

                nuevoTamano = "1.15rem";

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

        });

    });


    // ==========================================
    // ENLACES SIDEBAR
    // ==========================================

    const navLinks =
        document.querySelectorAll(
            ".sidebar-nav .nav-link"
        );


    navLinks.forEach(link => {

        link.addEventListener("click", function() {

            navLinks.forEach(nav =>
                nav.classList.remove("active")
            );

            this.classList.add("active");

        });

    });


    // ==========================================
    // CHART.JS
    // ==========================================

    function initCharts() {

        if (typeof Chart === "undefined") {
            return;
        }


        Chart.defaults.font.family =
            getComputedStyle(document.documentElement)
                .getPropertyValue("--fuente-actual");


        Chart.defaults.color = "#636e72";


        // Producción

        const ctxProduction =
            document.getElementById("productionChart");


        if (ctxProduction) {

            new Chart(ctxProduction, {

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

                    maintainAspectRatio: false,

                    cutout: "65%",

                    plugins: {

                        legend: {

                            position: "right",

                            labels: {

                                boxWidth: 10,

                                usePointStyle: true

                            }

                        }

                    }

                }

            });

        }


        // Rendimiento

        const ctxYield =
            document.getElementById("yieldChart");


        if (ctxYield) {

            new Chart(ctxYield, {

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

                        label: "Rendimiento",

                        data: [
                            1000,
                            3000,
                            4000,
                            3800,
                            6000,
                            8000
                        ],

                        borderColor: "#2196F3",

                        backgroundColor: "#2196F3",

                        borderWidth: 2,

                        tension: 0.4,

                        pointBackgroundColor: "#fff",

                        pointBorderColor: "#2196F3",

                        pointRadius: 4

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            });

        }


        // Humedad

        const ctxMoisture =
            document.getElementById("moistureChart");


        if (ctxMoisture) {

            new Chart(ctxMoisture, {

                type: "bar",

                data: {

                    labels: [
                        "Sector A",
                        "Sector B",
                        "Sector C",
                        "Sector D"
                    ],

                    datasets: [{

                        label: "Humedad",

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

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            });

        }

    }

});