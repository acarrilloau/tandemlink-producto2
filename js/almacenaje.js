/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: ChatGPT
   - Prompt 1: "Crea la estructura inicial de un módulo JavaScript llamado almacenaje.js que importe los datos iniciales de usuarios e intercambios, inicialice localStorage para guardar los usuarios y utilice IndexedDB para crear una base de datos con dos almacenes: intercambios y seleccionados. Carga los intercambios iniciales al crear la base de datos."
   - Prompt 2: "Crea funciones en JavaScript para gestionar usuarios mediante localStorage: consultar todos los usuarios, guardar uno nuevo, eliminarlo por ID, buscarlo por correo electrónico y gestionar la sesión del usuario conectado."
   - Prompt 3: "Crea funciones JavaScript asíncronas para gestionar intercambios mediante IndexedDB: obtener todos los intercambios, guardar uno nuevo, eliminarlo por ID y buscarlo por ID. Utiliza Promises para gestionar las operaciones."
   - Prompt 4: "Crea funciones para guardar, consultar y eliminar intercambios seleccionados en IndexedDB."
   ========================================================================== */

// Importamos los datos iniciales.
import { usuarios, intercambios } from "./datos.js";

// Claves de almacenamiento.
const claveUsuarios = "usuarios";
const claveUsuarioConectado = "usuarioConectado";

// Inicializamos localStorage e IndexedDB.
export async function inicializarAlmacenamiento() {

    // Guardamos los usuarios iniciales solo la primera vez.
    if (localStorage.getItem(claveUsuarios) === null) {
        localStorage.setItem(claveUsuarios, JSON.stringify(usuarios));
    }

    // Abrimos la base de datos.
    return await abrirBaseDatos();
}

// Abrimos o creamos la base de datos.
function abrirBaseDatos() {

    return new Promise(function (resolve, reject) {

        const solicitud = indexedDB.open("TandemLink", 1);

        solicitud.onupgradeneeded = function (evento) {

            const baseDatos = evento.target.result;

            // Almacenamiento de intercambios.
            if (!baseDatos.objectStoreNames.contains("intercambios")) {
                const almacenIntercambios = baseDatos.createObjectStore(
                    "intercambios",
                    { keyPath: "id" }
                );

                // Cargamos los intercambios iniciales.
                intercambios.forEach(function (intercambio) {
                    almacenIntercambios.add(intercambio);
                });
            }

            // Almacenamiento de intercambios seleccionados.
            if (!baseDatos.objectStoreNames.contains("seleccionados")) {
                baseDatos.createObjectStore(
                    "seleccionados",
                    { keyPath: "id" }
                );
            }
        };

        solicitud.onsuccess = function () {
            resolve(solicitud.result);
        };

        solicitud.onerror = function () {
            reject(solicitud.error);
        };
    });
}
// Obtenemos todos los usuarios.
export function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem(claveUsuarios)) || [];
}

// Guardamos un usuario nuevo.
export function guardarUsuario(usuario) {
    const usuariosGuardados = obtenerUsuarios();

    usuariosGuardados.push(usuario);

    localStorage.setItem(
        claveUsuarios,
        JSON.stringify(usuariosGuardados)
    );
}

// Eliminamos un usuario por su ID.
export function eliminarUsuario(id) {
    const usuariosGuardados = obtenerUsuarios();

    const usuariosActualizados = usuariosGuardados.filter(function (usuario) {
        return usuario.id !== id;
    });

    localStorage.setItem(
        claveUsuarios,
        JSON.stringify(usuariosActualizados)
    );
}

// Buscamos un usuario por su correo.
export function obtenerUsuarioPorEmail(email) {
    return obtenerUsuarios().find(function (usuario) {
        return usuario.email.toLowerCase() === email.toLowerCase();
    });
}

// Guardamos el correo del usuario conectado.
export function guardarUsuarioConectado(email) {
    localStorage.setItem(claveUsuarioConectado, email);
}

