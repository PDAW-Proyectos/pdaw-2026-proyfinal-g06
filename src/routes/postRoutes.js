const express = require('express');
const enrutador = express.Router();
const controladorPublicaciones = require('../controllers/postController');
const { requerirAutenticacion } = require('../middlewares/authMiddleware');

enrutador.get('/', controladorPublicaciones.obtenerPublicaciones);
enrutador.post('/', requerirAutenticacion, controladorPublicaciones.crearPublicacion);

module.exports = enrutador;

