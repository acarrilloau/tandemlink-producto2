/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: ChatGPT
   - Prompt 1: "Adapta login.js para consultar los usuarios desde localStorage
     y guardar el correo del usuario conectado mediante almacenaje.js."
   ========================================================================== */

// Importamos las funciones de almacenamiento y navegación.
import {
    inicializarAlmacenamiento,
    obtenerUsuarioPorEmail,
    guardarUsuarioConectado,
    cerrarSesion
} from "./almacenaje.js";

import { actualizarNavegacion } from "./navegacion.js";

// Buscamos el formulario y sus elementos.
const formulario = document.getElementById("formularioLogin");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");
const mensaje = document.getElementById("mensajeLogin");

// Escuchamos el envío del formulario.
formulario.addEventListener("submit", async function (evento) {
    // Evitamos que la página se recargue al enviar el formulario.
    evento.preventDefault();

    // Obtenemos los valores introducidos por el usuario.
    const email = campoEmail.value.trim();
    const password = campoPassword.value;

    try {
        // Inicializamos el almacenamiento.
        await inicializarAlmacenamiento();

        // Buscamos un usuario con ese correo.
        const usuarioEncontrado = obtenerUsuarioPorEmail(email);

        // Comprobamos si las credenciales son correctas.
        if (usuarioEncontrado && usuarioEncontrado.password === password) {
            mensaje.textContent = "¡Bienvenido/a, " + usuarioEncontrado.nombre + "!";
            mensaje.className = "alert alert-success mb-3";

            // Guardamos el correo del usuario conectado.
            guardarUsuarioConectado(usuarioEncontrado.email);

            actualizarNavegacion();
        } else {
            // Eliminamos una posible sesión anterior.
            cerrarSesion();

            mensaje.textContent = "Correo electrónico o contraseña incorrectos.";
            mensaje.className = "alert alert-danger mb-3";

            actualizarNavegacion();
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);

        mensaje.textContent = "No se ha podido iniciar sesión.";
        mensaje.className = "alert alert-danger mb-3";
    }
});