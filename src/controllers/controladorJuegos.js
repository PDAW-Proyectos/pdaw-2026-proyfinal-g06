const servicioJuegos = require('../services/servicioJuegos');
const servicioPuntuaciones = require('../services/servicioPuntuaciones');

const buscarJuegos = async (peticion, respuesta) => {
  const termino = peticion.query.busqueda || peticion.query.q || '';
  const idUsuario = peticion.session ? peticion.session.userId : null;

  try {
    const juegos = await servicioJuegos.buscarJuegos(termino, idUsuario);
    respuesta.status(200).json({ datos: juegos });
  } catch (error) {
    respuesta.status(error.statusCode || 500).json({
      error: error.message || 'Error al buscar videojuegos'
    });
  }
};

const obtenerJuegoPorId = async (peticion, respuesta) => {
  const idUsuario = peticion.session ? peticion.session.userId : null;

  try {
    const juego = await servicioJuegos.obtenerJuegoPorId(peticion.params.id, idUsuario);
    respuesta.status(200).json({ datos: juego });
  } catch (error) {
    respuesta.status(error.statusCode || 500).json({
      error: error.message || 'Error al obtener el videojuego'
    });
  }
};

const obtenerPuntuacionJuego = async (peticion, respuesta) => {
  const juego = peticion.query.juego || peticion.query.game || '';
  const idUsuario = peticion.session ? peticion.session.userId : null;

  try {
    const resumen = await servicioPuntuaciones.obtenerResumenPuntuacion(juego, idUsuario);
    respuesta.status(200).json({ datos: resumen });
  } catch (error) {
    respuesta.status(error.statusCode || 500).json({
      error: error.message || 'Error al obtener la puntuación del videojuego'
    });
  }
};

const puntuarJuego = async (peticion, respuesta) => {
  const cuerpo = peticion.body || {};
  const juego = cuerpo.juego !== undefined ? cuerpo.juego : cuerpo.game;
  const nota = cuerpo.nota !== undefined ? cuerpo.nota : cuerpo.score;
  const idUsuario = peticion.session ? peticion.session.userId : null;

  try {
    const resumen = await servicioPuntuaciones.registrarPuntuacion(juego, nota, idUsuario);
    respuesta.status(200).json({
      message: 'Puntuación registrada correctamente',
      datos: resumen
    });
  } catch (error) {
    respuesta.status(error.statusCode || 500).json({
      error: error.message || 'Error al registrar la puntuación'
    });
  }
};

module.exports = {
  buscarJuegos,
  obtenerJuegoPorId,
  obtenerPuntuacionJuego,
  puntuarJuego
};
