/* ==========================================================================
   DOCUMENTACIÓN IA GENERATIVA
   - IA utilizada: Gemini
   - Prompt 1: "Crea un array exportable de usuarios con identificador, nombre, email y contraseña."
   - Prompt 2: "Define un segundo array exportable de intercambios vinculado a los usuarios mediante un ID."
   - Prompt 3: "Añade propiedades de tipo, idiomas ofrecidos y buscados en cada objeto de intercambio."
   - Prompt 4: "Incluye datos de modalidad y fecha de creación con formato de texto estándar."
   ========================================================================== */



/*
    FICHERO DE DATOS COMPARTIDOS
    Proyecto: TandemLink
*/

// Array de usuarios iniciales
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

// Array de intercambios iniciales
export const intercambios = [
    {
        id: 1,
        tipo: "oferta",
        usuarioId: 1,
        idiomaOfrecido: "Español",
        idiomaBuscado: "Inglés",
        modalidad: "Presencial",
        descripcion: "Quiero practicar a hablar en inglés.",
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
        descripcion: "Puedo ayudar con francés a cambio de español.",
        fechaCreacion: "2026-10-17"
    }
];