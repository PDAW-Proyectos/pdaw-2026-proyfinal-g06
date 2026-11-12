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

const validarDatosPublicacion = (titulo, categoria, contenido, juego) => {
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

  return {
    title: titulo.trim(),
    titulo: titulo.trim(),
    category: categoria,
    categoria,
    content: contenido.trim(),
    contenido: contenido.trim(),
    game: juego.trim(),
    juego: juego.trim()
  };
};

const crearPublicacion = async (titulo, categoria, contenido, juego, idUsuario) => {
  const datosValidados = validarDatosPublicacion(titulo, categoria, contenido, juego);
  const autor = await repositorioUsuarios.buscarUsuarioPorId(idUsuario);
  if (!autor) {
    throw crearErrorPublicacion('Autor no encontrado', 404);
  }

  const juegosEncontrados = await adaptadorIgdb.buscarJuegosEnIgdb(datosValidados.game);
  const juegoAsociado = juegosEncontrados.find((juegoEncontrado) =>
    juegoEncontrado.titulo.toLowerCase() === datosValidados.game.toLowerCase()
  ) || juegosEncontrados[0] || null;
  const nombreJuegoFinal = juegoAsociado ? juegoAsociado.titulo : datosValidados.game;

  const datosPublicacion = {
    ...datosValidados,
    game: nombreJuegoFinal,
    juego: nombreJuegoFinal,
    imagenJuego: juegoAsociado ? juegoAsociado.imagen : '',
    datosJuego: juegoAsociado,
    author: { id: autor.id, name: autor.name }
  };

  return await repositorioPublicaciones.crearPublicacion(datosPublicacion);
};

const actualizarPublicacion = async (id, datos, idUsuario) => {
  const publicacion = await repositorioPublicaciones.buscarPublicacionPorId(id);
  if (!publicacion) {
    throw crearErrorPublicacion('Publicación no encontrada', 404);
  }
  if (!publicacion.author || String(publicacion.author.id) !== String(idUsuario)) {
    throw crearErrorPublicacion('Solo puedes editar tus propias publicaciones', 403);
  }

  const datosValidados = validarDatosPublicacion(
    datos.title !== undefined ? datos.title : publicacion.title,
    datos.category !== undefined ? datos.category : publicacion.category,
    datos.content !== undefined ? datos.content : publicacion.content,
    datos.game !== undefined ? datos.game : publicacion.game
  );
  const juegoActual = publicacion.game || publicacion.juego;
  let nombreJuegoFinal = juegoActual;
  let imagenJuego = publicacion.imagenJuego || '';
  let datosJuego = publicacion.datosJuego || null;

  if (datosValidados.game.toLowerCase() !== juegoActual.toLowerCase()) {
    const juegosEncontrados = await adaptadorIgdb.buscarJuegosEnIgdb(datosValidados.game);
    const juegoAsociado = juegosEncontrados.find((juegoEncontrado) =>
      juegoEncontrado.titulo.toLowerCase() === datosValidados.game.toLowerCase()
    ) || juegosEncontrados[0] || null;
    nombreJuegoFinal = juegoAsociado ? juegoAsociado.titulo : datosValidados.game;
    imagenJuego = juegoAsociado ? juegoAsociado.imagen : '';
    datosJuego = juegoAsociado;
  }

  return await repositorioPublicaciones.actualizarPublicacion(id, {
    ...datosValidados,
    game: nombreJuegoFinal,
    juego: nombreJuegoFinal,
    imagenJuego,
    datosJuego,
    author: publicacion.author
  });
};

const obtenerPublicaciones = async (pagina, juego = '') => {
  const paginaActual = Math.max(1, parseInt(pagina, 10) || 1);
  const juegoFiltrado = typeof juego === 'string' ? juego.trim() : '';
  return await repositorioPublicaciones.obtenerPublicaciones(paginaActual, LIMITE_POR_PAGINA, juegoFiltrado);
};

const obtenerPublicacionPorId = async (id) => {
  const publicacion = await repositorioPublicaciones.buscarPublicacionPorId(id);
  if (!publicacion) {
    throw crearErrorPublicacion('Publicación no encontrada', 404);
  }
  return publicacion;
};

module.exports = {
  crearPublicacion,
  actualizarPublicacion,
  obtenerPublicacionPorId,
  obtenerPublicaciones,
  CATEGORIAS_VALIDAS
};

