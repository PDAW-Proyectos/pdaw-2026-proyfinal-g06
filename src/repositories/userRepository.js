const usuariosDB = [];

const buscarUsuarioPorEmail = async (email) => {
  return usuariosDB.find((usuario) => usuario.email === email.toLowerCase());
};

const buscarUsuarioPorId = async (id) => {
  return usuariosDB.find((usuario) => usuario.id === id);
};

const crearUsuario = async (usuario) => {
  if (usuariosDB.some((usuarioGuardado) => usuarioGuardado.email === usuario.email)) {
    const error = new Error('El correo electrónico ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  usuariosDB.push(usuario);
  return usuario;
};

module.exports = { buscarUsuarioPorEmail, buscarUsuarioPorId, crearUsuario };