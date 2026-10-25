/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini
   - Prompt 1: "Importa los módulos necesarios y captura las referencias del DOM para el formulario de login."
   - Prompt 2: "Añade un event listener 'submit' para prevenir la recarga de la página y capturar las credenciales."
   - Prompt 3: "Utiliza el método .find() para comprobar si existe un usuario con ese email y contraseña."
   - Prompt 4: "Implementa la lógica para guardar la sesión en sessionStorage en caso de éxito o mostrar un error si falla."
   ========================================================================== */

// Importamos los datos de usuarios y la función para actualizar la navegación.
import { usuarios } from "./datos.js";
import { actualizarNavegacion } from "./navegacion.js";

// Buscamos el formulario y sus elementos.
const formulario = document.getElementById("formularioLogin");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");
const mensaje = document.getElementById("mensajeLogin");

// Escuchamos el envío del formulario.
formulario.addEventListener("submit", function (evento) {
    // Evitamos que la página se recargue al enviar el formulario.
    evento.preventDefault();

    // Obtenemos los valores introducidos por el usuario.
    const email = campoEmail.value.trim();
    const password = campoPassword.value;

    // Buscamos un usuario con ese correo y contraseña.
    const usuarioEncontrado = usuarios.find(function (usuario) {
        return usuario.email === email &&
               usuario.password === password;
    });

    // Comprobamos si las credenciales son correctas.
    if (usuarioEncontrado) {
        mensaje.textContent = "¡Bienvenido/a, " + usuarioEncontrado.nombre + "!";
        mensaje.className = "alert alert-success mb-3";

        // Guardamos los datos básicos del usuario conectado.
        sessionStorage.setItem(
            "usuarioConectado",
            JSON.stringify({
                id: usuarioEncontrado.id,
                nombre: usuarioEncontrado.nombre,
                email: usuarioEncontrado.email
            })
        );
        actualizarNavegacion();
    } else {
        // Eliminamos una posible sesión anterior.
        sessionStorage.removeItem("usuarioConectado");

        mensaje.textContent = "Correo electrónico o contraseña incorrectos.";
        mensaje.className = "alert alert-danger mb-3";
    }
});