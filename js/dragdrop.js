
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
const contenedorOrigen = document.getElementById("listaIntercambiosDrag");
const zonaDestino = document.getElementById("zonaFavoritos");
const mensaje = document.getElementById("mensajeDragDrop");

// Muestra un mensaje de alerta en la interfaz visual.
function mostrarMensaje(texto, tipo) {
    if (mensaje) {
        mensaje.textContent = texto;
        mensaje.className = `alert alert-${tipo} mt-3`;
    }
}

// ==========================================================================
// 2. RENDERIZADO Y CONFIGURACIÓN DE ELEMENTOS ARRASTRABLES (DRAG)
// ==========================================================================
async function cargarElementosArrastrables() {
    try {
        const intercambios = await obtenerIntercambios();

        if (!contenedorOrigen || !zonaDestino) return;

        contenedorOrigen.innerHTML = "";
        zonaDestino.innerHTML = "";

        // Recorremos cada intercambio para construir su representación visual
        intercambios.forEach(function (intercambio) {
            const usuario = usuarios.find(u => u.id === intercambio.usuarioId);
            const nombreUsuario = usuario ? usuario.nombre : "Desconocido";

            const tarjeta = document.createElement("div");
            tarjeta.className = "card mb-3 p-3 shadow-sm border-primary position-relative";
            tarjeta.dataset.id = intercambio.id;

            tarjeta.innerHTML = `
                <h5 class="card-title">${intercambio.idiomaOfrecido} ⇄ ${intercambio.idiomaBuscado}</h5>
                <p class="card-text mb-1"><strong>Modalidad:</strong> ${intercambio.modalidad}</p>
                <p class="card-text small text-muted mb-0">Publicado por: ${nombreUsuario}</p>
            `;

            // Comprobamos si el intercambio ya está guardado como favorito
            if (intercambio.favorito === true) {

                // Añadimos el botón X para eliminar el intercambio de favoritos
                const botonEliminar = document.createElement("button");
                botonEliminar.className = "position-absolute top-0 end-0 m-2 border-0 bg-transparent text-dark";
                botonEliminar.textContent = "X";
                botonEliminar.title = "Quitar de favoritos";

                // EVENTO 1 (click): Se ejecuta cuando el usuario pulsa el botón X
                botonEliminar.addEventListener("click", async function () {
                    try {
                        intercambio.favorito = false;
                        await guardarIntercambio(intercambio);
                        await cargarElementosArrastrables();

                        mostrarMensaje("¡Intercambio eliminado de favoritos correctamente!", "success");

                    } catch (error) {
                        console.error("Error al eliminar el favorito:", error);
                        mostrarMensaje("No se ha podido eliminar el favorito.", "danger");
                    }
                });

                tarjeta.appendChild(botonEliminar);
                zonaDestino.appendChild(tarjeta);

            } else {

                // ATRIBUTO CLAVE: Permite que este elemento HTML sea arrastrable por el usuario
                tarjeta.setAttribute("draggable", "true");

                // EVENTO 2 (dragstart): Se ejecuta cuando el usuario empieza a arrastrar la tarjeta
                tarjeta.addEventListener("dragstart", function (evento) {
                    evento.dataTransfer.setData("text/plain", intercambio.id);
                    tarjeta.classList.add("opacity-50");
                });

                // EVENTO 3 (dragend): Se ejecuta cuando el usuario suelta la tarjeta
                tarjeta.addEventListener("dragend", function () {
                    tarjeta.classList.remove("opacity-50");
                });

                contenedorOrigen.appendChild(tarjeta);
            }
        });

        // Si no hay intercambios disponibles, mostramos un mensaje informativo
        if (contenedorOrigen.children.length === 0) {
            contenedorOrigen.textContent = "No hay intercambios disponibles.";
        }

        // Si no hay favoritos, mostramos el mensaje inicial de la zona de destino
        if (zonaDestino.children.length === 0) {
            zonaDestino.textContent = "Suelta aquí los intercambios para añadirlos a tus favoritos";
        }

    } catch (error) {
        console.error("Error al cargar elementos para arrastrar:", error);
    }
}

// ==========================================================================
// 3. CONFIGURACIÓN DE LA ZONA DE DESTINO (DROPZONE)
// ==========================================================================
function configurarZonaDestino() {
    if (!zonaDestino) return;

    // EVENTO 1 (dragover)
    zonaDestino.addEventListener("dragover", function (evento) {
        evento.preventDefault();
        zonaDestino.classList.add("bg-light-subtle", "border-success");
    });

    // EVENTO 2 (dragleave)
    zonaDestino.addEventListener("dragleave", function () {
        zonaDestino.classList.remove("bg-light-subtle", "border-success");
    });

    // EVENTO 3 (drop)
    zonaDestino.addEventListener("drop", async function (evento) {
        evento.preventDefault();
        zonaDestino.classList.remove("bg-light-subtle", "border-success");

        const idIntercambio = Number(evento.dataTransfer.getData("text/plain"));
        if (!idIntercambio) return;

        try {
            const intercambios = await obtenerIntercambios();
            const intercambio = intercambios.find(i => i.id === idIntercambio);

            if (intercambio && intercambio.favorito !== true) {
                intercambio.favorito = true;
                await guardarIntercambio(intercambio);

                await cargarElementosArrastrables();

                mostrarMensaje(`¡Intercambio ${intercambio.idiomaOfrecido}-${intercambio.idiomaBuscado} añadido a favoritos con éxito!`, "success");
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
