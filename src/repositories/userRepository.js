const usersDB = [];

const findUserByEmail = async (email) => {
  return usersDB.find((user) => user.email === email.toLowerCase());
};

const findUserById = async (id) => {
  return usersDB.find((user) => user.id === id);
};

const createUser = async (user) => {
  if (usersDB.some((storedUser) => storedUser.email === user.email)) {
    const error = new Error('El correo electrónico ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  usersDB.push(user);
  return user;
};

module.exports = { findUserByEmail, findUserById, createUser };