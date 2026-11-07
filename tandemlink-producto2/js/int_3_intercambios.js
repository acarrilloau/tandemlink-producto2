
/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: ChatGPT
   - Prompt: "Adapta int_3_intercambios.js para gestionar los intercambios
     mediante IndexedDB. Incluye el registro con título, email, fecha,
     tipo, idiomas, modalidad y descripción; la consulta y el borrado
     de registros. Mantén la compatibilidad con los intercambios antiguos."
   ========================================================================== */

// Importamos las funciones de almacenamiento.
import {
    inicializarAlmacenamiento,
    obtenerIntercambios,
    guardarIntercambio,
    eliminarIntercambio,
    obtenerUsuarios
} from "./almacenaje.js";

// Elementos del formulario.
const formulario = document.getElementById("formularioIntercambio");
const campoTitulo = document.getElementById("tituloIntercambio");
const campoEmail = document.getElementById("emailIntercambio");
const campoFecha = document.getElementById("fechaIntercambio");
const campoTipo = document.getElementById("tipoIntercambio");
const campoIdiomaOfrecido = document.getElementById("idiomaOfrecido");
const campoIdiomaBuscado = document.getElementById("idiomaBuscado");
const campoModalidad = document.getElementById("modalidadIntercambio");
const campoDescripcion = document.getElementById("descripcionIntercambio");

const mensaje = document.getElementById("mensajeIntercambio");
const listaIntercambios = document.getElementById("listaIntercambios");
const mensajeListaVacia = document.getElementById("mensajeListaVacia");

