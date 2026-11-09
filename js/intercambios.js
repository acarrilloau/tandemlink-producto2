
import { intercambios as datosIniciales } from "./datos.js";

import {
    obtenerUsuarioActivo,
    consultarUsuarios,
    consultarIntercambiosBD,
    guardarIntercambioBD,
    actualizarIntercambioBD,
    eliminarIntercambioBD
} from "./almacenaje.js";

// Elementos de la página
const formulario = document.getElementById("formularioIntercambio");
const tabla = document.getElementById("tablaIntercambios");
const mensaje = document.getElementById("mensajeIntercambio");
const canvas = document.getElementById("graficoIntercambios");

const tituloFormulario = document.getElementById("tituloFormularioIntercambio");
const botonGuardar = document.getElementById("botonGuardarIntercambio");
const botonCancelar = document.getElementById("cancelarEdicionIntercambio");

// Intercambio que estamos editando
let intercambioEnEdicion = null;

// Obtener el usuario que tiene la sesión iniciada
function obtenerUsuarioSesion() {
    const emailActivo = obtenerUsuarioActivo();

    if (!emailActivo) return null;

    return consultarUsuarios().find(
        usuario => usuario.email.toLowerCase() === emailActivo.toLowerCase()
    ) || null;
}

// Comprobar si el intercambio pertenece al usuario activo
function esPropietario(intercambio) {
    const usuario = obtenerUsuarioSesion();

    return usuario !== null && usuario.id === intercambio.usuarioId;
}

// Cargar los datos iniciales si IndexedDB está vacío
async function cargarDatosIniciales() {
    const lista = await consultarIntercambiosBD();

    if (lista.length === 0) {
        for (const intercambio of datosIniciales) {
            await guardarIntercambioBD(intercambio);
        }
    }
}

// Mostrar los intercambios en la tabla
async function mostrarIntercambios() {
    if (!tabla) return;

    const lista = await consultarIntercambiosBD();
    const usuarios = consultarUsuarios();

    tabla.innerHTML = "";

    if (lista.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 7;
        celda.textContent = "Todavía no hay intercambios publicados.";

        fila.appendChild(celda);
        tabla.appendChild(fila);
    }

    lista.forEach(intercambio => {
        const usuario = usuarios.find(
            u => u.id === intercambio.usuarioId
        );

        const fila = document.createElement("tr");

        const valores = [
            intercambio.tipo,
            usuario ? usuario.email : "No disponible",
            `${intercambio.idiomaOfrecido} ↔ ${intercambio.idiomaBuscado}`,
            intercambio.modalidad,
            intercambio.descripcion,
            intercambio.fechaCreacion
        ];

        valores.forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const celdaAcciones = document.createElement("td");

        // Solo el propietario puede modificar o eliminar
        if (esPropietario(intercambio)) {

            // Botón editar
            const botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";
            botonEditar.className = "btn btn-warning btn-sm me-2";

            botonEditar.addEventListener("click", function () {

                if (!esPropietario(intercambio)) {
                    mensaje.textContent = "Solo puedes editar tus propios intercambios.";
                    mensaje.className = "text-danger mt-3";
                    return;
                }

                intercambioEnEdicion = intercambio;

                document.getElementById("tipo").value = intercambio.tipo;
                document.getElementById("idiomaOfrecido").value = intercambio.idiomaOfrecido;
                document.getElementById("idiomaBuscado").value = intercambio.idiomaBuscado;
                document.getElementById("modalidad").value = intercambio.modalidad;
                document.getElementById("descripcion").value = intercambio.descripcion;

                tituloFormulario.textContent = "Editar intercambio";
                botonGuardar.textContent = "Guardar cambios";
                botonCancelar.hidden = false;

                mensaje.textContent = "Modifica los datos del intercambio.";
                mensaje.className = "text-dark mt-3";

                formulario.scrollIntoView({ behavior: "smooth" });
            });

            // Botón eliminar
            const botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.className = "btn btn-danger btn-sm";

            botonEliminar.addEventListener("click", async function () {

                if (!esPropietario(intercambio)) {
                    mensaje.textContent = "Solo puedes eliminar tus propios intercambios.";
                    mensaje.className = "text-danger mt-3";
                    return;
                }

                if (confirm("¿Quieres eliminar este intercambio?")) {
                    await eliminarIntercambioBD(intercambio.id);

                    if (
                        intercambioEnEdicion &&
                        intercambioEnEdicion.id === intercambio.id
                    ) {
                        cancelarEdicion();
                    }

                    await actualizarPagina();
                }
            });

            celdaAcciones.appendChild(botonEditar);
            celdaAcciones.appendChild(botonEliminar);

        } else {
            celdaAcciones.textContent = "Sin permisos";
        }

        fila.appendChild(celdaAcciones);
        tabla.appendChild(fila);
    });

    dibujarGrafico(lista);
}

