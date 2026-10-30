const express = require('express');
const sesion = require('express-session');
const path = require('path');
const { randomBytes } = require('crypto');
const rutasAutenticacion = require('./routes/authRoutes');
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

module.exports = app;