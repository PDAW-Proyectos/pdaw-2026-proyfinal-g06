const servicioJuegos = require('../services/servicioJuegos');

const buscarJuegos = async (peticion, respuesta) => {
  const termino = peticion.query.busqueda || '';

  try {
    const juegos = await servicioJuegos.buscarJuegos(termino);
    respuesta.status(200).json({ datos: juegos });
  } catch (error) {
    respuesta.status(error.statusCode || 500).json({
      error: error.message || 'Error al buscar videojuegos'
    });
  }
};

const obtenerJuegoPorId = async (peticion, respuesta) => {
  try {
    const juego = await servicioJuegos.obtenerJuegoPorId(peticion.params.id);
    respuesta.status(200).json({ datos: juego });
  } catch (error) {
    respuesta.status(error.statusCode || 500).json({
      error: error.message || 'Error al obtener el videojuego'
    });
  }
};

module.exports = {
  buscarJuegos,
  obtenerJuegoPorId
};

