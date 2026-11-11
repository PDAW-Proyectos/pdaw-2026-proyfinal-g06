const servicioPublicaciones = require('../services/postService');

const crearPublicacion = async (req, res) => {
  const { title, titulo, category, categoria, content, contenido, game, juego } = req.body || {};
  const tituloFinal = titulo || title;
  const categoriaFinal = categoria || category;
  const contenidoFinal = contenido || content;
  const juegoFinal = juego || game;
  const idUsuario = req.session.userId;

  try {
    const publicacion = await servicioPublicaciones.crearPublicacion(
      tituloFinal,
      categoriaFinal,
      contenidoFinal,
      juegoFinal,
      idUsuario
    );
    res.status(201).json({
      message: 'Publicación creada exitosamente',
      post: publicacion,
      publicacion
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Error al crear publicación'
    });
  }
};

const obtenerPublicaciones = async (req, res) => {
  const { page, pagina } = req.query;
  const numeroPagina = pagina || page;
  
  try {
    const publicaciones = await servicioPublicaciones.obtenerPublicaciones(numeroPagina);
    res.status(200).json(publicaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las publicaciones' });
  }
};

module.exports = { crearPublicacion, obtenerPublicaciones };

