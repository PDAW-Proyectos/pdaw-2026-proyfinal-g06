const cargarConfiguracion = (entorno = process.env) => {
  const modo = entorno.NODE_ENV || 'development';
  const esProduccion = modo === 'production';
  const puerto = Number(entorno.PORT) || 3000;

  if (esProduccion && !entorno.SESSION_SECRET) {
    throw new Error('SESSION_SECRET es obligatorio en producción');
  }

  return Object.freeze({
    entorno: modo,
    esProduccion,
    puerto,
    sessionSecret: entorno.SESSION_SECRET || '',
    twitchClientId: entorno.TWITCH_CLIENT_ID || '',
    twitchClientSecret: entorno.TWITCH_CLIENT_SECRET || ''
  });
};

module.exports = { cargarConfiguracion };

