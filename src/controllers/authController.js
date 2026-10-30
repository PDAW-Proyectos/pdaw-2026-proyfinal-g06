const servicioAutenticacion = require('../services/authService');

const enviarErrorAutenticacion = (res, error, mensajePorDefecto) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: mensajePorDefecto });
};

const registrar = async (req, res) => {
  const { name: nombre, email, password } = req.body || {};

  try {
    const usuario = await servicioAutenticacion.registrarUsuario(nombre, email, password);
    res.status(201).json({ message: 'Cuenta creada correctamente', user: usuario });
  } catch (error) {
    enviarErrorAutenticacion(res, error, 'Error al crear la cuenta');
  }
};

const iniciarSesion = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    const usuario = await servicioAutenticacion.autenticarUsuario(email, password);

    req.session.regenerate((error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al iniciar sesión' });
      }

      req.session.userId = usuario.id;
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: { id: usuario.id, name: usuario.name }
      });
    });
  } catch (error) {
    enviarErrorAutenticacion(res, error, 'Error al iniciar sesión');
  }
};

const usuarioActual = async (req, res) => {
  if (!req.session.userId) {
    return res.status(200).json({ user: null });
  }

  try {
    const usuario = await servicioAutenticacion.obtenerUsuarioPorId(req.session.userId);
    if (!usuario) {
      return res.status(200).json({ user: null });
    }
    return res.status(200).json({ user: usuario });
  } catch (error) {
    return enviarErrorAutenticacion(res, error, 'Error al consultar la sesión');
  }
};

const cerrarSesion = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Sesión cerrada' });
  });
};

module.exports = { registrar, iniciarSesion, usuarioActual, cerrarSesion };