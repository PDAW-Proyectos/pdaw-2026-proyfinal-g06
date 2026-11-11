const { randomUUID } = require('crypto');

const publicacionesBD = [];

const crearPublicacion = async (datosPublicacion) => {
  const publicacion = {
    id: randomUUID(),
    ...datosPublicacion,
    createdAt: new Date().toISOString()
  };
  
  publicacionesBD.unshift(publicacion);
  return publicacion;
};

const buscarPublicacionPorId = async (id) => {
  return publicacionesBD.find((publicacion) => publicacion.id === id) || null;
};

const actualizarPublicacion = async (id, datosPublicacion) => {
  const publicacion = await buscarPublicacionPorId(id);
  if (!publicacion) return null;

  Object.assign(publicacion, datosPublicacion);
  return publicacion;
};

const obtenerPublicaciones = async (pagina = 1, limite = 10, juego = '') => {
  const publicacionesFiltradas = juego
    ? publicacionesBD.filter((publicacion) =>
      (publicacion.game || publicacion.juego || '').toLowerCase() === juego.trim().toLowerCase()
    )
    : publicacionesBD;
  const indiceInicio = (pagina - 1) * limite;
  const indiceFin = pagina * limite;

  return {
    data: publicacionesFiltradas.slice(indiceInicio, indiceFin),
    total: publicacionesFiltradas.length,
    page: pagina,
    totalPages: Math.ceil(publicacionesFiltradas.length / limite)
  };
};

module.exports = {
  crearPublicacion,
  buscarPublicacionPorId,
  actualizarPublicacion,
  obtenerPublicaciones
};

