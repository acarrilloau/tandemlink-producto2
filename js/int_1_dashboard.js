/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini 
   - Prompt: "Adapta dashboard.js para cargar y filtrar los intercambios desde IndexedDB mediante las funciones asíncronas de almacenaje.js."
   ========================================================================== */

// Importamos los datos de usuarios estáticos y las funciones asíncronas de almacenamiento.
import { usuarios } from "./datos.js";
import { inicializarAlmacenamiento, obtenerIntercambios } from "./almacenaje.js";

// Buscamos el contenedor donde aparecerán las tarjetas.
const contenedor = document.getElementById("contenedorIntercambios");

// Buscamos el selector de tipo de intercambio.
const filtroTipo = document.getElementById("filtroTipo");

// Buscamos el selector para ordenar por fecha.
const ordenFecha = document.getElementById("ordenFecha");

// CAMBIO: La función pasa a ser async para recuperar los intercambios de forma asíncrona desde IndexedDB.
async function mostrarIntercambios() {
    try {
        // Obtenemos todos los intercambios de la base de datos IndexedDB
        const intercambios = await obtenerIntercambios();

        // Limpiamos el contenedor antes de mostrar los datos.
        contenedor.innerHTML = "";

        // Filtramos y ordenamos los intercambios obtenidos de la base de datos.
        intercambios
            .filter(function (intercambio) {
                return filtroTipo.value === "todos" ||
                       intercambio.tipo === filtroTipo.value;
            })
            .slice()
            .sort(function (a, b) {
            const fechaA = a.fechaCreacion || a.fecha || "";
            const fechaB = b.fechaCreacion || b.fecha || "";

            // Comprobamos explícitamente si el selector pide los más antiguos
            if (ordenFecha.value === "antiguos" || ordenFecha.value === "mas-antiguos") {
                return fechaA.localeCompare(fechaB); // De más antiguo a más nuevo
            } else {
                return fechaB.localeCompare(fechaA); // De más nuevo a más antiguo (recientes)
            }
        })
            .forEach(function (intercambio) {

                // Buscamos al usuario que ha publicado el intercambio.
                const usuario = usuarios.find(function (u) {
                    return u.id === intercambio.usuarioId;
                });

                // Comprobamos si es una oferta o una petición.
                const esOferta = intercambio.tipo === "oferta";
                const color = esOferta ? "success" : "warning";
                const tipoTexto = esOferta ? "Oferta" : "Petición";

                // Creamos el elemento que contendrá la tarjeta.
                const tarjeta = document.createElement("div");
                tarjeta.className = "col-12 col-md-6 col-lg-4";

                // Creamos el contenido de la tarjeta.
                tarjeta.innerHTML = `
                    <article class="card h-100 border-${color} shadow-sm">
                        <div class="card-body">
                            <span class="badge text-bg-${color} mb-3">
                                ${tipoTexto}
                            </span>

                            <h3 class="card-title h5">
                                ${intercambio.idiomaOfrecido} por
                                ${intercambio.idiomaBuscado}
                            </h3>

                            <p class="card-text">
                                ${intercambio.descripcion}
                            </p>

                            <p class="small mb-2">
                                <strong>Modalidad:</strong>
                                ${intercambio.modalidad}
                            </p>

                            <p class="small mb-2">
                                <strong>Fecha de publicación:</strong>
                                ${new Date(intercambio.fechaCreacion + "T00:00:00").toLocaleDateString("es-ES")}
                            </p>

                            <p class="small mb-0">
                                <strong>Usuario:</strong>
                                ${usuario ? usuario.nombre : "Usuario desconocido"}
                            </p>
                        </div>
                    </article>
                `;

                // Añadimos la tarjeta al contenedor del dashboard.
                contenedor.appendChild(tarjeta);
            });
    } catch (error) {
        console.error("Error al cargar los intercambios en el dashboard:", error);
    }
}

// CAMBIO: Inicializamos el almacenamiento y cargamos la vista de forma asíncrona al arrancar la página.
async function iniciarPagina() {
    try {
        await inicializarAlmacenamiento();
        await mostrarIntercambios();
    } catch (error) {
        console.error("Error al inicializar la página del dashboard:", error);
    }
}

iniciarPagina();

// Actualizamos las tarjetas cuando cambia el filtro.
filtroTipo.addEventListener("change", mostrarIntercambios);

// Actualizamos las tarjetas cuando cambia el orden por fecha.
ordenFecha.addEventListener("change", mostrarIntercambios);