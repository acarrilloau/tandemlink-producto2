/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini
   - Prompt 1: "Crea una función para limpiar los elementos dinámicos previos del menú de navegación."
   - Prompt 2: "Comprueba si existe sesión en sessionStorage y parsea los datos para inyectar el correo del usuario."
   - Prompt 3: "Añade un botón interactivo de cerrar sesión con un event listener para limpiar el almacenamiento."
   - Prompt 4: "Implementa una función auxiliar para mostrar el enlace de inicio de sesión si no hay usuario autenticado."
   ========================================================================== */



const menuPrincipal = document.querySelector("#menuPrincipal .navbar-nav");

export function actualizarNavegacion() {
    // Comprobamos que exista el menú principal.
    if (!menuPrincipal) {
        return;
    }

    // Eliminamos los elementos dinámicos anteriores.
    const elementoAnterior = document.getElementById("usuarioConectadoMenu");
    if (elementoAnterior) {
        elementoAnterior.remove();
    }

    const elementoCerrarSesionAnterior =
        document.getElementById("cerrarSesionMenu");

    if (elementoCerrarSesionAnterior) {
        elementoCerrarSesionAnterior.remove();
    }

    const elementoLoginAnterior =
        document.getElementById("iniciarSesionMenu");

    if (elementoLoginAnterior) {
        elementoLoginAnterior.remove();
    }

    // Recuperamos los datos de la sesión.
    const datosUsuario = sessionStorage.getItem("usuarioConectado");

    if (datosUsuario) {
        try {
            const usuario = JSON.parse(datosUsuario);

            // Eliminamos el enlace fijo de inicio de sesión del HTML.
            const enlacesLogin = menuPrincipal.querySelectorAll(
                'a[href="login.html"]'
            );

            enlacesLogin.forEach(function (enlace) {
                enlace.closest(".nav-item")?.remove();
            });

            // Mostramos el correo del usuario conectado.
            const elementoUsuario = document.createElement("li");
            elementoUsuario.id = "usuarioConectadoMenu";
            elementoUsuario.className = "nav-item";

            const correoUsuario = document.createElement("span");
            correoUsuario.className = "nav-link text-white";
            correoUsuario.textContent = usuario.email;

            elementoUsuario.appendChild(correoUsuario);
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
                sessionStorage.removeItem("usuarioConectado");

                // Actualizamos el menú.
                actualizarNavegacion();

                // Si estamos en el login, limpiamos el mensaje anterior.
                if (window.location.pathname.endsWith("/login.html")) {
                    window.location.reload();
                }
            });

            elementoCerrarSesion.appendChild(botonCerrarSesion);
            menuPrincipal.appendChild(elementoCerrarSesion);

        } catch (error) {
            // Si los datos de sesión no son válidos, los eliminamos.
            sessionStorage.removeItem("usuarioConectado");
            mostrarEnlaceLogin();
        }
    } else {
        // No hay sesión: mostramos un único enlace de inicio de sesión.
        mostrarEnlaceLogin();
    }
}

function mostrarEnlaceLogin() {
    // Comprobamos que exista el menú.
    if (!menuPrincipal) {
        return;
    }

    // Evitamos duplicar el enlace dinámico.
    if (document.getElementById("iniciarSesionMenu")) {
        return;
    }

    // Eliminamos posibles enlaces fijos de inicio de sesión del HTML.
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

// Comprobamos la sesión al cargar la página.
actualizarNavegacion();

// Escuchamos cambios de almacenamiento procedentes de otras pestañas.
window.addEventListener("storage", actualizarNavegacion);
