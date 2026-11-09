
import { intercambios as datosIniciales } from "./datos.js";

import {
    consultarUsuarios,
    consultarIntercambiosBD,
    guardarIntercambioBD,
    consultarSeleccionados,
    guardarSeleccionado,
    eliminarSeleccionado
} from "./almacenaje.js";

// Elementos del HTML
const contenedorTarjetas = document.getElementById("tarjetasIntercambios");
const zonaSeleccion = document.getElementById("zonaSeleccion");
const filtroTipo = document.getElementById("filtroTipo");
const ordenFecha = document.getElementById("ordenFecha");

// Inicializar los intercambios si IndexedDB está vacía
async function inicializarIntercambios() {
    let lista = await consultarIntercambiosBD();

    if (lista.length === 0) {
        for (const intercambio of datosIniciales) {
            await guardarIntercambioBD(intercambio);
        }

        lista = await consultarIntercambiosBD();
    }

    return lista;
}

// Mostrar las tarjetas de intercambios
async function mostrarIntercambios() {
    let lista = await consultarIntercambiosBD();

    const tipoSeleccionado = filtroTipo.value;
    const ordenSeleccionado = ordenFecha.value;

    // Aplicar filtro
    if (tipoSeleccionado !== "todos") {
        lista = lista.filter(
            intercambio => intercambio.tipo === tipoSeleccionado
        );
    }

    // Aplicar ordenación
    lista.sort((a, b) => {
        const fechaA = new Date(a.fechaCreacion);
        const fechaB = new Date(b.fechaCreacion);

        return ordenSeleccionado === "antiguos"
            ? fechaA - fechaB
            : fechaB - fechaA;
    });

    const usuarios = await consultarUsuarios();

    contenedorTarjetas.innerHTML = "";

    if (lista.length === 0) {
        contenedorTarjetas.textContent = "No hay intercambios disponibles.";
        return;
    }

    // Recorrer todos los intercambios
    lista.forEach(intercambio => {
        const usuario = usuarios.find(
            u => u.id === intercambio.usuarioId
        );

        const tarjeta = document.createElement("article");
        const claseTipo = intercambio.tipo
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        tarjeta.className = `exchange-card ${claseTipo}`;
        tarjeta.draggable = true;
        tarjeta.dataset.id = intercambio.id;

        // Cabecera de la tarjeta
        const cabecera = document.createElement("div");
        cabecera.className = "exchange-card-header";
        cabecera.textContent = intercambio.tipo === "oferta"
            ? "Oferta de intercambio"
            : "Petición de intercambio";

        // Cuerpo de la tarjeta
        const cuerpo = document.createElement("div");
        cuerpo.className = "exchange-card-body";

        const usuarioTexto = document.createElement("p");
        usuarioTexto.textContent =
            `Usuario: ${usuario?.nombre || "Usuario desconocido"}`;

        const idiomas = document.createElement("p");
        idiomas.textContent =
            `Ofrece: ${intercambio.idiomaOfrecido} | Busca: ${intercambio.idiomaBuscado}`;

        const modalidad = document.createElement("p");
        modalidad.textContent = `Modalidad: ${intercambio.modalidad}`;

        const descripcion = document.createElement("p");
        descripcion.textContent = intercambio.descripcion;

        cuerpo.append(usuarioTexto, idiomas, modalidad, descripcion);
        tarjeta.append(cabecera, cuerpo);

        // Permitir arrastrar la tarjeta
        tarjeta.addEventListener("dragstart", event => {
            event.dataTransfer.setData(
                "text/plain",
                String(intercambio.id)
            );
        });

        contenedorTarjetas.appendChild(tarjeta);
    });
}

// Mostrar los intercambios seleccionados
async function mostrarSeleccionados() {
    const seleccionados = await consultarSeleccionados();
    const usuarios = await consultarUsuarios();

    zonaSeleccion.innerHTML = "";

    if (seleccionados.length === 0) {
        zonaSeleccion.textContent =
            "Arrastra aquí los intercambios que te interesen.";
        return;
    }

    seleccionados.forEach(intercambio => {
        const usuario = usuarios.find(
            u => u.id === intercambio.usuarioId
        );

        const tarjeta = document.createElement("article");
        const claseTipo = intercambio.tipo
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        tarjeta.className = `exchange-card selected-card ${claseTipo}`;

        // Cabecera
        const cabecera = document.createElement("div");
        cabecera.className = "exchange-card-header";
        cabecera.textContent = intercambio.tipo === "oferta"
            ? "Oferta de intercambio"
            : "Petición de intercambio";

        // Botón X para eliminar
        const botonEliminar = document.createElement("button");
        botonEliminar.className = "btn-quitar";
        botonEliminar.type = "button";
        botonEliminar.textContent = "×";
        botonEliminar.setAttribute(
            "aria-label",
            "Eliminar intercambio"
        );

        botonEliminar.addEventListener("click", async () => {
            await eliminarSeleccionado(intercambio.id);
            await mostrarSeleccionados();
        });

        cabecera.appendChild(botonEliminar);

        // Cuerpo
        const cuerpo = document.createElement("div");
        cuerpo.className = "exchange-card-body";

        const datos = [
            `Usuario: ${usuario?.nombre || "Usuario desconocido"}`,
            `Ofrece: ${intercambio.idiomaOfrecido} | Busca: ${intercambio.idiomaBuscado}`,
            `Modalidad: ${intercambio.modalidad}`,
            intercambio.descripcion
        ];

        datos.forEach(texto => {
            const parrafo = document.createElement("p");
            parrafo.textContent = texto;
            cuerpo.appendChild(parrafo);
        });

        tarjeta.append(cabecera, cuerpo);
        zonaSeleccion.appendChild(tarjeta);
    });
}

// Configurar la zona de arrastrar y soltar
zonaSeleccion.addEventListener("dragover", event => {
    event.preventDefault();
});

zonaSeleccion.addEventListener("drop", async event => {
    event.preventDefault();

    const id = Number(event.dataTransfer.getData("text/plain"));

    const intercambios = await consultarIntercambiosBD();
    const intercambio = intercambios.find(item => item.id === id);

    if (!intercambio) return;

    const seleccionados = await consultarSeleccionados();

    const yaExiste = seleccionados.some(
        item => item.id === intercambio.id
    );

    if (!yaExiste) {
        await guardarSeleccionado(intercambio);
    }

    await mostrarSeleccionados();
});

// Eventos de filtros
filtroTipo.addEventListener("change", mostrarIntercambios);
ordenFecha.addEventListener("change", mostrarIntercambios);

// Arrancar el dashboard
async function iniciarDashboard() {
    try {
        await inicializarIntercambios();
        await mostrarIntercambios();
        await mostrarSeleccionados();
    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        contenedorTarjetas.textContent =
            "No se han podido cargar los intercambios.";
    }
}

iniciarDashboard();
