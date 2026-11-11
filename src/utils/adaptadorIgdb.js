const URL_TOKEN_TWITCH = process.env.TWITCH_AUTH_URL || 'https://id.twitch.tv/oauth2/token';
const URL_API_IGDB = process.env.IGDB_API_URL || 'https://api.igdb.com/v4/games';
const TIEMPO_LIMITE_MS = 5000;

const cacheBusqueda = new Map();
let tokenAccesoCache = null;
let expiracionTokenMs = 0;

const juegosSimulados = [
  {
    id: 119133,
    titulo: 'Elden Ring',
    imagen: 'https://i.blogs.es/ea0624/elden-ring-new-header-mobile/1366_2000.jpeg',
    descripcion: 'Un vasto mundo donde los campos abiertos con una variedad de situaciones y enormes mazmorras con diseños complejos y tridimensionales se conectan de forma fluida.',
    plataformas: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X|S', 'Xbox One'],
    generos: ['RPG', 'Aventura', 'Mundo abierto'],
    puntaje: 9.5
  },
  {
    id: 14593,
    titulo: 'Hollow Knight',
    imagen: 'https://m.media-amazon.com/images/M/MV5BMGIyYmJmZDgtOWQ1Ny00NDFiLTk2OTgtM2Q2ZWQ4OWIxZjg3XkEyXkFqcGc@._V1_.jpg',
    descripcion: 'Forja tu propio camino en Hollow Knight, una aventura de acción clásica en 2D a través de un vasto mundo interconectado de insectos y héroes.',
    plataformas: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    generos: ['Metroidvania', 'Aventura', 'Indie'],
    puntaje: 9.3
  },
  {
    id: 228530,
    titulo: 'Hades II',
    imagen: 'https://m.media-amazon.com/images/M/MV5BYmU1MzVkYjMtNmI2Ny00NWQzLWE5MjQtZTIzNzgzMGY3ODEyXkEyXkFqcGc@._V1_.jpg',
    descripcion: 'Lucha más allá del Inframundo usando hechicería oscura para enfrentarte al Titán del Tiempo en esta secuela roguelike de exploración de mazmorras.',
    plataformas: ['PC'],
    generos: ['Roguelike', 'Acción', 'RPG'],
    puntaje: 9.1
  },
  {
    id: 1942,
    titulo: 'The Witcher 3: Wild Hunt',
    imagen: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
    descripcion: 'Eres Geralt de Rivia, cazador de monstruos mercenario, en un continente devastado por la guerra e infestado de criaturas.',
    plataformas: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X|S', 'Nintendo Switch'],
    generos: ['RPG', 'Aventura'],
    puntaje: 9.4
  },
  {
    id: 26192,
    titulo: 'Celeste',
    imagen: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3byy.jpg',
    descripcion: 'Ayuda a Madeline a sobrevivir a sus demonios internos en su viaje hasta la cima de la montaña Celeste en este juego de plataformas.',
    plataformas: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    generos: ['Plataformas', 'Aventura', 'Indie'],
    puntaje: 9.0
  }
];

const tieneCredencialesValidas = () => {
  const idCliente = process.env.TWITCH_CLIENT_ID;
  const secretoCliente = process.env.TWITCH_CLIENT_SECRET;
  const tokenDirecto = process.env.IGDB_ACCESS_TOKEN;

  if (!idCliente || idCliente === 'tu_client_id_de_twitch_aqui') {
    return false;
  }
  if (tokenDirecto) {
    return true;
  }
  return Boolean(secretoCliente && secretoCliente !== 'tu_client_secret_de_twitch_aqui');
};

const normalizarUrlImagen = (url) => {
  if (!url || typeof url !== 'string') return '';
  const urlConProtocolo = url.startsWith('//') ? `https:${url}` : url;
  return urlConProtocolo.replace('t_thumb', 't_cover_big');
};

