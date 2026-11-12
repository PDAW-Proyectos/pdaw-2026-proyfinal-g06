const repositorioPuntuaciones = require('../repositories/repositorioPuntuaciones');

const crearErrorPuntuacion = (mensaje, codigoEstado) => {
  const error = new Error(mensaje);
  error.statusCode = codigoEstado;
  error.status = codigoEstado;
  return error;
};

const obtenerResumenPuntuacion = async (juego, idUsuario = null) => {
  const nombreJuego = typeof juego === 'string' ? juego.trim() : '';
  if (!nombreJuego) {
    throw crearErrorPuntuacion('El nombre del videojuego es obligatorio', 400);
  }

  const puntuaciones = await repositorioPuntuaciones.obtenerPuntuacionesPorJuego(nombreJuego);
  const cantidadVotos = puntuaciones.length;
  const sumaNotas = puntuaciones.reduce((acumulado, puntuacion) => acumulado + puntuacion.nota, 0);
  const promedio = cantidadVotos > 0 ? Number((sumaNotas / cantidadVotos).toFixed(1)) : 0;

  let miPuntuacion = null;
  if (idUsuario) {
    const puntuacionUsuario = await repositorioPuntuaciones.buscarPuntuacionPorUsuarioYJuego(
      String(idUsuario),
      nombreJuego
    );
    miPuntuacion = puntuacionUsuario ? puntuacionUsuario.nota : null;
  }

  return {
    juego: nombreJuego,
    promedio,
    cantidadVotos,
    miPuntuacion
  };
};

const registrarPuntuacion = async (juego, nota, idUsuario) => {
  if (!idUsuario) {
    throw crearErrorPuntuacion('Se requiere iniciar sesión para realizar esta acción', 401);
  }
  const nombreJuego = typeof juego === 'string' ? juego.trim() : '';
  if (!nombreJuego) {
    throw crearErrorPuntuacion('El nombre del videojuego es obligatorio', 400);
  }

  await repositorioPuntuaciones.guardarPuntuacion({
    idUsuario: String(idUsuario),
    juego: nombreJuego,
    nota
  });

  return await obtenerResumenPuntuacion(nombreJuego, idUsuario);
};

module.exports = {
  obtenerResumenPuntuacion,
  registrarPuntuacion
};
