const adaptadorIgdb = require('../utils/adaptadorIgdb');
const servicioPuntuaciones = require('./servicioPuntuaciones');

const crearErrorJuego = (mensaje, codigoEstado) => {
  const error = new Error(mensaje);
  error.statusCode = codigoEstado;
  return error;
};

const enriquecerJuegoConPuntuacion = async (juego, idUsuario = null) => {
  if (!juego) return null;
  const resumen = await servicioPuntuaciones.obtenerResumenPuntuacion(juego.titulo, idUsuario);
  return {
    ...juego,
    puntajeComunidad: resumen.promedio,
    cantidadVotos: resumen.cantidadVotos,
    miPuntuacion: resumen.miPuntuacion
  };
};

const buscarJuegos = async (termino = '', idUsuario = null) => {
  const textoBusqueda = typeof termino === 'string' ? termino.trim() : '';
  const resultados = await adaptadorIgdb.buscarJuegosEnIgdb(textoBusqueda);

  if (textoBusqueda && resultados.length === 0) {
    throw crearErrorJuego('Juego no encontrado', 404);
  }

  return await Promise.all(
    resultados.map((juego) => enriquecerJuegoConPuntuacion(juego, idUsuario))
  );
};

const obtenerJuegoPorId = async (idJuego, idUsuario = null) => {
  const juego = await adaptadorIgdb.obtenerJuegoPorIdEnIgdb(idJuego);
  if (!juego) {
    throw crearErrorJuego('Juego no encontrado', 404);
  }
  return await enriquecerJuegoConPuntuacion(juego, idUsuario);
};

module.exports = {
  buscarJuegos,
  obtenerJuegoPorId
};
