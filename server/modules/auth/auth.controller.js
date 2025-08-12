const authService = require('./auth.service');

class AuthController {
  // Registro de usuário
  async register(req, res) {
    try {
      console.log('Tentativa de registro:', { ...req.body, password: '***' });
      
      // Validar dados de entrada
      const validationErrors = authService.validateUserData(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validationErrors 
        });
      }

      const { name, username, email, password, bio } = req.body;

      // Verificar se usuário já existe
      const userExists = await authService.userExists(username, email);
      if (userExists) {
        return res.status(400).json({ error: 'Usuário ou email já existe' });
      }

      // Criar usuário
      const newUser = await authService.createUser({ name, username, email, password, bio });

      // Gerar tokens
      const { accessToken, refreshToken } = authService.generateTokens(newUser.id, newUser.username);

      console.log('Usuário criado com sucesso:', newUser.username);

      // Configurar cookie HTTPOnly para refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
      });

      res.status(201).json({
        message: 'Usuário criado com sucesso!',
        user: newUser,
        accessToken
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Login de usuário
  async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log('Tentativa de login:', { username, password: '***' });

      // Validar dados de entrada
      const validationErrors = authService.validateLoginData(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validationErrors 
        });
      }

      // Buscar usuário
      const user = await authService.findUserByCredentials(username);
      if (!user) {
        console.log('Usuário não encontrado:', username);
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const isValidPassword = await authService.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        console.log('Senha inválida para usuário:', username);
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar tokens
      const { accessToken, refreshToken } = authService.generateTokens(user.id, user.username);

      // Remover senha do objeto de resposta
      const { password_hash, ...userWithoutPassword } = user;

      // Configurar cookie HTTPOnly para refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
      });

      console.log('Login bem-sucedido para:', username);

      res.json({
        message: 'Login realizado com sucesso!',
        user: userWithoutPassword,
        accessToken
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Verificar token (rota protegida)
  async verify(req, res) {
    try {
      console.log('Verificando token para usuário:', req.user.id);
      
      const user = await authService.findUserById(req.user.id);
      if (!user) {
        console.log('Usuário não encontrado:', req.user.id);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      console.log('Usuário encontrado:', user.username);
      res.json({ user });
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Refresh token
  async refresh(req, res) {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token não fornecido' });
      }

      // Verificar refresh token
      const decoded = await authService.verifyRefreshToken(refreshToken);
      
      // Buscar usuário
      const user = await authService.findUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Gerar novos tokens
      const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user.id, user.username);

      // Atualizar cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
      });

      res.json({
        message: 'Token renovado com sucesso',
        accessToken
      });

    } catch (error) {
      console.error('Erro no refresh token:', error);
      res.status(401).json({ error: 'Refresh token inválido' });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      // Limpar cookie do refresh token
      res.clearCookie('refreshToken');
      
      res.json({ message: 'Logout realizado com sucesso' });
      
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AuthController();
