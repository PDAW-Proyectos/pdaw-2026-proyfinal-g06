const express = require('express');
const sesion = require('express-session');
const path = require('path');
const { randomBytes } = require('crypto');
const rutasAutenticacion = require('./routes/authRoutes');
const rutasPublicaciones = require('./routes/postRoutes');
const rutasJuegos = require('./routes/rutasJuegos');
const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

app.use(sesion({
  secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use('/api/auth', rutasAutenticacion);
app.use('/api/posts', rutasPublicaciones);
app.use('/api/juegos', rutasJuegos);
app.use('/api/games', rutasJuegos);

module.exports = app;
