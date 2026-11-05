/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini
   - Prompt 1: "Crea una función para recorrer un array de usuarios y rellenar un elemento <select> con opciones."
   - Prompt 2: "Genera un bucle para construir dinámicamente tarjetas HTML y asociarles un botón de eliminación."
   - Prompt 3: "Añade la lógica de validación con .some() y cálculo de ID máximo para registrar un nuevo elemento vía formulario."
   - Prompt 4: "Implementa el borrado seguro de un elemento de la lista usando delegación de eventos y un confirm nativo."
   ========================================================================== */



// Importamos los datos de usuarios e intercambios.
import { usuarios, intercambios } from "./datos.js";

// Elementos del formulario.
const formulario = document.getElementById("formularioIntercambio");
const campoTipo = document.getElementById("tipoIntercambio");
const campoUsuario = document.getElementById("usuarioIntercambio");
const campoIdiomaOfrecido = document.getElementById("idiomaOfrecido");
const campoIdiomaBuscado = document.getElementById("idiomaBuscado");
const campoModalidad = document.getElementById("modalidadIntercambio");
const campoDescripcion = document.getElementById("descripcionIntercambio");
const mensaje = document.getElementById("mensajeIntercambio");

// Elementos del listado.
const listaIntercambios = document.getElementById("listaIntercambios");
const mensajeListaVacia = document.getElementById("mensajeListaVacia");

// Mostramos mensajes de éxito o error.
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo} mt-3`;
}

// Cargamos los usuarios en el selector.
function cargarUsuarios() {
    usuarios.forEach(function (usuario) {
        const opcion = document.createElement("option");

        opcion.value = usuario.id;
        opcion.textContent = usuario.nombre;

        campoUsuario.appendChild(opcion);
    });
}

// Mostramos todos los intercambios.
function mostrarIntercambios() {
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

        // Tipo de intercambio.
        const etiqueta = document.createElement("span");
        etiqueta.className = `badge text-bg-${color} mb-3`;
        etiqueta.textContent = tipoTexto;
        cuerpo.appendChild(etiqueta);

        // Idiomas.
        const titulo = document.createElement("h3");
        titulo.className = "card-title h5";
        titulo.textContent =
            `${intercambio.idiomaOfrecido} por ${intercambio.idiomaBuscado}`;
        cuerpo.appendChild(titulo);

        // Descripción.
        const descripcion = document.createElement("p");
        descripcion.className = "card-text";
        descripcion.textContent = intercambio.descripcion;
        cuerpo.appendChild(descripcion);

        // Modalidad.
        const modalidad = document.createElement("p");
        modalidad.className = "small mb-2";
        modalidad.textContent = `Modalidad: ${intercambio.modalidad}`;
        cuerpo.appendChild(modalidad);

        // Usuario.
        const nombreUsuario = document.createElement("p");
        nombreUsuario.className = "small mb-2";
        nombreUsuario.textContent =
            `Usuario: ${usuario ? usuario.nombre : "Usuario desconocido"}`;
        cuerpo.appendChild(nombreUsuario);

        // Fecha de creación.
        const fecha = document.createElement("p");
        fecha.className = "small text-secondary mb-3";

        if (intercambio.fechaCreacion) {
            fecha.textContent =
                "Fecha de publicación: " +
                new Date(
                    intercambio.fechaCreacion + "T00:00:00"
                ).toLocaleDateString("es-ES");
        } else {
            fecha.textContent = "Fecha de publicación no disponible";
        }

        cuerpo.appendChild(fecha);

        // Botón para eliminar.
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
}

// Registramos un nuevo intercambio.
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const tipo = campoTipo.value;
    const usuarioId = Number(campoUsuario.value);
    const idiomaOfrecido = campoIdiomaOfrecido.value.trim();
    const idiomaBuscado = campoIdiomaBuscado.value.trim();
    const modalidad = campoModalidad.value;
    const descripcionTexto = campoDescripcion.value.trim();

    // Comprobamos que el usuario seleccionado existe.
    const usuarioExiste = usuarios.some(function (usuario) {
        return usuario.id === usuarioId;
    });

    if (!usuarioExiste) {
        mostrarMensaje("Selecciona un usuario válido.", "danger");
        return;
    }

    // Calculamos un identificador que no esté utilizado.
    const nuevoId = intercambios.length > 0
        ? Math.max(...intercambios.map(function (intercambio) {
            return intercambio.id;
        })) + 1
        : 1;

    // Añadimos el intercambio al array compartido.
    intercambios.push({
        id: nuevoId,
        tipo: tipo,
        usuarioId: usuarioId,
        idiomaOfrecido: idiomaOfrecido,
        idiomaBuscado: idiomaBuscado,
        modalidad: modalidad,
        descripcion: descripcionTexto,
        fechaCreacion: new Date().toLocaleDateString("en-CA")
    });

    mostrarIntercambios();
    formulario.reset();

    mostrarMensaje("Intercambio publicado correctamente.", "success");
});

// Gestionamos los clics en los botones de eliminar.
listaIntercambios.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[data-id]");

    if (!boton) {
        return;
    }

    const id = Number(boton.dataset.id);

    const indice = intercambios.findIndex(function (intercambio) {
        return intercambio.id === id;
    });

    if (indice === -1) {
        return;
    }

    const confirmar = window.confirm(
        "¿Seguro que quieres eliminar este intercambio?"
    );

    if (!confirmar) {
        return;
    }

    intercambios.splice(indice, 1);

    mostrarIntercambios();
    mostrarMensaje("Intercambio eliminado correctamente.", "success");
});

// Inicializamos la página.
cargarUsuarios();
mostrarIntercambios();