
/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: ChatGPT
   - Prompt 1: "Adapta navegacion.js para utilizar DOMContentLoaded,
     mostrar el nombre del usuario conectado o '-no login-' y mantener
     la funcionalidad de inicio y cierre de sesión mediante almacenaje.js"
   ========================================================================== */

// Importamos las funciones de almacenamiento.
import {
    obtenerUsuarioConectado,
    obtenerUsuarioPorEmail,
    cerrarSesion
} from "./almacenaje.js";

// Buscamos el menú principal.
const menuPrincipal = document.querySelector("#menuPrincipal .navbar-nav");

export function mostrarUsuarioActivo() {
    // Comprobamos que exista el menú principal.
    if (!menuPrincipal) {
        return;
    }

    // Eliminamos los elementos dinámicos anteriores.
    const idsElementos = [
        "usuarioConectadoMenu",
        "cerrarSesionMenu",
        "iniciarSesionMenu"
    ];

    idsElementos.forEach(function (id) {
        document.getElementById(id)?.remove();
    });

    // Recuperamos el correo del usuario conectado.
    const emailUsuario = obtenerUsuarioConectado();
    const usuario = emailUsuario
        ? obtenerUsuarioPorEmail(emailUsuario)
        : null;

    // Creamos el elemento que mostrará el usuario activo.
    const elementoUsuario = document.createElement("li");
    elementoUsuario.id = "usuarioConectadoMenu";
    elementoUsuario.className = "nav-item";

    const nombreUsuario = document.createElement("span");
    nombreUsuario.className = "nav-link text-white";

    if (usuario) {
        // Mostramos el nombre del usuario conectado.
        nombreUsuario.textContent = usuario.nombre || usuario.email;

        // Eliminamos el enlace fijo de inicio de sesión del HTML.
        const enlacesLogin = menuPrincipal.querySelectorAll(
            'a[href="login.html"]'
        );

        enlacesLogin.forEach(function (enlace) {
            enlace.closest(".nav-item")?.remove();
        });

        // Añadimos el elemento del usuario al menú.
        elementoUsuario.appendChild(nombreUsuario);
        menuPrincipal.appendChild(elementoUsuario);

        // Añadimos la opción de cerrar sesión.
        const elementoCerrarSesion = document.createElement("li");
        elementoCerrarSesion.id = "cerrarSesionMenu";
        elementoCerrarSesion.className = "nav-item";

        const botonCerrarSesion = document.createElement("button");
        botonCerrarSesion.type = "button";
        botonCerrarSesion.className =
            "nav-link btn btn-link text-white";
        botonCerrarSesion.textContent = "Cerrar sesión";

        botonCerrarSesion.addEventListener("click", function () {
            // Eliminamos la sesión.
            cerrarSesion();

            // Actualizamos el menú.
            mostrarUsuarioActivo();

            // Si estamos en el login, recargamos la página.
            if (window.location.pathname.endsWith("/login.html")) {
                window.location.reload();
            }
        });

        elementoCerrarSesion.appendChild(botonCerrarSesion);
        menuPrincipal.appendChild(elementoCerrarSesion);

    } else {
        // Si existe una sesión inválida, la eliminamos.
        if (emailUsuario) {
            cerrarSesion();
        }

        // Mostramos que no hay ningún usuario conectado.
        nombreUsuario.textContent = "-no login-";
        elementoUsuario.appendChild(nombreUsuario);
        menuPrincipal.appendChild(elementoUsuario);

        // Mostramos el enlace de inicio de sesión.
        mostrarEnlaceLogin();
    }
}

// Mantenemos este nombre para no romper las importaciones existentes.
export const actualizarNavegacion = mostrarUsuarioActivo;

function mostrarEnlaceLogin() {
    // Comprobamos que exista el menú.
    if (!menuPrincipal) {
        return;
    }

    // Evitamos duplicar el enlace.
    if (document.getElementById("iniciarSesionMenu")) {
        return;
    }

    // Eliminamos posibles enlaces fijos del HTML.
    const enlacesLogin = menuPrincipal.querySelectorAll(
        'a[href="login.html"]'
    );

    enlacesLogin.forEach(function (enlace) {
        enlace.closest(".nav-item")?.remove();
    });

    // Creamos el enlace de inicio de sesión.
    const elementoLogin = document.createElement("li");
    elementoLogin.id = "iniciarSesionMenu";
    elementoLogin.className = "nav-item";

    const enlaceLogin = document.createElement("a");
    enlaceLogin.className = "nav-link";
    enlaceLogin.href = "login.html";
    enlaceLogin.textContent = "Iniciar sesión";

    elementoLogin.appendChild(enlaceLogin);
    menuPrincipal.appendChild(elementoLogin);
}

// Esperamos a que el documento esté cargado.
document.addEventListener("DOMContentLoaded", mostrarUsuarioActivo);

// Escuchamos cambios de almacenamiento procedentes de otras pestañas.
window.addEventListener("storage", mostrarUsuarioActivo);