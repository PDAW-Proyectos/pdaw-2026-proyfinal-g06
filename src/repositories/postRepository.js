const { randomUUID } = require('crypto');
const { VotoPublicacion } = require('../models/votoPublicacion');

const publicacionesBD = [];
const votosPublicacionesBD = [];

const calcularResumenVotos = (idPublicacion, idUsuario = null) => {
  const votos = votosPublicacionesBD.filter((voto) => voto.idPublicacion === idPublicacion);
  const puntajeVotos = votos.reduce((total, voto) => total + voto.valor, 0);
  const votoUsuario = idUsuario
    ? votos.find((voto) => voto.idUsuario === String(idUsuario))
    : null;
  const miVoto = votoUsuario ? votoUsuario.valor : 0;

  return {
    puntajeVotos,
    votes: puntajeVotos,
    miVoto,
    userVote: miVoto
  };
};

const formatearPublicacion = (publicacion, idUsuario = null) => {
  if (!publicacion) return null;
  return {
    ...publicacion,
    ...calcularResumenVotos(publicacion.id, idUsuario)
  };
};

const crearPublicacion = async (datosPublicacion) => {
  const publicacion = {
    id: randomUUID(),
    ...datosPublicacion,
    createdAt: new Date().toISOString()
  };

  publicacionesBD.unshift(publicacion);
  return formatearPublicacion(publicacion, datosPublicacion.author && datosPublicacion.author.id);
};

const buscarPublicacionPorId = async (id, idUsuario = null) => {
  const publicacion = publicacionesBD.find((item) => item.id === id) || null;
  return formatearPublicacion(publicacion, idUsuario);
};

const actualizarPublicacion = async (id, datosPublicacion, idUsuario = null) => {
  const publicacion = publicacionesBD.find((item) => item.id === id) || null;
  if (!publicacion) return null;

  Object.assign(publicacion, datosPublicacion);
  return formatearPublicacion(publicacion, idUsuario);
};

const registrarVotoPublicacion = async (idPublicacion, idUsuario, valor) => {
  const publicacion = publicacionesBD.find((item) => item.id === idPublicacion) || null;
  if (!publicacion) return null;

  const indiceExistente = votosPublicacionesBD.findIndex(
    (voto) => voto.idPublicacion === idPublicacion && voto.idUsuario === String(idUsuario)
  );

  if (indiceExistente !== -1) {
    const votoExistente = votosPublicacionesBD[indiceExistente];
    if (votoExistente.valor === Number(valor)) {
      votosPublicacionesBD.splice(indiceExistente, 1);
    } else {
      votoExistente.actualizarValor(valor);
    }
  } else {
    const nuevoVoto = new VotoPublicacion({
      idUsuario: String(idUsuario),
      idPublicacion,
      valor
    });
    votosPublicacionesBD.push(nuevoVoto);
  }

  return formatearPublicacion(publicacion, idUsuario);
};

const obtenerPublicaciones = async (pagina = 1, limite = 10, juego = '', idUsuario = null) => {
  const publicacionesFiltradas = juego
    ? publicacionesBD.filter((publicacion) =>
      (publicacion.game || publicacion.juego || '').toLowerCase() === juego.trim().toLowerCase()
    )
    : publicacionesBD;
  const indiceInicio = (pagina - 1) * limite;
  const indiceFin = pagina * limite;

  return {
    data: publicacionesFiltradas
      .slice(indiceInicio, indiceFin)
      .map((publicacion) => formatearPublicacion(publicacion, idUsuario)),
    total: publicacionesFiltradas.length,
    page: pagina,
    totalPages: Math.ceil(publicacionesFiltradas.length / limite)
  };
};

module.exports = {
  crearPublicacion,
  buscarPublicacionPorId,
  actualizarPublicacion,
  registrarVotoPublicacion,
  obtenerPublicaciones
};
