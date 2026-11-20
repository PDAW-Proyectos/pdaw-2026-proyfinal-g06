# Arquitectura del Sistema — Respawn

Documento técnico de arquitectura para la plataforma Respawn (PDAW 2026 — Grupo 06 — DCIC — UNS).

---

## 1. Contexto del sistema

El sistema se estructura en torno a tres límites claramente definidos:

### Componentes e interfaces
1. **Cliente Web (Frontend HTML / Bootstrap / JS):**
   - Interfaz de usuario ejecutada en el navegador (`public/index.html`, `public/juego.html` y `public/perfil.html`).
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
   - Mapea las solicitudes HTTP hacia los controladores (`authRoutes.js`, `postRoutes.js`, `rutasJuegos.js`, `adminRoutes.js`).
   - Aplica `requerirAutenticacion` y `requerirAdmin` (`authMiddleware.js`) para proteger las operaciones que requieren sesión activa o rol de administrador.

2. **Controladores (`src/controllers/`):**
   - Reciben la petición HTTP (`req`, `res`), extraen parámetros o cuerpo y delegan en los servicios o repositorios (`authController.js`, `postController.js`, `commentController.js`, `controladorJuegos.js`, `adminController.js`).
   - Devuelven el código de estado HTTP correspondiente y la respuesta JSON.

3. **Servicios (`src/services/`):**
   - Contienen las reglas de negocio: validación de contraseña (8 a 20 caracteres, mayúscula, número y carácter especial), control de autoría y permisos de administrador (puede eliminar cualquier publicación, pero no editar ni reportar), cálculo de promedios y control de reportes.

4. **Repositorios y Modelos (`src/repositories/`, `src/models/`):**
   - Encapsulan el acceso a las colecciones persistidas en `data/datos.json` (`almacenamientoJson.js`).
   - Los modelos (`Usuario`, `Publicacion`, `Comentario`, `Puntuacion`, `VotoPublicacion`, `Reporte`) validan su estado en el constructor y normalizan su serialización (`toJSON` / `fromJSON`).

5. **Adaptador externo (`src/utils/adaptadorIgdb.js`):**
   - Aísla la autenticación OAuth2 con Twitch y las consultas a IGDB, filtra juegos recomendados con portada y más de 100 votos, normaliza los resultados, aplica caché en memoria con expiración (5 minutos) y usa datos simulados si la API externa no está disponible.

---

## 3. Modelo de clases del dominio

1. **Usuario (`src/models/usuario.js`):**
   - Atributos: `id`, `nombre`, `correo`, `contrasenaHash`, `rol` (`'usuario'` o `'admin'`), `fechaCreacion`.
   - Valida nombre obligatorio, formato de correo y hash de contraseña; normaliza el correo a minúsculas.

2. **Publicacion (`src/models/publicacion.js`):**
   - Atributos: `id`, `titulo`, `categoria`, `contenido`, `juego`, `imagenJuego`, `datosJuego`, `autor`, `fechaCreacion`.
   - Incluye el método `actualizar(datos)` para editar título, categoría, contenido o juego asociado.

3. **Comentario (`src/models/comentario.js`):**
   - Atributos: `id`, `idPublicacion`, `idPadre`, `contenido`, `autor`, `eliminado`, fechas.
   - Permite respuestas anidadas (`idPadre`), edición (`actualizarContenido`) y borrado lógico (`marcarEliminado`) cuando tiene respuestas.

4. **Puntuacion (`src/models/puntuacion.js`):**
   - Atributos: `id`, `idUsuario`, `juego`, `nota`, `fechaActualizacion`.
   - Valida que `nota` sea un entero entre 1 y 5, y permite modificarla con `actualizarNota` o eliminarla desde `DELETE /api/juegos/puntuaciones`.

5. **VotoPublicacion (`src/models/votoPublicacion.js`):**
   - Atributos: `idUsuario`, `idPublicacion`, `valor`, `fechaActualizacion`.
   - Solo admite voto positivo (`1`) o negativo (`-1`).

6. **Reporte (`src/models/reporte.js`):**
   - Atributos: `idUsuario`, `idPublicacion`, `motivo`, `fecha`.
   - Valida motivo obligatorio; cada usuario puede reportar una vez por publicación (no puede reportar publicaciones propias ni ser reportado por un admin) y al llegar a 3 reportes la publicación queda marcada para verificación (`requiereRevision`).

---

## 4. Navegabilidad

1. **Página principal (`public/index.html`):**
   - Banner principal con buscador de videojuegos en tiempo real y carrusel horizontal de **Juegos recomendados**.
   - Listado de publicaciones con filtro por categoría, ordenamiento (`Más recientes` / `Más votados`), votación con flechas, menú de acciones (`⋯`) y modal de nueva publicación con buscador dinámico de juegos y portada.
   - Columna lateral con el Top 5 de **Juegos mejor valorados**.

2. **Ficha del videojuego (`public/juego.html`):**
   - Muestra la portada, descripción, géneros, plataformas, puntaje de IGDB y puntuación con estrellas de la comunidad (con opción de eliminar la nota propia).
   - Debajo lista todas las publicaciones/reseñas del juego con su contenido completo, votación, acciones según rol (`⋯`) y comentarios anidados inline.

3. **Mi perfil (`public/perfil.html`):**
   - **Usuario estándar**: pestañas de **Publicaciones** (con filtro por categoría, edición y eliminación) y **Puntuaciones** (listado de juegos puntuados con estrellas y opción de eliminar).
   - **Administrador (`rol: 'admin'`)**: pestañas de **Usuarios** (listado y eliminación de usuarios) y **Reportadas (3+)** (listado y eliminación de publicaciones que alcanzaron 3 o más reportes).
