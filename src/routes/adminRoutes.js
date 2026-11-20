const express = require('express');
const controladorAdmin = require('../controllers/adminController');
const { requerirAdmin } = require('../middlewares/authMiddleware');

const enrutador = express.Router();

enrutador.get('/usuarios', requerirAdmin, controladorAdmin.listarUsuarios);
enrutador.delete('/usuarios/:id', requerirAdmin, controladorAdmin.eliminarUsuario);
enrutador.get('/publicaciones-reportadas', requerirAdmin, controladorAdmin.listarPublicacionesReportadas);

module.exports = enrutador;