const normalizarJuegoIgdb = (datosJuego) => {
  const puntajeBase = typeof datosJuego.rating === 'number'
    ? Number((datosJuego.rating / 10).toFixed(1))
    : 0;

  return {
    id: datosJuego.id,
    titulo: datosJuego.name || 'Sin título',
    imagen: normalizarUrlImagen(datosJuego.cover && datosJuego.cover.url),
    descripcion: datosJuego.summary || 'Sin descripción disponible.',
    plataformas: Array.isArray(datosJuego.platforms)
      ? datosJuego.platforms.map((plataforma) => plataforma.name).filter(Boolean)
      : [],
    generos: Array.isArray(datosJuego.genres)
      ? datosJuego.genres.map((genero) => genero.name).filter(Boolean)
      : [],
    puntaje: puntajeBase
  };
};

const obtenerTokenTwitch = async () => {
  if (process.env.IGDB_ACCESS_TOKEN) {
    return process.env.IGDB_ACCESS_TOKEN;
  }

  if (tokenAccesoCache && Date.now() < expiracionTokenMs) {
    return tokenAccesoCache;
  }

  const parametros = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials'
  });

  const respuesta = await fetch(`${URL_TOKEN_TWITCH}?${parametros.toString()}`, {
    method: 'POST',
    signal: AbortSignal.timeout(TIEMPO_LIMITE_MS)
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo autenticar con Twitch para IGDB');
  }

  const datos = await respuesta.json();
  tokenAccesoCache = datos.access_token;
  expiracionTokenMs = Date.now() + ((datos.expires_in || 3600) - 60) * 1000;
  return tokenAccesoCache;
};

const filtrarJuegosSimulados = (termino) => {
  const terminoNormalizado = termino.trim().toLowerCase();
  if (!terminoNormalizado) {
    return juegosSimulados;
  }
  return juegosSimulados.filter((juego) =>
    juego.titulo.toLowerCase().includes(terminoNormalizado)
  );
};

const consultarIgdbRemoto = async (termino) => {
  const token = await obtenerTokenTwitch();
  const terminoLimpio = termino.replace(/"/g, '').trim();
  const consulta = terminoLimpio
    ? `search "${terminoLimpio}"; fields id,name,summary,cover.url,platforms.name,genres.name,rating; limit 10;`
    : 'fields id,name,summary,cover.url,platforms.name,genres.name,rating; sort rating desc; limit 10;';

  const respuesta = await fetch(URL_API_IGDB, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'text/plain'
    },
    body: consulta,
    signal: AbortSignal.timeout(TIEMPO_LIMITE_MS)
  });

  if (!respuesta.ok) {
    throw new Error('Error al consultar la API de IGDB');
  }

  const datos = await respuesta.json();
  return Array.isArray(datos) ? datos.map(normalizarJuegoIgdb) : [];
};

const buscarJuegosEnIgdb = async (termino = '') => {
  const claveCache = termino.trim().toLowerCase();
  if (cacheBusqueda.has(claveCache)) {
    return cacheBusqueda.get(claveCache);
  }

  if (!tieneCredencialesValidas()) {
    const resultadosSimulados = filtrarJuegosSimulados(termino);
    cacheBusqueda.set(claveCache, resultadosSimulados);
    return resultadosSimulados;
  }

  try {
    const resultadosRemotos = await consultarIgdbRemoto(termino);
    cacheBusqueda.set(claveCache, resultadosRemotos);
    return resultadosRemotos;
  } catch (error) {
    console.warn('No se pudo consultar IGDB; se usarán datos de ejemplo:', error.message);
    return filtrarJuegosSimulados(termino);
  }
};

const obtenerJuegoPorIdEnIgdb = async (idJuego) => {
  const idNumerico = Number(idJuego);
  const juegos = await buscarJuegosEnIgdb('');
  const encontrado = juegos.find((juego) => Number(juego.id) === idNumerico);
  if (encontrado) {
    return encontrado;
  }
  return juegosSimulados.find((juego) => Number(juego.id) === idNumerico) || null;
};

const limpiarCacheIgdb = () => {
  cacheBusqueda.clear();
  tokenAccesoCache = null;
  expiracionTokenMs = 0;
};

module.exports = {
  buscarJuegosEnIgdb,
  obtenerJuegoPorIdEnIgdb,
  limpiarCacheIgdb,
  normalizarJuegoIgdb
};
