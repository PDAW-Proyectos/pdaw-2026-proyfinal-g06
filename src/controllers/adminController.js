const repositorioUsuarios = require('../repositories/userRepository');
const repositorioPublicaciones = require('../repositories/postRepository');
const repositorioComentarios = require('../repositories/commentRepository');

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await repositorioUsuarios.listarUsuarios();
    res.status(200).json({ datos: usuarios });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al listar usuarios' });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  if (String(id) === String(req.session.userId)) {
    return res.status(400).json({ error: 'No podés eliminar tu propio usuario administrador' });
  }

  try {
    const usuarioObjetivo = await repositorioUsuarios.buscarUsuarioPorId(id);
    if (!usuarioObjetivo) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (usuarioObjetivo.rol === 'admin') {
      return res.status(403).json({ error: 'No podés eliminar a otro administrador' });
    }

    const idsPublicaciones = await repositorioPublicaciones.eliminarPublicacionesPorAutor(id);
    for (const idPub of idsPublicaciones) {
      await repositorioComentarios.eliminarComentariosPorPublicacion(idPub);
    }
    const eliminado = await repositorioUsuarios.eliminarUsuarioPorId(id);
    return res.status(200).json({
      message: 'Usuario eliminado correctamente',
      usuario: eliminado
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error al eliminar usuario' });
  }
};

const listarPublicacionesReportadas = async (req, res) => {
  try {
    const publicaciones = await repositorioPublicaciones.obtenerPublicacionesReportadas(req.session.userId);
    res.status(200).json({ datos: publicaciones });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al listar publicaciones reportadas' });
  }
};

module.exports = {
  listarUsuarios,
  eliminarUsuario,
  listarPublicacionesReportadas
};

