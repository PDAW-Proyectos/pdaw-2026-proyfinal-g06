const express = require('express');
const enrutador = express.Router();
const controladorAutenticacion = require('../controllers/authController');

enrutador.post('/register', controladorAutenticacion.registrar);
enrutador.post('/login', controladorAutenticacion.iniciarSesion);
enrutador.get('/me', controladorAutenticacion.usuarioActual);
enrutador.post('/logout', controladorAutenticacion.cerrarSesion);

module.exports = enrutador;