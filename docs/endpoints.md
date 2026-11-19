# Documentación de Endpoints — Respawn API

Documento de referencia para la API REST del proyecto Respawn (PDAW 2026 — Grupo 06).

---

## Salud del Servidor (`app.js`)
- `GET /api/salud`  
  Devuelve `200 OK` con el estado del servidor, versión de `package.json`, entorno activo y tiempo de actividad (`uptime`).

---

## Autenticación y Sesión (`authRoutes.js`)
Gestión de registro, inicio de sesión, cierre de sesión y consulta de usuario actual mediante cookies de sesión (`express-session`).

- `POST /api/auth/register`  
  Registra un usuario nuevo validando nombre, formato de correo electrónico y contraseña mínima de 8 caracteres. Responde `201 Created`, `400 Bad Request` o `409 Conflict` si el correo ya existe.
- `POST /api/auth/login`  
  Verifica correo y contraseña con `bcryptjs`, guarda `userId` en sesión y devuelve `200 OK` con los datos públicos del usuario (o `401 Unauthorized` si las credenciales son incorrectas).
- `POST /api/auth/logout`  
  Destruye la sesión activa en el servidor y limpia la cookie. Responde `200 OK`.
- `GET /api/auth/me`  
  Consulta la sesión actual y devuelve `{ user }` (o `{ user: null }` si no hay sesión iniciada).

---

## Videojuegos y Puntuaciones (`rutasJuegos.js`)
Búsqueda de catálogo en IGDB a través de `adaptadorIgdb.js` y sistema de puntuación comunitaria de 1 a 5 estrellas.

- `GET /api/juegos?busqueda=...`  
  Busca videojuegos en IGDB (o en datos simulados de respaldo) y enriquece cada resultado con el promedio de la comunidad. Responde `200 OK` o `404 Not Found` si no hay coincidencias para el término buscado.
- `GET /api/juegos/:id`  
  Obtiene la ficha de un videojuego por su identificador numérico. Responde `200 OK` o `404 Not Found`.
- `GET /api/juegos/puntuaciones?juego=...`  
  Devuelve el promedio de estrellas (1 a 5), cantidad total de votos y la nota del usuario actual si está autenticado.
- `GET /api/juegos/mejores-puntuados`  
  Retorna el Top 5 de videojuegos ordenados por mejor promedio y mayor cantidad de votos.
- `POST /api/juegos/puntuaciones` *(requiere sesión)*  
  Registra o actualiza la puntuación (entero de 1 a 5) de un usuario sobre un juego y recalcula el promedio. Responde `200 OK`, `400 Bad Request` o `401 Unauthorized`.

---

## Publicaciones, Votos y Reportes (`postRoutes.js`)
Gestión del foro de discusión, descubrimientos, votación por flechas y reportes de moderación.

- `GET /api/posts?page=1&orden=recientes&categoria=...&game=...`  
  Lista publicaciones paginadas de a 10 resultados, permitiendo filtrar por juego o categoría y ordenar por `recientes` o `votados` sin mutar la colección original.
- `GET /api/posts/:id`  
  Obtiene el detalle completo de una publicación, incluyendo sus contadores de votos y estado de reportes. Responde `200 OK` o `404 Not Found`.
- `POST /api/posts` *(requiere sesión)*  
  Crea una publicación nueva vinculada al usuario autenticado y asociada a un videojuego y una categoría válida (`Informativa`, `Review o reseña`, `Crítica`, `Bug o problema técnico` o `Descubrimiento o secreto`). Responde `201 Created`.
- `PATCH /api/posts/:id` *(requiere sesión y ser autor)*  
  Actualiza una publicación propia. Responde `200 OK`, `403 Forbidden` si pertenece a otro usuario o `404 Not Found`.
- `DELETE /api/posts/:id` *(requiere sesión y ser autor)*  
  Elimina definitivamente una publicación propia junto con sus comentarios, votos y reportes. Responde `200 OK` o `403 Forbidden`.
- `POST /api/posts/:id/voto` *(requiere sesión)*  
  Registra voto positivo (`1`) o negativo (`-1`); si el usuario repite el mismo voto, lo quita.
- `POST /api/posts/:id/reportes` *(requiere sesión)*  
  Registra un reporte con motivo obligatorio (máximo 1 por usuario por publicación; al llegar a 3 reportes marca `requiereRevision: true`). Responde `201 Created`, `400 Bad Request` o `409 Conflict`.

---

## Comentarios e Hilos (`postRoutes.js`)
- `GET /api/posts/:id/comments`  
  Lista los comentarios y respuestas anidadas (`parentId`) de una publicación.
- `POST /api/posts/:id/comments` *(requiere sesión)*  
  Crea un comentario raíz o una respuesta a otro comentario (`parentId`). Responde `201 Created`.
- `PATCH /api/posts/:id/comments/:commentId` *(requiere sesión y ser autor)*  
  Edita el texto de un comentario propio.
- `DELETE /api/posts/:id/comments/:commentId` *(requiere sesión y ser autor)*  
  Elimina un comentario propio (si es raíz borra el hilo completo; si es una respuesta oculta el texto conservando el hilo).
