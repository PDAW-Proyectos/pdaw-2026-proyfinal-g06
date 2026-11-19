# Respawn · Comunidad y Descubrimientos de Videojuegos

> Plataforma web para buscar videojuegos vía la API de IGDB, compartir descubrimientos y debatir en foros con puntuaciones de la comunidad.

Proyecto del equipo **Grupo 06** para *7513 · Proyecto de Desarrollo de Aplicaciones Web*
(Tecnicatura Universitaria en Programación Web y Móvil — DCIC — UNS).

## Ficha del proyecto

| Aspecto | Descripción |
| --- | --- |
| **Problema** | Falta de espacios ágiles y centralizados donde jugadores puedan descubrir secretos o trucos de juegos específicos y debatir en comunidad manteniendo calificaciones colaborativas independientes. |
| **Usuarios** | Jugadores interesados en descubrir secretos/guías (cazadores de logros) y aficionados que buscan debatir sobre tramas, mecánicas y puntuaciones. |
| **Funcionalidades núcleo** | 1. Búsqueda y catálogo de videojuegos consumiendo la API de IGDB.
2. Sistema de calificación comunitaria de videojuegos (1 al 10) con recálculo dinámico de promedios.
3. Foros de discusión por juego con hilos y respuestas.
4. Calificación de publicaciones (1 al 5), con un voto por persona, promedio comunitario y ranking de las cinco mejor puntuadas. |
| **Reglas de negocio** | 1. Cada usuario autenticado puede emitir un único voto por juego (si vuelve a votar, se actualiza el valor anterior).<br>2. El recálculo del puntaje promedio del juego es automático y se valida en el servidor que la nota esté en el rango de 1 a 10.<br>3. Cada usuario autenticado puede puntuar una publicación una sola vez con una nota entera de 1 a 5; su creador no puede calificarla.<br>4. Solo usuarios registrados y autenticados pueden publicar hilos, comentarios o descubrimientos; las publicaciones no pueden tener títulos vacíos. |
| **API externa** | **IGDB Video Game Database API (Twitch)** — [Documentación oficial](https://api-docs.igdb.com/). Uso: consulta de fichas técnicas de juegos, portadas, descripciones, plataformas, metadatos y géneros. |

## Equipo y roles del sprint actual

| Integrante | Usuario de GitHub | Rol en el sprint |
| --- | --- | --- |
| Máximo Gómez Campello | `@maximgomezc` | Referente de producto |
| Sebastián Tomás Pulles | `@sebapulles` | Facilitación |
| Todos | Todos | Repositorio |
| Luca Kisner | `@lucakisner` | Calidad |

## Variables de entorno

Crear un archivo `.env` en la raíz (ver `.env.example`):

| Variable | Descripción | Obligatoria en producción |
| --- | --- | --- |
| `PORT` | Puerto HTTP del servidor (por defecto `3000`) | No |
| `NODE_ENV` | Entorno de ejecución (`development` o `production`) | Sí |
| `SESSION_SECRET` | Clave secreta para firmar cookies de sesión | Sí |
| `TWITCH_CLIENT_ID` | Client ID de aplicación en Twitch para IGDB | Recomendada |
| `TWITCH_CLIENT_SECRET` | Client Secret de Twitch para autenticar IGDB | Recomendada |

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev
```
El servidor lee `.env` al arrancar e inicia en `http://localhost:3000`. Para producción usar `npm start` (chequeo de salud en `GET /api/salud`).

## Cómo ejecutar las pruebas

```bash
npm run lint
npm test
```

## Documentación

- Guía de uso: [`docs/guia-de-usuario.md`](docs/guia-de-usuario.md)
- Especificación de la API (Endpoints): [`docs/endpoints.md`](docs/endpoints.md)
- Arquitectura del sistema: [`docs/arquitectura.md`](docs/arquitectura.md)
- Decisiones de arquitectura (ADRs): [`docs/adr/`](docs/adr/)
  - [ADR 001: Sesiones de Express con cookies HttpOnly frente a JWT](docs/adr/001-sesiones-express.md)
  - [ADR 002: Aislamiento de IGDB mediante patrón Adaptador y caché TTL](docs/adr/002-adaptador-igdb.md)
- Lecciones aprendidas: [`docs/lecciones.md`](docs/lecciones.md)
- Backlog, usuarios y criterios de aceptación: [`docs/backlog.md`](docs/backlog.md)
- Peticiones HTTP de prueba: [`requests.http`](requests.http)
- Acuerdos de trabajo y convenciones: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Riesgos: [`docs/riesgos.md`](docs/riesgos.md)

## Declaración de uso de IA

| Herramienta | Tarea | Qué se adoptó y por qué | Cómo se verificó |
| --- | --- | --- | --- |
| Asistente de IA | Ideación, refactorización, pruebas y documentación | Estructura de modelos de dominio, pruebas unitarias y diagramas Mermaid para mantener coherencia de capas | Revisión manual de cada archivo, ejecución de `npm run lint`, `npm test` y pruebas en navegador |

Todas las personas del equipo comprendemos el código del repositorio, podemos explicarlo y modificarlo sin asistencia, y las partes generadas o sugeridas fueron revisadas, probadas y adaptadas por el equipo.
