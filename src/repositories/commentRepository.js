const { randomUUID } = require('crypto');

const comentariosBD = [];

const obtenerComentariosPorPublicacion = async (idPublicacion) => comentariosBD
  .filter((comentario) => comentario.postId === idPublicacion)
  .map((comentario) => ({ ...comentario }));

const buscarComentarioPorId = async (id) => {
  const comentario = comentariosBD.find((item) => item.id === id);
  return comentario ? { ...comentario } : null;
};

const crearComentario = async (datosComentario) => {
  const comentario = {
    id: randomUUID(),
    ...datosComentario,
    createdAt: new Date().toISOString()
  };
  comentariosBD.push(comentario);
  return { ...comentario };
};

const actualizarComentario = async (id, contenido) => {
  const comentario = comentariosBD.find((item) => item.id === id);
  if (!comentario || comentario.deleted) return null;

  comentario.content = contenido;
  comentario.updatedAt = new Date().toISOString();
  return { ...comentario };
};

const eliminarComentario = async (id) => {
  const comentario = comentariosBD.find((item) => item.id === id);
  if (!comentario || comentario.deleted) return null;

  comentario.content = '';
  comentario.deleted = true;
  comentario.deletedAt = new Date().toISOString();
  return { ...comentario };
};

const eliminarHiloComentario = async (id) => {
  const comentario = comentariosBD.find((item) => item.id === id);
  if (!comentario) return null;

  const idsHilo = new Set([id]);
  let encontroRespuestas = true;
  while (encontroRespuestas) {
    encontroRespuestas = false;
    for (const respuesta of comentariosBD) {
      if (idsHilo.has(respuesta.parentId) && !idsHilo.has(respuesta.id)) {
        idsHilo.add(respuesta.id);
        encontroRespuestas = true;
      }
    }
  }

  for (let indice = comentariosBD.length - 1; indice >= 0; indice -= 1) {
    if (idsHilo.has(comentariosBD[indice].id)) {
      comentariosBD.splice(indice, 1);
    }
  }
  return { ...comentario, content: '', deleted: true };
};

module.exports = {
  obtenerComentariosPorPublicacion,
  buscarComentarioPorId,
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  eliminarHiloComentario
};
