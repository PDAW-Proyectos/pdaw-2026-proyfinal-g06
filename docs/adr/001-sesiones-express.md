# ADR 001 — Sesiones de Express con cookies HttpOnly frente a JWT

- **Estado:** Aceptado
- **Fecha:** 2026-11-12

## Contexto
Necesitábamos autenticar a los usuarios desde el navegador web para proteger la creación de publicaciones, comentarios, votos, puntuaciones y reportes sin exponer credenciales ni tokens en `localStorage`.

## Alternativas consideradas
1. **JWT almacenado en `localStorage`:** obliga a manejar el token manualmente en el cliente y queda expuesto ante cualquier script inyectado (XSS).
2. **Sesiones de `express-session` con cookie `HttpOnly`:** la cookie viaja automáticamente en cada petición al mismo origen y no puede ser leída desde JavaScript.

## Decisión y consecuencias
Elegimos sesiones con cookie `HttpOnly` (`sameSite: 'lax'`) respaldadas por nuestro almacén en `data/datos.json` (`AlmacenSesionesJson`). De este modo las sesiones sobreviven a los reinicios del servidor local y las pruebas automatizadas solo necesitan reenviar la cookie de sesión.
