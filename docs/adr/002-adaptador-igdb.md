# ADR 002 — Aislamiento de IGDB mediante patrón Adaptador y caché TTL

- **Estado:** Aceptado
- **Fecha:** 2026-11-12

## Contexto
La API de IGDB requiere obtener un token OAuth2 de Twitch antes de consultar videojuegos y tiene límites de peticiones por segundo.

## Alternativas consideradas
1. **Consultar IGDB directamente desde los controladores:** mezcla detalles HTTP externos con la lógica de negocio y rompe la aplicación si la API falla o faltan credenciales.
2. **Encapsular todo en `src/utils/adaptadorIgdb.js`:** centraliza el token, normaliza los datos, cachea búsquedas por 5 minutos y ofrece datos simulados de respaldo.

## Decisión y consecuencias
Elegimos el patrón Adaptador en `adaptadorIgdb.js` con inyección opcional de `fetchImpl`. Así evitamos repetir consultas idénticas en la búsqueda en tiempo real y podemos ejecutar todas las pruebas sin depender de internet.
