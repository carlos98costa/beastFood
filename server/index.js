const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const performanceConfig = require('./config/performance');
const pool = require('./config/database');
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
const estabelecimentosRoutes = require('./modules/estabelecimentos/estabelecimentos.routes');
const osmEstabelecimentosRoutes = require('./modules/osm-estabelecimentos/osm-estabelecimentos.routes');
const googlePlacesRoutes = require('./modules/google-places/google-places.routes');
const aiRestaurantSearchRoutes = require('./modules/ai-restaurant-search/ai-restaurant-search.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const restaurantOwnerRoutes = require('./modules/restaurant-owner/restaurant-owner.routes');
const restaurantRoutes = require('./routes/restaurants');
const restaurantPhotosRoutes = require('./modules/restaurants/restaurant-photos.routes');
const restaurantFeaturesRoutes = require('./modules/restaurants/restaurant-features.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const favoriteRoutes = require('./routes/favorites');
const followRoutes = require('./routes/follows');
const searchRoutes = require('./routes/search');

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

// Middleware de compressão para melhor performance
app.use(compression(performanceConfig.compression));

// Middleware de segurança
app.use(helmet(performanceConfig.security.helmet));

// CORS otimizado
app.use(cors(performanceConfig.cors));

console.log('CORS configurado para:', process.env.CLIENT_URL || 'http://localhost:3000');

// Rate limiting otimizado usando configurações de performance
const authLimiter = rateLimit(performanceConfig.rateLimit.auth);
const generalLimiter = rateLimit(performanceConfig.rateLimit.general);

// Rate limiting específico para login (mais permissivo)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 50 : 10000, // 10000 tentativas de login em desenvolvimento
  delayMs: 0,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false
});

// DESABILITAR RATE LIMITING EM DESENVOLVIMENTO
if (process.env.NODE_ENV === 'production') {
  // Aplicar rate limiting específico para rotas de auth
  app.use('/api/auth', authLimiter);
  
  // Rate limiting ainda mais permissivo para login específico
  app.use('/api/auth/login', loginLimiter);
  
  // Aplicar rate limiting geral para outras rotas
  app.use('/api', generalLimiter);
} else {
  console.log('🚀 Rate limiting DESABILITADO em desenvolvimento');
}

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de cache para rotas estáticas (muito seletivo)
app.use((req, res, next) => {
  if (performanceConfig.cache.enabled && req.method === 'GET') {
    // Apenas para uploads de imagens (rotas estáticas)
    if (req.path.startsWith('/uploads/')) {
      res.set('Cache-Control', `public, max-age=${performanceConfig.cache.maxAge}`);
    }
  }
  next();
});

// Servir arquivos estáticos de upload
app.use('/uploads', express.static('uploads'));

// Cookie parser para refresh tokens
app.use(cookieParser());

// Middleware para lidar com requisições OPTIONS (preflight)
app.options('*', cors());

// Middleware adicional para CORS preflight
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    return;
  }
  next();
});

// Garantir colunas de links sociais na tabela restaurants
(async () => {
  try {
    await pool.query("ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instagram TEXT");
    await pool.query("ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS ifood TEXT");
    console.log('✅ Colunas instagram e ifood garantidas na tabela restaurants');
  } catch (e) {
    console.error('⚠️ Não foi possível garantir colunas instagram/ifood:', e.message);
  }
})();

// Rotas modulares
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/estabelecimentos', estabelecimentosRoutes);
app.use('/api/osm-estabelecimentos', osmEstabelecimentosRoutes);
app.use('/api/google-places', googlePlacesRoutes);
app.use('/api/ai-restaurant-search', aiRestaurantSearchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurant-owner', restaurantOwnerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurant-photos', restaurantPhotosRoutes);
app.use('/api/restaurant-features', restaurantFeaturesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/search', searchRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BeastFood API funcionando!',
    timestamp: new Date().toISOString(),
    version: '2.3.0',
    modules: ['auth', 'users', 'estabelecimentos', 'osm-estabelecimentos', 'google-places', 'ai-restaurant-search', 'restaurants', 'posts', 'comments', 'likes', 'favorites']
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
      '/api/estabelecimentos',
      '/api/osm-estabelecimentos',
      '/api/google-places',
      '/api/ai-restaurant-search',
      '/api/admin',
      '/api/restaurant-owner',
      '/api/restaurants',
      '/api/restaurant-photos',
      '/api/restaurant-features',
      '/api/posts',
      '/api/comments',
      '/api/likes',
      '/api/favorites',
      '/api/follows',
      '/api/search',
      '/api/health'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor BeastFood v2.3 rodando na porta ${PORT}`);
  console.log(`📱 API disponível em:`);
  console.log(`   🌐 Local: http://localhost:${PORT}/api`);
  console.log(`   📱 Rede: http://192.168.100.2:${PORT}/api`);
  console.log(`🔒 Autenticação com refresh tokens habilitada`);
  console.log(`🗺️  Geolocalização com PostGIS habilitada`);
  console.log(`🏪 API de Estabelecimentos implementada`);
  console.log(`🗺️  OpenStreetMap integrado`);
  console.log(`🌐 Google Places API integrada`);
  console.log(`📊 Estrutura modular implementada`);
  console.log(`\n📍 Endpoints disponíveis:`);
  console.log(`   GET  /api/estabelecimentos - Estabelecimentos manuais`);
  console.log(`   GET  /api/osm-estabelecimentos - Estabelecimentos OpenStreetMap`);
  console.log(`   GET  /api/osm-estabelecimentos/nearby - Busca por proximidade OSM`);
  console.log(`   GET  /api/osm-estabelecimentos/status - Status da view OSM`);
  console.log(`   GET  /api/google-places - Estabelecimentos Google Places`);
  console.log(`   GET  /api/google-places/estabelecimentos/unificados - Busca unificada`);
  console.log(`   GET  /api/google-places/estabelecimentos/proximos - Busca por proximidade`);
});