// Obtenemos el correo del usuario conectado.
export function obtenerUsuarioConectado() {
    return localStorage.getItem(claveUsuarioConectado);
}

// Cerramos la sesión.
export function cerrarSesion() {
    localStorage.removeItem(claveUsuarioConectado);
}
// Obtenemos todos los intercambios.
export async function obtenerIntercambios() {
    const baseDatos = await abrirBaseDatos();

    return new Promise(function (resolve, reject) {
        const transaccion = baseDatos.transaction("intercambios", "readonly");
        const almacen = transaccion.objectStore("intercambios");
        const solicitud = almacen.getAll();

        solicitud.onsuccess = function () {
            resolve(solicitud.result);
        };

        solicitud.onerror = function () {
            reject(solicitud.error);
        };
    });
}

// Guardamos un intercambio.
export async function guardarIntercambio(intercambio) {
    const baseDatos = await abrirBaseDatos();

    return new Promise(function (resolve, reject) {
        const transaccion = baseDatos.transaction("intercambios", "readwrite");
        const almacen = transaccion.objectStore("intercambios");
        const solicitud = almacen.put(intercambio);

        solicitud.onsuccess = function () {
            resolve();
        };

        solicitud.onerror = function () {
            reject(solicitud.error);
        };
    });
}

// Eliminamos un intercambio por su ID.
export async function eliminarIntercambio(id) {
    const baseDatos = await abrirBaseDatos();

    return new Promise(function (resolve, reject) {
        const transaccion = baseDatos.transaction("intercambios", "readwrite");
        const almacen = transaccion.objectStore("intercambios");
        const solicitud = almacen.delete(id);

        solicitud.onsuccess = function () {
            resolve();
        };

        solicitud.onerror = function () {
            reject(solicitud.error);
        };
    });
}

// Buscamos un intercambio por su ID.
export async function obtenerIntercambioPorId(id) {
    const baseDatos = await abrirBaseDatos();

    return new Promise(function (resolve, reject) {
        const transaccion = baseDatos.transaction("intercambios", "readonly");
        const almacen = transaccion.objectStore("intercambios");
        const solicitud = almacen.get(id);

        solicitud.onsuccess = function () {
            resolve(solicitud.result);
        };

        solicitud.onerror = function () {
            reject(solicitud.error);
        };
    });
}
// Obtenemos los intercambios seleccionados.
export async function obtenerSeleccionados() {
    const baseDatos = await abrirBaseDatos();

    return new Promise(function (resolve, reject) {
        const transaccion = baseDatos.transaction("seleccionados", "readonly");
        const almacen = transaccion.objectStore("seleccionados");
        const solicitud = almacen.getAll();

        solicitud.onsuccess = function () {
            resolve(solicitud.result);
        };

        solicitud.onerror = function () {
            reject(solicitud.error);
        };
    });
}

// Guardamos un intercambio seleccionado.
export async function guardarSeleccionado(intercambio) {
    const baseDatos = await abrirBaseDatos();

    return new Promise(function (resolve, reject) {
        const transaccion = baseDatos.transaction("seleccionados", "readwrite");
        const almacen = transaccion.objectStore("seleccionados");
        const solicitud = almacen.put(intercambio);

        solicitud.onsuccess = function () {
            resolve();
        };

        solicitud.onerror = function () {
            reject(solicitud.error);
        };
    });
}

// Eliminamos un intercambio seleccionado.
export async function eliminarSeleccionado(id) {
    const baseDatos = await abrirBaseDatos();

    return new Promise(function (resolve, reject) {
        const transaccion = baseDatos.transaction("seleccionados", "readwrite");
        const almacen = transaccion.objectStore("seleccionados");
        const solicitud = almacen.delete(id);

        solicitud.onsuccess = function () {
            resolve();
        };

        solicitud.onerror = function () {
            reject(solicitud.error);
        };
    });
}