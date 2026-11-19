const express = require('express');
const sesion = require('express-session');
const path = require('path');
const { version } = require('../package.json');
const { cargarConfiguracion } = require('./config');
const rutasAutenticacion = require('./routes/authRoutes');
const rutasPublicaciones = require('./routes/postRoutes');
const rutasJuegos = require('./routes/rutasJuegos');
const { obtenerSecretoSesion, AlmacenSesionesJson } = require('./utils/almacenamientoJson');

const config = cargarConfiguracion();
const app = express();

if (config.esProduccion) {
  app.set('trust proxy', 1);
}

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

app.use(sesion({
  store: new AlmacenSesionesJson(),
  secret: config.sessionSecret || obtenerSecretoSesion(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.esProduccion,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.get('/api/salud', (req, res) => {
  res.status(200).json({
    estado: 'ok',
    version,
    entorno: config.entorno,
    uptime: Math.floor(process.uptime())
  });
});

app.use('/api/auth', rutasAutenticacion);
app.use('/api/posts', rutasPublicaciones);
app.use('/api/juegos', rutasJuegos);
app.use('/api/games', rutasJuegos);

module.exports = app;
