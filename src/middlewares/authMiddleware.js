const requerirAutenticacion = (req, res, siguiente) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión para realizar esta acción' });
  }
  
  siguiente(); 
};

module.exports = { requerirAutenticacion };