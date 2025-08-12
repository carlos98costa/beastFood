const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../../config/jwt');

class AuthService {
  constructor() {
    this.saltRounds = 12;
  }

  // Gerar tokens JWT
  generateTokens(userId, username) {
    const accessToken = jwt.sign(
      { id: userId, username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: userId, username },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Verificar se usuário existe
  async userExists(username, email) {
    const result = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    return result.rows.length > 0;
  }

  // Criar novo usuário
  async createUser(userData) {
    const { name, username, email, password, bio } = userData;
    
    // Hash da senha
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Inserir usuário
    const result = await pool.query(
      `INSERT INTO users (name, username, email, password_hash, bio) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, username, email, bio, profile_picture, created_at`,
      [name, username, email, passwordHash, bio]
    );

    return result.rows[0];
  }

  // Buscar usuário por credenciais
  async findUserByCredentials(identifier) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [identifier]
    );
    return result.rows[0] || null;
  }

  // Verificar senha
  async verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }

  // Verificar token de acesso
  async verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Verificar token de refresh
  async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  // Buscar usuário por ID
  async findUserById(userId) {
    const result = await pool.query(
      'SELECT id, name, username, email, bio, profile_picture, created_at FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  // Validar dados de entrada
  validateUserData(userData) {
    const { name, username, email, password } = userData;
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!username || username.trim().length < 3) {
      errors.push('Username deve ter pelo menos 3 caracteres');
    }

    if (!email || !this.isValidEmail(email)) {
      errors.push('Email inválido');
    }

    if (!password || password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    return errors;
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar credenciais de login
  validateLoginData(loginData) {
    const { username, password } = loginData;
    const errors = [];

    if (!username || !username.trim()) {
      errors.push('Username ou email é obrigatório');
    }

    if (!password || !password.trim()) {
      errors.push('Senha é obrigatória');
    }

    return errors;
  }
}

module.exports = new AuthService();
