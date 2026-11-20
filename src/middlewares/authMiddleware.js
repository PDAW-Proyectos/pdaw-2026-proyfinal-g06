const repositorioUsuarios = require('../repositories/userRepository');

const requerirAutenticacion = (req, res, siguiente) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión para realizar esta acción' });
  }
  
  siguiente(); 
};

const requerirAdmin = async (req, res, siguiente) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión para realizar esta acción' });
  }
  const usuario = await repositorioUsuarios.buscarUsuarioPorId(req.session.userId);
  if (!usuario || usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  siguiente();
};

module.exports = { requerirAutenticacion, requerirAdmin };