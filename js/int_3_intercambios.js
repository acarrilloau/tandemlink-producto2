
/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: ChatGPT / Gemini
   - Prompt: "Adapta int_3_intercambios.js para gestionar los intercambios
     mediante IndexedDB, mostrando las tarjetas, el gráfico circular en canvas
     y manteniendo la compatibilidad y el borrado."
   ========================================================================== */

// Importamos las funciones de almacenamiento.
import {
    inicializarAlmacenamiento,
    obtenerIntercambios,
    guardarIntercambio,
    eliminarIntercambio,
    obtenerUsuarios
} from "./almacenaje.js";

// Elementos del formulario y DOM.
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

// Elemento Canvas para el gráfico estadístico
const canvas = document.getElementById("graficoIntercambios"); // Asegúrate de que tu canvas en el HTML tenga este ID

// Mostramos mensajes en el formulario.
function mostrarMensaje(texto, tipo) {
    if (!mensaje) return;
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

// -------------------------------------------------------------------------
// DIBUJAR GRÁFICO CIRCULAR GRANDE Y CENTRADO
// -------------------------------------------------------------------------
function dibujarGrafico(lista) {
    if (!canvas) return;

    const contexto = canvas.getContext("2d");

    const ofertas = lista.filter(
        i => i.tipo === "oferta"
    ).length;

    const peticiones = lista.filter(
        i => i.tipo === "petición" || i.tipo === "peticion"
    ).length;

    const total = ofertas + peticiones;

    contexto.clearRect(0, 0, canvas.width, canvas.height);

    // Coordenadas centradas para un canvas de 800x400
    const centroX = 300;
    const centroY = canvas.height / 2;
    const radio = 160; // Círculo mucho más grande

    if (total === 0) {
        contexto.beginPath();
        contexto.arc(centroX, centroY, radio, 0, Math.PI * 2);
        contexto.fillStyle = "#dce2e9";
        contexto.fill();
        
        contexto.font = "22px Arial";
        contexto.fillStyle = "#263238";
        contexto.textAlign = "center";
        contexto.fillText("Sin datos", centroX, centroY);
    } else {
        let anguloInicial = -Math.PI / 2;

        const datos = [
            { cantidad: ofertas, color: "#198754" },
            { cantidad: peticiones, color: "#ffc107" }
        ];

        datos.forEach(dato => {
            if (dato.cantidad === 0) return;

            const angulo = (dato.cantidad / total) * Math.PI * 2;

            contexto.beginPath();
            contexto.moveTo(centroX, centroY);
            contexto.arc(
                centroX,
                centroY,
                radio,
                anguloInicial,
                anguloInicial + angulo
            );
            contexto.closePath();

            contexto.fillStyle = dato.color;
            contexto.fill();

            anguloInicial += angulo;
        });
    }

    // Leyenda del gráfico dimensionada y legible
    const leyendaX = 530;
    
    contexto.font = "22px Arial";
    contexto.textAlign = "left";

    // Ofertas
    contexto.fillStyle = "#198754";
    contexto.fillRect(leyendaX, centroY - 60, 28, 28);
    contexto.fillStyle = "#263238";
    contexto.fillText(`Ofertas: ${ofertas}`, leyendaX + 40, centroY - 38);

    // Peticiones
    contexto.fillStyle = "#ffc107";
    contexto.fillRect(leyendaX, centroY - 10, 28, 28);
    contexto.fillStyle = "#263238";
    contexto.fillText(`Peticiones: ${peticiones}`, leyendaX + 40, centroY + 12);

    // Total
    contexto.font = "bold 22px Arial";
    contexto.fillStyle = "#263238";
    contexto.fillText(`Total: ${total}`, leyendaX, centroY + 75);
}


// Consultamos y mostramos los intercambios y el gráfico.
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
        tarjeta.className = "col-12 col-md-6 col-lg-4 mb-3";

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
        botonEliminar.className = "btn btn-outline-danger btn-sm mt-2";
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

    if (mensajeListaVacia) {
        mensajeListaVacia.textContent = intercambios.length === 0
            ? "Todavía no hay intercambios publicados."
            : "";
    }

    // Actualizamos también el gráfico estadístico con la lista actual
    dibujarGrafico(intercambios);
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

// -------------------------------------------------------------------------
// INICIALIZACIÓN DE LA PÁGINA
// -------------------------------------------------------------------------
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

// Ejecución principal al cargar el script
iniciarPagina();