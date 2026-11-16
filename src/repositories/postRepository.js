const { randomUUID } = require('crypto');
const { VotoPublicacion } = require('../models/votoPublicacion');
const { CalificacionPublicacion } = require('../models/calificacionPublicacion');

const publicacionesBD = [];
const votosPublicacionesBD = [];
const calificacionesPublicacionesBD = [];

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

const obtenerCalificacionesPublicacion = (idPublicacion) => calificacionesPublicacionesBD.filter(
  (calificacion) => calificacion.idPublicacion === idPublicacion
);

const calcularResumenCalificaciones = (idPublicacion, idUsuario = null) => {
  const calificaciones = obtenerCalificacionesPublicacion(idPublicacion);
  const sumaCalificaciones = calificaciones.reduce(
    (total, calificacion) => total + calificacion.valor,
    0
  );
  const miCalificacion = idUsuario
    ? calificaciones.find((calificacion) => calificacion.idUsuario === String(idUsuario))
    : null;

  return {
    promedioPuntuacion: calificaciones.length > 0
      ? Number((sumaCalificaciones / calificaciones.length).toFixed(1))
      : 0,
    cantidadPuntuaciones: calificaciones.length,
    miCalificacionPublicacion: miCalificacion ? miCalificacion.valor : null
  };
};

const formatearPublicacion = (publicacion, idUsuario = null) => {
  if (!publicacion) return null;
  return {
    ...publicacion,
    ...calcularResumenVotos(publicacion.id, idUsuario),
    ...calcularResumenCalificaciones(publicacion.id, idUsuario)
  };
};

const obtenerPublicacionesMejorPuntuadas = async (limite = 5, idUsuario = null) => {
  const limiteSeguro = Math.max(1, Math.floor(Number(limite) || 5));
  const resumenes = new Map();

  calificacionesPublicacionesBD.forEach((calificacion) => {
    const resumen = resumenes.get(calificacion.idPublicacion) || { suma: 0, cantidad: 0 };
    resumen.suma += calificacion.valor;
    resumen.cantidad += 1;
    resumenes.set(calificacion.idPublicacion, resumen);
  });

  return publicacionesBD
    .map((publicacion) => {
      const resumen = resumenes.get(publicacion.id) || { suma: 0, cantidad: 0 };
      return {
        publicacion: formatearPublicacion(publicacion, idUsuario),
        promedio: resumen.cantidad ? resumen.suma / resumen.cantidad : 0,
        cantidadPuntuaciones: resumen.cantidad
      };
    })
    .filter((item) => item.cantidadPuntuaciones > 0)
    .sort((a, b) =>
      b.promedio - a.promedio
      || b.cantidadPuntuaciones - a.cantidadPuntuaciones
      || Date.parse(b.publicacion.createdAt) - Date.parse(a.publicacion.createdAt)
    )
    .slice(0, limiteSeguro)
    .map((item) => item.publicacion);
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
  const respaldo = formatearPublicacion(eliminada, idUsuario);
  for (let i = votosPublicacionesBD.length - 1; i >= 0; i -= 1) {
    if (votosPublicacionesBD[i].idPublicacion === id) {
      votosPublicacionesBD.splice(i, 1);
    }
  }
  for (let i = calificacionesPublicacionesBD.length - 1; i >= 0; i -= 1) {
    if (calificacionesPublicacionesBD[i].idPublicacion === id) {
      calificacionesPublicacionesBD.splice(i, 1);
    }
  }
  return respaldo;
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

const registrarCalificacionPublicacion = async (idPublicacion, idUsuario, valor) => {
  const publicacion = publicacionesBD.find((item) => item.id === idPublicacion) || null;
  if (!publicacion) return null;

  const yaCalifico = calificacionesPublicacionesBD.some(
    (calificacion) =>
      calificacion.idPublicacion === idPublicacion &&
      calificacion.idUsuario === String(idUsuario)
  );
  if (yaCalifico) {
    const error = new Error('Ya calificaste esta publicación');
    error.statusCode = 409;
    error.status = 409;
    throw error;
  }

  calificacionesPublicacionesBD.push(new CalificacionPublicacion({
    idUsuario: String(idUsuario),
    idPublicacion,
    valor
  }));
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
  eliminarPublicacion,
  registrarVotoPublicacion,
  registrarCalificacionPublicacion,
  obtenerPublicacionesMejorPuntuadas,
  obtenerPublicaciones
};
