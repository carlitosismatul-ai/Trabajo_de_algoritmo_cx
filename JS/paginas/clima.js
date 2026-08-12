/**
 * HarvestX - Módulo Meteorológico Real (Ubicación Dinámica)
 * Depende de: Geolocation API, Open-Meteo API, BigDataCloud (Reverse Geocoding)
 */

const Clima = {
    // Configuración
    intervaloActualizacionAPI: 15 * 60 * 1000, // 15 minutos en milisegundos
    distanciaSignificativaMetros: 2000, // Actualizar si el usuario se mueve 2km
    ultimaCoordenada: null,
    ultimaActualizacion: 0,
    watchId: null,

    // Elementos del DOM
    dom: {
        reloj: document.getElementById('relojSistema'),
        estadoContenedor: document.getElementById('climaEstado'),
        mensajeEstado: document.getElementById('climaMensaje'),
        climaContenedor: document.getElementById('climaContenido'),
        pronosticoContenedor: document.getElementById('climaPronostico'),
        
        // Datos actuales
        ubicacion: document.getElementById('climaUbicacion'),
        icono: document.getElementById('climaIcono'),
        estadoTexto: document.getElementById('climaEstadoTexto'),
        temp: document.getElementById('climaTemp'),
        sensacion: document.getElementById('climaSensacion'),
        viento: document.getElementById('climaViento'),
        humedad: document.getElementById('climaHumedad'),
        probLluvia: document.getElementById('climaProbLluvia'),
        fecha: document.getElementById('climaFecha'),
        ultimaAct: document.getElementById('climaUltimaAct')
    },

    // Inicializar módulo
    init: function() {
        this.iniciarReloj();
        this.solicitarUbicacion();
    },

    // 1. Reloj en tiempo real
    iniciarReloj: function() {
        const actualizar = () => {
            const ahora = new Date();
            const horas = String(ahora.getHours()).padStart(2, '0');
            const minutos = String(ahora.getMinutes()).padStart(2, '0');
            const segundos = String(ahora.getSeconds()).padStart(2, '0');
            if(this.dom.reloj) this.dom.reloj.textContent = `${horas}:${minutos}:${segundos}`;
        };
        actualizar();
        setInterval(actualizar, 1000); // Actualiza cada segundo sin llamar a APIs
    },

    // 2. Control de Estados de la UI
    mostrarEstado: function(mensaje, iconoClase = "fa-solid fa-circle-info") {
        this.dom.estadoContenedor.style.display = 'flex';
        this.dom.climaContenedor.style.display = 'none';
        this.dom.pronosticoContenedor.style.display = 'none';
        this.dom.estadoContenedor.innerHTML = `<i class="${iconoClase}" style="font-size: 2rem; margin-bottom:10px;"></i><p>${mensaje}</p>`;
    },

    mostrarDatos: function() {
        this.dom.estadoContenedor.style.display = 'none';
        this.dom.climaContenedor.style.display = 'block';
        this.dom.pronosticoContenedor.style.display = 'flex';
    },

    // 3. Geolocalización
    solicitarUbicacion: function() {
        if (!navigator.geolocation) {
            this.mostrarEstado("Tu navegador no soporta geolocalización.", "fa-solid fa-triangle-exclamation text-red");
            return;
        }

        this.mostrarEstado("Permite el acceso a tu ubicación para consultar el clima.", "fa-solid fa-location-dot fa-bounce text-blue");

        // Obtener posición inicial
        navigator.geolocation.getCurrentPosition(
            (posicion) => this.manejarNuevaPosicion(posicion),
            (error) => this.manejarErrorUbicacion(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Vigilar cambios de posición (watchPosition)
        this.watchId = navigator.geolocation.watchPosition(
            (posicion) => this.evaluarDesplazamiento(posicion),
            null, 
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
        );
    },

    manejarErrorUbicacion: function(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                this.mostrarEstado("El acceso a la ubicación fue rechazado. Necesitamos tu ubicación para mostrar el clima de tu zona.", "fa-solid fa-hand text-red");
                break;
            case error.POSITION_UNAVAILABLE:
                this.mostrarEstado("La información de ubicación no está disponible.", "fa-solid fa-satellite-dish text-yellow");
                break;
            case error.TIMEOUT:
                this.mostrarEstado("Se agotó el tiempo de espera para obtener la ubicación.", "fa-solid fa-clock-rotate-left text-yellow");
                break;
            default:
                this.mostrarEstado("Ocurrió un error desconocido al obtener la ubicación.", "fa-solid fa-circle-exclamation text-red");
                break;
        }
    },

    // 4. Lógica de Desplazamiento
    calcularDistancia: function(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Radio de la Tierra en metros
        const phi1 = lat1 * Math.PI/180;
        const phi2 = lat2 * Math.PI/180;
        const deltaPhi = (lat2-lat1) * Math.PI/180;
        const deltaLambda = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Metros
    },

    evaluarDesplazamiento: function(posicion) {
        const { latitude, longitude } = posicion.coords;
        const ahora = Date.now();

        if (this.ultimaCoordenada) {
            const distancia = this.calcularDistancia(
                this.ultimaCoordenada.lat, this.ultimaCoordenada.lon,
                latitude, longitude
            );
            
            const tiempoTranscurrido = ahora - this.ultimaActualizacion;

            // Si se movió más de 2km O pasaron 15 minutos, actualizar.
            if (distancia >= this.distanciaSignificativaMetros || tiempoTranscurrido >= this.intervaloActualizacionAPI) {
                this.manejarNuevaPosicion(posicion);
            }
        }
    },

    manejarNuevaPosicion: function(posicion) {
        const lat = posicion.coords.latitude;
        const lon = posicion.coords.longitude;
        
        this.ultimaCoordenada = { lat, lon };
        this.ultimaActualizacion = Date.now();
        
        this.mostrarEstado("Obteniendo información meteorológica...", "fa-solid fa-cloud-arrow-down fa-bounce text-blue");
        this.actualizarClima(lat, lon);
        this.obtenerNombreUbicacion(lat, lon);
    },

    // 5. API Meteorológica (Open-Meteo)
    actualizarClima: async function(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

        try {
            const respuesta = await fetch(url);
            if (!respuesta.ok) throw new Error("Error en la respuesta de la red");
            
            const datos = await respuesta.json();
            this.procesarDatosClima(datos);
            this.mostrarDatos();
        } catch (error) {
            console.error("Error al obtener clima:", error);
            this.mostrarEstado("No se pudo conectar con el servicio meteorológico.", "fa-solid fa-wifi text-red");
        }
    },

    // 6. Geocodificación Inversa (Obtener Ciudad/País)
    obtenerNombreUbicacion: async function(lat, lon) {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`;
        
        try {
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            
            const ciudad = datos.city || datos.locality || "Ubicación desconocida";
            const pais = datos.countryName || "";
            
            this.dom.ubicacion.textContent = pais ? `${ciudad}, ${pais}` : ciudad;
        } catch (error) {
            this.dom.ubicacion.textContent = "Ubicación detectada (Coordenadas)";
        }
    },

    // 7. Procesamiento y Renderizado de Datos
    procesarDatosClima: function(datos) {
        const actual = datos.current;
        const diario = datos.daily;

        const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const ahora = new Date();
        
        // Actualizar UI - Clima Actual
        const infoClima = this.traducirCodigoClima(actual.weather_code);
        
        this.dom.icono.className = `fa-solid ${infoClima.icono} weather-icon-large`;
        this.dom.icono.style.color = infoClima.icono === 'fa-sun' ? '#ffca28' : '#e0e0e0';
        
        this.dom.estadoTexto.textContent = infoClima.texto;
        this.dom.temp.textContent = `${Math.round(actual.temperature_2m)}°C`;
        this.dom.sensacion.textContent = Math.round(actual.apparent_temperature);
        this.dom.viento.textContent = Math.round(actual.wind_speed_10m);
        this.dom.humedad.textContent = actual.relative_humidity_2m;
        this.dom.probLluvia.textContent = diario.precipitation_probability_max[0] || 0;
        
        this.dom.fecha.textContent = ahora.toLocaleDateString('es-ES', opcionesFecha);
        this.dom.ultimaAct.textContent = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

        // Generar Pronóstico (Próximos 5 días)
        this.dom.pronosticoContenedor.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const fechaDato = new Date(diario.time[i]);
            fechaDato.setMinutes(fechaDato.getMinutes() + fechaDato.getTimezoneOffset()); 
            
            const nombreDia = i === 0 ? 'HOY' : fechaDato.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
            const probLluvia = diario.precipitation_probability_max[i];
            const tempMax = Math.round(diario.temperature_2m_max[i]);
            const estadoDia = this.traducirCodigoClima(diario.weather_code[i]);
            
            const colorIcono = estadoDia.icono === 'fa-sun' ? 'var(--text-yellow)' : 'var(--texto-claro)';

            const diaHtml = `
                <div class="forecast-day">
                    <span style="font-weight: 700;">${nombreDia}</span>
                    <i class="fa-solid ${estadoDia.icono}" style="color: ${colorIcono}; margin: 5px 0;"></i>
                    <span style="font-size: 0.85rem;">${tempMax}°C</span>
                    <small style="font-size: 0.6rem; color: var(--text-blue);">${probLluvia}% <i class="fa-solid fa-droplet"></i></small>
                </div>
            `;
            this.dom.pronosticoContenedor.innerHTML += diaHtml;
        }
    },

    traducirCodigoClima: function(codigo) {
        const mapa = {
            0: { texto: 'Soleado', icono: 'fa-sun' },
            1: { texto: 'Mayormente Despejado', icono: 'fa-sun' },
            2: { texto: 'Parcialmente Nublado', icono: 'fa-cloud-sun' },
            3: { texto: 'Nublado', icono: 'fa-cloud' },
            45: { texto: 'Niebla', icono: 'fa-smog' },
            48: { texto: 'Niebla de Escarcha', icono: 'fa-smog' },
            51: { texto: 'Llovizna Ligera', icono: 'fa-cloud-rain' },
            53: { texto: 'Llovizna', icono: 'fa-cloud-rain' },
            55: { texto: 'Llovizna Fuerte', icono: 'fa-cloud-showers-heavy' },
            61: { texto: 'Lluvia Ligera', icono: 'fa-cloud-rain' },
            63: { texto: 'Lluvia', icono: 'fa-cloud-showers-heavy' },
            65: { texto: 'Lluvia Fuerte', icono: 'fa-cloud-showers-water' },
            71: { texto: 'Nieve Ligera', icono: 'fa-snowflake' },
            73: { texto: 'Nieve', icono: 'fa-snowflake' },
            75: { texto: 'Nieve Fuerte', icono: 'fa-snowflake' },
            95: { texto: 'Tormenta', icono: 'fa-cloud-bolt' },
            96: { texto: 'Tormenta con Granizo', icono: 'fa-cloud-bolt' },
            99: { texto: 'Tormenta Fuerte', icono: 'fa-cloud-bolt' }
        };
        
        return mapa[codigo] || { texto: 'Desconocido', icono: 'fa-circle-question' };
    }
};

window.actualizarClimaGlobal = () => {
    if (Clima.ultimaCoordenada) {
        Clima.actualizarClima(Clima.ultimaCoordenada.lat, Clima.ultimaCoordenada.lon);
    } else {
        Clima.solicitarUbicacion();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Clima.init();
});