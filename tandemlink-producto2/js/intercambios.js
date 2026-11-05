import { usuarios } from "./datos.js";
import {
    inicializarAlmacenamiento,
    obtenerIntercambios,
    guardarIntercambio,
    eliminarIntercambio
} from "./almacenaje.js";

const formulario = document.getElementById("formularioIntercambio");
const campoTipo = document.getElementById("tipoIntercambio");
const campoUsuario = document.getElementById("usuarioIntercambio");
const campoIdiomaOfrecido = document.getElementById("idiomaOfrecido");
const campoIdiomaBuscado = document.getElementById("idiomaBuscado");
const campoModalidad = document.getElementById("modalidadIntercambio");
const campoDescripcion = document.getElementById("descripcionIntercambio");
const mensaje = document.getElementById("mensajeIntercambio");

const listaIntercambios = document.getElementById("listaIntercambios");
const mensajeListaVacia = document.getElementById("mensajeListaVacia");

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo} mt-3`;
}

function cargarUsuarios() {
    usuarios.forEach(function (usuario) {
        const opcion = document.createElement("option");
        opcion.value = usuario.id;
        opcion.textContent = usuario.nombre;
        campoUsuario.appendChild(opcion);
    });
}

async function mostrarIntercambios() {
    try {
        const intercambios = await obtenerIntercambios();
        listaIntercambios.innerHTML = "";

        intercambios.forEach(function (intercambio) {
            const usuario = usuarios.find(function (persona) {
                return persona.id === intercambio.usuarioId;
            });

            const esOferta = intercambio.tipo === "oferta";
            const color = esOferta ? "success" : "warning";
            const tipoTexto = esOferta ? "Oferta" : "Petición";

            const tarjeta = document.createElement("div");
            tarjeta.className = "col-12 col-md-6 col-lg-4";

            const articulo = document.createElement("article");
            articulo.className = `card h-100 border-${color} shadow-sm`;

            const cuerpo = document.createElement("div");
            cuerpo.className = "card-body";

            const etiqueta = document.createElement("span");
            etiqueta.className = `badge text-bg-${color} mb-3`;
            etiqueta.textContent = tipoTexto;
            cuerpo.appendChild(etiqueta);

            const titulo = document.createElement("h3");
            titulo.className = "card-title h5";
            titulo.textContent = `${intercambio.idiomaOfrecido} por ${intercambio.idiomaBuscado}`;
            cuerpo.appendChild(titulo);

            const descripcion = document.createElement("p");
            descripcion.className = "card-text";
            descripcion.textContent = intercambio.descripcion;
            cuerpo.appendChild(descripcion);

            const modalidad = document.createElement("p");
            modalidad.className = "small mb-2";
            modalidad.textContent = `Modalidad: ${intercambio.modalidad}`;
            cuerpo.appendChild(modalidad);

            const nombreUsuario = document.createElement("p");
            nombreUsuario.className = "small mb-2";
            nombreUsuario.textContent = `Usuario: ${usuario ? usuario.nombre : "Usuario desconocido"}`;
            cuerpo.appendChild(nombreUsuario);

            const fecha = document.createElement("p");
            fecha.className = "small text-secondary mb-3";

            if (intercambio.fechaCreacion) {
                fecha.textContent = "Fecha de publicación: " + new Date(intercambio.fechaCreacion + "T00:00:00").toLocaleDateString("es-ES");
            } else {
                fecha.textContent = "Fecha de publicación no disponible";
            }
            cuerpo.appendChild(fecha);

            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.className = "btn btn-outline-danger btn-sm";
            botonEliminar.textContent = "Eliminar";
            botonEliminar.dataset.id = intercambio.id;
            cuerpo.appendChild(botonEliminar);

            articulo.appendChild(cuerpo);
            tarjeta.appendChild(articulo);
            listaIntercambios.appendChild(tarjeta);
        });

        mensajeListaVacia.textContent = intercambios.length === 0
            ? "Todavía no hay intercambios publicados."
            : "";
    } catch (error) {
        console.error("Error al cargar los intercambios:", error);
    }
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const tipo = campoTipo.value;
    const usuarioId = Number(campoUsuario.value);
    const idiomaOfrecido = campoIdiomaOfrecido.value.trim();
    const idiomaBuscado = campoIdiomaBuscado.value.trim();
    const modalidad = campoModalidad.value;
    const descripcionTexto = campoDescripcion.value.trim();

    const usuarioExiste = usuarios.some(function (usuario) {
        return usuario.id === usuarioId;
    });

    if (!usuarioExiste) {
        mostrarMensaje("Selecciona un usuario válido.", "danger");
        return;
    }

    try {
        const intercambios = await obtenerIntercambios();
        const nuevoId = intercambios.length > 0
            ? Math.max(...intercambios.map(i => i.id)) + 1
            : 1;

        const nuevoIntercambio = {
            id: nuevoId,
            tipo: tipo,
            usuarioId: usuarioId,
            idiomaOfrecido: idiomaOfrecido,
            idiomaBuscado: idiomaBuscado,
            modalidad: modalidad,
            descripcion: descripcionTexto,
            fechaCreacion: new Date().toLocaleDateString("en-CA")
        };

        await guardarIntercambio(nuevoIntercambio);
        await mostrarIntercambios();
        formulario.reset();
        mostrarMensaje("Intercambio publicado correctamente.", "success");
    } catch (error) {
        console.error("Error al guardar el intercambio:", error);
        mostrarMensaje("No se ha podido guardar el intercambio.", "danger");
    }
});

listaIntercambios.addEventListener("click", async function (evento) {
    const boton = evento.target.closest("button[data-id]");
    if (!boton) return;

    const id = Number(boton.dataset.id);
    const confirmar = window.confirm("¿Seguro que quieres eliminar este intercambio?");
    if (!confirmar) return;

    try {
        await eliminarIntercambio(id);
        await mostrarIntercambios();
        mostrarMensaje("Intercambio eliminado correctamente.", "success");
    } catch (error) {
        console.error("Error al eliminar el intercambio:", error);
        mostrarMensaje("No se ha podido eliminar el intercambio.", "danger");
    }
});

async function iniciarPagina() {
    try {
        await inicializarAlmacenamiento();
        cargarUsuarios();
        await mostrarIntercambios();
    } catch (error) {
        console.error("Error al inicializar la página:", error);
    }
}

iniciarPagina();