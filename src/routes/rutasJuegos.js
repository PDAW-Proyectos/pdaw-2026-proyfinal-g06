const express = require('express');
const enrutador = express.Router();
const controladorJuegos = require('../controllers/controladorJuegos');
const { requerirAutenticacion } = require('../middlewares/authMiddleware');

enrutador.get('/', controladorJuegos.buscarJuegos);
enrutador.get('/puntuaciones', controladorJuegos.obtenerPuntuacionJuego);
enrutador.get('/mejores-puntuados', controladorJuegos.obtenerJuegosMejorPuntuados);
enrutador.post('/puntuaciones', requerirAutenticacion, controladorJuegos.puntuarJuego);
enrutador.get('/:id', controladorJuegos.obtenerJuegoPorId);

module.exports = enrutador;
