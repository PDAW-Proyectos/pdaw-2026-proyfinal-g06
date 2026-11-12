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

const actualizarPublicacion = async (req, res) => {
  const cuerpo = req.body || {};
  const datos = {
    title: cuerpo.title !== undefined ? cuerpo.title : cuerpo.titulo,
    category: cuerpo.category !== undefined ? cuerpo.category : cuerpo.categoria,
    content: cuerpo.content !== undefined ? cuerpo.content : cuerpo.contenido,
    game: cuerpo.game !== undefined ? cuerpo.game : cuerpo.juego
  };

  try {
    const publicacion = await servicioPublicaciones.actualizarPublicacion(
      req.params.id,
      datos,
      req.session.userId
    );
    res.status(200).json({ message: 'Publicación actualizada', post: publicacion });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Error al actualizar publicación'
    });
  }
};

const votarPublicacion = async (req, res) => {
  const cuerpo = req.body || {};
  const valor = cuerpo.valor !== undefined ? cuerpo.valor : cuerpo.value;

  try {
    const publicacion = await servicioPublicaciones.votarPublicacion(
      req.params.id,
      valor,
      req.session.userId
    );
    res.status(200).json({
      message: 'Voto procesado correctamente',
      post: publicacion,
      puntajeVotos: publicacion.puntajeVotos,
      miVoto: publicacion.miVoto
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Error al procesar el voto'
    });
  }
};

const obtenerPublicaciones = async (req, res) => {
  const { page, pagina, game } = req.query;
  const numeroPagina = pagina || page;
  const idUsuario = req.session ? req.session.userId : null;

  try {
    const publicaciones = await servicioPublicaciones.obtenerPublicaciones(numeroPagina, game, idUsuario);
    res.status(200).json(publicaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las publicaciones' });
  }
};

const obtenerPublicacionPorId = async (req, res) => {
  const idUsuario = req.session ? req.session.userId : null;

  try {
    const publicacion = await servicioPublicaciones.obtenerPublicacionPorId(req.params.id, idUsuario);
    res.status(200).json(publicacion);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Error al obtener la publicación'
    });
  }
};

module.exports = {
  crearPublicacion,
  actualizarPublicacion,
  votarPublicacion,
  obtenerPublicaciones,
  obtenerPublicacionPorId
};
