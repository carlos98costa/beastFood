const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// Middleware de autenticação opcional: não falha se não houver token
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Ignorar erros de token e seguir sem usuário autenticado
  }
  next();
};

module.exports = optionalAuth;


