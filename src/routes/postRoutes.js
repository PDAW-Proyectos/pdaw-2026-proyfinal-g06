const express = require('express');
const enrutador = express.Router();
const controladorPublicaciones = require('../controllers/postController');
const { requerirAutenticacion } = require('../middlewares/authMiddleware');

enrutador.get('/', controladorPublicaciones.obtenerPublicaciones);
enrutador.get('/:id', controladorPublicaciones.obtenerPublicacionPorId);
enrutador.post('/', requerirAutenticacion, controladorPublicaciones.crearPublicacion);
enrutador.patch('/:id', requerirAutenticacion, controladorPublicaciones.actualizarPublicacion);

module.exports = enrutador;

