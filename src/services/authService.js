const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const userRepository = require('../repositories/userRepository');

const createAuthError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const registerUser = async (name, email, password) => {
  if (typeof name !== 'string' || !name.trim()) {
    throw createAuthError('El nombre visible es obligatorio', 400);
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw createAuthError('Introduce un correo electrónico válido', 400);
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw createAuthError('La contraseña debe tener al menos 8 caracteres', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw createAuthError('El correo electrónico ya está registrado', 409);
  }

  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12)
  };

  await userRepository.createUser(user);
  return { id: user.id, name: user.name };
};

const authenticateUser = async (email, password) => {
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    throw createAuthError('Introduce tu correo electrónico y contraseña', 400);
  }

  const user = await userRepository.findUserByEmail(email.trim().toLowerCase());
  if (!user) {
    throw createAuthError('Credenciales inválidas', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw createAuthError('Credenciales inválidas', 401);
  }

  return user;
};

const getUserById = async (id) => {
  const user = await userRepository.findUserById(id);
  return user ? { id: user.id, name: user.name } : null;
};

module.exports = { registerUser, authenticateUser, getUserById };