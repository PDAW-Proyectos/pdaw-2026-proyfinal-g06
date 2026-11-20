const { Puntuacion } = require('../models/puntuacion');
const { obtenerColeccion, guardarColeccion } = require('../utils/almacenamientoJson');

const puntuacionesBD = obtenerColeccion('puntuaciones').map((datos) =>
  Puntuacion.fromJSON(datos)
);

const sincronizarPuntuaciones = () => {
  guardarColeccion('puntuaciones', puntuacionesBD.map((item) => item.toJSON()));
};

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
    sincronizarPuntuaciones();
    return existente;
  }

  const nuevaPuntuacion = new Puntuacion({ idUsuario, juego, nota });
  puntuacionesBD.push(nuevaPuntuacion);
  sincronizarPuntuaciones();
  return nuevaPuntuacion;
};

const obtenerPuntuacionesPorJuego = async (juego) => {
  const juegoNormalizado = normalizarNombreJuego(juego);
  if (!juegoNormalizado) return [];
  return puntuacionesBD.filter(
    (puntuacion) => normalizarNombreJuego(puntuacion.juego) === juegoNormalizado
  );
};

const obtenerJuegosMejorPuntuados = async (limite = 5) => {
  const puntuacionesPorJuego = new Map();

  for (const puntuacion of puntuacionesBD) {
    const clave = normalizarNombreJuego(puntuacion.juego);
    if (!clave) continue;

    const resumen = puntuacionesPorJuego.get(clave) || {
      juego: puntuacion.juego,
      sumaNotas: 0,
      cantidadVotos: 0
    };
    resumen.sumaNotas += puntuacion.nota;
    resumen.cantidadVotos += 1;
    puntuacionesPorJuego.set(clave, resumen);
  }

  const limiteSeguro = Math.max(1, parseInt(limite, 10) || 5);
  return [...puntuacionesPorJuego.values()]
    .map((resumen) => ({
      juego: resumen.juego,
      promedio: Number((resumen.sumaNotas / resumen.cantidadVotos).toFixed(1)),
      cantidadVotos: resumen.cantidadVotos
    }))
    .sort((a, b) =>
      b.promedio - a.promedio
      || b.cantidadVotos - a.cantidadVotos
      || a.juego.localeCompare(b.juego)
    )
    .slice(0, limiteSeguro);
};

const eliminarPuntuacionPorUsuarioYJuego = async (idUsuario, juego) => {
  const juegoNormalizado = normalizarNombreJuego(juego);
  const indice = puntuacionesBD.findIndex(
    (puntuacion) =>
      puntuacion.idUsuario === String(idUsuario) &&
      normalizarNombreJuego(puntuacion.juego) === juegoNormalizado
  );
  if (indice === -1) return false;
  puntuacionesBD.splice(indice, 1);
  sincronizarPuntuaciones();
  return true;
};

const obtenerPuntuacionesPorUsuario = async (idUsuario) => {
  if (!idUsuario) return [];
  return puntuacionesBD
    .filter((puntuacion) => puntuacion.idUsuario === String(idUsuario))
    .map((puntuacion) => puntuacion.toJSON());
};

const limpiarPuntuaciones = () => {
  puntuacionesBD.length = 0;
  sincronizarPuntuaciones();
};

module.exports = {
  buscarPuntuacionPorUsuarioYJuego,
  guardarPuntuacion,
  eliminarPuntuacionPorUsuarioYJuego,
  obtenerPuntuacionesPorJuego,
  obtenerPuntuacionesPorUsuario,
  obtenerJuegosMejorPuntuados,
  limpiarPuntuaciones
};
