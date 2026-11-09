
import {
    obtenerUsuarioActivo,
    consultarUsuarios,
    cerrarSesion
} from "./almacenaje.js";

// Mostrar el nombre del usuario activo
export function mostrarUsuarioActivo() {
    const emailActivo = obtenerUsuarioActivo();
    const elemento = document.getElementById("usuarioActivo");
    const botonCerrarSesion = document.getElementById("cerrarSesion");

    if (elemento) {
        if (emailActivo) {
            const usuarios = consultarUsuarios();

            const usuario = usuarios.find(
                u => u.email.toLowerCase() === emailActivo.toLowerCase()
            );

            elemento.textContent = usuario
                ? usuario.nombre
                : "-no login-";
        } else {
            elemento.textContent = "-no login-";
        }
    }

    if (botonCerrarSesion) {
        botonCerrarSesion.hidden = !emailActivo;
    }
}

// Cerrar la sesión del usuario
export function gestionarCierreSesion() {
    const boton = document.getElementById("cerrarSesion");

    if (boton) {
        boton.addEventListener("click", function () {
            cerrarSesion();
            window.location.href = "index.html";
        });
    }
}

// Ejecutar las funciones al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    mostrarUsuarioActivo();
    gestionarCierreSesion();
});
