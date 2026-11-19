const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');
const sesion = require('express-session');

const RUTA_ARCHIVO_DATOS = path.join(__dirname, '..', '..', 'data', 'datos.json');

const crearEstadoInicial = () => ({
  secretoSesion: randomBytes(32).toString('hex'),
  usuarios: [],
  publicaciones: [],
  votosPublicaciones: [],
  reportesPublicaciones: [],
  comentarios: [],
  puntuaciones: [],
  sesiones: {}
});

const esEntornoPruebas = () =>
  Boolean(process.env.NODE_TEST_CONTEXT || process.env.NODE_ENV === 'test');

let estadoCache = null;

const leerEstadoDisco = () => {
  if (estadoCache) return estadoCache;

  if (esEntornoPruebas()) {
    estadoCache = crearEstadoInicial();
    return estadoCache;
  }

  try {
    if (fs.existsSync(RUTA_ARCHIVO_DATOS)) {
      const texto = fs.readFileSync(RUTA_ARCHIVO_DATOS, 'utf8');
      const leido = JSON.parse(texto);
      estadoCache = {
        ...crearEstadoInicial(),
        ...leido,
        sesiones: leido && typeof leido.sesiones === 'object' && leido.sesiones !== null
          ? leido.sesiones
          : {}
      };
      return estadoCache;
    }
  } catch (error) {
    estadoCache = crearEstadoInicial();
    return estadoCache;
  }

  estadoCache = crearEstadoInicial();
  guardarEstadoDisco();
  return estadoCache;
};

const guardarEstadoDisco = () => {
  if (esEntornoPruebas() || !estadoCache) return;
  try {
    const directorio = path.dirname(RUTA_ARCHIVO_DATOS);
    if (!fs.existsSync(directorio)) {
      fs.mkdirSync(directorio, { recursive: true });
    }
    fs.writeFileSync(RUTA_ARCHIVO_DATOS, JSON.stringify(estadoCache, null, 2), 'utf8');
  } catch (error) {
    return;
  }
};

const obtenerColeccion = (nombre) => {
  const estado = leerEstadoDisco();
  return Array.isArray(estado[nombre]) ? estado[nombre] : [];
};

const guardarColeccion = (nombre, elementos) => {
  const estado = leerEstadoDisco();
  estado[nombre] = elementos;
  guardarEstadoDisco();
};

const obtenerSecretoSesion = () => {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const estado = leerEstadoDisco();
  if (!estado.secretoSesion) {
    estado.secretoSesion = randomBytes(32).toString('hex');
    guardarEstadoDisco();
  }
  return estado.secretoSesion;
};

class AlmacenSesionesJson extends sesion.Store {
  get(idSesion, callback) {
    try {
      const estado = leerEstadoDisco();
      const datosSesion = estado.sesiones[idSesion] || null;
      if (!datosSesion) return callback(null, null);

      const expiracion = datosSesion.cookie && datosSesion.cookie.expires
        ? Date.parse(datosSesion.cookie.expires)
        : null;
      if (expiracion && expiracion <= Date.now()) {
        delete estado.sesiones[idSesion];
        guardarEstadoDisco();
        return callback(null, null);
      }
      return callback(null, datosSesion);
    } catch (error) {
      return callback(error);
    }
  }

  set(idSesion, datosSesion, callback) {
    try {
      const estado = leerEstadoDisco();
      estado.sesiones[idSesion] = datosSesion;
      guardarEstadoDisco();
      if (callback) callback(null);
    } catch (error) {
      if (callback) callback(error);
    }
  }

  destroy(idSesion, callback) {
    try {
      const estado = leerEstadoDisco();
      delete estado.sesiones[idSesion];
      guardarEstadoDisco();
      if (callback) callback(null);
    } catch (error) {
      if (callback) callback(error);
    }
  }
}

module.exports = {
  obtenerColeccion,
  guardarColeccion,
  obtenerSecretoSesion,
  AlmacenSesionesJson
};
