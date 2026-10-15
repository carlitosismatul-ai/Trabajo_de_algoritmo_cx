/* =========================================================
   HARVESTX — MONITOREO CLIMÁTICO
   Open-Meteo + Alertas Automáticas
========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const CLIMA_CONFIG = {

    intervaloActualizacion: 15 * 60 * 1000,

    diasPronostico: 5

};


/* =========================================================
   CONFIGURACIÓN DE ALERTAS
========================================================= */

const ALERTAS_API = "http://127.0.0.1:5000";


/* =========================================================
   ELEMENTOS
========================================================= */

const climaElementos = {

    ubicacion:
        document.getElementById("climaUbicacion"),

    estadoConexion:
        document.getElementById("climaEstadoConexion"),

    statusDot:
        document.getElementById("climaStatusDot"),

    ultimaActualizacion:
        document.getElementById("climaUltimaActualizacion"),

    temperatura:
        document.getElementById("climaTemperatura"),

    sensacion:
        document.getElementById("climaSensacion"),

    humedad:
        document.getElementById("climaHumedad"),

    lluvia:
        document.getElementById("climaLluvia"),

    precipitacion:
        document.getElementById("climaPrecipitacion"),

    viento:
        document.getElementById("climaViento"),

    descripcion:
        document.getElementById("climaDescripcion"),

    detalle:
        document.getElementById("climaDetalle"),

    icono:
        document.getElementById("climaIcono"),

    nubosidad:
        document.getElementById("climaNubosidad"),

    precipitacionActual:
        document.getElementById("climaPrecipitacionActual"),

    pronostico:
        document.getElementById("climaPronostico")

};


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarMonitoreo
);


function iniciarMonitoreo() {

    console.log(
        "🌦️ HarvestX — Monitoreo Climático iniciado"
    );


    obtenerUbicacion();


    /*
       Actualización automática cada 15 minutos.
    */

    setInterval(
        obtenerUbicacion,
        CLIMA_CONFIG.intervaloActualizacion
    );

}


/* =========================================================
   UBICACIÓN
========================================================= */

function obtenerUbicacion() {

    actualizarEstado(
        "Obteniendo ubicación..."
    );


    if (!navigator.geolocation) {

        mostrarError(
            "Tu navegador no permite obtener la ubicación."
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        posicion => {

            const latitud =
                posicion.coords.latitude;

            const longitud =
                posicion.coords.longitude;


            console.log(
                "📍 Ubicación:",
                latitud,
                longitud
            );


            obtenerClima(
                latitud,
                longitud
            );

        },


        error => {

            console.error(
                "Error obteniendo ubicación:",
                error
            );


            mostrarError(
                "No fue posible obtener tu ubicación."
            );

        },


        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 10 * 60 * 1000

        }

    );

}


/* =========================================================
   CONSULTAR CLIMA
========================================================= */

