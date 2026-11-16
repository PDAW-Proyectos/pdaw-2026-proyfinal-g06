const repositorioComentarios = require('../repositories/commentRepository');
const repositorioPublicaciones = require('../repositories/postRepository');
const repositorioUsuarios = require('../repositories/userRepository');

const crearErrorComentario = (mensaje, codigoEstado) => {
  const error = new Error(mensaje);
  error.statusCode = codigoEstado;
  return error;
};

const obtenerComentarios = async (idPublicacion) => {
  const publicacion = await repositorioPublicaciones.buscarPublicacionPorId(idPublicacion);
  if (!publicacion) {
    throw crearErrorComentario('Publicación no encontrada', 404);
  }
  return repositorioComentarios.obtenerComentariosPorPublicacion(idPublicacion);
};

const validarContenidoComentario = (contenido) => {
  if (typeof contenido !== 'string' || !contenido.trim()) {
    throw crearErrorComentario('El comentario no puede estar vacío', 400);
  }
  if (contenido.trim().length > 2000) {
    throw crearErrorComentario('El comentario no puede superar los 2000 caracteres', 400);
  }
  return contenido.trim();
};

const crearComentario = async (idPublicacion, contenido, idUsuario, idComentarioPadre = null) => {
  const contenidoValidado = validarContenidoComentario(contenido);

  const publicacion = await repositorioPublicaciones.buscarPublicacionPorId(idPublicacion);
  if (!publicacion) {
    throw crearErrorComentario('Publicación no encontrada', 404);
  }

  if (idComentarioPadre !== null && idComentarioPadre !== undefined && idComentarioPadre !== '') {
    const comentarioPadre = await repositorioComentarios.buscarComentarioPorId(idComentarioPadre);
    if (!comentarioPadre || comentarioPadre.postId !== idPublicacion) {
      throw crearErrorComentario('Comentario al que se responde no encontrado', 404);
    }
  }

  const autor = await repositorioUsuarios.buscarUsuarioPorId(idUsuario);
  if (!autor) {
    throw crearErrorComentario('Usuario no encontrado', 404);
  }

  return repositorioComentarios.crearComentario({
    postId: idPublicacion,
    parentId: idComentarioPadre || null,
    content: contenidoValidado,
    author: { id: autor.id, name: autor.name }
  });
};

const obtenerComentarioPropio = async (idPublicacion, idComentario, idUsuario) => {
  const comentario = await repositorioComentarios.buscarComentarioPorId(idComentario);
  if (!comentario || comentario.postId !== idPublicacion || comentario.deleted) {
    throw crearErrorComentario('Comentario no encontrado', 404);
  }
  if (String(comentario.author.id) !== String(idUsuario)) {
    throw crearErrorComentario('Solo puedes modificar tus propios comentarios', 403);
  }
  return comentario;
};

const editarComentario = async (idPublicacion, idComentario, contenido, idUsuario) => {
  const contenidoValidado = validarContenidoComentario(contenido);
  await obtenerComentarioPropio(idPublicacion, idComentario, idUsuario);
  return repositorioComentarios.actualizarComentario(idComentario, contenidoValidado);
};

const eliminarComentario = async (idPublicacion, idComentario, idUsuario) => {
  const comentario = await obtenerComentarioPropio(idPublicacion, idComentario, idUsuario);
  if (!comentario.parentId) {
    return repositorioComentarios.eliminarHiloComentario(idComentario);
  }
  return repositorioComentarios.eliminarComentario(idComentario);
};

module.exports = {
  obtenerComentarios,
  crearComentario,
  editarComentario,
  eliminarComentario
};
