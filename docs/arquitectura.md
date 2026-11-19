# Arquitectura del Sistema — Respawn

Documento técnico de arquitectura para la plataforma Respawn (PDAW 2026 — Grupo 06 — DCIC — UNS).

---

## 1. Contexto del sistema

El sistema se estructura en torno a tres límites claramente definidos:

### Componentes e interfaces
1. **Cliente Web (Frontend HTML / Bootstrap / JS):**
   - Interfaz de usuario ejecutada en el navegador (`public/index.html` y `public/post.html`).
   - Consume la API propia mediante peticiones `fetch` intercambiando datos en formato JSON.
   - Maneja la autenticación del usuario mediante cookies de sesión (`HttpOnly`, `SameSite=Lax`).

2. **Backend Respawn API (Node.js / Express):**
   - Servidor central que encapsula la lógica de negocio, validaciones de dominio y persistencia local.
   - Expone rutas REST bajo `/api/` y devuelve mensajes de error claros en JSON (`{ error }`).
   - Almacena los datos de forma persistente en `data/datos.json` a través de los repositorios y `almacenamientoJson.js`.

3. **API Externa de IGDB (Twitch):**
   - Servicio externo de catálogo de videojuegos (títulos, portadas, sinopsis, géneros, plataformas y puntaje).
   - El navegador nunca accede a IGDB directamente: el backend actúa como intermediario manteniendo `TWITCH_CLIENT_ID` y `TWITCH_CLIENT_SECRET` en variables de entorno del servidor.

---

## 2. Arquitectura en capas

El backend adopta una arquitectura en capas desacopladas con flujo unidireccional:

**Rutas y Middlewares** ➔ **Controladores** ➔ **Servicios** ➔ **Repositorios / Adaptadores**

### Descripción de cada capa

1. **Rutas y Middlewares (`src/routes/`, `src/middlewares/`):**
   - Mapea las solicitudes HTTP hacia los controladores (`authRoutes.js`, `postRoutes.js`, `rutasJuegos.js`).
   - Aplica `requerirAutenticacion` (`authMiddleware.js`) para proteger las operaciones que requieren sesión activa.

2. **Controladores (`src/controllers/`):**
   - Reciben la petición HTTP (`req`, `res`), extraen parámetros o cuerpo y delegan en los servicios.
   - Devuelven el código de estado HTTP correspondiente y la respuesta JSON.

3. **Servicios (`src/services/`):**
   - Contienen las reglas de negocio: validación de campos, control de autoría al editar o eliminar, cálculo de promedios y control de reportes.

4. **Repositorios y Modelos (`src/repositories/`, `src/models/`):**
   - Encapsulan el acceso a las colecciones persistidas en `data/datos.json` (`almacenamientoJson.js`).
   - Los modelos (`Usuario`, `Publicacion`, `Comentario`, `Puntuacion`, `VotoPublicacion`, `Reporte`) validan su estado en el constructor usando atributos privados.

5. **Adaptador externo (`src/utils/adaptadorIgdb.js`):**
   - Aísla la autenticación OAuth2 con Twitch y las consultas a IGDB, normaliza los resultados, aplica caché en memoria con expiración (5 minutos) y usa datos simulados si la API externa no está disponible.

---

## 3. Modelo de clases del dominio

1. **Usuario (`src/models/usuario.js`):**
   - Atributos privados: `id`, `nombre`, `correo`, `contrasenaHash`, `fechaCreacion`.
   - Valida nombre obligatorio, formato de correo y hash de contraseña; normaliza el correo a minúsculas.

2. **Publicacion (`src/models/publicacion.js`):**
   - Atributos privados: `id`, `titulo`, `categoria`, `contenido`, `juego`, `imagenJuego`, `datosJuego`, `autor`, `fechaCreacion`.
   - Incluye el método `actualizar(datos)` para editar título, categoría, contenido o juego asociado.

3. **Comentario (`src/models/comentario.js`):**
   - Atributos privados: `id`, `idPublicacion`, `idPadre`, `contenido`, `autor`, `eliminado`, fechas.
   - Permite respuestas anidadas (`idPadre`), edición (`actualizarContenido`) y borrado lógico (`marcarEliminado`) cuando tiene respuestas.

4. **Puntuacion (`src/models/puntuacion.js`):**
   - Atributos privados: `id`, `idUsuario`, `juego`, `nota`, fechas.
   - Valida que `nota` sea un entero entre 1 y 5, y permite modificarla con `actualizarNota`.

5. **VotoPublicacion (`src/models/votoPublicacion.js`):**
   - Atributos privados: `idUsuario`, `idPublicacion`, `valor`, `fechaActualizacion`.
   - Solo admite voto positivo (`1`) o negativo (`-1`).

6. **Reporte (`src/models/reporte.js`):**
   - Atributos privados: `idUsuario`, `idPublicacion`, `motivo`, `fecha`.
   - Valida motivo obligatorio; cada usuario puede reportar una vez por publicación y al llegar a 3 reportes la publicación queda marcada para verificación.

---

## 4. Navegabilidad

1. **Página principal (`public/index.html`):**
   - Buscador de videojuegos en tiempo real, tarjetas de resultados y modal de ficha de juego con puntuación de 1 a 5 estrellas.
   - Listado de publicaciones con filtro por categoría (incluyendo `Descubrimiento o secreto`), ordenamiento (`Más recientes` / `Más votados`), votación por flechas y creación de nuevas publicaciones.
   - Columna lateral con el Top 5 de **Juegos mejor valorados**.

2. **Vista de publicación (`public/post.html`):**
   - Muestra el detalle completo de la publicación, botones de edición/eliminación para el autor, botón **Reportar** con selección de motivo, ficha del videojuego asociado con estrellas de puntuación y sección de comentarios e hilos anidados.
