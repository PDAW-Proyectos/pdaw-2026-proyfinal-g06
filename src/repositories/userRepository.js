const { Usuario } = require('../models/usuario');
const { obtenerColeccion, guardarColeccion } = require('../utils/almacenamientoJson');

const usuariosDB = obtenerColeccion('usuarios').map((datos) => Usuario.fromJSON(datos));

const sincronizarUsuarios = () => {
  guardarColeccion('usuarios', usuariosDB.map((usuario) => usuario.toJSON()));
};

const buscarUsuarioPorEmail = async (email) => {
  const encontrado = usuariosDB.find((usuario) => usuario.correo === email.toLowerCase());
  return encontrado ? encontrado.toJSON() : undefined;
};

const buscarUsuarioPorId = async (id) => {
  const encontrado = usuariosDB.find((usuario) => usuario.id === id);
  return encontrado ? encontrado.toJSON() : undefined;
};

const crearUsuario = async (datosUsuario) => {
  const nuevoUsuario = new Usuario(datosUsuario);
  if (usuariosDB.some((usuarioGuardado) => usuarioGuardado.correo === nuevoUsuario.correo)) {
    const error = new Error('El correo electrónico ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  usuariosDB.push(nuevoUsuario);
  sincronizarUsuarios();
  return nuevoUsuario.toJSON();
};

module.exports = { buscarUsuarioPorEmail, buscarUsuarioPorId, crearUsuario };
