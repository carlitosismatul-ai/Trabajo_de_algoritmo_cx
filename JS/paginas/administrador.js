const bgMusic = new Audio("song/mc.mp3");
bgMusic.loop = true; 

document.addEventListener("DOMContentLoaded", () => {
    
    // Loader
    const loader = document.getElementById("loader");
    setTimeout(() => {
        if (loader) loader.classList.add("hidden");
        document.querySelectorAll(".fade-up").forEach(el => el.classList.add("visible"));
        
        // Inicializar gráficos tras ocultar el loader para asegurar dimensiones correctas
        initCharts();
    }, 1000);

    // Sidebar interacciones
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

    // Cierra el sidebar en móvil si se hace clic afuera
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            // Verifica que el sidebar esté activo y que el clic no haya sido dentro del sidebar ni en el botón de abrir
            if (sidebar && sidebar.classList.contains("active") && menuToggleMobile) {
                if (!sidebar.contains(e.target) && !menuToggleMobile.contains(e.target)) {
                    sidebar.classList.remove("active");
                }
            }
        }
    });

    // Modal Configuración
    const settingsModal = document.getElementById("settingsModal");
    const openSettings = document.getElementById("openSettings");
    const closeSettings = document.getElementById("closeSettings");

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

    // Enlaces Sidebar activos
    const navLinks = document.querySelectorAll(".sidebar-nav .nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            navLinks.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Función para renderizar gráficos Chart.js
    function initCharts() {
        Chart.defaults.font.family = getComputedStyle(document.documentElement).getPropertyValue('--fuente-actual');
        Chart.defaults.color = '#636e72';

        const ctxProduction = document.getElementById('productionChart');
        if(ctxProduction) {
            new Chart(ctxProduction, {
                type: 'doughnut',
                data: {
                    labels: ['Tomate 45%', 'Maíz 30%', 'Café 15%', 'Lechuga 10%'],
                    datasets: [{
                        data: [45, 30, 15, 10],
                        backgroundColor: ['#4CAF50', '#fbc02d', '#81c784', '#64b5f6'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true } }
                    }
                }
            });
        }

        const ctxYield = document.getElementById('yieldChart');
        if(ctxYield) {
            new Chart(ctxYield, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Rendimiento',
                        data: [1000, 3000, 4000, 3800, 6000, 8000],
                        borderColor: '#2196F3',
                        backgroundColor: '#2196F3',
                        borderWidth: 2,
                        tension: 0.4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#2196F3',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { callback: function(value) { return value/1000 + 'k'; } },
                            grid: { borderDash: [5, 5], color: '#eee' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        const ctxMoisture = document.getElementById('moistureChart');
        if(ctxMoisture) {
            new Chart(ctxMoisture, {
                type: 'bar',
                data: {
                    labels: ['Sector A', 'Sector B', 'Sector C', 'Sector D'],
                    datasets: [{
                        label: 'Humedad',
                        data: [75, 60, 80, 45],
                        backgroundColor: ['#2196F3', '#4CAF50', '#1976D2', '#fbc02d'],
                        borderRadius: 4,
                        barPercentage: 0.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true, max: 100,
                            ticks: { callback: function(value) { return value + '%'; } },
                            grid: { display: false }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }
});