const express = require('express');
const enrutador = express.Router();
const controladorPublicaciones = require('../controllers/postController');
const controladorComentarios = require('../controllers/commentController');
const { requerirAutenticacion } = require('../middlewares/authMiddleware');

enrutador.get('/', controladorPublicaciones.obtenerPublicaciones);
enrutador.get('/mejores-puntuadas', controladorPublicaciones.obtenerPublicacionesMejorPuntuadas);
enrutador.get('/:id/comments', controladorComentarios.obtenerComentarios);
enrutador.post('/:id/comments', requerirAutenticacion, controladorComentarios.crearComentario);
enrutador.patch('/:id/comments/:commentId', requerirAutenticacion, controladorComentarios.editarComentario);
enrutador.delete('/:id/comments/:commentId', requerirAutenticacion, controladorComentarios.eliminarComentario);
enrutador.get('/:id', controladorPublicaciones.obtenerPublicacionPorId);
enrutador.post('/', requerirAutenticacion, controladorPublicaciones.crearPublicacion);
enrutador.patch('/:id', requerirAutenticacion, controladorPublicaciones.actualizarPublicacion);
enrutador.delete('/:id', requerirAutenticacion, controladorPublicaciones.eliminarPublicacion);
enrutador.post('/:id/voto', requerirAutenticacion, controladorPublicaciones.votarPublicacion);
enrutador.post('/:id/vote', requerirAutenticacion, controladorPublicaciones.votarPublicacion);
enrutador.post('/:id/calificacion', requerirAutenticacion, controladorPublicaciones.calificarPublicacion);

module.exports = enrutador;
