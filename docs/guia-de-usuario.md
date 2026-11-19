# Guía de Uso — Respawn

**Nombre de la aplicación:** Respawn  
**Acceso a la aplicación:** Ejecución local en `http://localhost:3000`  
**Versión:** 1.0.0  
**Cátedra:** Proyecto de Desarrollo de Aplicaciones Web (PDAW 2026) — DCIC — Universidad Nacional del Sur  
**Equipo:** Grupo 06  

---

## 1. ¿Para quién es?

Respawn es una plataforma web pensada para jugadores que quieren buscar información de videojuegos, compartir descubrimientos o secretos, puntuar títulos con estrellas y debatir en foros organizados por juego.

### Perfiles de usuario
- **Visitante:** Puede buscar videojuegos, consultar fichas técnicas, ver puntajes de la comunidad, leer publicaciones, filtrar por categoría y recorrer comentarios.
- **Usuario registrado:** Además puede crear publicaciones y descubrimientos, votar publicaciones con flechas arriba/abajo, puntuar juegos de 1 a 5 estrellas, comentar o responder en hilos, editar o eliminar su propio contenido y reportar publicaciones inapropiadas.

---

## 2. Primeros pasos

1. **Iniciar el servidor:** Ejecutar `npm install` y luego `npm run dev` (o `npm start`), con el archivo `.env` configurado a partir de `.env.example`.
2. **Ingresar desde el navegador:** Abrir `http://localhost:3000`.
3. **Crear cuenta o iniciar sesión:** Presionar el botón **Iniciar sesión** en la barra superior, completar el registro (nombre, correo válido y contraseña de al menos 8 caracteres) e ingresar con esas credenciales. La sesión se mantiene activa incluso si se reinicia el servidor.

---

## 3. Tareas principales

### Buscar un videojuego y puntuarlo
1. Escribir el nombre del juego en **Buscar videojuego...** para ver los resultados en tiempo real.
2. Hacer clic en la tarjeta del juego para abrir su ficha con portada, descripción, géneros, plataformas, puntaje de IGDB y publicaciones relacionadas.
3. Tocar de 1 a 5 estrellas para guardar o actualizar la calificación del juego.

### Crear publicaciones, filtrar y votar
1. Presionar **Nueva publicación**, elegir el juego (con sugerencias automáticas), la categoría (`Informativa`, `Review o reseña`, `Crítica`, `Bug o problema técnico` o `Descubrimiento o secreto`), el título y el contenido.
2. En el listado principal se puede filtrar por categoría y ordenar por **Más recientes** o **Más votados**.
3. Usar las flechas arriba/abajo para votar una publicación y ver reflejado el puntaje en tiempo real.

### Comentar, editar, eliminar y reportar
1. Hacer clic en el título de una publicación para abrir su vista dedicada.
2. Escribir un comentario principal o usar **Responder** sobre un comentario existente para continuar el hilo.
3. Si la publicación o comentario es propio, aparecen los botones **Editar** y **Eliminar** con confirmación mediante notificación en pantalla.
4. Cualquier usuario registrado puede presionar **Reportar** y elegir un motivo (1 reporte por usuario); al alcanzar 3 reportes la publicación muestra la etiqueta **En verificación**.

---

## 4. Preguntas frecuentes

- **¿Qué ocurre si no hay conexión con IGDB o faltan credenciales de Twitch?** La aplicación utiliza un catálogo de respaldo para seguir funcionando sin errores.
- **¿Se pierden las cuentas o publicaciones al reiniciar el servidor?** No, toda la información y las sesiones activas se guardan en `data/datos.json`.