// Volver al modo de publicación
function cancelarEdicion() {
    intercambioEnEdicion = null;

    formulario.reset();

    tituloFormulario.textContent = "Publicar un intercambio";
    botonGuardar.textContent = "Publicar intercambio";
    botonCancelar.hidden = true;

    mensaje.textContent = "";
}

// Publicar o editar un intercambio
if (formulario) {
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const usuario = obtenerUsuarioSesion();

        if (!usuario) {
            mensaje.textContent = "Debes iniciar sesión para publicar un intercambio.";
            mensaje.className = "text-danger mt-3";
            return;
        }

        const datosIntercambio = {
            tipo: document.getElementById("tipo").value,
            idiomaOfrecido: document.getElementById("idiomaOfrecido").value.trim(),
            idiomaBuscado: document.getElementById("idiomaBuscado").value.trim(),
            modalidad: document.getElementById("modalidad").value,
            descripcion: document.getElementById("descripcion").value.trim()
        };

        try {
            if (intercambioEnEdicion !== null) {

                // Comprobar nuevamente que el usuario es el propietario
                if (!esPropietario(intercambioEnEdicion)) {
                    mensaje.textContent = "No tienes permiso para editar este intercambio.";
                    mensaje.className = "text-danger mt-3";
                    cancelarEdicion();
                    return;
                }

                const intercambioActualizado = {
                    ...intercambioEnEdicion,
                    ...datosIntercambio
                };

                await actualizarIntercambioBD(intercambioActualizado);

                cancelarEdicion();

                mensaje.textContent = "¡Intercambio actualizado correctamente!";
                mensaje.className = "text-success mt-3";

            } else {
                const nuevoIntercambio = {
                    ...datosIntercambio,
                    usuarioId: usuario.id,
                    fechaCreacion: new Date().toISOString().split("T")[0]
                };

                await guardarIntercambioBD(nuevoIntercambio);

                formulario.reset();

                mensaje.textContent = "¡Intercambio publicado correctamente!";
                mensaje.className = "text-success mt-3";
            }

            await actualizarPagina();

        } catch (error) {
            mensaje.textContent = "No se ha podido guardar el intercambio.";
            mensaje.className = "text-danger mt-3";
            console.error(error);
        }
    });
}

// Cancelar edición
if (botonCancelar) {
    botonCancelar.addEventListener("click", cancelarEdicion);
}

// Dibujar el gráfico circular
function dibujarGrafico(lista) {
    if (!canvas) return;

    const contexto = canvas.getContext("2d");

    const ofertas = lista.filter(
        i => i.tipo === "oferta"
    ).length;

    const peticiones = lista.filter(
        i => i.tipo === "petición"
    ).length;

    const total = ofertas + peticiones;

    contexto.clearRect(0, 0, canvas.width, canvas.height);

    const centroX = 170;
    const centroY = 170;
    const radio = 125;

    if (total === 0) {
        contexto.beginPath();
        contexto.arc(centroX, centroY, radio, 0, Math.PI * 2);
        contexto.fillStyle = "#dce2e9";
        contexto.fill();
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

    // Leyenda del gráfico
    contexto.font = "20px Arial";
    contexto.textAlign = "left";

    contexto.fillStyle = "#198754";
    contexto.fillRect(355, 105, 22, 22);

    contexto.fillStyle = "#20364d";
    contexto.fillText(`Ofertas: ${ofertas}`, 390, 124);

    contexto.fillStyle = "#ffc107";
    contexto.fillRect(355, 165, 22, 22);

    contexto.fillStyle = "#20364d";
    contexto.fillText(`Peticiones: ${peticiones}`, 390, 184);

    contexto.font = "bold 19px Arial";
    contexto.fillText(`Total: ${total}`, 355, 245);
}

// Actualizar tabla y gráfico
async function actualizarPagina() {
    await mostrarIntercambios();
}

// Inicializar la página
async function iniciarPagina() {
    try {
        await cargarDatosIniciales();
        await actualizarPagina();
    } catch (error) {
        console.error("Error al iniciar los intercambios:", error);

        if (mensaje) {
            mensaje.textContent = "No se han podido cargar los intercambios.";
            mensaje.className = "text-danger mt-3";
        }
    }
}

iniciarPagina();

