/*
    DATOS INICIALES DE TANDEMLINK
*/

// Usuarios iniciales
export const usuarios = [
    {
        id: 1,
        nombre: "Ana García",
        email: "ana@example.com",
        password: "ana123"
    },
    {
        id: 2,
        nombre: "Carlos López",
        email: "carlos@example.com",
        password: "carlos123"
    },
    {
        id: 3,
        nombre: "Lucía Martín",
        email: "lucia@example.com",
        password: "lucia123"
    }
];

// Intercambios iniciales
export const intercambios = [
    {
        id: 1,
        tipo: "oferta",
        usuarioId: 1,
        idiomaOfrecido: "Español",
        idiomaBuscado: "Inglés",
        modalidad: "Presencial",
        descripcion: "Quiero practicar inglés y ayudar a otras personas con el español.",
        fechaCreacion: "2026-10-10"
    },
    {
        id: 2,
        tipo: "petición",
        usuarioId: 2,
        idiomaOfrecido: "Inglés",
        idiomaBuscado: "Francés",
        modalidad: "Online",
        descripcion: "Busco practicar francés con otra persona.",
        fechaCreacion: "2026-10-14"
    },
    {
        id: 3,
        tipo: "oferta",
        usuarioId: 3,
        idiomaOfrecido: "Francés",
        idiomaBuscado: "Español",
        modalidad: "Online",
        descripcion: "Puedo ayudar con francés a cambio de practicar español.",
        fechaCreacion: "2026-10-17"
    }
];