const express = require('express');
const enrutador = express.Router();
const controladorJuegos = require('../controllers/controladorJuegos');

enrutador.get('/', controladorJuegos.buscarJuegos);
enrutador.get('/:id', controladorJuegos.obtenerJuegoPorId);

module.exports = enrutador;

