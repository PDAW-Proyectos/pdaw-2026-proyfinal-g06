const repositorioPublicaciones = require('../repositories/postRepository');
const repositorioUsuarios = require('../repositories/userRepository');
const adaptadorIgdb = require('../utils/adaptadorIgdb');

const CATEGORIAS_VALIDAS = ['Informativa', 'Review o reseña', 'Crítica', 'Bug o problema técnico'];
const LIMITE_POR_PAGINA = 10;

const crearErrorPublicacion = (mensaje, codigoEstado) => {
  const error = new Error(mensaje);
  error.statusCode = codigoEstado;
  return error;
};

const crearPublicacion = async (titulo, categoria, contenido, juego, idUsuario) => {
  if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
    throw crearErrorPublicacion('El título es obligatorio', 400);
  }
  if (!contenido || typeof contenido !== 'string' || !contenido.trim()) {
    throw crearErrorPublicacion('El contenido es obligatorio', 400);
  }
  if (!juego || typeof juego !== 'string' || !juego.trim()) {
    throw crearErrorPublicacion('Debe asociar la publicación a un juego', 400);
  }
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    throw crearErrorPublicacion('Categoría inválida', 400);
  }

  const autor = await repositorioUsuarios.buscarUsuarioPorId(idUsuario);
  if (!autor) {
    throw crearErrorPublicacion('Autor no encontrado', 404);
  }

  const juegosEncontrados = await adaptadorIgdb.buscarJuegosEnIgdb(juego.trim());
  const juegoAsociado = juegosEncontrados[0] || null;
  const nombreJuegoFinal = juegoAsociado ? juegoAsociado.titulo : juego.trim();

  const datosPublicacion = {
    title: titulo.trim(),
    titulo: titulo.trim(),
    category: categoria,
    categoria,
    content: contenido.trim(),
    contenido: contenido.trim(),
    game: nombreJuegoFinal,
    juego: nombreJuegoFinal,
    imagenJuego: juegoAsociado ? juegoAsociado.imagen : '',
    datosJuego: juegoAsociado,
    author: { id: autor.id, name: autor.name }
  };

  return await repositorioPublicaciones.crearPublicacion(datosPublicacion);
};

const obtenerPublicaciones = async (pagina) => {
  const paginaActual = Math.max(1, parseInt(pagina, 10) || 1);
  return await repositorioPublicaciones.obtenerPublicaciones(paginaActual, LIMITE_POR_PAGINA);
};

module.exports = { crearPublicacion, obtenerPublicaciones, CATEGORIAS_VALIDAS };

