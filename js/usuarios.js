
import {
    obtenerUsuarioActivo,
    consultarUsuarios,
    crearUsuario,
    editarUsuario,
    eliminarUsuario
} from "./almacenaje.js";

// Elementos de la página
const formulario = document.getElementById("formularioUsuario");
const tablaUsuarios = document.getElementById("tablaUsuarios");
const mensaje = document.getElementById("mensajeUsuario");

const tituloFormulario = document.getElementById("tituloFormularioUsuario");
const botonGuardar = document.getElementById("botonGuardarUsuario");
const botonCancelar = document.getElementById("cancelarEdicion");

// Usuario que estamos editando
let usuarioEnEdicion = null;

// Obtener el usuario que tiene la sesión iniciada
function obtenerUsuarioSesion() {
    const emailActivo = obtenerUsuarioActivo();

    if (!emailActivo) return null;

    return consultarUsuarios().find(
        usuario => usuario.email.toLowerCase() === emailActivo.toLowerCase()
    ) || null;
}

// Comprobar si el usuario activo es propietario del perfil
function esPropietario(usuario) {
    const usuarioActivo = obtenerUsuarioSesion();

    return usuarioActivo !== null && usuarioActivo.id === usuario.id;
}

// Mostrar los usuarios en la tabla
function mostrarUsuarios() {
    if (!tablaUsuarios) return;

    const usuarios = consultarUsuarios();
    tablaUsuarios.innerHTML = "";

    usuarios.forEach(usuario => {
        const fila = document.createElement("tr");

        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = usuario.nombre;

        const celdaEmail = document.createElement("td");
        celdaEmail.textContent = usuario.email;

        const celdaPassword = document.createElement("td");
        celdaPassword.textContent = "••••••••";

        const celdaAcciones = document.createElement("td");

        if (esPropietario(usuario)) {
            const grupoBotones = document.createElement("div");
            grupoBotones.className = "d-flex gap-2";

            // Botón editar
            const botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";
            botonEditar.className = "btn btn-warning btn-sm btn-editar";

            botonEditar.addEventListener("click", function () {
                if (!esPropietario(usuario)) {
                    mensaje.textContent = "Solo puedes editar tu propio perfil.";
                    mensaje.className = "text-danger mt-3";
                    return;
                }

                usuarioEnEdicion = usuario.id;

                document.getElementById("nombre").value = usuario.nombre;
                document.getElementById("email").value = usuario.email;
                document.getElementById("password").value = "";

                tituloFormulario.textContent = "Editar usuario";
                botonGuardar.textContent = "Guardar cambios";
                botonCancelar.hidden = false;

                mensaje.textContent = "Modifica los datos de tu perfil.";
                mensaje.className = "text-dark mt-3";

                formulario.scrollIntoView({ behavior: "smooth" });
            });

            // Botón eliminar
            const botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.className = "btn btn-danger btn-sm btn-eliminar";

            botonEliminar.addEventListener("click", function () {
                if (!esPropietario(usuario)) {
                    mensaje.textContent = "Solo puedes eliminar tu propio perfil.";
                    mensaje.className = "text-danger mt-3";
                    return;
                }

                const confirmar = confirm(
                    "¿Quieres eliminar tu propio perfil?"
                );

                if (confirmar) {
                    eliminarUsuario(usuario.id);

                    if (usuarioEnEdicion === usuario.id) {
                        cancelarEdicion();
                    }

                    mostrarUsuarios();
                }
            });

            grupoBotones.appendChild(botonEditar);
            grupoBotones.appendChild(botonEliminar);
            celdaAcciones.appendChild(grupoBotones);

        } else {
            celdaAcciones.textContent = "Sin permisos";
        }

        fila.appendChild(celdaNombre);
        fila.appendChild(celdaEmail);
        fila.appendChild(celdaPassword);
        fila.appendChild(celdaAcciones);

        tablaUsuarios.appendChild(fila);
    });
}

// Volver al modo de registro
function cancelarEdicion() {
    usuarioEnEdicion = null;

    formulario.reset();

    tituloFormulario.textContent = "Registrar nuevo usuario";
    botonGuardar.textContent = "Registrar usuario";
    botonCancelar.hidden = true;

    mensaje.textContent = "";
}

// Registrar o editar usuario
if (formulario) {
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        let resultado;

        if (usuarioEnEdicion !== null) {

            const usuarioOriginal = consultarUsuarios().find(
                usuario => usuario.id === usuarioEnEdicion
            );

            if (!usuarioOriginal || !esPropietario(usuarioOriginal)) {
                mensaje.textContent = "No tienes permiso para editar este perfil.";
                mensaje.className = "text-danger mt-3";
                cancelarEdicion();
                return;
            }

            const usuarioActualizado = {
                id: usuarioEnEdicion,
                nombre,
                email
            };

            if (password !== "") {
                usuarioActualizado.password = password;
            }

            resultado = editarUsuario(usuarioActualizado);

        } else {
            // Se mantiene el registro de nuevas cuentas
            // para que cualquier visitante pueda registrarse.
            const usuario = {
                nombre,
                email,
                password
            };

            resultado = crearUsuario(usuario);
        }

        if (resultado) {
            mensaje.textContent = usuarioEnEdicion !== null
                ? "Usuario actualizado correctamente."
                : "Usuario registrado correctamente.";

            mensaje.className = "text-success mt-3";

            cancelarEdicion();
            mostrarUsuarios();

        } else {
            mensaje.textContent = "Ya existe otro usuario con ese correo.";
            mensaje.className = "text-danger mt-3";
        }
    });
}

// Cancelar edición
if (botonCancelar) {
    botonCancelar.addEventListener("click", cancelarEdicion);
}

// Mostrar usuarios al cargar la página
mostrarUsuarios();
