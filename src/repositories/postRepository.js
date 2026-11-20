const { Publicacion } = require('../models/publicacion');
const { VotoPublicacion } = require('../models/votoPublicacion');
const { Reporte } = require('../models/reporte');
const { obtenerColeccion, guardarColeccion } = require('../utils/almacenamientoJson');

const publicacionesBD = obtenerColeccion('publicaciones').map((datos) =>
  Publicacion.fromJSON(datos)
);
const votosPublicacionesBD = obtenerColeccion('votosPublicaciones').map((datos) =>
  VotoPublicacion.fromJSON(datos)
);
const reportesPublicacionesBD = obtenerColeccion('reportesPublicaciones').map((datos) =>
  Reporte.fromJSON(datos)
);

const sincronizarPublicaciones = () => {
  guardarColeccion('publicaciones', publicacionesBD.map((item) => item.toJSON()));
  guardarColeccion('votosPublicaciones', votosPublicacionesBD.map((item) => item.toJSON()));
  guardarColeccion('reportesPublicaciones', reportesPublicacionesBD.map((item) => item.toJSON()));
};

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

const calcularResumenReportes = (idPublicacion, idUsuario = null) => {
  const reportes = reportesPublicacionesBD.filter(
    (reporte) => reporte.idPublicacion === idPublicacion
  );
  const yaReportado = idUsuario
    ? reportes.some((reporte) => reporte.idUsuario === String(idUsuario))
    : false;

  return {
    cantidadReportes: reportes.length,
    requiereRevision: reportes.length >= 3,
    yaReportado
  };
};

const formatearPublicacion = (publicacion, idUsuario = null) => {
  if (!publicacion) return null;
  const base = typeof publicacion.toJSON === 'function' ? publicacion.toJSON() : { ...publicacion };
  return {
    ...base,
    ...calcularResumenVotos(base.id, idUsuario),
    ...calcularResumenReportes(base.id, idUsuario)
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
  const publicacion = new Publicacion(datosPublicacion);
  publicacionesBD.unshift(publicacion);
  sincronizarPublicaciones();
  return formatearPublicacion(publicacion, datosPublicacion.author && datosPublicacion.author.id);
};

const buscarPublicacionPorId = async (id, idUsuario = null) => {
  const publicacion = publicacionesBD.find((item) => item.id === id) || null;
  return formatearPublicacion(publicacion, idUsuario);
};

const actualizarPublicacion = async (id, datosPublicacion, idUsuario = null) => {
  const publicacion = publicacionesBD.find((item) => item.id === id) || null;
  if (!publicacion) return null;

  publicacion.actualizar(datosPublicacion);
  sincronizarPublicaciones();
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
  for (let i = reportesPublicacionesBD.length - 1; i >= 0; i -= 1) {
    if (reportesPublicacionesBD[i].idPublicacion === id) {
      reportesPublicacionesBD.splice(i, 1);
    }
  }
  sincronizarPublicaciones();
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

  sincronizarPublicaciones();
  return formatearPublicacion(publicacion, idUsuario);
};

const registrarReportePublicacion = async (idPublicacion, idUsuario, motivo) => {
  const publicacion = publicacionesBD.find((item) => item.id === idPublicacion) || null;
  if (!publicacion) return null;

  const yaReporto = reportesPublicacionesBD.some(
    (reporte) =>
      reporte.idPublicacion === idPublicacion &&
      reporte.idUsuario === String(idUsuario)
  );
  if (yaReporto) {
    const error = new Error('Ya reportaste esta publicación');
    error.statusCode = 409;
    error.status = 409;
    throw error;
  }

  const nuevoReporte = new Reporte({
    idUsuario: String(idUsuario),
    idPublicacion,
    motivo
  });
  reportesPublicacionesBD.push(nuevoReporte);
  sincronizarPublicaciones();
  return formatearPublicacion(publicacion, idUsuario);
};

const obtenerPublicaciones = async (
  pagina = 1,
  limite = 10,
  juego = '',
  idUsuario = null,
  orden = 'recientes',
  categoria = ''
) => {
  const publicacionesPorJuego = juego
    ? publicacionesBD.filter((publicacion) =>
      (publicacion.game || publicacion.juego || '').toLowerCase() === juego.trim().toLowerCase()
    )
    : publicacionesBD;

  const publicacionesFiltradas = categoria
    ? publicacionesPorJuego.filter((publicacion) =>
      (publicacion.category || publicacion.categoria || '').toLowerCase() === categoria.trim().toLowerCase()
    )
    : publicacionesPorJuego;

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

const obtenerPublicacionesReportadas = async (idUsuario = null) => {
  const publicaciones = publicacionesBD
    .map((publicacion) => formatearPublicacion(publicacion, idUsuario))
    .filter((publicacion) => publicacion.requiereRevision);
  return ordenarPublicacionesInmutable(publicaciones, 'recientes');
};

const eliminarPublicacionesPorAutor = async (idUsuario) => {
  const idsEliminados = [];
  for (let i = publicacionesBD.length - 1; i >= 0; i -= 1) {
    const autor = publicacionesBD[i].autor;
    if (autor && String(autor.id) === String(idUsuario)) {
      idsEliminados.push(publicacionesBD[i].id);
      publicacionesBD.splice(i, 1);
    }
  }
  if (idsEliminados.length > 0) {
    const conjuntoIds = new Set(idsEliminados);
    for (let i = votosPublicacionesBD.length - 1; i >= 0; i -= 1) {
      if (conjuntoIds.has(votosPublicacionesBD[i].idPublicacion)) {
        votosPublicacionesBD.splice(i, 1);
      }
    }
    for (let i = reportesPublicacionesBD.length - 1; i >= 0; i -= 1) {
      if (conjuntoIds.has(reportesPublicacionesBD[i].idPublicacion)) {
        reportesPublicacionesBD.splice(i, 1);
      }
    }
    sincronizarPublicaciones();
  }
  return idsEliminados;
};

module.exports = {
  crearPublicacion,
  buscarPublicacionPorId,
  actualizarPublicacion,
  eliminarPublicacion,
  eliminarPublicacionesPorAutor,
  registrarVotoPublicacion,
  registrarReportePublicacion,
  obtenerPublicaciones,
  obtenerPublicacionesMejorPuntuadas,
  obtenerPublicacionesReportadas
};
