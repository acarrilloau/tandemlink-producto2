/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: ChatGPT
   - Prompt 1: "Adapta usuarios.js para gestionar el registro, la visualización y la eliminación de usuarios mediante las funciones de almacenaje.js y localStorage, incluyendo el cierre de sesión si se elimina el usuario conectado."
   - Prompt 2: ""
   ========================================================================== */
   
// Importamos las funciones de almacenamiento y navegación.
import {
    inicializarAlmacenamiento,
    obtenerUsuarios,
    guardarUsuario,
    eliminarUsuario,
    obtenerUsuarioConectado,
    cerrarSesion
} from "./almacenaje.js";

import { actualizarNavegacion } from "./navegacion.js";

// Elementos del formulario y de la tabla.
const formulario = document.getElementById("formularioUsuario");
const campoNombre = document.getElementById("nombre");
const campoEmail = document.getElementById("emailUsuario");
const campoPassword = document.getElementById("passwordUsuario");
const mensaje = document.getElementById("mensajeUsuario");
const listaUsuarios = document.getElementById("listaUsuarios");
const mensajeListaVacia = document.getElementById("mensajeListaVacia");

// Mostramos los usuarios guardados.
function mostrarUsuarios() {
    const usuarios = obtenerUsuarios();

    listaUsuarios.innerHTML = "";

    usuarios.forEach(function (usuario) {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${usuario.id}</td>
            <td></td>
            <td></td>
            <td>
                <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    data-id="${usuario.id}"
                >
                    Eliminar
                </button>
            </td>
        `;

        fila.children[1].textContent = usuario.nombre;
        fila.children[2].textContent = usuario.email;

        listaUsuarios.appendChild(fila);
    });

    mensajeListaVacia.textContent = usuarios.length === 0
        ? "Todavía no hay usuarios registrados."
        : "";
}

// Mostramos un mensaje al usuario.
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo} mt-3`;
}

// Registramos un usuario al enviar el formulario.
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = campoNombre.value.trim();
    const email = campoEmail.value.trim();
    const password = campoPassword.value;

    const usuarios = obtenerUsuarios();

    // Comprobamos que el correo no esté registrado.
    const correoExiste = usuarios.some(function (usuario) {
        return usuario.email.toLowerCase() === email.toLowerCase();
    });

    if (correoExiste) {
        mostrarMensaje("Ya existe un usuario con ese correo electrónico.", "danger");
        return;
    }

    // Generamos un identificador nuevo.
    const nuevoId = usuarios.length > 0
        ? Math.max(...usuarios.map(function (usuario) {
            return usuario.id;
        })) + 1
        : 1;

    // Guardamos el nuevo usuario en localStorage.
    guardarUsuario({
        id: nuevoId,
        nombre: nombre,
        email: email,
        password: password
    });

    mostrarUsuarios();
    formulario.reset();

    mostrarMensaje("Usuario registrado correctamente.", "success");
});

// Gestionamos los clics en los botones de eliminar.
listaUsuarios.addEventListener("click", async function (evento) {
    const boton = evento.target.closest("button[data-id]");

    if (!boton) {
        return;
    }

    const id = Number(boton.dataset.id);

    const usuario = obtenerUsuarios().find(function (usuario) {
        return usuario.id === id;
    });

    if (!usuario) {
        return;
    }

    const confirmar = window.confirm(
        "¿Seguro que quieres eliminar este usuario?"
    );

    if (!confirmar) {
        return;
    }

    // Comprobamos si el usuario eliminado tiene la sesión activa.
    const emailConectado = obtenerUsuarioConectado();

    if (emailConectado &&
        emailConectado.toLowerCase() === usuario.email.toLowerCase()) {
        cerrarSesion();
    }

    // Eliminamos el usuario de localStorage.
    eliminarUsuario(id);

    mostrarUsuarios();
    mostrarMensaje("Usuario eliminado correctamente.", "success");

    actualizarNavegacion();
});

// Inicializamos el almacenamiento antes de mostrar los usuarios.
async function iniciarPagina() {
    try {
        await inicializarAlmacenamiento();
        mostrarUsuarios();
    } catch (error) {
        console.error("Error al inicializar el almacenamiento:", error);
        mostrarMensaje("No se han podido cargar los usuarios.", "danger");
    }
}

iniciarPagina();