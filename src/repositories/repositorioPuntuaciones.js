const { Puntuacion } = require('../models/puntuacion');

const puntuacionesBD = [];

const normalizarNombreJuego = (juego) => String(juego || '').trim().toLowerCase();

const buscarPuntuacionPorUsuarioYJuego = async (idUsuario, juego) => {
  const juegoNormalizado = normalizarNombreJuego(juego);
  return puntuacionesBD.find(
    (puntuacion) =>
      puntuacion.idUsuario === String(idUsuario) &&
      normalizarNombreJuego(puntuacion.juego) === juegoNormalizado
  ) || null;
};

const guardarPuntuacion = async ({ idUsuario, juego, nota }) => {
  const existente = await buscarPuntuacionPorUsuarioYJuego(idUsuario, juego);
  if (existente) {
    existente.actualizarNota(nota);
    return existente;
  }

  const nuevaPuntuacion = new Puntuacion({ idUsuario, juego, nota });
  puntuacionesBD.push(nuevaPuntuacion);
  return nuevaPuntuacion;
};

const obtenerPuntuacionesPorJuego = async (juego) => {
  const juegoNormalizado = normalizarNombreJuego(juego);
  if (!juegoNormalizado) return [];
  return puntuacionesBD.filter(
    (puntuacion) => normalizarNombreJuego(puntuacion.juego) === juegoNormalizado
  );
};

const limpiarPuntuaciones = () => {
  puntuacionesBD.length = 0;
};

module.exports = {
  buscarPuntuacionPorUsuarioYJuego,
  guardarPuntuacion,
  obtenerPuntuacionesPorJuego,
  limpiarPuntuaciones
};
