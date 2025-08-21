// Configurações de performance para o servidor BeastFood
require('dotenv').config();

// Constrói a lista de origens permitidas para CORS
const buildAllowedOrigins = () => {
	const origins = [];
	if (process.env.CLIENT_URL) origins.push(process.env.CLIENT_URL);
	if (process.env.CLIENT_URLS) {
		origins.push(
			...process.env.CLIENT_URLS
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		);
	}
	// Origens padrão para desenvolvimento local
	origins.push(
		'http://localhost:3000',
		'http://127.0.0.1:3000',
		'http://192.168.100.2:3000',
		'http://192.168.100.2:5000',
		// IP adicional solicitado para acesso ao backend
		'http://186.210.177.159:3000'
	);
	return Array.from(new Set(origins));
};

module.exports = {
  // Configurações de compressão
  compression: {
    enabled: true,
    level: 6, // Nível de compressão (0-9)
    threshold: 1024 // Tamanho mínimo para compressão
  },

  // Configurações de cache
  cache: {
    enabled: true,
    maxAge: 300, // 5 minutos em segundos
    etag: true
  },

  // Configurações de timeout
  timeouts: {
    server: 30000, // 30 segundos
    request: 25000, // 25 segundos
    response: 20000, // 20 segundos
    database: 10000, // 10 segundos
    auth: 15000 // 15 segundos
  },

  // Configurações de rate limiting otimizadas
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: process.env.NODE_ENV === 'production' ? 20 : 5000, // Aumentado para 5000 em desenvolvimento
      delayMs: 0, // Sem delay para melhor performance
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: process.env.NODE_ENV === 'production' ? 200 : 50000, // Aumentado para 50000 em desenvolvimento
      delayMs: 0, // Sem delay para melhor performance
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false
    }
  },

  // Configurações de banco de dados otimizadas
  database: {
    pool: {
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      acquireTimeoutMillis: 10000,
      createTimeoutMillis: 10000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    },
    query: {
      statementTimeout: 10000,
      queryTimeout: 10000
    }
  },

  // Configurações de CORS otimizadas
  cors: {
    // Aceita múltiplas origens (local + IP da rede)
    origin: buildAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Cache-Control',
      'Pragma',
      'Expires'
    ],
    exposedHeaders: ['Cache-Control', 'ETag'],
    maxAge: 86400 // 24 horas
  },

  // Configurações de segurança
  security: {
    helmet: {
      contentSecurityPolicy: false, // Desabilitar CSP em desenvolvimento
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false
    }
  }
};
