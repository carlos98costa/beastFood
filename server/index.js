const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('Variáveis de ambiente carregadas:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'undefined');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '***' : 'undefined');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

// Importar rotas modulares
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const restaurantRoutes = require('./routes/restaurants');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const favoriteRoutes = require('./routes/favorites');
const followRoutes = require('./routes/follows');
const testRoutes = require('./routes/test');

// Configurações
const PORT = process.env.PORT || 5000;

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Diretório de uploads criado:', uploadsDir);
}

const app = express();

// Configurar trust proxy para rate limiting
app.set('trust proxy', 1);

// Middleware de segurança
app.use(helmet());

// CORS - DEVE vir ANTES do rate limiting
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

console.log('CORS configurado para:', process.env.CLIENT_URL || 'http://localhost:3000');

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Aumentado de 5 para 20 tentativas por IP
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar tentativas bem-sucedidas
  skipFailedRequests: false, // Contar apenas tentativas falhadas
});

// Rate limiting geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200 // Aumentado de 100 para 200 requests por IP
});

// Aplicar rate limiting específico para rotas de auth
app.use('/api/auth', authLimiter);

// Aplicar rate limiting geral para outras rotas
app.use('/api', generalLimiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos de upload
app.use('/uploads', express.static('uploads'));

// Cookie parser para refresh tokens
app.use(cookieParser());

// Middleware para lidar com requisições OPTIONS (preflight)
app.options('*', cors());

// Rotas modulares
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/test', testRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BeastFood API funcionando!',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    modules: ['auth', 'users', 'restaurants', 'posts', 'comments', 'likes', 'favorites']
  });
});

// Middleware de erro centralizado
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Dados inválidos',
      details: err.message 
    });
  }

  // Erro de autenticação JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Token inválido' 
    });
  }

  // Erro de token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Token expirado' 
    });
  }

  // Erro genérico
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    availableRoutes: [
      '/api/auth',
      '/api/users', 
      '/api/restaurants',
      '/api/posts',
      '/api/comments',
      '/api/likes',
      '/api/favorites',
      '/api/follows',
      '/api/health'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor BeastFood v2.0 rodando na porta ${PORT}`);
  console.log(`📱 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🔒 Autenticação com refresh tokens habilitada`);
  console.log(`🗺️  Geolocalização com PostGIS habilitada`);
  console.log(`📊 Estrutura modular implementada`);
});
