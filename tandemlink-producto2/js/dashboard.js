/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini
   - Prompt 1: "Importa los arrays de datos y captura los elementos del DOM (contenedor y filtros)."
   - Prompt 2: "Usa .filter() para mostrar solo las ofertas o peticiones seleccionadas."
   - Prompt 3: "Aplica .sort() y .slice() para ordenar las tarjetas por fecha de forma cronológica."
   - Prompt 4: "Añade eventos 'change' a los selectores para actualizar la vista de forma automática."
   ========================================================================== */

// Importamos los datos de usuarios e intercambios.
import { usuarios, intercambios } from "./datos.js";

// Buscamos el contenedor donde aparecerán las tarjetas.
const contenedor = document.getElementById("contenedorIntercambios");

// Buscamos el selector de tipo de intercambio.
const filtroTipo = document.getElementById("filtroTipo");

// Buscamos el selector para ordenar por fecha.
const ordenFecha = document.getElementById("ordenFecha");

// Función para mostrar todos los intercambios.
function mostrarIntercambios() {
    // Limpiamos el contenedor antes de mostrar los datos.
    contenedor.innerHTML = "";

    // Filtramos los intercambios según la opción seleccionada.
    intercambios
    .filter(function (intercambio) {
        return filtroTipo.value === "todos" ||
               intercambio.tipo === filtroTipo.value;
    })
    .slice()
    .sort(function (a, b) {
        if (ordenFecha.value === "recientes") {
            return b.fechaCreacion.localeCompare(a.fechaCreacion);
        }

        return a.fechaCreacion.localeCompare(b.fechaCreacion);
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
}

// Mostramos los intercambios al cargar la página.
mostrarIntercambios();

// Actualizamos las tarjetas cuando cambia el filtro.
filtroTipo.addEventListener("change", mostrarIntercambios);

// Actualizamos las tarjetas cuando cambia el orden por fecha.
ordenFecha.addEventListener("change", mostrarIntercambios);