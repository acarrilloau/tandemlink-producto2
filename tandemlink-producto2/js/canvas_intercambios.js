/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini
   - Prompt: "Haz comentarios en cada sección del código para explicar su funcionamiento."
   ========================================================================== */

// Importamos las funciones de persistencia asíncrona desde el módulo central de almacenamiento (IndexedDB)
import { inicializarAlmacenamiento, obtenerIntercambios } from "./almacenaje.js";
// Importamos el array estático de usuarios para poder asociar cada intercambio con el nombre de su autor
import { usuarios } from "./datos.js";

// ==========================================================================
// 1. CAPTURA DE ELEMENTOS DEL DOM
// ==========================================================================
const selectIntercambio = document.getElementById("selectIntercambioCanvas"); // Desplegable para elegir el intercambio
const botonGenerar = document.getElementById("btnGenerarCanvas");           // Botón para disparar el dibujo en el canvas
const canvas = document.getElementById("miCanvas");                         // Elemento <canvas> HTML5 donde se dibujará la gráfica
const enlaceDescarga = document.getElementById("btnDescargarCanvas");       // Enlace para descargar la imagen resultante en PNG
const mensaje = document.getElementById("mensajeCanvas");                     // Contenedor para mostrar alertas de éxito o error

/**
 * Muestra un mensaje de alerta en la interfaz del usuario.
 * @param {string} texto - El contenido del mensaje.
 * @param {string} tipo - El tipo de alerta de Bootstrap ('success', 'warning', 'danger').
 */
function mostrarMensaje(texto, tipo) {
    if (mensaje) {
        mensaje.textContent = texto;
        mensaje.className = `alert alert-${tipo} mt-3`;
    }
}

// ==========================================================================
// 2. CARGA DE DATOS EN EL SELECTOR
// ==========================================================================
/**
 * Recupera los intercambios almacenados en IndexedDB y rellena el elemento <select>
 * para que el usuario pueda escoger cuál desea convertir en tarjeta gráfica.
 */
async function cargarSelectIntercambios() {
    try {
        // Obtenemos de forma asíncrona todos los intercambios guardados en la base de datos
        const intercambios = await obtenerIntercambios();
        
        // Limpiamos el selector y añadimos una opción por defecto
        selectIntercambio.innerHTML = '<option value="">-- Selecciona un intercambio --</option>';

        // Recorremos cada intercambio para crear una opción en el desplegable
        intercambios.forEach(function (intercambio) {
            // Buscamos al usuario creador del intercambio para mostrar su nombre
            const usuario = usuarios.find(function (u) {
                return u.id === intercambio.usuarioId;
            });
            const nombreUsuario = usuario ? usuario.nombre : "Desconocido";

            const opcion = document.createElement("option");
            opcion.value = intercambio.id;
            // Mostramos los idiomas ofrecido y buscado junto con el nombre del usuario
            opcion.textContent = `${intercambio.idiomaOfrecido} ⇄ ${intercambio.idiomaBuscado} (${nombreUsuario})`;
            selectIntercambio.appendChild(opcion);
        });
    } catch (error) {
        console.error("Error al cargar los intercambios en el selector de Canvas:", error);
    }
}

// ==========================================================================
// 3. MOTOR DE DIBUJO EN CANVAS (API HTML5 CANVAS)
// ==========================================================================
/**
 * Dibuja de manera personalizada una insignia o tarjeta gráfica basada en los datos del intercambio seleccionado.
 * @param {number|string} intercambioId - El identificador único del intercambio seleccionado.
 */
