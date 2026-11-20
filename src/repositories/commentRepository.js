const { Comentario } = require('../models/comentario');
const { obtenerColeccion, guardarColeccion } = require('../utils/almacenamientoJson');

const comentariosBD = obtenerColeccion('comentarios').map((datos) =>
  Comentario.fromJSON(datos)
);

const sincronizarComentarios = () => {
  guardarColeccion('comentarios', comentariosBD.map((item) => item.toJSON()));
};

const obtenerComentariosPorPublicacion = async (idPublicacion) => comentariosBD
  .filter((comentario) => comentario.idPublicacion === idPublicacion)
  .map((comentario) => comentario.toJSON());

const buscarComentarioPorId = async (id) => {
  const comentario = comentariosBD.find((item) => item.id === id);
  return comentario ? comentario.toJSON() : null;
};

const crearComentario = async (datosComentario) => {
  const comentario = new Comentario(datosComentario);
  comentariosBD.push(comentario);
  sincronizarComentarios();
  return comentario.toJSON();
};

const actualizarComentario = async (id, contenido) => {
  const comentario = comentariosBD.find((item) => item.id === id);
  if (!comentario || comentario.eliminado) return null;

  comentario.actualizarContenido(contenido);
  sincronizarComentarios();
  return comentario.toJSON();
};

const eliminarComentario = async (id) => {
  const comentario = comentariosBD.find((item) => item.id === id);
  if (!comentario || comentario.eliminado) return null;

  comentario.marcarEliminado();
  sincronizarComentarios();
  return comentario.toJSON();
};

const eliminarHiloComentario = async (id) => {
  const comentario = comentariosBD.find((item) => item.id === id);
  if (!comentario) return null;

  const idsHilo = new Set([id]);
  let encontroRespuestas = true;
  while (encontroRespuestas) {
    encontroRespuestas = false;
    for (const respuesta of comentariosBD) {
      if (idsHilo.has(respuesta.idPadre) && !idsHilo.has(respuesta.id)) {
        idsHilo.add(respuesta.id);
        encontroRespuestas = true;
      }
    }
  }

  const respaldo = comentario.toJSON();
  for (let indice = comentariosBD.length - 1; indice >= 0; indice -= 1) {
    if (idsHilo.has(comentariosBD[indice].id)) {
      comentariosBD.splice(indice, 1);
    }
  }
  sincronizarComentarios();
  return { ...respaldo, content: '', deleted: true };
};

const eliminarComentariosPorPublicacion = async (idPublicacion) => {
  for (let indice = comentariosBD.length - 1; indice >= 0; indice -= 1) {
    if (comentariosBD[indice].idPublicacion === idPublicacion) {
      comentariosBD.splice(indice, 1);
    }
  }
  sincronizarComentarios();
};

module.exports = {
  obtenerComentariosPorPublicacion,
  buscarComentarioPorId,
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  eliminarHiloComentario,
  eliminarComentariosPorPublicacion
};
