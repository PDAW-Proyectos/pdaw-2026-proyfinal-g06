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

const obtenerPublicaciones = async (pagina = 1, limite = 10) => {
  const indiceInicio = (pagina - 1) * limite;
  const indiceFin = pagina * limite;
  
  return {
    data: publicacionesBD.slice(indiceInicio, indiceFin),
    total: publicacionesBD.length,
    page: pagina,
    totalPages: Math.ceil(publicacionesBD.length / limite)
  };
};

module.exports = { crearPublicacion, obtenerPublicaciones };

