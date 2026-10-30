const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const repositorioUsuarios = require('../repositories/userRepository');

const crearErrorAutenticacion = (mensaje, codigoEstado) => {
  const error = new Error(mensaje);
  error.statusCode = codigoEstado;
  return error;
};

const registrarUsuario = async (nombre, email, password) => {
  if (typeof nombre !== 'string' || !nombre.trim()) {
    throw crearErrorAutenticacion('El nombre visible es obligatorio', 400);
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw crearErrorAutenticacion('Introduce un correo electrónico válido', 400);
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw crearErrorAutenticacion('La contraseña debe tener al menos 8 caracteres', 400);
  }

  const emailNormalizado = email.trim().toLowerCase();
  const usuarioExistente = await repositorioUsuarios.buscarUsuarioPorEmail(emailNormalizado);
  if (usuarioExistente) {
    throw crearErrorAutenticacion('El correo electrónico ya está registrado', 409);
  }

  const usuario = {
    id: randomUUID(),
    name: nombre.trim(),
    email: emailNormalizado,
    passwordHash: await bcrypt.hash(password, 12)
  };

  await repositorioUsuarios.crearUsuario(usuario);
  return { id: usuario.id, name: usuario.name };
};

const autenticarUsuario = async (email, password) => {
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    throw crearErrorAutenticacion('Introduce tu correo electrónico y contraseña', 400);
  }

  const usuario = await repositorioUsuarios.buscarUsuarioPorEmail(email.trim().toLowerCase());
  if (!usuario) {
    throw crearErrorAutenticacion('Credenciales inválidas', 401);
  }

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) {
    throw crearErrorAutenticacion('Credenciales inválidas', 401);
  }

  return usuario;
};

const obtenerUsuarioPorId = async (id) => {
  const usuario = await repositorioUsuarios.buscarUsuarioPorId(id);
  return usuario ? { id: usuario.id, name: usuario.name } : null;
};

module.exports = { registrarUsuario, autenticarUsuario, obtenerUsuarioPorId };