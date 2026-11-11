const adaptadorIgdb = require('../utils/adaptadorIgdb');

const crearErrorJuego = (mensaje, codigoEstado) => {
  const error = new Error(mensaje);
  error.statusCode = codigoEstado;
  return error;
};

const buscarJuegos = async (termino = '') => {
  const textoBusqueda = typeof termino === 'string' ? termino.trim() : '';
  const resultados = await adaptadorIgdb.buscarJuegosEnIgdb(textoBusqueda);

  if (textoBusqueda && resultados.length === 0) {
    throw crearErrorJuego('Juego no encontrado', 404);
  }

  return resultados;
};

const obtenerJuegoPorId = async (idJuego) => {
  const juego = await adaptadorIgdb.obtenerJuegoPorIdEnIgdb(idJuego);
  if (!juego) {
    throw crearErrorJuego('Juego no encontrado', 404);
  }
  return juego;
};

module.exports = {
  buscarJuegos,
  obtenerJuegoPorId
};