// Mostramos mensajes en el formulario.
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo} mt-3`;
}

// Convertimos una fecha al formato español.
function formatearFecha(fecha) {
    if (!fecha) {
        return "Fecha no disponible";
    }

    const fechaValida = new Date(fecha + "T00:00:00");

    return fechaValida.toLocaleDateString("es-ES");
}

// Consultamos y mostramos los intercambios guardados.
async function mostrarIntercambios() {
    const intercambios = await obtenerIntercambios();
    const usuarios = obtenerUsuarios();

    listaIntercambios.innerHTML = "";

    intercambios.forEach(function (intercambio) {

        // Compatibilidad con los intercambios antiguos.
        const usuarioAntiguo = usuarios.find(function (usuario) {
            return usuario.id === intercambio.usuarioId;
        });

        const tituloTexto = intercambio.titulo ||
            `${intercambio.idiomaOfrecido} por ${intercambio.idiomaBuscado}`;

        const emailTexto = intercambio.email ||
            (usuarioAntiguo ? usuarioAntiguo.email : "No disponible");

        const fechaTexto = intercambio.fecha ||
            intercambio.fechaCreacion;

        const esOferta = intercambio.tipo === "oferta";
        const color = esOferta ? "success" : "warning";
        const tipoTexto = esOferta ? "Ofrezco idioma" : "Busco idioma";

        // Creamos la tarjeta.
        const tarjeta = document.createElement("div");
        tarjeta.className = "col-12 col-md-6 col-lg-4";

        const articulo = document.createElement("article");
        articulo.className = `card h-100 border-${color} shadow-sm`;

        const cuerpo = document.createElement("div");
        cuerpo.className = "card-body";

        const etiqueta = document.createElement("span");
        etiqueta.className = `badge text-bg-${color} mb-3`;
        etiqueta.textContent = tipoTexto;

        const titulo = document.createElement("h3");
        titulo.className = "card-title h5";
        titulo.textContent = tituloTexto;

        const email = document.createElement("p");
        email.className = "small mb-2";
        email.textContent = "Email: " + emailTexto;

        const fecha = document.createElement("p");
        fecha.className = "small text-secondary mb-2";
        fecha.textContent = "Fecha: " + formatearFecha(fechaTexto);

        const idiomas = document.createElement("p");
        idiomas.className = "mb-2";
        idiomas.textContent =
            `Idiomas: ${intercambio.idiomaOfrecido || "No indicado"} / ${intercambio.idiomaBuscado || "No indicado"}`;

        const modalidad = document.createElement("p");
        modalidad.className = "small mb-2";
        modalidad.textContent =
            "Modalidad: " + (intercambio.modalidad || "No indicada");

        const descripcion = document.createElement("p");
        descripcion.className = "card-text";
        descripcion.textContent = intercambio.descripcion;

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn btn-outline-danger btn-sm";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.dataset.id = intercambio.id;

        cuerpo.appendChild(etiqueta);
        cuerpo.appendChild(titulo);
        cuerpo.appendChild(email);
        cuerpo.appendChild(fecha);
        cuerpo.appendChild(idiomas);
        cuerpo.appendChild(modalidad);
        cuerpo.appendChild(descripcion);
        cuerpo.appendChild(botonEliminar);

        articulo.appendChild(cuerpo);
        tarjeta.appendChild(articulo);
        listaIntercambios.appendChild(tarjeta);
    });

    mensajeListaVacia.textContent = intercambios.length === 0
        ? "Todavía no hay intercambios publicados."
        : "";
}

// Gestionamos el alta de intercambios.
formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const email = campoEmail.value.trim();
    const fecha = campoFecha.value;
    const tipo = campoTipo.value;
    const idiomaOfrecido = campoIdiomaOfrecido.value.trim();
    const idiomaBuscado = campoIdiomaBuscado.value.trim();
    const modalidad = campoModalidad.value;
    const descripcion = campoDescripcion.value.trim();

    // Comprobamos que el email corresponda a un usuario registrado.
    const usuarioExiste = obtenerUsuarios().some(function (usuario) {
        return usuario.email.toLowerCase() === email.toLowerCase();
    });

    if (!usuarioExiste) {
        mostrarMensaje(
            "El correo electrónico no pertenece a ningún usuario registrado.",
            "danger"
        );
        return;
    }

    try {
        const intercambios = await obtenerIntercambios();

        // Generamos un identificador nuevo.
        const nuevoId = intercambios.length > 0
            ? Math.max(...intercambios.map(function (intercambio) {
                return intercambio.id;
            })) + 1
            : 1;

        // Creamos el nuevo intercambio.
        const nuevoIntercambio = {
            id: nuevoId,
            titulo: titulo,
            email: email,
            fecha: fecha,
            tipo: tipo,
            idiomaOfrecido: idiomaOfrecido,
            idiomaBuscado: idiomaBuscado,
            modalidad: modalidad,
            descripcion: descripcion
        };

        // Guardamos el intercambio en IndexedDB.
        await guardarIntercambio(nuevoIntercambio);

        await mostrarIntercambios();

        formulario.reset();

        mostrarMensaje(
            "Intercambio publicado correctamente.",
            "success"
        );

    } catch (error) {
        console.error("Error al guardar el intercambio:", error);

        mostrarMensaje(
            "No se ha podido guardar el intercambio.",
            "danger"
        );
    }
});

// Gestionamos la eliminación de intercambios.
listaIntercambios.addEventListener("click", async function (evento) {
    const boton = evento.target.closest("button[data-id]");

    if (!boton) {
        return;
    }

    const id = Number(boton.dataset.id);

    const confirmar = window.confirm(
        "¿Seguro que quieres eliminar este intercambio?"
    );

    if (!confirmar) {
        return;
    }

    try {
        await eliminarIntercambio(id);

        await mostrarIntercambios();

        mostrarMensaje(
            "Intercambio eliminado correctamente.",
            "success"
        );

    } catch (error) {
        console.error("Error al eliminar el intercambio:", error);

        mostrarMensaje(
            "No se ha podido eliminar el intercambio.",
            "danger"
        );
    }
});

// Inicializamos el almacenamiento antes de cargar los intercambios.
async function iniciarPagina() {
    try {
        await inicializarAlmacenamiento();
        await mostrarIntercambios();

    } catch (error) {
        console.error("Error al inicializar la página:", error);

        mostrarMensaje(
            "No se han podido cargar los intercambios.",
            "danger"
        );
    }
}

iniciarPagina();