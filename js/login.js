
/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: ChatGPT
   - Prompt 1: "Adapta login.js para crear una función loguearUsuario(),
     gestionar el inicio de sesión mediante localStorage y configurar
     los eventos click y submit sin duplicar la autenticación."
   ========================================================================== */

// Importamos las funciones de almacenamiento y navegación.
import {
    inicializarAlmacenamiento,
    obtenerUsuarioPorEmail,
    guardarUsuarioConectado,
    cerrarSesion
} from "./almacenaje.js";

import { mostrarUsuarioActivo } from "./navegacion.js";

// Buscamos el formulario y sus elementos.
const formulario = document.getElementById("formularioLogin");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");
const botonLogin = document.getElementById("loginButton");
const mensaje = document.getElementById("mensajeLogin");

// Función para mostrar mensajes en el formulario.
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "alert alert-" + tipo + " mb-3";
}

// Función que gestiona el inicio de sesión.
async function loguearUsuario(email, password) {
    try {
        // Inicializamos el almacenamiento.
        await inicializarAlmacenamiento();

        // Buscamos un usuario con ese correo.
        const usuarioEncontrado = obtenerUsuarioPorEmail(email);

        // Comprobamos si las credenciales son correctas.
        if (usuarioEncontrado && usuarioEncontrado.password === password) {
            // Guardamos el correo del usuario conectado.
            guardarUsuarioConectado(usuarioEncontrado.email);

            // Mostramos un mensaje de bienvenida.
            mostrarMensaje(
                "¡Bienvenido/a, " + usuarioEncontrado.nombre + "!",
                "success"
            );

            // Actualizamos la navegación.
            mostrarUsuarioActivo();

        } else {
            // Eliminamos una posible sesión anterior.
            cerrarSesion();

            mostrarMensaje(
                "Correo electrónico o contraseña incorrectos.",
                "danger"
            );

            mostrarUsuarioActivo();
        }

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        mostrarMensaje("No se ha podido iniciar sesión.", "danger");
    }
}

// Esperamos a que el documento esté preparado.
document.addEventListener("DOMContentLoaded", function () {

    // Evento click del botón de inicio de sesión.
    botonLogin.addEventListener("click", function (evento) {
        // Evitamos que el botón envíe también el formulario.
        evento.preventDefault();

        const email = campoEmail.value.trim();
        const password = campoPassword.value;

        loguearUsuario(email, password);
    });

    // Evento submit del formulario, por ejemplo al pulsar Enter.
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const email = campoEmail.value.trim();
        const password = campoPassword.value;

        loguearUsuario(email, password);
    });
});