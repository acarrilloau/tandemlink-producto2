
import { loguearUsuario } from "./almacenaje.js";

// Gestionar el formulario de inicio de sesión
const formularioLogin = document.getElementById("formularioLogin");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const mensaje = document.getElementById("mensajeLogin");

        const accesoCorrecto = loguearUsuario(email, password);

        if (accesoCorrecto) {
            mensaje.textContent = "¡Inicio de sesión correcto!";
            mensaje.className = "text-success mt-3";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } else {
            mensaje.textContent =
                "Correo electrónico o contraseña incorrectos.";

            mensaje.className = "text-danger mt-3";
        }
    });
}
