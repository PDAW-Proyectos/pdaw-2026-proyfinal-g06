const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión para realizar esta acción' });
  }
  
  next(); 
};

module.exports = { requireAuth };