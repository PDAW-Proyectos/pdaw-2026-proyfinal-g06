const servicioComentarios = require('../services/commentService');

const obtenerComentarios = async (req, res) => {
  try {
    const comentarios = await servicioComentarios.obtenerComentarios(req.params.id);
    res.status(200).json({ comments: comentarios });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Error al obtener los comentarios'
    });
  }
};

const crearComentario = async (req, res) => {
  const cuerpo = req.body || {};
  const contenido = cuerpo.content !== undefined ? cuerpo.content : cuerpo.contenido;
  const idComentarioPadre = cuerpo.parentId !== undefined ? cuerpo.parentId : cuerpo.comentarioPadreId;

  try {
    const comentario = await servicioComentarios.crearComentario(
      req.params.id,
      contenido,
      req.session.userId,
      idComentarioPadre
    );
    res.status(201).json({ comment: comentario });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Error al crear el comentario'
    });
  }
};

const editarComentario = async (req, res) => {
  const cuerpo = req.body || {};
  const contenido = cuerpo.content !== undefined ? cuerpo.content : cuerpo.contenido;

  try {
    const comentario = await servicioComentarios.editarComentario(
      req.params.id,
      req.params.commentId,
      contenido,
      req.session.userId
    );
    res.status(200).json({ comment: comentario });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Error al editar el comentario'
    });
  }
};

const eliminarComentario = async (req, res) => {
  try {
    const comentario = await servicioComentarios.eliminarComentario(
      req.params.id,
      req.params.commentId,
      req.session.userId
    );
    res.status(200).json({ comment: comentario });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Error al eliminar el comentario'
    });
  }
};

module.exports = {
  obtenerComentarios,
  crearComentario,
  editarComentario,
  eliminarComentario
};
