/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini
   - Prompt 1: "Crea una función para renderizar dinámicamente los usuarios en una tabla HTML con botones de eliminación."
   - Prompt 2: "Añade un event listener 'submit' para validar correos duplicados y registrar nuevos usuarios con un ID autoincremental."
   - Prompt 3: "Implementa la lógica para eliminar un usuario de forma segura comprobando su índice en el array."
   - Prompt 4: "Comprueba si el usuario eliminado tiene una sesión activa en sessionStorage para cerrarla y actualizar la navegación."
   ========================================================================== */
   
// Importamos los datos de usuarios y la función para actualizar la navegación.
import { usuarios } from "./datos.js";
import { actualizarNavegacion } from "./navegacion.js";

// Elementos del formulario y de la tabla.
const formulario = document.getElementById("formularioUsuario");
const campoNombre = document.getElementById("nombre");
const campoEmail = document.getElementById("emailUsuario");
const campoPassword = document.getElementById("passwordUsuario");
const mensaje = document.getElementById("mensajeUsuario");
const listaUsuarios = document.getElementById("listaUsuarios");
const mensajeListaVacia = document.getElementById("mensajeListaVacia");

// Mostramos los usuarios en la tabla.
function mostrarUsuarios() {
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

        // Insertamos los textos como texto, no como HTML.
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

    // Añadimos el nuevo usuario al array.
    usuarios.push({
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
listaUsuarios.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[data-id]");

    if (!boton) {
        return;
    }

    const id = Number(boton.dataset.id);

    const indice = usuarios.findIndex(function (usuario) {
        return usuario.id === id;
    });

    if (indice === -1) {
        return;
    }

    const confirmar = window.confirm(
        "¿Seguro que quieres eliminar este usuario?"
    );

    if (!confirmar) {
        return;
    }

    // Comprobamos si el usuario eliminado tiene la sesión activa.
    const datosSesion = sessionStorage.getItem("usuarioConectado");

    if (datosSesion) {
        try {
            const usuarioConectado = JSON.parse(datosSesion);

            if (usuarioConectado.id === id) {
                sessionStorage.removeItem("usuarioConectado");
            }
        } catch (error) {
            // Si la sesión no es válida, la eliminamos.
            sessionStorage.removeItem("usuarioConectado");
        }
    }

    // Eliminamos al usuario del array.
    usuarios.splice(indice, 1);

    mostrarUsuarios();
    mostrarMensaje("Usuario eliminado correctamente.", "success");

    // Actualizamos el menú después de la eliminación.
    actualizarNavegacion();
});

// Cargamos los usuarios iniciales.
mostrarUsuarios();