const { randomUUID } = require('crypto');
const { VotoPublicacion } = require('../models/votoPublicacion');

const publicacionesBD = [];
const votosPublicacionesBD = [];

const calcularResumenVotos = (idPublicacion, idUsuario = null) => {
  const votos = votosPublicacionesBD.filter((voto) => voto.idPublicacion === idPublicacion);
  const puntajeVotos = votos.reduce((total, voto) => total + voto.valor, 0);
  const cantidadVotos = votos.length;
  const votoUsuario = idUsuario
    ? votos.find((voto) => voto.idUsuario === String(idUsuario))
    : null;
  const miVoto = votoUsuario ? votoUsuario.valor : 0;

  return {
    puntajeVotos,
    votes: puntajeVotos,
    cantidadVotos,
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

const ordenarPublicacionesInmutable = (publicaciones, orden = 'recientes') => {
  const criterio = typeof orden === 'string' ? orden.trim().toLowerCase() : 'recientes';
  const ordenarPorVotos = criterio === 'votados' || criterio === 'votos' || criterio === 'votes';

  return [...publicaciones].sort((a, b) => {
    if (ordenarPorVotos) {
      return (
        b.puntajeVotos - a.puntajeVotos
        || b.cantidadVotos - a.cantidadVotos
        || Date.parse(b.createdAt) - Date.parse(a.createdAt)
      );
    }
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
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

const eliminarPublicacion = async (id, idUsuario = null) => {
  const indice = publicacionesBD.findIndex((item) => item.id === id);
  if (indice === -1) return null;

  const [eliminada] = publicacionesBD.splice(indice, 1);
  for (let i = votosPublicacionesBD.length - 1; i >= 0; i -= 1) {
    if (votosPublicacionesBD[i].idPublicacion === id) {
      votosPublicacionesBD.splice(i, 1);
    }
  }
  return formatearPublicacion(eliminada, idUsuario);
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

const obtenerPublicaciones = async (
  pagina = 1,
  limite = 10,
  juego = '',
  idUsuario = null,
  orden = 'recientes'
) => {
  const publicacionesFiltradas = juego
    ? publicacionesBD.filter((publicacion) =>
      (publicacion.game || publicacion.juego || '').toLowerCase() === juego.trim().toLowerCase()
    )
    : publicacionesBD;

  const publicacionesFormateadas = publicacionesFiltradas.map((publicacion) =>
    formatearPublicacion(publicacion, idUsuario)
  );
  const publicacionesOrdenadas = ordenarPublicacionesInmutable(publicacionesFormateadas, orden);

  const indiceInicio = (pagina - 1) * limite;
  const indiceFin = pagina * limite;

  return {
    data: publicacionesOrdenadas.slice(indiceInicio, indiceFin),
    total: publicacionesOrdenadas.length,
    page: pagina,
    totalPages: Math.ceil(publicacionesOrdenadas.length / limite)
  };
};

const obtenerPublicacionesMejorPuntuadas = async (limite = 5, idUsuario = null) => {
  const limiteSeguro = Math.max(1, parseInt(limite, 10) || 5);
  const publicacionesFormateadas = publicacionesBD
    .map((publicacion) => formatearPublicacion(publicacion, idUsuario))
    .filter((publicacion) => publicacion.puntajeVotos > 0);
  return ordenarPublicacionesInmutable(publicacionesFormateadas, 'votados')
    .slice(0, limiteSeguro);
};

module.exports = {
  crearPublicacion,
  buscarPublicacionPorId,
  actualizarPublicacion,
  eliminarPublicacion,
  registrarVotoPublicacion,
  obtenerPublicaciones,
  obtenerPublicacionesMejorPuntuadas
};