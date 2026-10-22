# Backlog del proyecto y requisitos

## 1. Personas usuarias y escenarios

### Persona 1: Lucas (21 años) — El cazador de logros
* **Escenario:** Entra desde el celular buscando un truco o descubrimiento específico de un juego para pasarlo rápido.
* **Implicancia de diseño:** Interfaz *mobile-first*, buscador rápido y la sección de "Descubrimientos" accesible de forma inmediata.

### Persona 2: Sofía (26 años) — La apasionada de los debates
* **Escenario:** Termina un juego que le fascinó y busca ingresar al foro a discutir el final y comparar opiniones.
* **Implicancia de diseño:** Sistema de hilos de discusión ordenados, perfiles de usuario y botones de puntuación accesibles.

---

## 2. Historias de Usuario (Backlog)

| ID | Historia de Usuario | Prioridad (MoSCoW) | Estimación (Puntos) |
|---|---|---|---|
| **HU-01** | Como usuario visitante, quiero buscar un videojuego mediante la API, para ver su información general y puntaje global. | **Must** | 5 |
| **HU-02** | Como usuario registrado, quiero puntuar un videojuego del 1 al 10, para aportar a la calificación general de la comunidad. | **Must** | 3 |
| **HU-03** | Como miembro de la comunidad, quiero crear un hilo de discusión en el foro de un juego específico, para debatir sobre su historia o mecánicas. | **Must** | 5 |
| **HU-04** | Como usuario, quiero responder en un foro de discusión, para interactuar con las opiniones de otros jugadores. | **Must** | 3 |
| **HU-05** | Como jugador curioso, quiero publicar un "descubrimiento" o easter egg en la sección del juego, para compartirlo con la comunidad. | **Should** | 5 |
| **HU-06** | Como usuario, quiero filtrar los hilos del foro por los más votados o recientes, para encontrar los debates más interesantes. | **Should** | 3 |
| **HU-07** | Como usuario registrado, quiero editar o borrar mis propias publicaciones en los foros, para corregir errores o mantener mi contenido al día. | **Could** | 3 |
| **HU-08** | Como administrador de la plataforma, quiero moderar y eliminar comentarios o descubrimientos inapropiados, para mantener un espacio seguro. | **Won't** | 8 |

---

## 3. Criterios de Aceptación (Dado - Cuando - Entonces)

### HU-01: Buscar juego y ver puntaje
* **Criterio 1:** Dado que la API externa de videojuegos está disponible, cuando ingreso el nombre del juego en la barra de búsqueda, entonces el sistema muestra la ficha con su título, portada y puntaje global actualizado.
* **Criterio 2:** Dado que busco un juego que no existe en el sistema ni en la API, cuando realizo la búsqueda, entonces se muestra un mensaje claro de "Juego no encontrado".

### HU-02: Puntuar un videojuego
* **Criterio 1:** Dado que soy un usuario registrado y estoy logueado, cuando selecciono un puntaje del 1 al 10 para un juego y presiono "Enviar", entonces mi voto se registra y se recalcula el puntaje promedio del juego en menos de 1 segundo.
* **Criterio 2:** Dado que ya voté un juego anteriormente, cuando intento volver a puntuarlo, entonces el sistema me permite actualizar mi nota anterior en lugar de duplicarla.

### HU-03: Crear un hilo de discusión
* **Criterio 1:** Dado que estoy dentro del foro de un juego y autenticado, cuando completo el título y el cuerpo del hilo y hago clic en "Publicar", entonces la discusión aparece en el tope de la lista del foro del juego.
* **Criterio 2:** Dado que intento crear un hilo con el título vacío, cuando presiono "Publicar", entonces el sistema bloquea la acción e indica de forma visual qué campo falta completar.

---

## 4. Validación con Criterios INVEST

* **Independiente:** Historias como la búsqueda contra la API (HU-01) pueden desarrollarse sin esperar al sistema de foros (HU-03).
* **Negociable:** El detalle de presentación o filtros de ordenamiento se puede acordar incrementalmente con el equipo.
* **Valiosa:** Cada historia brinda valor visible y concreto a las personas usuarias definidas (Lucas y Sofía).
* **Estimable:** El alcance funcional de cada historia está acotado para poder medirse en puntos de historia.
* **Pequeña:** Cada historia de prioridad Must/Should cabe dentro de un sprint de una semana.
* **Verificable:** Cuentan con criterios de aceptación en formato Dado-Cuando-Entonces contrastables sin ambigüedad.
