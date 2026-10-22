# Respawn · Comunidad y Descubrimientos de Videojuegos

> Plataforma web para buscar videojuegos vía la API de RAWG, compartir descubrimientos y debatir en foros con puntuaciones de la comunidad.

Proyecto del equipo **Grupo 06** para *7513 · Proyecto de Desarrollo de Aplicaciones Web*
(Tecnicatura Universitaria en Programación Web y Móvil — DCIC — UNS).

## Ficha del proyecto

| Aspecto | Descripción |
| --- | --- |
| **Problema** | Falta de espacios ágiles y centralizados donde jugadores puedan descubrir secretos o trucos de juegos específicos y debatir en comunidad manteniendo calificaciones colaborativas independientes. |
| **Usuarios** | Jugadores interesados en descubrir secretos/guías (cazadores de logros) y aficionados que buscan debatir sobre tramas, mecánicas y puntuaciones. |
| **Funcionalidades núcleo** | 1. Búsqueda y catálogo de videojuegos consumiendo la API de RAWG.<br>2. Sistema de calificación comunitaria (1 al 10) con recálculo dinámico de promedios.<br>3. Foros de discusión por juego con hilos y respuestas. |
| **Reglas de negocio** | 1. Cada usuario autenticado puede emitir un único voto por juego (si vuelve a votar, se actualiza el valor anterior).<br>2. El recálculo del puntaje promedio es automático y se valida en el servidor que la nota esté en el rango de 1 a 10.<br>3. Solo usuarios registrados y autenticados pueden publicar hilos, comentarios o descubrimientos; las publicaciones no pueden tener títulos vacíos. |
| **API externa** | **RAWG Video Games Database API** — [Documentación oficial](https://rawg.io/apidocs). Uso: consulta de fichas técnicas de juegos, portadas, metadatos y géneros. |

## Equipo y roles del sprint actual

| Integrante | Usuario de GitHub | Rol en el sprint |
| --- | --- | --- |
| Máximo Gómez Campello | `@maximgomezc` | Referente de producto |
| Sebastián Tomás Pulles | `@sebapulles` | Facilitación |
| Todos | Todos | Repositorio |
| Luca Kisner | `@lucakisner` | Calidad |

## Cómo ejecutar el proyecto

```bash
npm install
cp .env.example .env
npm run dev
```

El servidor iniciará en `http://localhost:3000`.

## Cómo ejecutar las pruebas

```bash
npm test
```

## Documentación

- Backlog, usuarios y criterios de aceptación: [`docs/backlog.md`](docs/backlog.md)
- Diagramas y wireframes: [`docs/`](docs/)
- Acuerdos de trabajo y convenciones: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Riesgos: [`docs/riesgos.md`](docs/riesgos.md)

## Uso de herramientas de IA

Registrar aquí qué herramientas se usaron, para qué tareas y qué se adoptó de sus propuestas.

| Fecha | Herramienta | Tarea | Qué se adoptó y por qué |
| ----- | ----------- | ----- | ----------------------- |
|       |             |       |                         |
