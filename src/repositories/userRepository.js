const bcrypt = require('bcryptjs');
const { Usuario } = require('../models/usuario');
const { obtenerColeccion, guardarColeccion } = require('../utils/almacenamientoJson');

const usuariosDB = obtenerColeccion('usuarios').map((datos) => Usuario.fromJSON(datos));

const sincronizarUsuarios = () => {
  guardarColeccion('usuarios', usuariosDB.map((usuario) => usuario.toJSON()));
};

const asegurarAdminInicial = () => {
  const existeAdmin = usuariosDB.some((usuario) => usuario.rol === 'admin');
  if (!existeAdmin) {
    const admin = new Usuario({
      name: 'Administrador',
      email: 'admin@respawn.com',
      passwordHash: bcrypt.hashSync('Admin1234!', 10),
      rol: 'admin'
    });
    usuariosDB.push(admin);
    sincronizarUsuarios();
  }
};

asegurarAdminInicial();

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

const listarUsuarios = async () => {
  return usuariosDB.map((usuario) => ({
    id: usuario.id,
    name: usuario.nombre,
    email: usuario.correo,
    rol: usuario.rol,
    createdAt: usuario.fechaCreacion
  }));
};

const eliminarUsuarioPorId = async (id) => {
  const indice = usuariosDB.findIndex((usuario) => usuario.id === id);
  if (indice === -1) return null;
  const [eliminado] = usuariosDB.splice(indice, 1);
  sincronizarUsuarios();
  return {
    id: eliminado.id,
    name: eliminado.nombre,
    email: eliminado.correo,
    rol: eliminado.rol
  };
};

module.exports = {
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  crearUsuario,
  listarUsuarios,
  eliminarUsuarioPorId
};
