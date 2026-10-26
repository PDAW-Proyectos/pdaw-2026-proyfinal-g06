const authService = require('../services/authService');

const sendAuthError = (res, error, fallbackMessage) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: fallbackMessage });
};

const register = async (req, res) => {
  const { name, email, password } = req.body || {};

  try {
    const user = await authService.registerUser(name, email, password);
    res.status(201).json({ message: 'Cuenta creada correctamente', user });
  } catch (error) {
    sendAuthError(res, error, 'Error al crear la cuenta');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    const user = await authService.authenticateUser(email, password);

    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al iniciar sesión' });
      }

      req.session.userId = user.id;
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: { id: user.id, name: user.name }
      });
    });
  } catch (error) {
    sendAuthError(res, error, 'Error al iniciar sesión');
  }
};

const currentUser = async (req, res) => {
  if (!req.session.userId) {
    return res.status(200).json({ user: null });
  }

  try {
    const user = await authService.getUserById(req.session.userId);
    if (!user) {
      return res.status(200).json({ user: null });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return sendAuthError(res, error, 'Error al consultar la sesión');
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Sesión cerrada' });
  });
};

module.exports = { register, login, currentUser, logout };