# Lecciones Aprendidas

### 1. Organización en capas y modularización
Separar la aplicación en rutas, controladores, servicios, repositorios y modelos nos permitió trabajar sobre distintas funcionalidades sin pisarnos y mantener reglas claras (por ejemplo, validar los datos en los modelos y controlar la autoría en los servicios antes de llegar al repositorio).

### 2. Integración con una API externa (IGDB)
Conectar la aplicación con la API de IGDB mediante autenticación OAuth2 de Twitch nos obligó a proteger las credenciales en el servidor, implementar búsqueda con demora (*debounce*) y cancelación de peticiones (`AbortController`) en el navegador, y agregar caché con expiración más datos simulados de respaldo para no depender de la disponibilidad externa.

### 3. Consistencia visual y flujo de trabajo en Git
A lo largo del proyecto fuimos unificando criterios de interfaz (cinco estrellas para videojuegos, flechas arriba/abajo para publicaciones, notificaciones tipo *toast* y persistencia en JSON). También aprendimos la importancia de usar ramas cortas, vincular cada Pull Request con sus issues mediante `Closes` y verificar todo con `npm run lint` y `npm test` en GitHub Actions antes de integrar a `main`.
