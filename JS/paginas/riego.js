/* ============================================================
   HARVESTX — PROGRAMACIÓN DE RIEGO
   Versión 5.0 — Flask, MySQL y clima automático

   FUNCIONES:
   - Identificación del usuario.
   - Carga de cultivos y fincas.
   - Registro de programaciones en MySQL.
   - Calendario interactivo.
   - Listado de riegos pendientes.
   - Completar, cancelar y eliminar programaciones.
   - Consulta del historial.
   - Resumen y estimación de agua.
   - Selector de modo manual y automático.
   - Notificaciones de HarvestX.
   - Temperatura y clima mediante Open-Meteo.
   - Recomendaciones según cultivo y condiciones climáticas.

   IMPORTANTE:
   - No controla bombas ni dispositivos físicos.
   - No mide humedad del suelo.
   - La humedad atmosférica no equivale a humedad del suelo.
   - Los litros son estimaciones.
   ============================================================ */

(() => {
    "use strict";

    // ========================================================
    // CONFIGURACIÓN
    // ========================================================

    const API = "http://127.0.0.1:5000";

    const OPEN_METEO_GEOCODING =
        "https://geocoding-api.open-meteo.com/v1/search";

    const OPEN_METEO_WEATHER =
        "https://api.open-meteo.com/v1/forecast";

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const estado = {
        usuarioId: null,

        cultivos: [],
        fincas: [],
        programaciones: [],
        historial: [],

        clima: null,

        mesActual: new Date().getMonth(),
        anioActual: new Date().getFullYear(),

        modoAutomatico: false,
        cargando: false,

        fechaFiltro: null,

        operacionesEnCurso: new Set()
    };

    const nombresMeses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    // ========================================================
    // INICIALIZACIÓN
    // ========================================================

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciar,
            { once: true }
        );
    } else {
        iniciar();
    }

    async function iniciar() {
        estado.usuarioId = obtenerUsuarioId();

        configurarFechaMinima();
        configurarEventos();
        configurarControlesCalendario();
        actualizarInterfazModo();

        if (!estado.usuarioId) {
            mostrarMensaje(
                "No se pudo identificar tu usuario. Inicia sesión nuevamente.",
                "error"
            );

            mostrarEstadoVacio(
                "No se pudo identificar la cuenta."
            );

            bloquearFormulario(true);
            return;
        }

        await cargarTodo();
    }

    // ========================================================
    // IDENTIFICACIÓN DEL USUARIO
    // ========================================================

    function obtenerUsuarioId() {
        const posiblesClaves = [
            "usuarioHarvestX",
            "usuario",
            "usuarioActual"
        ];

        for (const clave of posiblesClaves) {
            try {
                const valor = localStorage.getItem(clave);

                if (!valor) continue;

                let usuario;

                try {
                    usuario = JSON.parse(valor);
                } catch {
                    usuario = valor;
                }

                if (
                    usuario &&
                    typeof usuario === "object"
                ) {
                    const id = Number(
                        usuario.id ??
                        usuario.usuario_id ??
                        usuario.usuarioId
                    );

                    if (
                        Number.isInteger(id) &&
                        id > 0
                    ) {
                        return id;
                    }
                }

                if (
                    typeof usuario === "string" &&
                    /^\d+$/.test(usuario)
                ) {
                    const id = Number(usuario);

                    if (id > 0) return id;
                }

            } catch (error) {
                console.warn(
                    `No se pudo leer ${clave}.`,
                    error
                );
            }
        }

        return null;
    }

    // ========================================================
    // COMUNICACIÓN CON FLASK
    // ========================================================

    async function peticion(ruta, opciones = {}) {
        const configuracion = {
            ...opciones,

            headers: {
                ...(opciones.body
                    ? {
                        "Content-Type": "application/json"
                    }
                    : {}),

                ...(opciones.headers || {})
            }
        };

        let respuesta;

        try {
            respuesta = await fetch(
                `${API}${ruta}`,
                configuracion
            );

        } catch (error) {
            throw new Error(
                "No se pudo conectar con HarvestX. " +
                "Comprueba que Flask esté ejecutándose."
            );
        }

        let datos;

        try {
            datos = await respuesta.json();

        } catch {
            throw new Error(
                `El servidor respondió con un formato inesperado (${respuesta.status}).`
            );
        }

        if (
            !respuesta.ok ||
            datos?.exito === false
        ) {
            throw new Error(
                datos?.mensaje ||
                datos?.error ||
                `La solicitud falló (${respuesta.status}).`
            );
        }

        return datos;
    }

    // ========================================================
    // CARGA GENERAL
    // ========================================================

    async function cargarTodo() {
        if (estado.cargando) return;

        estado.cargando = true;
        bloquearFormulario(true);

        try {
            await cargarCultivos();
            await cargarProgramaciones();

            try {
                await cargarHistorial();

            } catch (error) {
                console.error(
                    "Error al cargar historial:",
                    error
                );

                mostrarMensaje(
                    "Las programaciones se cargaron, pero no se pudo actualizar el historial.",
                    "error"
                );
            }

            renderizarCalendario();

            renderizarProgramaciones(
                estado.fechaFiltro
            );

            renderizarHistorial();
            actualizarResumen();

            await cargarClima();

            actualizarRecomendacion();
            actualizarEstadoRiego();

        } catch (error) {
            console.error(
                "Error al cargar Programación de Riego:",
                error
            );

            mostrarMensaje(
                error.message,
                "error"
            );

        } finally {
            estado.cargando = false;
            bloquearFormulario(false);
        }
    }

    // ========================================================
    // CULTIVOS
    // ========================================================

    async function cargarCultivos() {
        const datos = await peticion(
            `/cultivos?usuario_id=${encodeURIComponent(
                estado.usuarioId
            )}`
        );

        estado.cultivos = Array.isArray(datos)
            ? datos
            : Array.isArray(datos.cultivos)
                ? datos.cultivos
                : [];

        const selector = $("#riegoCultivo");

        if (!selector) return;

        const seleccionado = selector.value;

        selector.replaceChildren();

        const opcionInicial =
            document.createElement("option");

        opcionInicial.value = "";

        opcionInicial.textContent =
            estado.cultivos.length
                ? "Selecciona un cultivo"
                : "No tienes cultivos registrados";

        selector.appendChild(opcionInicial);

        estado.cultivos.forEach(cultivo => {
            const opcion =
                document.createElement("option");

            opcion.value = String(cultivo.id);

            opcion.textContent =
                cultivo.nombre || "Cultivo sin nombre";

            selector.appendChild(opcion);
        });

        if (
            seleccionado &&
            estado.cultivos.some(
                cultivo =>
                    String(cultivo.id) === seleccionado
            )
        ) {
            selector.value = seleccionado;
        }

        selector.disabled =
            estado.cultivos.length === 0;
    }

    // ========================================================
    // FINCAS
    // ========================================================

    async function cargarFincas() {
        try {
            const datos = await peticion(
                `/fincas?usuario_id=${encodeURIComponent(
                    estado.usuarioId
                )}`
            );

            estado.fincas = Array.isArray(datos)
                ? datos
                : Array.isArray(datos.fincas)
                    ? datos.fincas
                    : [];

            return estado.fincas;

        } catch (error) {
            console.warn(
                "No se pudieron consultar las fincas:",
                error
            );

            estado.fincas = [];

            return [];
        }
    }

    function obtenerFincaParaClima() {
        if (!estado.fincas.length) return null;

        // Primero buscamos una finca vinculada
        // a alguno de los cultivos del usuario.

        for (const cultivo of estado.cultivos) {
            if (!cultivo.finca_id) continue;

            const finca = estado.fincas.find(
                item =>
                    Number(item.id) ===
                    Number(cultivo.finca_id)
            );

            if (
                finca &&
                finca.ubicacion &&
                String(finca.ubicacion).trim()
            ) {
                return finca;
            }
        }

        // Si no existe una finca vinculada,
        // utilizamos la primera con ubicación registrada.

        return estado.fincas.find(
            finca =>
                finca.ubicacion &&
                String(finca.ubicacion).trim()
        ) || null;
    }

    // ========================================================
    // CLIMA AUTOMÁTICO — OPEN-METEO
    // ========================================================

    async function cargarClima() {
        const finca = await obtenerFincaParaClimaAsync();

        if (!finca) {
            estado.clima = null;

            actualizarTextoSeguro(
                "#temperaturaValor",
                "-- °C"
            );

            actualizarTextoSeguro(
                "#climaValor",
                "Sin ubicación"
            );

            return;
        }

        try {
            const coordenadas =
                await obtenerCoordenadas(
                    finca.ubicacion
                );

            if (!coordenadas) {
                throw new Error(
                    "No fue posible localizar la finca."
                );
            }

            const clima =
                await obtenerDatosMeteorologicos(
                    coordenadas
                );

            estado.clima = {
                ...clima,
                finca: finca.nombre || "Finca"
            };

            actualizarIndicadoresClimaticos(
                estado.clima
            );

        } catch (error) {
            console.error(
                "Error al consultar el clima:",
                error
            );

            estado.clima = null;

            actualizarTextoSeguro(
                "#temperaturaValor",
                "-- °C"
            );

            actualizarTextoSeguro(
                "#climaValor",
                "No disponible"
            );
        }
    }

    async function obtenerFincaParaClimaAsync() {
        await cargarFincas();

        return obtenerFincaParaClima();
    }

    async function obtenerCoordenadas(ubicacion) {
        const consulta = String(
            ubicacion || ""
        ).trim();

        if (!consulta) return null;

        const parametros = new URLSearchParams({
            name: consulta,
            count: "1",
            language: "es",
            format: "json"
        });

        const respuesta = await fetch(
            `${OPEN_METEO_GEOCODING}?${parametros}`
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo consultar la ubicación."
            );
        }

        const datos = await respuesta.json();

        const resultado = datos.results?.[0];

        if (!resultado) return null;

        return {
            latitud: resultado.latitude,
            longitud: resultado.longitude,
            nombre: resultado.name,
            pais: resultado.country
        };
    }

    async function obtenerDatosMeteorologicos(
        coordenadas
    ) {
        const parametros = new URLSearchParams({
            latitude: coordenadas.latitud,
            longitude: coordenadas.longitud,

            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation",
                "rain",
                "showers",
                "weather_code",
                "wind_speed_10m"
            ].join(","),

            daily: "precipitation_probability_max",

            timezone: "auto",
            forecast_days: "1"
        });

        const respuesta = await fetch(
            `${OPEN_METEO_WEATHER}?${parametros}`
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener el pronóstico meteorológico."
            );
        }

        const datos = await respuesta.json();

        if (!datos.current) {
            throw new Error(
                "La respuesta meteorológica está incompleta."
            );
        }

        return {
            temperatura: Number(
                datos.current.temperature_2m
            ),

            humedadAtmosferica: Number(
                datos.current.relative_humidity_2m
            ),

            precipitacion: Number(
                datos.current.precipitation
            ),

            lluvia: Number(
                datos.current.rain
            ),

            lluviaProbabilidad: Number(
                datos.daily
                    ?.precipitation_probability_max?.[0] ?? 0
            ),

            codigoClima: Number(
                datos.current.weather_code
            ),

            viento: Number(
                datos.current.wind_speed_10m
            ),

            ubicacion: coordenadas.nombre,
            pais: coordenadas.pais
        };
    }

    // ========================================================
    // INTERPRETACIÓN DEL CLIMA
    // ========================================================

    function interpretarClima(codigo) {
        const codigos = {
            0: "Despejado",
            1: "Mayormente despejado",
            2: "Parcialmente nublado",
            3: "Nublado",

            45: "Niebla",
            48: "Niebla",

            51: "Llovizna ligera",
            53: "Llovizna",
            55: "Llovizna intensa",

            56: "Llovizna helada",
            57: "Llovizna helada",

            61: "Lluvia ligera",
            63: "Lluvia moderada",
            65: "Lluvia intensa",

            66: "Lluvia helada",
            67: "Lluvia helada",

            71: "Nieve ligera",
            73: "Nieve moderada",
            75: "Nieve intensa",

            77: "Granizo pequeño",

            80: "Chubascos ligeros",
            81: "Chubascos moderados",
            82: "Chubascos intensos",

            85: "Nieve ligera",
            86: "Nieve intensa",

            95: "Tormenta eléctrica",
            96: "Tormenta con granizo",
            99: "Tormenta intensa"
        };

        return codigos[codigo] ||
            "Condición no identificada";
    }

    function actualizarIndicadoresClimaticos(clima) {
        if (Number.isFinite(clima.temperatura)) {
            actualizarTextoSeguro(
                "#temperaturaValor",
                `${clima.temperatura.toFixed(1)} °C`
            );
        }

        actualizarTextoSeguro(
            "#climaValor",
            interpretarClima(clima.codigoClima)
        );

        // No modificamos humedadValor.
        // Ese campo representa humedad del suelo
        // y no contamos con un sensor físico.
    }

    // ========================================================
    // RECOMENDACIÓN INTELIGENTE
    // ========================================================

    function actualizarRecomendacion() {
        const texto = $("#recomendacionTexto");
        const cultivoTexto = $("#recCultivo");

        if (!texto) return;

        const selector = $("#riegoCultivo");

        let cultivo = null;

        if (selector?.value) {
            cultivo = estado.cultivos.find(
                item =>
                    Number(item.id) ===
                    Number(selector.value)
            );
        }

        if (!cultivo) {
            cultivo = estado.cultivos.find(
                item =>
                    item.finca_id &&
                    estado.fincas.some(
                        finca =>
                            Number(finca.id) ===
                            Number(item.finca_id)
                    )
            ) || estado.cultivos[0];
        }

        if (!cultivo) {
            if (cultivoTexto) {
                cultivoTexto.textContent =
                    "Sin cultivo seleccionado";
            }

            texto.textContent =
                "Registra un cultivo para recibir recomendaciones de riego.";

            return;
        }

        if (cultivoTexto) {
            cultivoTexto.textContent =
                cultivo.nombre || "Cultivo";
        }

        const necesidad = String(
            cultivo.agua || ""
        ).toLowerCase();

        const clima = estado.clima;

        let recomendacion =
            "Mantén un seguimiento de las necesidades de agua del cultivo y revisa las condiciones de tu finca.";

        if (!clima) {
            recomendacion =
                "No hay información meteorológica disponible para la finca. " +
                "Consulta la humedad del suelo directamente antes de decidir el riego.";

            colocarTextoRecomendacion(
                recomendacion
            );

            return;
        }

        const temperatura = clima.temperatura;
        const probabilidad = clima.lluviaProbabilidad;
        const precipitacion = clima.precipitacion;
        const codigo = clima.codigoClima;

        const hayLluvia =
            precipitacion > 0 ||
            clima.lluvia > 0 ||
            probabilidad >= 70 ||
            [
                51, 53, 55,
                61, 63, 65,
                80, 81, 82,
                95, 96, 99
            ].includes(codigo);

        if (hayLluvia) {
            recomendacion =
                `Se detectan condiciones de lluvia en ${clima.ubicacion}. ` +
                `La probabilidad máxima de precipitación es del ${probabilidad}%. ` +
                "Revisa el suelo antes de realizar un nuevo riego para evitar exceso de agua.";

        } else if (temperatura >= 32) {
            recomendacion =
                `La temperatura actual es de ${temperatura.toFixed(1)} °C en ${clima.ubicacion}. ` +
                "Vigila la pérdida de humedad del suelo y considera programar el riego en horas de menor temperatura.";

        } else if (necesidad.includes("alta")) {
            recomendacion =
                "Este cultivo tiene una necesidad de agua alta. " +
                "Revisa regularmente la humedad real del suelo y mantén una programación de riego adecuada.";

        } else if (necesidad.includes("baja")) {
            recomendacion =
                "Este cultivo tiene una necesidad de agua baja. " +
                "Evita riegos excesivos y comprueba las condiciones del suelo antes de programar otro.";

        } else if (necesidad.includes("media")) {
            recomendacion =
                "Este cultivo tiene una necesidad de agua moderada. " +
                "Mantén una programación equilibrada y revisa la humedad del suelo.";

        } else {
            recomendacion =
                "Consulta las necesidades hídricas de este cultivo y revisa las condiciones del suelo antes de programar el riego.";
        }

        colocarTextoRecomendacion(
            recomendacion
        );
    }

    function colocarTextoRecomendacion(mensaje) {
        const contenedor = $("#recomendacionTexto");
        const cultivoTexto = $("#recCultivo");

        if (!contenedor) return;

        // Conservamos el elemento <strong id="recCultivo">
        // del HTML y reemplazamos solamente el texto restante.

        if (cultivoTexto && cultivoTexto.parentElement === contenedor) {
            const nodos = [...contenedor.childNodes];

            nodos.forEach(nodo => {
                if (nodo !== cultivoTexto) {
                    nodo.remove();
                }
            });

            contenedor.appendChild(
                document.createTextNode(" " + mensaje)
            );

        } else {
            contenedor.textContent = mensaje;
        }
    }

    // ========================================================
    // ESTADO DEL RIEGO
    // ========================================================

    function actualizarEstadoRiego() {
        const indicador = $("#estadoUltimaAccion");

        if (!indicador) return;

        const pendientes =
            estado.programaciones.filter(
                item => item.estado === "Programado"
            );

        pendientes.sort((a, b) => {
            const fechaA =
                `${a.fecha || ""} ${a.hora || ""}`;

            const fechaB =
                `${b.fecha || ""} ${b.hora || ""}`;

            return fechaA.localeCompare(fechaB);
        });

        if (!pendientes.length) {
            indicador.textContent =
                "Sin programaciones pendientes.";

            return;
        }

        const proximo = pendientes[0];

        indicador.textContent =
            `Próximo riego: ${formatearFecha(proximo.fecha)} · ` +
            `${String(proximo.hora || "").slice(0, 5)}. ` +
            "Estado basado en MySQL.";
    }

    // ========================================================
    // CARGAR PROGRAMACIONES
    // ========================================================

    async function cargarProgramaciones() {
        const datos = await peticion(
            `/api/riego?usuario_id=${encodeURIComponent(
                estado.usuarioId
            )}`
        );

        estado.programaciones = Array.isArray(datos)
            ? datos
            : Array.isArray(datos.programaciones)
                ? datos.programaciones
                : [];
    }

    // ========================================================
    // CREAR PROGRAMACIÓN
    // ========================================================

    async function guardarProgramacion(evento) {
        evento.preventDefault();

        if (estado.cargando) return;

        if (!estado.usuarioId) {
            mostrarMensaje(
                "No se identificó tu usuario.",
                "error"
            );

            return;
        }

        const formulario = $("#formRiego");

        const selectorCultivo = $("#riegoCultivo");
        const campoFecha = $("#riegoFecha");
        const campoHora = $("#riegoHora");
        const campoDuracion = $("#riegoDuracion");

        if (
            !formulario ||
            !selectorCultivo ||
            !campoFecha ||
            !campoHora ||
            !campoDuracion
        ) {
            mostrarMensaje(
                "Faltan campos del formulario de riego en el HTML.",
                "error"
            );

            return;
        }

        const cultivoId = Number(
            selectorCultivo.value
        );

        const fecha = campoFecha.value;
        const hora = campoHora.value;

        const duracion = Number(
            campoDuracion.value
        );

        if (
            !Number.isInteger(cultivoId) ||
            cultivoId <= 0
        ) {
            mostrarMensaje(
                "Selecciona un cultivo válido.",
                "error"
            );

            return;
        }

        const cultivoExiste =
            estado.cultivos.some(
                cultivo =>
                    Number(cultivo.id) === cultivoId
            );

        if (!cultivoExiste) {
            mostrarMensaje(
                "El cultivo seleccionado ya no está disponible.",
                "error"
            );

            return;
        }

        if (!fecha || !hora) {
            mostrarMensaje(
                "Selecciona una fecha y una hora para el riego.",
                "error"
            );

            return;
        }

        if (fecha < fechaLocal(new Date())) {
            mostrarMensaje(
                "No puedes programar un riego para una fecha pasada.",
                "error"
            );

            return;
        }

        if (
            !Number.isInteger(duracion) ||
            duracion < 1 ||
            duracion > 1440
        ) {
            mostrarMensaje(
                "La duración debe estar entre 1 y 1440 minutos.",
                "error"
            );

            return;
        }

        const litrosEstimados =
            calcularLitrosEstimados(duracion);

        const botonEnviar =
            evento.submitter ||
            formulario.querySelector(
                'button[type="submit"], input[type="submit"]'
            );

        if (botonEnviar) {
            botonEnviar.disabled = true;
        }

        try {
            const resultado = await peticion(
                "/api/riego",
                {
                    method: "POST",

                    body: JSON.stringify({
                        usuario_id: estado.usuarioId,
                        cultivo_id: cultivoId,
                        fecha,
                        hora,
                        duracion,
                        litros_estimados: litrosEstimados,

                        modo: estado.modoAutomatico
                            ? "Automatico"
                            : "Manual"
                    })
                }
            );

            mostrarMensaje(
                resultado.mensaje ||
                "Riego programado correctamente.",
                "exito"
            );

            formulario.reset();

            configurarFechaMinima();

            estado.fechaFiltro = null;

            await cargarTodo();

        } catch (error) {
            console.error(
                "Error al guardar riego:",
                error
            );

            mostrarMensaje(
                error.message,
                "error"
            );

        } finally {
            if (botonEnviar) {
                botonEnviar.disabled = false;
            }
        }
    }

    // ========================================================
    // COMPLETAR O CANCELAR PROGRAMACIÓN
    // ========================================================

    async function actualizarEstado(id, nuevoEstado) {
        const identificador = Number(id);

        if (
            !Number.isInteger(identificador) ||
            identificador <= 0
        ) {
            mostrarMensaje(
                "La programación seleccionada no es válida.",
                "error"
            );

            return;
        }

        if (
            nuevoEstado !== "Completado" &&
            nuevoEstado !== "Cancelado"
        ) {
            mostrarMensaje(
                "El estado solicitado no es válido.",
                "error"
            );

            return;
        }

        const programacion =
            estado.programaciones.find(
                item =>
                    Number(item.id) === identificador
            );

        if (!programacion) {
            mostrarMensaje(
                "No se encontró la programación seleccionada.",
                "error"
            );

            return;
        }

        if (programacion.estado !== "Programado") {
            mostrarMensaje(
                "Esta programación ya no está pendiente.",
                "info"
            );

            return;
        }

        if (
            estado.operacionesEnCurso.has(
                identificador
            )
        ) {
            return;
        }

        const confirmacion = confirm(
            nuevoEstado === "Completado"
                ? "¿Confirmas que el riego se completó?"
                : "¿Quieres cancelar este riego?"
        );

        if (!confirmacion) return;

        estado.operacionesEnCurso.add(
            identificador
        );

        try {
            const resultado = await peticion(
                `/api/riego/${identificador}`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        usuario_id: estado.usuarioId,
                        estado: nuevoEstado
                    })
                }
            );

            mostrarMensaje(
                resultado.mensaje ||
                (
                    nuevoEstado === "Completado"
                        ? "Riego marcado como completado."
                        : "Riego cancelado correctamente."
                ),
                "exito"
            );

            await cargarTodo();

        } catch (error) {
            console.error(
                "Error al actualizar riego:",
                error
            );

            mostrarMensaje(
                error.message,
                "error"
            );

        } finally {
            estado.operacionesEnCurso.delete(
                identificador
            );
        }
    }

    // ========================================================
    // ELIMINAR PROGRAMACIÓN PENDIENTE
    // ========================================================

    async function eliminarProgramacion(id) {
        const identificador = Number(id);

        if (
            !Number.isInteger(identificador) ||
            identificador <= 0
        ) {
            mostrarMensaje(
                "La programación seleccionada no es válida.",
                "error"
            );

            return;
        }

        const programacion =
            estado.programaciones.find(
                item =>
                    Number(item.id) === identificador
            );

        if (
            !programacion ||
            programacion.estado !== "Programado"
        ) {
            mostrarMensaje(
                "Solo puedes eliminar programaciones pendientes.",
                "info"
            );

            return;
        }

        if (
            estado.operacionesEnCurso.has(
                identificador
            )
        ) {
            return;
        }

        if (!confirm(
            "¿Seguro que quieres eliminar esta programación pendiente?"
        )) {
            return;
        }

        estado.operacionesEnCurso.add(
            identificador
        );

        try {
            const resultado = await peticion(
                `/api/riego/${identificador}` +
                `?usuario_id=${encodeURIComponent(
                    estado.usuarioId
                )}`,
                {
                    method: "DELETE"
                }
            );

            mostrarMensaje(
                resultado.mensaje ||
                "Programación eliminada.",
                "exito"
            );

            await cargarTodo();

        } catch (error) {
            console.error(
                "Error al eliminar riego:",
                error
            );

            mostrarMensaje(
                error.message,
                "error"
            );

        } finally {
            estado.operacionesEnCurso.delete(
                identificador
            );
        }
    }

    // ========================================================
    // HISTORIAL
    // ========================================================

    async function cargarHistorial() {
        const datos = await peticion(
            `/api/riego/historial?usuario_id=${encodeURIComponent(
                estado.usuarioId
            )}`
        );

        estado.historial = Array.isArray(datos)
            ? datos
            : Array.isArray(datos.historial)
                ? datos.historial
                : [];
    }

    function renderizarHistorial() {
        let cuerpo = $("#historialRiegoBody");

        if (!cuerpo) {
            const tabla = $(".riego-table");

            if (!tabla) return;

            cuerpo = tabla.querySelector("tbody");

            if (!cuerpo) return;

            cuerpo.id = "historialRiegoBody";
        }

        cuerpo.replaceChildren();

        if (!estado.historial.length) {
            const fila =
                document.createElement("tr");

            const celda =
                document.createElement("td");

            celda.colSpan = 5;

            celda.textContent =
                "Todavía no hay registros en el historial.";

            celda.className = "riego-vacio";

            fila.appendChild(celda);
            cuerpo.appendChild(fila);

            return;
        }

        estado.historial.forEach(registro => {
            const fila =
                document.createElement("tr");

            const fechaRegistro =
                registro.fecha_riego ??
                registro.fecha ??
                registro.fecha_creacion ??
                null;

            const valores = [
                formatearFechaHora(fechaRegistro),

                registro.cultivo_nombre ||
                "Cultivo",

                `${registro.duracion || 0} min`,

                `${Number(
                    registro.agua_utilizada ??
                    registro.litros_estimados ??
                    0
                ).toLocaleString("es-GT")} L`,

                registro.estado || "Sin estado"
            ];

            valores.forEach(valor => {
                const celda =
                    document.createElement("td");

                celda.textContent = String(valor);

                fila.appendChild(celda);
            });

            cuerpo.appendChild(fila);
        });
    }

    // ========================================================
    // CALENDARIO
    // ========================================================

    function configurarControlesCalendario() {
        const calendario = $("#calGrid");

        if (!calendario) return;

        const encabezadoHTML =
            calendario
                .closest(".cal-panel")
                ?.querySelector(".cal-days-title");

        if (encabezadoHTML) {
            encabezadoHTML.style.display = "grid";
        }

        let controles = $(
            ".riego-calendario-controles"
        );

        if (!controles) {
            controles =
                document.createElement("div");

            controles.className =
                "riego-calendario-controles";

            const anterior = crearBoton(
                "‹",
                "Mes anterior",
                () => cambiarMes(-1)
            );

            const titulo =
                document.createElement("h3");

            titulo.id = "riegoMesTitulo";

            titulo.setAttribute(
                "aria-live",
                "polite"
            );

            const siguiente = crearBoton(
                "›",
                "Mes siguiente",
                () => cambiarMes(1)
            );

            controles.append(
                anterior,
                titulo,
                siguiente
            );

            const barra =
                calendario
                    .closest(".cal-panel")
                    ?.querySelector(".cal-header-bar");

            if (barra) {
                barra.insertAdjacentElement(
                    "beforebegin",
                    controles
                );
            } else {
                calendario.insertAdjacentElement(
                    "beforebegin",
                    controles
                );
            }
        }

        actualizarTituloMes();
    }

    function cambiarMes(cantidad) {
        estado.mesActual += cantidad;

        if (estado.mesActual < 0) {
            estado.mesActual = 11;
            estado.anioActual--;

        } else if (estado.mesActual > 11) {
            estado.mesActual = 0;
            estado.anioActual++;
        }

        renderizarCalendario();
    }

    function actualizarTituloMes() {
        const titulo = $("#riegoMesTitulo");

        if (titulo) {
            titulo.textContent =
                `${nombresMeses[estado.mesActual]} ` +
                `${estado.anioActual}`;
        }
    }

    function renderizarCalendario() {
        const grid = $("#calGrid");

        if (!grid) return;

        grid.replaceChildren();

        actualizarTituloMes();

        const primerDia = new Date(
            estado.anioActual,
            estado.mesActual,
            1
        );

        const desplazamiento =
            (primerDia.getDay() + 6) % 7;

        const totalDias = new Date(
            estado.anioActual,
            estado.mesActual + 1,
            0
        ).getDate();

        const hoy = fechaLocal(new Date());

        const campoFecha = $("#riegoFecha");

        const fechaSeleccionada =
            estado.fechaFiltro ||
            campoFecha?.value ||
            null;

        for (
            let i = 0;
            i < desplazamiento;
            i++
        ) {
            const espacio =
                document.createElement("div");

            espacio.className = "cal-dia vacio";

            espacio.setAttribute(
                "aria-hidden",
                "true"
            );

            grid.appendChild(espacio);
        }

        for (
            let dia = 1;
            dia <= totalDias;
            dia++
        ) {
            const fecha = [
                estado.anioActual,
                String(
                    estado.mesActual + 1
                ).padStart(2, "0"),
                String(dia).padStart(2, "0")
            ].join("-");

            const celda =
                document.createElement("button");

            celda.type = "button";
            celda.className = "cal-dia";
            celda.dataset.fecha = fecha;

            const numero =
                document.createElement("span");

            numero.className = "cal-numero";
            numero.textContent = String(dia);

            celda.appendChild(numero);

            if (fecha === hoy) {
                celda.classList.add("hoy");
            }

            if (fecha === fechaSeleccionada) {
                celda.classList.add("seleccionado");
            }

            const delDia =
                estado.programaciones.filter(
                    riego =>
                        String(riego.fecha || "")
                            .slice(0, 10) === fecha &&
                        riego.estado === "Programado"
                );

            if (delDia.length > 0) {
                celda.classList.add("tiene-riego");

                const indicador =
                    document.createElement("span");

                indicador.className =
                    "cal-indicador";

                indicador.textContent =
                    delDia.length > 1
                        ? `${delDia.length} riegos`
                        : "Riego";

                celda.appendChild(indicador);
            }

            const detalles =
                estado.programaciones.filter(
                    riego =>
                        String(riego.fecha || "")
                            .slice(0, 10) === fecha
                );

            celda.title = detalles.length
                ? detalles.map(riego =>
                    `${String(riego.hora || "").slice(0, 5)} · ` +
                    `${riego.cultivo_nombre || "Cultivo"} · ` +
                    `${riego.estado}`
                ).join("\n")
                : `Seleccionar ${dia} de ` +
                    nombresMeses[estado.mesActual];

            celda.setAttribute(
                "aria-label",
                `${dia} de ${nombresMeses[estado.mesActual]}` +
                (
                    detalles.length
                        ? `, ${detalles.length} programaciones`
                        : ""
                )
            );

            celda.addEventListener(
                "click",
                () => {
                    estado.fechaFiltro = fecha;

                    if (campoFecha) {
                        campoFecha.value = fecha;

                        campoFecha.dispatchEvent(
                            new Event(
                                "change",
                                { bubbles: true }
                            )
                        );
                    }

                    renderizarCalendario();

                    renderizarProgramaciones(fecha);
                }
            );

            grid.appendChild(celda);
        }

        const restantes =
            (7 - (grid.children.length % 7)) % 7;

        for (
            let i = 0;
            i < restantes;
            i++
        ) {
            const espacio =
                document.createElement("div");

            espacio.className = "cal-dia vacio";

            espacio.setAttribute(
                "aria-hidden",
                "true"
            );

            grid.appendChild(espacio);
        }
    }

    // ========================================================
    // LISTADO DE PROGRAMACIONES
    // ========================================================

    function renderizarProgramaciones(
        fechaFiltro = estado.fechaFiltro
    ) {
        let contenedor =
            $("#listaProgramacionesRiego");

        if (!contenedor) {
            const grid = $("#calGrid");

            if (!grid || !grid.parentElement) {
                return;
            }

            contenedor =
                document.createElement("div");

            contenedor.id =
                "listaProgramacionesRiego";

            contenedor.className =
                "lista-programaciones-riego";

            grid.insertAdjacentElement(
                "afterend",
                contenedor
            );
        }

        contenedor.replaceChildren();

        let registros = estado.programaciones.filter(
            riego =>
                riego.estado === "Programado"
        );

        if (fechaFiltro) {
            registros = registros.filter(
                riego =>
                    String(riego.fecha || "")
                        .slice(0, 10) === fechaFiltro
            );
        }

        registros.sort((a, b) => {
            const fechaA =
                `${a.fecha || ""} ${a.hora || ""}`;

            const fechaB =
                `${b.fecha || ""} ${b.hora || ""}`;

            return fechaA.localeCompare(fechaB);
        });

        const titulo =
            document.createElement("h3");

        titulo.textContent = fechaFiltro
            ? `Riegos pendientes del ${formatearFecha(fechaFiltro)}`
            : "Programaciones de riego";

        contenedor.appendChild(titulo);

        const buscador = $("#buscarRiego");

        const termino =
            buscador?.value
                .trim()
                .toLocaleLowerCase("es") || "";

        const filtrados = registros.filter(
            riego => {
                const texto = [
                    riego.cultivo_nombre || "",
                    riego.fecha || "",
                    riego.hora || "",
                    riego.duracion || "",
                    riego.estado || ""
                ]
                    .join(" ")
                    .toLocaleLowerCase("es");

                return texto.includes(termino);
            }
        );

        if (!filtrados.length) {
            const vacio =
                document.createElement("p");

            vacio.className = "riego-vacio";

            vacio.textContent = termino
                ? "No hay programaciones que coincidan con la búsqueda."
                : fechaFiltro
                    ? "No hay riegos pendientes para este día."
                    : "Todavía no tienes riegos pendientes.";

            contenedor.appendChild(vacio);

            return;
        }

        filtrados.forEach(riego => {
            const tarjeta =
                document.createElement("article");

            tarjeta.className =
                "riego-programacion";

            tarjeta.dataset.id = riego.id;

            const encabezado =
                document.createElement("div");

            encabezado.className =
                "riego-programacion-info";

            const cultivo =
                document.createElement("h4");

            cultivo.textContent =
                riego.cultivo_nombre || "Cultivo";

            const detalles =
                document.createElement("p");

            detalles.textContent =
                `${formatearFecha(riego.fecha)} · ` +
                `${String(riego.hora || "").slice(0, 5)} · ` +
                `${riego.duracion || 0} min`;

            const agua =
                document.createElement("p");

            const litros =
                Number(riego.litros_estimados);

            agua.textContent =
                Number.isFinite(litros)
                    ? `Agua estimada: ${litros.toLocaleString("es-GT")} L`
                    : "Agua estimada: No disponible";

            const estadoEtiqueta =
                document.createElement("span");

            estadoEtiqueta.className =
                `riego-estado estado-${normalizarClase(riego.estado)}`;

            estadoEtiqueta.textContent =
                riego.estado || "Sin estado";

            encabezado.append(
                cultivo,
                detalles,
                agua,
                estadoEtiqueta
            );

            tarjeta.appendChild(encabezado);

            const acciones =
                document.createElement("div");

            acciones.className =
                "riego-programacion-acciones";

            acciones.appendChild(
                crearBotonAccion(
                    "Completar",
                    () => actualizarEstado(
                        riego.id,
                        "Completado"
                    )
                )
            );

            acciones.appendChild(
                crearBotonAccion(
                    "Cancelar",
                    () => actualizarEstado(
                        riego.id,
                        "Cancelado"
                    )
                )
            );

            acciones.appendChild(
                crearBotonAccion(
                    "Eliminar",
                    () => eliminarProgramacion(
                        riego.id
                    )
                )
            );

            tarjeta.appendChild(acciones);

            contenedor.appendChild(tarjeta);
        });
    }

    function crearBotonAccion(texto, accion) {
        const boton =
            document.createElement("button");

        boton.type = "button";
        boton.textContent = texto;

        boton.addEventListener(
            "click",
            accion
        );

        return boton;
    }

    // ========================================================
    // RESUMEN
    // ========================================================

    function actualizarResumen() {
        const programados =
            estado.programaciones.filter(
                item => item.estado === "Programado"
            );

        const completadosEnProgramaciones =
            estado.programaciones.filter(
                item => item.estado === "Completado"
            );

        const completadosEnHistorial =
            estado.historial.filter(
                item =>
                    normalizarClase(item.estado) ===
                    "completado"
            );

        const completados =
            completadosEnHistorial.length > 0
                ? completadosEnHistorial.length
                : completadosEnProgramaciones.length;

        const litros = programados.reduce(
            (total, item) =>
                total +
                Number(item.litros_estimados || 0),
            0
        );

        actualizarElemento(
            [
                "#totalRiegos",
                "#totalProgramaciones"
            ],
            String(programados.length)
        );

        actualizarElemento(
            ["#riegosCompletados"],
            String(completados)
        );

        actualizarElemento(
            [
                "#aguaEstimada",
                "#litrosEstimados"
            ],
            `${litros.toLocaleString("es-GT")} L`
        );
    }

    function actualizarElemento(
        selectores,
        valor
    ) {
        for (const selector of selectores) {
            const elemento = $(selector);

            if (elemento) {
                elemento.textContent = valor;
                return;
            }
        }
    }

    // ========================================================
    // MODO MANUAL / AUTOMÁTICO
    // ========================================================

    function configurarModoAutomatico() {
        const boton = $("#btnToggleAuto");

        if (!boton) return;

        if (
            boton.dataset.riegoEventoConfigurado === "true"
        ) {
            return;
        }

        boton.dataset.riegoEventoConfigurado = "true";

        boton.addEventListener("click", () => {
            estado.modoAutomatico =
                !estado.modoAutomatico;

            actualizarInterfazModo();

            mostrarMensaje(
                estado.modoAutomatico
                    ? "Modo automático seleccionado para las nuevas programaciones."
                    : "Modo manual seleccionado para las nuevas programaciones.",
                "info"
            );
        });
    }

    function actualizarInterfazModo() {
        const boton = $("#btnToggleAuto");

        const descripcion = $("#autoStatusDesc");

        if (boton) {
            boton.setAttribute(
                "aria-pressed",
                String(estado.modoAutomatico)
            );

            boton.classList.toggle(
                "activo",
                estado.modoAutomatico
            );

            boton.classList.toggle(
                "inactivo",
                !estado.modoAutomatico
            );

            boton.textContent =
                estado.modoAutomatico
                    ? "Desactivar"
                    : "Activar";

            boton.title =
                estado.modoAutomatico
                    ? "Seleccionar modo manual"
                    : "Seleccionar modo automático";
        }

        if (descripcion) {
            descripcion.textContent =
                estado.modoAutomatico
                    ? "Las nuevas programaciones se guardarán con el modo automático. Esto no activa equipos físicos."
                    : "Las nuevas programaciones se guardarán con el modo manual.";
        }
    }

    // ========================================================
    // EVENTOS
    // ========================================================

    function configurarEventos() {
        const formulario = $("#formRiego");

        if (formulario) {
            formulario.addEventListener(
                "submit",
                guardarProgramacion
            );
        }

        configurarModoAutomatico();

        const botonActualizar =
            $("#btnActualizarRiegos");

        if (botonActualizar) {
            botonActualizar.addEventListener(
                "click",
                async () => {
                    estado.fechaFiltro = null;

                    await cargarTodo();
                }
            );
        }

        const campoFecha = $("#riegoFecha");

        if (campoFecha) {
            campoFecha.addEventListener(
                "change",
                () => {
                    estado.fechaFiltro =
                        campoFecha.value || null;

                    renderizarCalendario();

                    renderizarProgramaciones(
                        estado.fechaFiltro
                    );
                }
            );
        }

        const buscador = $("#buscarRiego");

        if (buscador) {
            buscador.addEventListener(
                "input",
                () => {
                    renderizarProgramaciones(
                        estado.fechaFiltro
                    );
                }
            );
        }

        const selectorCultivo = $("#riegoCultivo");

        if (selectorCultivo) {
            selectorCultivo.addEventListener(
                "change",
                actualizarRecomendacion
            );
        }
    }

    // ========================================================
    // FECHAS
    // ========================================================

    function configurarFechaMinima() {
        const campo = $("#riegoFecha");

        if (!campo) return;

        const hoy = fechaLocal(new Date());

        campo.min = hoy;

        if (
            !campo.value ||
            campo.value < hoy
        ) {
            campo.value = hoy;
        }
    }

    function fechaLocal(fecha) {
        const anio = fecha.getFullYear();

        const mes = String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

        const dia = String(
            fecha.getDate()
        ).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    function formatearFecha(valor) {
        if (!valor) {
            return "Fecha no disponible";
        }

        const texto =
            String(valor).slice(0, 10);

        const partes = texto.split("-");

        if (partes.length !== 3) {
            return texto;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    function formatearFechaHora(valor) {
        if (!valor) {
            return "Fecha no disponible";
        }

        const texto =
            String(valor).replace("T", " ");

        return texto.length >= 16
            ? `${formatearFecha(texto)} ${texto.slice(11, 16)}`
            : formatearFecha(texto);
    }

    // ========================================================
    // ESTIMACIÓN DE AGUA
    // ========================================================

    function calcularLitrosEstimados(duracion) {
        // Estimación inicial: 3 litros por minuto.
        // No representa una medición real.

        return Number(
            (duracion * 3).toFixed(2)
        );
    }

    // ========================================================
    // UTILIDADES
    // ========================================================

    function normalizarClase(valor) {
        return String(valor || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9_-]/g, "");
    }

    function crearBoton(
        texto,
        etiqueta,
        accion
    ) {
        const boton =
            document.createElement("button");

        boton.type = "button";
        boton.textContent = texto;
        boton.title = etiqueta;

        boton.setAttribute(
            "aria-label",
            etiqueta
        );

        boton.addEventListener(
            "click",
            accion
        );

        return boton;
    }

    function actualizarTextoSeguro(
        selector,
        valor
    ) {
        const elemento = $(selector);

        if (elemento) {
            elemento.textContent = valor;
        }
    }

    // ========================================================
    // ESTADOS DE LA INTERFAZ
    // ========================================================

    function bloquearFormulario(bloquear) {
        const formulario = $("#formRiego");

        if (!formulario) return;

        const boton = formulario.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (boton) {
            boton.disabled = bloquear;
        }
    }

    function mostrarEstadoVacio(mensaje) {
        const grid = $("#calGrid");

        if (grid) {
            grid.setAttribute(
                "aria-label",
                mensaje
            );
        }

        const contenedor =
            $("#listaProgramacionesRiego");

        if (contenedor) {
            contenedor.replaceChildren();

            const texto =
                document.createElement("p");

            texto.className = "riego-vacio";
            texto.textContent = mensaje;

            contenedor.appendChild(texto);
        }
    }

    // ========================================================
    // NOTIFICACIONES
    // ========================================================

    function mostrarMensaje(
        mensaje,
        tipo = "info"
    ) {
        if (
            typeof window.mostrarNotificacion ===
            "function"
        ) {
            window.mostrarNotificacion(
                mensaje,
                tipo
            );

            return;
        }

        if (
            typeof window.mostrarToast ===
            "function"
        ) {
            window.mostrarToast(
                mensaje,
                tipo
            );

            return;
        }

        let contenedor =
            $("#notificacionesRiego");

        if (!contenedor) {
            contenedor =
                document.createElement("div");

            contenedor.id =
                "notificacionesRiego";

            contenedor.className =
                "notificaciones-riego";

            contenedor.setAttribute(
                "aria-live",
                "polite"
            );

            Object.assign(
                contenedor.style,
                {
                    position: "fixed",
                    right: "20px",
                    bottom: "20px",
                    zIndex: "99999",
                    display: "grid",
                    gap: "8px",
                    maxWidth:
                        "min(420px, calc(100vw - 40px))"
                }
            );

            document.body.appendChild(
                contenedor
            );
        }

        const alerta =
            document.createElement("div");

        alerta.textContent = mensaje;

        alerta.className =
            `notificacion-riego ${normalizarClase(tipo)}`;

        Object.assign(
            alerta.style,
            {
                padding: "12px 16px",
                borderRadius: "10px",

                background:
                    tipo === "error"
                        ? "#8b2424"
                        : tipo === "exito"
                            ? "#1d6b43"
                            : "#244f63",

                color: "#ffffff",

                boxShadow:
                    "0 5px 18px rgba(0,0,0,.2)"
            }
        );

        contenedor.appendChild(alerta);

        window.setTimeout(() => {
            alerta.remove();

            if (!contenedor.childElementCount) {
                contenedor.remove();
            }
        }, 4500);
    }

})();