async function obtenerClima(
    latitud,
    longitud
) {

    actualizarEstado(
        "Consultando información climática..."
    );


    const currentVariables =
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m"
        ].join(",");


    const hourlyVariables =
        [
            "precipitation_probability"
        ].join(",");


    const dailyVariables =
        [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "precipitation_sum",
            "sunrise",
            "sunset"
        ].join(",");


    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitud}` +
        `&longitude=${longitud}` +
        `&current=${currentVariables}` +
        `&hourly=${hourlyVariables}` +
        `&daily=${dailyVariables}` +
        `&timezone=auto` +
        `&forecast_days=${CLIMA_CONFIG.diasPronostico}`;


    console.log(
        "🌐 Consultando:",
        url
    );


    try {

        const respuesta =
            await fetch(url);


        if (!respuesta.ok) {

            throw new Error(
                "Error consultando la API climática."
            );

        }


        const datos =
            await respuesta.json();


        console.log(
            "🌦️ Datos climáticos:",
            datos
        );


        mostrarClima(datos);


        obtenerNombreUbicacion(
            latitud,
            longitud
        );


        /*
           NUEVO:
           Revisamos si las condiciones actuales
           deben generar una alerta.
        */

        revisarAlertasClimaticas(
            datos
        );


        actualizarEstado(
            "Información climática actualizada"
        );


    } catch (error) {

        console.error(
            "Error climático:",
            error
        );


        mostrarError(
            "No fue posible actualizar el clima."
        );

    }

}


/* =========================================================
   MOSTRAR CLIMA ACTUAL
========================================================= */

function mostrarClima(datos) {

    const actual =
        datos.current;


    if (!actual) {

        console.warn(
            "La API no devolvió información actual."
        );

        return;

    }


    /* TEMPERATURA */

    if (
        actual.temperature_2m !== undefined
    ) {

        climaElementos.temperatura.textContent =
            `${Math.round(actual.temperature_2m)}°C`;

    }


    /* SENSACIÓN */

    if (
        actual.apparent_temperature !== undefined
    ) {

        climaElementos.sensacion.textContent =
            `Sensación: ${Math.round(actual.apparent_temperature)}°C`;

    }


    /* HUMEDAD */

    if (
        actual.relative_humidity_2m !== undefined
    ) {

        climaElementos.humedad.textContent =
            `${actual.relative_humidity_2m}%`;

    }


    /* VIENTO */

    if (
        actual.wind_speed_10m !== undefined
    ) {

        climaElementos.viento.textContent =
            `${Math.round(actual.wind_speed_10m)} km/h`;

    }


    /* PRECIPITACIÓN */

    const precipitacion =
        Number(actual.precipitation || 0);


    climaElementos.precipitacion.textContent =
        `Precipitación: ${precipitacion.toFixed(1)} mm`;


    climaElementos.precipitacionActual.textContent =
        `${precipitacion.toFixed(1)} mm`;


    /* NUBOSIDAD */

    if (
        actual.cloud_cover !== undefined
    ) {

        climaElementos.nubosidad.textContent =
            `${actual.cloud_cover}%`;

    }


    /* =====================================================
       DÍA / NOCHE ACTUAL
    ===================================================== */

    const esNoche =
        determinarNocheActual(
            datos.daily
        );


    /* CONDICIÓN */

    const condicion =
        interpretarClima(
            actual.weather_code,
            esNoche
        );


    climaElementos.descripcion.textContent =
        condicion.nombre;


    climaElementos.detalle.textContent =
        condicion.detalle;


    /* ICONO */

    climaElementos.icono.innerHTML =
        `<i class="${condicion.icono}"></i>`;


    /* PROBABILIDAD DE LLUVIA */

    const probabilidad =
        obtenerProbabilidadLluvia(
            datos
        );


    climaElementos.lluvia.textContent =
        `${probabilidad}%`;


    /* ACTUALIZACIÓN */

    const ahora =
        new Date();


    climaElementos.ultimaActualizacion.textContent =
        ahora.toLocaleTimeString(
            "es-GT",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    /* PRONÓSTICO */

    mostrarPronostico(
        datos.daily
    );

}


/* =========================================================
   ALERTAS CLIMÁTICAS AUTOMÁTICAS
========================================================= */

/*
   Esta función analiza los datos reales de Open-Meteo
   y determina si existe alguna condición que deba
   registrarse como alerta en HarvestX.
*/

async function revisarAlertasClimaticas(datos) {

    if (
        !datos ||
        !datos.current
    ) {

        return;

    }


    const actual =
        datos.current;


    const temperatura =
        Number(actual.temperature_2m);


    const humedad =
        Number(actual.relative_humidity_2m);


    const viento =
        Number(actual.wind_speed_10m);


    const codigoClima =
        Number(actual.weather_code);


    const probabilidadLluvia =
        obtenerProbabilidadLluvia(datos);


    /*
       =====================================================
       TORMENTA ELÉCTRICA
       =====================================================
    */

    if (
        codigoClima === 95 ||
        codigoClima === 96 ||
        codigoClima === 99
    ) {

        await crearAlertaClimatica(
            "Clima",
            "Alto",
            "Se detectan condiciones de tormenta eléctrica en la zona."
        );

    }


    /*
       =====================================================
       TEMPERATURA
       =====================================================
    */

    else if (
        temperatura >= 35
    ) {

        await crearAlertaClimatica(
            "Temperatura",
            "Alto",
            `La temperatura actual es de ${Math.round(temperatura)}°C y puede representar un riesgo para los cultivos.`
        );

    }


    else if (
        temperatura >= 30
    ) {

        await crearAlertaClimatica(
            "Temperatura",
            "Medio",
            `La temperatura actual es de ${Math.round(temperatura)}°C y supera el rango recomendado.`
        );

    }


    /*
       =====================================================
       HUMEDAD
       =====================================================
    */

    if (
        humedad <= 30
    ) {

        await crearAlertaClimatica(
            "Humedad",
            "Alto",
            `La humedad relativa actual es de ${Math.round(humedad)}% y se encuentra muy por debajo del nivel recomendado.`
        );

    }


    else if (
        humedad <= 40
    ) {

        await crearAlertaClimatica(
            "Humedad",
            "Medio",
            `La humedad relativa actual es de ${Math.round(humedad)}% y se encuentra por debajo del nivel recomendado.`
        );

    }


    /*
       =====================================================
       PROBABILIDAD DE LLUVIA
       =====================================================
    */

    if (
        probabilidadLluvia >= 90
    ) {

        await crearAlertaClimatica(
            "Lluvia",
            "Alto",
            `La probabilidad de lluvia es del ${probabilidadLluvia}%. Se recomienda revisar las condiciones de los cultivos.`
        );

    }


    else if (
        probabilidadLluvia >= 80
    ) {

        await crearAlertaClimatica(
            "Lluvia",
            "Medio",
            `La probabilidad de lluvia es del ${probabilidadLluvia}%. Se recomienda estar atento a las condiciones climáticas.`
        );

    }


    /*
       =====================================================
       VIENTO
       =====================================================
    */

    if (
        viento >= 50
    ) {

        await crearAlertaClimatica(
            "Clima",
            "Alto",
            `La velocidad del viento es de ${Math.round(viento)} km/h y puede afectar las condiciones de los cultivos.`
        );

    }


    else if (
        viento >= 35
    ) {

        await crearAlertaClimatica(
            "Clima",
            "Medio",
            `La velocidad del viento es de ${Math.round(viento)} km/h. Se recomienda supervisar los cultivos.`
        );

    }

}


/* =========================================================
   CREAR ALERTA CLIMÁTICA
========================================================= */

/*
   Antes de crear una alerta:

   1. Consulta las alertas existentes.
   2. Busca una alerta activa del mismo tipo,
      nivel y mensaje.
   3. Si ya existe, NO crea otra.

   Esto evita que la actualización automática
   cada 15 minutos llene la base de datos con
   alertas duplicadas.
*/

async function crearAlertaClimatica(
    tipo,
    nivel,
    mensaje
) {

    try {

        const respuestaExistentes =
            await fetch(
                `${ALERTAS_API}/api/alertas`
            );


        if (!respuestaExistentes.ok) {

            throw new Error(
                `Error consultando alertas existentes: ${respuestaExistentes.status}`
            );

        }


        const datosExistentes =
            await respuestaExistentes.json();


        if (
            datosExistentes.status !== "ok" ||
            !Array.isArray(datosExistentes.alertas)
        ) {

            throw new Error(
                "La respuesta de alertas no tiene el formato esperado."
            );

        }


        /*
           Buscamos únicamente alertas activas
           iguales a la que queremos crear.
        */

        const alertaYaExiste =
            datosExistentes.alertas.some(
                alerta =>
                    String(alerta.estado).toLowerCase() === "activa" &&
                    String(alerta.tipo).toLowerCase() ===
                        String(tipo).toLowerCase() &&
                    String(alerta.nivel).toLowerCase() ===
                        String(nivel).toLowerCase() &&
                    String(alerta.mensaje).toLowerCase() ===
                        String(mensaje).toLowerCase()
            );


        if (alertaYaExiste) {

            console.log(
                "🔔 Alerta ya existente. No se creará duplicada:",
                tipo,
                nivel
            );

            return;

        }


        /*
           Crear alerta nueva.
        */

        const respuesta =
            await fetch(
                `${ALERTAS_API}/api/alertas`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        tipo: tipo,
                        nivel: nivel,
                        mensaje: mensaje
                    })
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                `Error creando alerta: ${respuesta.status}`
            );

        }


        const resultado =
            await respuesta.json();


        if (
            resultado.status === "ok"
        ) {

            console.log(
                "🔔 HarvestX — Alerta climática creada:",
                tipo,
                nivel
            );

        }
        else {

            console.warn(
                "La API no confirmó la creación de la alerta:",
                resultado
            );

        }


    } catch (error) {

        console.error(
            "HarvestX — Error creando alerta climática:",
            error
        );

    }

}


/* =========================================================
   DETERMINAR DÍA / NOCHE
========================================================= */

function determinarNocheActual(
    diario
) {

    if (
        !diario ||
        !Array.isArray(diario.sunrise) ||
        !Array.isArray(diario.sunset)
    ) {

        return false;

    }


    if (
        !diario.sunrise[0] ||
        !diario.sunset[0]
    ) {

        return false;

    }


    const ahora =
        new Date();


    const amanecer =
        new Date(
            diario.sunrise[0]
        );


    const atardecer =
        new Date(
            diario.sunset[0]
        );


    return (
        ahora < amanecer ||
        ahora >= atardecer
    );

}


/* =========================================================
   DETERMINAR DÍA / NOCHE PARA PRONÓSTICO
========================================================= */

function determinarNochePronostico(
    diario,
    indice
) {

    if (
        !diario ||
        !Array.isArray(diario.sunrise) ||
        !Array.isArray(diario.sunset)
    ) {

        return false;

    }


    if (
        !diario.sunrise[indice] ||
        !diario.sunset[indice]
    ) {

        return false;

    }


    /*
       Para el pronóstico usamos la noche
       como referencia para mostrar una
       representación nocturna en condiciones
       despejadas o parcialmente nubladas.
    */

    const amanecer =
        new Date(
            diario.sunrise[indice]
        );


    const atardecer =
        new Date(
            diario.sunset[indice]
        );


    /*
       La tarjeta representa el día completo,
       así que usamos la noche solamente
       cuando la condición es principalmente
       nocturna.

       Para los días futuros se muestra
       normalmente la representación diurna.
    */

    return false;

}


/* =========================================================
   PROBABILIDAD DE LLUVIA
========================================================= */

function obtenerProbabilidadLluvia(
    datos
) {

    /*
       Primero intentamos obtener la probabilidad
       horaria de lluvia.
    */

    if (
        datos.hourly &&
        Array.isArray(
            datos.hourly.precipitation_probability
        ) &&
        datos.hourly.precipitation_probability.length > 0
    ) {

        const valor =
            datos.hourly.precipitation_probability[0];


        if (
            valor !== null &&
            valor !== undefined
        ) {

            return Math.round(valor);

        }

    }


    /*
       Si no existe información horaria,
       usamos la probabilidad máxima del día.
    */

    if (
        datos.daily &&
        Array.isArray(
            datos.daily.precipitation_probability_max
        ) &&
        datos.daily.precipitation_probability_max.length > 0
    ) {

        const valor =
            datos.daily.precipitation_probability_max[0];


        if (
            valor !== null &&
            valor !== undefined
        ) {

            return Math.round(valor);

        }

    }


    return 0;

}


/* =========================================================
   PRONÓSTICO
========================================================= */

function mostrarPronostico(
    diario
) {

    if (
        !diario ||
        !Array.isArray(diario.time)
    ) {

        console.warn(
            "No existe información de pronóstico."
        );

        return;

    }


    climaElementos.pronostico.innerHTML =
        "";


    const cantidad =
        Math.min(
            diario.time.length,
            CLIMA_CONFIG.diasPronostico
        );


    for (
        let i = 0;
        i < cantidad;
        i++
    ) {

        /* DATOS SEGUROS */

        const codigo =
            Array.isArray(diario.weather_code)
                ? diario.weather_code[i]
                : 0;


        const max =
            Array.isArray(diario.temperature_2m_max)
                ? diario.temperature_2m_max[i]
                : null;


        const min =
            Array.isArray(diario.temperature_2m_min)
                ? diario.temperature_2m_min[i]
                : null;


        const probabilidad =
            Array.isArray(
                diario.precipitation_probability_max
            )
                ? diario.precipitation_probability_max[i]
                : 0;


        /* FECHA */

        const fecha =
            new Date(
                `${diario.time[i]}T12:00:00`
            );


        /*
           Para las tarjetas del pronóstico
           usamos representación diurna,
           ya que representan el comportamiento
           general del día.
        */

        const condicion =
            interpretarClima(
                codigo,
                false
            );


        /* NOMBRE DEL DÍA */

        const dia =
            obtenerNombreDia(
                fecha,
                i
            );


        /* TEMPERATURAS */

        const temperaturaMaxima =
            max !== null &&
            max !== undefined
                ? Math.round(max)
                : "--";


        const temperaturaMinima =
            min !== null &&
            min !== undefined
                ? Math.round(min)
                : "--";


        /* LLUVIA */

        const lluvia =
            probabilidad !== null &&
            probabilidad !== undefined
                ? Math.round(probabilidad)
                : 0;


        /* TARJETA */

        const tarjeta =
            document.createElement("article");


        tarjeta.className =
            "forecast-card";


        tarjeta.innerHTML = `

            <div class="forecast-day">
                ${dia}
            </div>


            <div class="forecast-icon">

                <i class="${condicion.icono}"></i>

            </div>


            <div class="forecast-condition">

                ${condicion.nombre}

            </div>


            <div class="forecast-temperature">

                <span class="forecast-max">

                    ${temperaturaMaxima}°

                </span>


                <span class="forecast-min">

                    ${temperaturaMinima}°

                </span>

            </div>


            <span class="forecast-rain">

                <i class="fa-solid fa-droplet"></i>

                ${lluvia}% lluvia

            </span>

        `;


        climaElementos.pronostico.appendChild(
            tarjeta
        );

    }

}


/* =========================================================
   NOMBRE DEL DÍA
========================================================= */

function obtenerNombreDia(
    fecha,
    indice
) {

    if (indice === 0) {

        return "Hoy";

    }


    if (indice === 1) {

        return "Mañana";

    }


    return fecha.toLocaleDateString(
        "es-GT",
        {
            weekday: "long"
        }
    ).replace(
        /^\w/,
        letra => letra.toUpperCase()
    );

}


/* =========================================================
   INTERPRETAR CÓDIGO METEOROLÓGICO
========================================================= */

function interpretarClima(
    codigo,
    esNoche = false
) {

    /* =====================================================
       CIELO DESPEJADO
    ===================================================== */

    if (codigo === 0) {

        if (esNoche) {

            return {

                nombre: "Cielo despejado",

                detalle:
                    "Noche despejada con cielo estable.",

                icono:
                    "fa-solid fa-moon"

            };

        }


        return {

            nombre: "Cielo despejado",

            detalle:
                "Condiciones despejadas y estables.",

            icono:
                "fa-solid fa-sun"

        };

    }


    /* =====================================================
       PARCIALMENTE NUBLADO
    ===================================================== */

    if (
        codigo === 1 ||
        codigo === 2
    ) {

        if (esNoche) {

            return {

                nombre: "Noche parcialmente nublada",

                detalle:
                    "Se observan nubes durante la noche.",

                icono:
                    "fa-solid fa-cloud-moon"

            };

        }


        return {

            nombre: "Parcialmente nublado",

            detalle:
                "Se observan algunas nubes en la zona.",

            icono:
                "fa-solid fa-cloud-sun"

        };

    }


    /* =====================================================
       NUBLADO
    ===================================================== */

    if (codigo === 3) {

        return {

            nombre: "Nublado",

            detalle:
                "El cielo presenta una cobertura nubosa considerable.",

            icono:
                "fa-solid fa-cloud"

        };

    }


    /* =====================================================
       NIEBLA
    ===================================================== */

    if (
        codigo === 45 ||
        codigo === 48
    ) {

        return {

            nombre: "Niebla",

            detalle:
                "Se presentan condiciones de niebla.",

            icono:
                "fa-solid fa-smog"

        };

    }


    /* =====================================================
       LLOVIZNA
    ===================================================== */

    if (
        codigo >= 51 &&
        codigo <= 57
    ) {

        return {

            nombre: "Llovizna",

            detalle:
                "Se esperan precipitaciones ligeras.",

            icono:
                "fa-solid fa-cloud-rain"

        };

    }


    /* =====================================================
       LLUVIA
    ===================================================== */

    if (
        codigo >= 61 &&
        codigo <= 67
    ) {

        return {

            nombre: "Lluvia",

            detalle:
                "Se presentan condiciones de lluvia.",

            icono:
                "fa-solid fa-cloud-showers-heavy"

        };

    }


    /* =====================================================
       NIEVE
    ===================================================== */

    if (
        codigo >= 71 &&
        codigo <= 77
    ) {

        return {

            nombre: "Nieve",

            detalle:
                "Se presentan condiciones de nieve.",

            icono:
                "fa-solid fa-snowflake"

        };

    }


    /* =====================================================
       CHUBASCOS
    ===================================================== */

    if (
        codigo >= 80 &&
        codigo <= 82
    ) {

        return {

            nombre: "Chubascos",

            detalle:
                "Se esperan chubascos en la zona.",

            icono:
                "fa-solid fa-cloud-showers-heavy"

        };

    }


    /* =====================================================
       TORMENTA ELÉCTRICA
    ===================================================== */

    if (
        codigo === 95 ||
        codigo === 96 ||
        codigo === 99
    ) {

        return {

            nombre: "Tormenta eléctrica",

            detalle:
                "Se presentan condiciones de tormenta eléctrica.",

            icono:
                "fa-solid fa-cloud-bolt"

        };

    }


    /* =====================================================
       CONDICIÓN DESCONOCIDA
    ===================================================== */

    return {

        nombre: "Condición variable",

        detalle:
            "Las condiciones climáticas están cambiando.",

        icono:
            esNoche
                ? "fa-solid fa-cloud-moon"
                : "fa-solid fa-cloud-sun"

    };

}


/* =========================================================
   OBTENER NOMBRE DE UBICACIÓN
========================================================= */

async function obtenerNombreUbicacion(
    latitud,
    longitud
) {

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=jsonv2` +
            `&lat=${latitud}` +
            `&lon=${longitud}` +
            `&zoom=10` +
            `&addressdetails=1`;


        const respuesta =
            await fetch(
                url,
                {
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener ubicación."
            );

        }


        const datos =
            await respuesta.json();


        const direccion =
            datos.address || {};


        const nombre =

            direccion.city ||

            direccion.town ||

            direccion.municipality ||

            direccion.village ||

            direccion.county ||

            "Ubicación detectada";


        const pais =
            direccion.country || "";


        climaElementos.ubicacion.textContent =
            pais
                ? `${nombre}, ${pais}`
                : nombre;


    } catch (error) {

        console.warn(
            "No se pudo obtener el nombre de la ubicación.",
            error
        );


        climaElementos.ubicacion.textContent =
            `${latitud.toFixed(3)}, ${longitud.toFixed(3)}`;

    }

}


/* =========================================================
   ESTADO
========================================================= */

function actualizarEstado(
    mensaje
) {

    climaElementos.estadoConexion.textContent =
        mensaje;


    climaElementos.statusDot.classList.remove(
        "offline"
    );


    climaElementos.statusDot.classList.add(
        "online"
    );

}


/* =========================================================
   ERROR
========================================================= */

function mostrarError(
    mensaje
) {

    climaElementos.estadoConexion.textContent =
        mensaje;


    climaElementos.statusDot.classList.remove(
        "online"
    );


    climaElementos.statusDot.classList.add(
        "offline"
    );


    climaElementos.ubicacion.textContent =
        "No disponible";

}