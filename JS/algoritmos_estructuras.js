/*
 * HarvestX - estructuras y algoritmos usados por los módulos reales y pruebas.
 * Los módulos fincas, cultivos, labores y riego consumen algunas de estas funciones.
 * Dijkstra permanece como herramienta demostrativa hasta que existan distancias reales
 * entre ubicaciones; no se inventan rutas geográficas.
 */
(function () {
    "use strict";

    // 1) LISTA ENLAZADA: cada nodo apunta al siguiente.
    class NodoListaHX {
        constructor(valor) { this.valor = valor; this.siguiente = null; }
    }
    class ListaEnlazadaHX {
        constructor() { this.cabeza = null; this.tamano = 0; }
        agregar(valor) {
            const nodo = new NodoListaHX(valor);
            if (!this.cabeza) this.cabeza = nodo;
            else {
                let actual = this.cabeza;
                while (actual.siguiente) actual = actual.siguiente;
                actual.siguiente = nodo;
            }
            this.tamano++;
        }
        aArreglo() {
            const resultado = [];
            let actual = this.cabeza;
            while (actual) { resultado.push(actual.valor); actual = actual.siguiente; }
            return resultado;
        }
    }

    // 2) PILA LIFO: el último elemento agregado es el primero que sale.
    class PilaHX {
        constructor() { this.items = []; }
        apilar(valor) { this.items.push(valor); }
        desapilar() { return this.items.pop(); }
        estaVacia() { return this.items.length === 0; }
    }

    // 3) COLA FIFO: procesa primero el elemento que llegó primero.
    class ColaHX {
        constructor() { this.items = []; this.inicio = 0; }
        encolar(valor) { this.items.push(valor); }
        desencolar() {
            if (this.inicio >= this.items.length) return undefined;
            const valor = this.items[this.inicio++];
            if (this.inicio > 50 && this.inicio * 2 >= this.items.length) {
                this.items = this.items.slice(this.inicio); this.inicio = 0;
            }
            return valor;
        }
        estaVacia() { return this.inicio >= this.items.length; }
    }

    // 4) ÁRBOL BINARIO DE BÚSQUEDA para IDs numéricos únicos.
    class NodoArbolHX {
        constructor(id) { this.id = id; this.izquierdo = null; this.derecho = null; }
    }
    class ArbolBusquedaHX {
        constructor() { this.raiz = null; }
        insertar(id) {
            const nuevo = new NodoArbolHX(id);
            if (!this.raiz) { this.raiz = nuevo; return; }
            let actual = this.raiz;
            while (true) {
                if (id === actual.id) return;
                const lado = id < actual.id ? "izquierdo" : "derecho";
                if (!actual[lado]) { actual[lado] = nuevo; return; }
                actual = actual[lado];
            }
        }
        buscar(id) {
            let actual = this.raiz;
            while (actual) {
                if (actual.id === id) return true;
                actual = id < actual.id ? actual.izquierdo : actual.derecho;
            }
            return false;
        }
    }

    // 5) TABLA HASH: Map almacena clave -> registro (usa implementación nativa JS).
    function crearIndiceFincas(fincas) {
        const indice = new Map();
        for (const finca of fincas) indice.set(finca.id, finca);
        return indice;
    }

    // ALGORITMO DE BÚSQUEDA 1: búsqueda lineal O(n) tiempo, O(1) espacio extra.
    function busquedaLineal(lista, objetivo, clave = x => x) {
        for (let i = 0; i < lista.length; i++) {
            if (clave(lista[i]) === objetivo) return i;
        }
        return -1;
    }

    // ALGORITMO DE BÚSQUEDA 2: búsqueda binaria O(log n) tiempo, O(1) espacio.
    // Requiere que la lista esté ordenada de menor a mayor según la clave.
    function busquedaBinaria(listaOrdenada, objetivo, clave = x => x) {
        let izquierda = 0, derecha = listaOrdenada.length - 1;
        while (izquierda <= derecha) {
            const medio = Math.floor((izquierda + derecha) / 2);
            const valor = clave(listaOrdenada[medio]);
            if (valor === objetivo) return medio;
            if (valor < objetivo) izquierda = medio + 1;
            else derecha = medio - 1;
        }
        return -1;
    }

    // ALGORITMO DE ORDENAMIENTO 1: burbuja O(n²) tiempo, O(n) por la copia.
    function ordenarBurbuja(datos, comparar = (a, b) => a - b) {
        const arr = datos.slice();
        for (let i = 0; i < arr.length - 1; i++) {
            let huboCambio = false;
            for (let j = 0; j < arr.length - 1 - i; j++) {
                if (comparar(arr[j], arr[j + 1]) > 0) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    huboCambio = true;
                }
            }
            if (!huboCambio) break;
        }
        return arr;
    }

    // ALGORITMO DE ORDENAMIENTO 2: inserción O(n²) peor caso, O(n) por la copia.
    function ordenarInsercion(datos, comparar = (a, b) => a - b) {
        const arr = datos.slice();
        for (let i = 1; i < arr.length; i++) {
            const actual = arr[i];
            let j = i - 1;
            while (j >= 0 && comparar(arr[j], actual) > 0) { arr[j + 1] = arr[j]; j--; }
            arr[j + 1] = actual;
        }
        return arr;
    }

    // 6) GRAFO ponderado no dirigido, representado con lista de adyacencia.
    // ALGORITMO DE GRAFOS: Dijkstra. Para pesos no negativos.
    function dijkstra(grafo, inicio, destino) {
        const distancias = {}, anteriores = {}, pendientes = new Set(Object.keys(grafo));
        for (const nodo of pendientes) distancias[nodo] = Infinity;
        if (!(inicio in grafo) || !(destino in grafo)) return { distancia: Infinity, ruta: [] };
        distancias[inicio] = 0;
        while (pendientes.size) {
            let actual = null;
            for (const nodo of pendientes) {
                if (actual === null || distancias[nodo] < distancias[actual]) actual = nodo;
            }
            if (actual === null || distancias[actual] === Infinity) break;
            pendientes.delete(actual);
            if (actual === destino) break;
            for (const [vecino, peso] of Object.entries(grafo[actual] || {})) {
                if (peso < 0) throw new Error("Dijkstra requiere pesos no negativos.");
                if (!pendientes.has(vecino)) continue;
                const nueva = distancias[actual] + peso;
                if (nueva < (distancias[vecino] ?? Infinity)) {
                    distancias[vecino] = nueva; anteriores[vecino] = actual;
                }
            }
        }
        if (distancias[destino] === Infinity) return { distancia: Infinity, ruta: [] };
        const ruta = [];
        for (let nodo = destino; nodo !== undefined; nodo = anteriores[nodo]) ruta.unshift(nodo);
        return { distancia: distancias[destino], ruta };
    }

    // 7) OPTIMIZACIÓN VORAZ ilustrativa: prioriza mayor urgencia por litro.
    // Ordena por prioridad/agua y elige tareas que quepan en el presupuesto de agua.
    // Es una heurística voraz, no garantiza el óptimo global para todos los casos.
    function planificarRiegoVoraz(tareas, litrosDisponibles) {
        if (!Number.isFinite(litrosDisponibles) || litrosDisponibles < 0) {
            throw new Error("Los litros disponibles deben ser un número no negativo.");
        }
        const candidatas = tareas
            .filter(t => Number.isFinite(t.litros) && t.litros > 0 && Number.isFinite(t.prioridad) && t.prioridad >= 0)
            .map(t => ({ ...t, razon: t.prioridad / t.litros }))
            .sort((a, b) => b.razon - a.razon);
        const seleccionadas = [];
        let usados = 0;
        for (const tarea of candidatas) {
            if (usados + tarea.litros <= litrosDisponibles) {
                seleccionadas.push(tarea); usados += tarea.litros;
            }
        }
        return { seleccionadas, litrosUsados: usados, litrosRestantes: litrosDisponibles - usados };
    }

    // Ejemplos autocontenidos para verificar cada estructura/algoritmo sin tocar la app.
    function ejecutarDemostracion() {
        const resultados = {};
        const lista = new ListaEnlazadaHX(); lista.agregar("Preparar terreno"); lista.agregar("Sembrar");
        resultados.listaEnlazada = lista.aArreglo();
        const pila = new PilaHX(); pila.apilar("Registrar finca"); pila.apilar("Programar riego");
        resultados.pila = pila.desapilar();
        const cola = new ColaHX(); cola.encolar("Preparar terreno"); cola.encolar("Sembrar");
        resultados.cola = cola.desencolar();
        const arbol = new ArbolBusquedaHX(); [20, 10, 30, 5].forEach(x => arbol.insertar(x));
        resultados.arbolEncuentra10 = arbol.buscar(10);
        resultados.tablaHashFinca2 = crearIndiceFincas([{id: 1, nombre: "El Roble"}, {id: 2, nombre: "Las Flores"}]).get(2);
        resultados.busquedaLineal = busquedaLineal([4, 8, 12], 8);
        resultados.busquedaBinaria = busquedaBinaria([4, 8, 12, 16], 12);
        resultados.burbuja = ordenarBurbuja([5, 2, 4, 1]);
        resultados.insercion = ordenarInsercion([5, 2, 4, 1]);
        resultados.dijkstra = dijkstra({Bodega: {FincaA: 4, FincaB: 7}, FincaA: {Bodega: 4, FincaB: 2}, FincaB: {Bodega: 7, FincaA: 2}}, "Bodega", "FincaB");
        resultados.optimizacionVoraz = planificarRiegoVoraz([{nombre: "Tomate", litros: 20, prioridad: 8}, {nombre: "Maíz", litros: 15, prioridad: 5}], 25);
        return resultados;
    }

    window.HarvestXAlgoritmos = {
        ListaEnlazadaHX, PilaHX, ColaHX, ArbolBusquedaHX, crearIndiceFincas,
        busquedaLineal, busquedaBinaria, ordenarBurbuja, ordenarInsercion,
        dijkstra, planificarRiegoVoraz, ejecutarDemostracion
    };
})();
