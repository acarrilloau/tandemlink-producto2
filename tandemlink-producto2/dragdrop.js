/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini / ChatGPT
   - Prompt: "Comenta el módulo de Drag & Drop detalladamente para entender cada parte de la lógica de arrastrar, soltar y persistencia."
   ========================================================================== */

// Importamos las funciones de persistencia asíncrona desde IndexedDB (almacenaje.js)
import { inicializarAlmacenamiento, obtenerIntercambios, guardarIntercambio } from "./almacenaje.js";
// Importamos el array de usuarios para asociar cada tarjeta con su respectivo autor
import { usuarios } from "./datos.js";

// ==========================================================================
// 1. CAPTURA DE ELEMENTOS DEL DOM
// ==========================================================================
const contenedorOrigen = document.getElementById("listaIntercambiosDrag"); // Contenedor donde se listan las tarjetas originales
const zonaDestino = document.getElementById("zonaFavoritos");                // Zona o "dropzone" donde se soltarán las tarjetas
const mensaje = document.getElementById("mensajeDragDrop");                    // Contenedor para mostrar notificaciones al usuario

/**
 * Muestra un mensaje de alerta en la interfaz visual.
 * @param {string} texto - El texto de la notificación.
 * @param {string} tipo - El tipo de alerta de Bootstrap ('success', 'danger', etc.).
 */
function mostrarMensaje(texto, tipo) {
    if (mensaje) {
        mensaje.textContent = texto;
        mensaje.className = `alert alert-${tipo} mt-3`;
    }
}

// ==========================================================================
// 2. RENDERIZADO Y CONFIGURACIÓN DE ELEMENTOS ARRASTRABLES (DRAG)
// ==========================================================================
/**
 * Carga los intercambios desde IndexedDB, crea las tarjetas visuales
 * y les añade los atributos y eventos necesarios para que puedan ser arrastradas.
 */
async function cargarElementosArrastrables() {
    try {
        // Obtenemos todos los intercambios de la base de datos de manera asíncrona
        const intercambios = await obtenerIntercambios();
        if (!contenedorOrigen) return;

        contenedorOrigen.innerHTML = "";

        // Recorremos cada intercambio para construir su representación visual
        intercambios.forEach(function (intercambio) {
            const usuario = usuarios.find(u => u.id === intercambio.usuarioId);
            const nombreUsuario = usuario ? usuario.nombre : "Desconocido";

            const tarjeta = document.createElement("div");
            tarjeta.className = "card mb-3 p-3 shadow-sm border-primary";
            
            // ATRIBUTO CLAVE: Permite que este elemento HTML sea arrastrable por el usuario
            tarjeta.setAttribute("draggable", "true"); 
            tarjeta.dataset.id = intercambio.id; // Guardamos el ID en un atributo de datos para identificarlo después

            tarjeta.innerHTML = `
                <h5 class="card-title">${intercambio.idiomaOfrecido} ⇄ ${intercambio.idiomaBuscado}</h5>
                <p class="card-text mb-1"><strong>Modalidad:</strong> ${intercambio.modalidad}</p>
                <p class="card-text small text-muted mb-0">Publicado por: ${nombreUsuario}</p>
            `;

            // EVENTO 1 (dragstart): Se ejecuta justo cuando el usuario empieza a arrastrar la tarjeta
            tarjeta.addEventListener("dragstart", function (evento) {
                // Guardamos el ID del intercambio utilizando el objeto dataTransfer para transportarlo durante el arrastre
                evento.dataTransfer.setData("text/plain", intercambio.id);
                // Añadimos una clase visual para que la tarjeta se vea semitransparente mientras se arrastra
                tarjeta.classList.add("opacity-50");
            });

            // EVENTO 2 (dragend): Se ejecuta cuando el usuario suelta la tarjeta (independientemente de si acertó en la zona o no)
            tarjeta.addEventListener("dragend", function () {
                // Restauramos la opacidad original de la tarjeta
                tarjeta.classList.remove("opacity-50");
            });

            contenedorOrigen.appendChild(tarjeta);
        });
    } catch (error) {
        console.error("Error al cargar elementos para arrastrar:", error);
    }
}

// ==========================================================================
// 3. CONFIGURACIÓN DE LA ZONA DE DESTINO (DROPZONE)
// ==========================================================================
/**
 * Configura la zona de destino para aceptar elementos arrastrados
 * y gestionar la persistencia del cambio en IndexedDB cuando se sueltan.
 */
function configurarZonaDestino() {
    if (!zonaDestino) return;

    // EVENTO 1 (dragover): Se dispara continuamente mientras un elemento arrastrado se mueve sobre la zona de destino
    zonaDestino.addEventListener("dragover", function (evento) {
        evento.preventDefault(); // OBLIGATORIO: Por defecto los navegadores bloquean el evento 'drop', hay que prevenirlo para permitir soltar.
        zonaDestino.classList.add("bg-light-subtle", "border-success"); // Efecto visual al pasar por encima
    });

    // EVENTO 2 (dragleave): Se dispara cuando el elemento arrastrado sale de la zona de destino sin ser soltado
    zonaDestino.addEventListener("dragleave", function () {
        zonaDestino.classList.remove("bg-light-subtle", "border-success"); // Quitamos el efecto visual
    });

    // EVENTO 3 (drop): Se dispara cuando el usuario suelta el elemento dentro de la zona de destino
    zonaDestino.addEventListener("drop", async function (evento) {
        evento.preventDefault();
        zonaDestino.classList.remove("bg-light-subtle", "border-success");

        // Recuperamos el ID del intercambio que viajó a través de dataTransfer
        const idIntercambio = Number(evento.dataTransfer.getData("text/plain"));
        if (!idIntercambio) return;

        try {
            // Obtenemos los intercambios de IndexedDB para buscar el elemento afectado
            const intercambios = await obtenerIntercambios();
            const intercambio = intercambios.find(i => i.id === idIntercambio);

            if (intercambio) {
                // MODIFICACIÓN DE DATOS: Cambiamos una propiedad del objeto (ej. marcarlo como favorito)
                intercambio.favorito = true;
                
                // PERSISTENCIA: Guardamos el cambio de forma permanente en IndexedDB
                await guardarIntercambio(intercambio);

                mostrarMensaje(`¡Intercambio ${intercambio.idiomaOfrecido}-${intercambio.idiomaBuscado} añadido a favoritos con éxito!`, "success");
                
                // ACTUALIZACIÓN VISUAL: Movemos físicamente el elemento DOM a la zona de destino
                const elementoMovido = document.querySelector(`[data-id='${idIntercambio}']`);
                if (elementoMovido) {
                    zonaDestino.appendChild(elementoMovido);
                }
            }
        } catch (error) {
            console.error("Error al procesar el drop:", error);
            mostrarMensaje("No se ha podido actualizar el elemento.", "danger");
        }
    });
}

// ==========================================================================
// 4. INICIALIZACIÓN DEL MÓDULO
// ==========================================================================
/**
 * Función principal que arranca la base de datos,
 * pinta los elementos arrastrables y habilita la zona de destino.
 */
async function iniciarModuloDragDrop() {
    try {
        await inicializarAlmacenamiento();
        await cargarElementosArrastrables();
        configurarZonaDestino();
    } catch (error) {
        console.error("Error al inicializar el módulo de Drag & Drop:", error);
    }
}

// Llamada de ejecución automática al cargar el script
iniciarModuloDragDrop();