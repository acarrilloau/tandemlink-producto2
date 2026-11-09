import { usuarios } from "./datos.js";

// =====================================
// ALMACENAMIENTO DE USUARIOS (localStorage)
// =====================================

const CLAVE_USUARIO_ACTIVO = "tandemlink_usuario_activo";

function obtenerUsuarios() {
    const datosGuardados = localStorage.getItem("tandemlink_usuarios");

    if (datosGuardados) {
        return JSON.parse(datosGuardados);
    }

    localStorage.setItem("tandemlink_usuarios", JSON.stringify(usuarios));
    return [...usuarios];
}

function guardarUsuarios(listaUsuarios) {
    localStorage.setItem(
        "tandemlink_usuarios",
        JSON.stringify(listaUsuarios)
    );
}

export function consultarUsuarios() {
    return obtenerUsuarios();
}

export function crearUsuario(usuario) {
    const listaUsuarios = obtenerUsuarios();

    const existe = listaUsuarios.some(
        u => u.email.toLowerCase() === usuario.email.toLowerCase()
    );

    if (existe) return false;

    usuario.id = Date.now();
    listaUsuarios.push(usuario);
    guardarUsuarios(listaUsuarios);

    return true;
}

export function editarUsuario(usuarioActualizado) {
    const listaUsuarios = obtenerUsuarios();

    const existe = listaUsuarios.some(
        u => u.email.toLowerCase() === usuarioActualizado.email.toLowerCase()
            && u.id !== usuarioActualizado.id
    );

    if (existe) return false;

    const indice = listaUsuarios.findIndex(
        u => u.id === usuarioActualizado.id
    );

    if (indice === -1) return false;

    listaUsuarios[indice] = {
        ...listaUsuarios[indice],
        ...usuarioActualizado
    };

    guardarUsuarios(listaUsuarios);

    return true;
}

export function eliminarUsuario(id) {
    const listaUsuarios = obtenerUsuarios();
    const nuevaLista = listaUsuarios.filter(u => u.id !== id);

    guardarUsuarios(nuevaLista);
}

export function obtenerUsuarioActivo() {
    return localStorage.getItem(CLAVE_USUARIO_ACTIVO);
}

export function loguearUsuario(email, password) {
    const listaUsuarios = obtenerUsuarios();

    const usuario = listaUsuarios.find(
        u => u.email.toLowerCase() === email.toLowerCase()
            && u.password === password
    );

    if (!usuario) return false;

    localStorage.setItem(CLAVE_USUARIO_ACTIVO, usuario.email);
    return true;
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO_ACTIVO);
}


// =====================================
// BASE DE DATOS INDEXEDDB
// =====================================

const NOMBRE_BD = "TandemLinkDB";
const VERSION_BD = 2;

// Abrir la base de datos
export function abrirBaseDatos() {
    return new Promise((resolve, reject) => {
        const solicitud = indexedDB.open(NOMBRE_BD, VERSION_BD);

        solicitud.onupgradeneeded = function (evento) {
            const bd = evento.target.result;

            if (!bd.objectStoreNames.contains("intercambios")) {
                bd.createObjectStore("intercambios", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }

            if (!bd.objectStoreNames.contains("seleccionados")) {
                bd.createObjectStore("seleccionados", {
                    keyPath: "id"
                });
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

// Consultar todos los intercambios
export async function consultarIntercambiosBD() {
    const bd = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("intercambios", "readonly");
        const almacen = transaccion.objectStore("intercambios");
        const solicitud = almacen.getAll();

        solicitud.onsuccess = () => resolve(solicitud.result);
        solicitud.onerror = () => reject(solicitud.error);

        transaccion.oncomplete = () => bd.close();
    });
}

// Guardar un intercambio
export async function guardarIntercambioBD(intercambio) {
    const bd = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("intercambios", "readwrite");
        const almacen = transaccion.objectStore("intercambios");

        almacen.add(intercambio);

        transaccion.oncomplete = () => {
            bd.close();
            resolve();
        };

        transaccion.onerror = () => {
            bd.close();
            reject(transaccion.error);
        };
    });
}

// Actualizar un intercambio existente
export async function actualizarIntercambioBD(intercambio) {
    const bd = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("intercambios", "readwrite");
        const almacen = transaccion.objectStore("intercambios");

        almacen.put(intercambio);

        transaccion.oncomplete = () => {
            bd.close();
            resolve();
        };

        transaccion.onerror = () => {
            bd.close();
            reject(transaccion.error);
        };
    });
}

// Eliminar un intercambio
export async function eliminarIntercambioBD(id) {
    const bd = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("intercambios", "readwrite");
        const almacen = transaccion.objectStore("intercambios");

        almacen.delete(id);

        transaccion.oncomplete = () => {
            bd.close();
            resolve();
        };

        transaccion.onerror = () => {
            bd.close();
            reject(transaccion.error);
        };
    });
}


// =====================================
// INTERCAMBIOS SELECCIONADOS
// =====================================

// Consultar los intercambios seleccionados
export async function consultarSeleccionados() {
    const bd = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("seleccionados", "readonly");
        const almacen = transaccion.objectStore("seleccionados");
        const solicitud = almacen.getAll();

        solicitud.onsuccess = () => resolve(solicitud.result);
        solicitud.onerror = () => reject(solicitud.error);

        transaccion.oncomplete = () => bd.close();
    });
}

// Guardar un intercambio seleccionado
export async function guardarSeleccionado(intercambio) {
    const bd = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("seleccionados", "readwrite");
        const almacen = transaccion.objectStore("seleccionados");

        almacen.put(intercambio);

        transaccion.oncomplete = () => {
            bd.close();
            resolve();
        };

        transaccion.onerror = () => {
            bd.close();
            reject(transaccion.error);
        };
    });
}

// Eliminar un intercambio de la selección
export async function eliminarSeleccionado(id) {
    const bd = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("seleccionados", "readwrite");
        const almacen = transaccion.objectStore("seleccionados");

        almacen.delete(id);

        transaccion.oncomplete = () => {
            bd.close();
            resolve();
        };

        transaccion.onerror = () => {
            bd.close();
            reject(transaccion.error);
        };
    });
}