async function dibujarCanvas(intercambioId) {
    if (!canvas) return;
    
    // Obtenemos el contexto de renderizado 2D, que es la herramienta con la que se dibuja en el canvas
    const ctx = canvas.getContext("2d");

    try {
        // Consultamos de nuevo IndexedDB para asegurar que tenemos los datos más recientes
        const intercambios = await obtenerIntercambios();
        const intercambio = intercambios.find(function (i) {
            return i.id === Number(intercambioId);
        });

        // Validación: si no se selecciona un intercambio válido, limpiamos el canvas y avisamos
        if (!intercambio) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            mostrarMensaje("Por favor, selecciona un intercambio válido.", "warning");
            return;
        }

        // Buscamos el usuario asociado al intercambio
        const usuario = usuarios.find(function (u) {
            return u.id === intercambio.usuarioId;
        });
        const nombreUsuario = usuario ? usuario.nombre : "Usuario anónimo";

        // Definimos las dimensiones fijas en píxeles para el archivo gráfico resultante
        canvas.width = 600;
        canvas.height = 350;

        // Establecemos colores dinámicos condicionales según el tipo de intercambio (oferta o petición)
        const esOferta = intercambio.tipo === "oferta";
        const colorFondo = esOferta ? "#e8f5e9" : "#fff8e1";   // Verde suave para ofertas, amarillo suave para peticiones
        const colorBorde = esOferta ? "#2e7d32" : "#f57f17";   // Verde oscuro o ámbar oscuro para los bordes
        const colorTexto = "#212529";                          // Color principal de tipografía

        // PASO 1: Dibujar el rectángulo de fondo de toda la tarjeta
        ctx.fillStyle = colorFondo;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // PASO 2: Dibujar un marco o borde perimetral decorativo
        ctx.strokeStyle = colorBorde;
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        // PASO 3: Dibujar la insignia superior (Badge que indica si es Oferta o Petición)
        ctx.fillStyle = colorBorde;
        ctx.fillRect(30, 30, 110, 32);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText(esOferta ? "OFERTA" : "PETICIÓN", 48, 51);

        // PASO 4: Dibujar el título principal con los idiomas (Ej: "Español por Inglés")
        ctx.fillStyle = colorTexto;
        ctx.font = "bold 22px sans-serif";
        ctx.fillText(`${intercambio.idiomaOfrecido} por ${intercambio.idiomaBuscado}`, 30, 100);

        // PASO 5: Dibujar detalles informativos (Modalidad y Nombre del usuario)
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#495057";
        ctx.fillText(`Modalidad: ${intercambio.modalidad}`, 30, 145);
        ctx.fillText(`Publicado por: ${nombreUsuario}`, 30, 180);

        // PASO 6: Dibujar la descripción (Se recorta con substring si es demasiado larga para que no desborde)
        ctx.font = "italic 14px sans-serif";
        ctx.fillStyle = "#6c757d";
        const descripcionTexto = intercambio.descripcion.length > 55
            ? intercambio.descripcion.substring(0, 52) + "..."
            : intercambio.descripcion;
        ctx.fillText(`"${descripcionTexto}"`, 30, 225);

        // PASO 7: Dibujar el pie de página o marca de agua corporativa
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#adb5bd";
        ctx.fillText("TandemLink - Plataforma de Intercambio Lingüístico", 30, 305);

        // PASO 8: Configurar el enlace de descarga para convertir el contenido del Canvas en un archivo PNG descargable
        if (enlaceDescarga) {
            enlaceDescarga.href = canvas.toDataURL("image/png"); // Convierte el canvas en una URL de datos en formato PNG
            enlaceDescarga.download = `tarjeta-tandem-${intercambio.id}.png`; // Nombre sugerido para el archivo descargado
            enlaceDescarga.style.display = "inline-block"; // Hacemos visible el botón/enlace de descarga
        }

        mostrarMensaje("¡Tarjeta gráfica generada correctamente con Canvas!", "success");
    } catch (error) {
        console.error("Error al procesar el dibujo en Canvas:", error);
        mostrarMensaje("No se ha podido generar la tarjeta gráfica.", "danger");
    }
}

// ==========================================================================
// 4. INICIALIZACIÓN Y GESTIÓN DE EVENTOS DEL MÓDULO
// ==========================================================================
/**
 * Inicializa la base de datos, carga los elementos en el selector
 * y configura el evento de escucha para el botón de generación gráfica.
 */
async function iniciarModuloCanvas() {
    try {
        await inicializarAlmacenamiento();
        await cargarSelectIntercambios();

        // Escuchamos el evento click del botón para disparar el renderizado del canvas
        if (botonGenerar && selectIntercambio) {
            botonGenerar.addEventListener("click", function () {
                dibujarCanvas(selectIntercambio.value);
            });
        }
    } catch (error) {
        console.error("Error al inicializar el módulo de Canvas:", error);
    }
}

// Llamada principal al cargar el script
iniciarModuloCanvas();