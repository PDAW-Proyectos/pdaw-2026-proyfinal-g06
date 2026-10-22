# Matriz de riesgos

Revisar en cada retrospectiva. Probabilidad e impacto: baja/media/alta.

| Riesgo | Probabilidad | Impacto | Respuesta (acción concreta) | Responsable |
| --- | --- | --- | --- | --- |
| **Límite de peticiones o indisponibilidad de la API de RAWG** | Media | Alto | Implementar un patrón Adaptador con caché en memoria o respuestas simuladas (mock data) para desarrollo y pruebas. | Repositorio / Calidad |
| **Alcance excesivo en funcionalidades de comunidad/moderación** | Alta | Alto | Aplicar MoSCoW estricto: dejar moderación avanzada en *Won't* y concentrarse en el núcleo (búsqueda, puntuación y foros). | Referente de producto |
| **Conflictos frecuentes de integración en Git** | Media | Medio | Ramas cortas enfocadas a un solo issue, pull requests de menos de 400 líneas e integración continua diaria. | Repositorio |
| **Ausencia o bloqueo prolongado de un integrante** | Baja | Alto | Revisión cruzada de PRs para conocimiento compartido y aviso de bloqueos superior a 30 minutos por canal del equipo. | Facilitación |

