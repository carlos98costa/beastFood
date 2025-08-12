const { Pool } = require('pg');
require('dotenv').config();

console.log('Configuração do banco - dotenv carregado');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log('Pool do banco criado com configuração:', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD ? '***' : 'undefined'
});



// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err);
});

// Teste de conexão inicial
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao testar conexão com o banco:', err);
  } else {
    console.log('✅ Teste de conexão com o banco bem-sucedido:', res.rows[0]);
  }
});

module.exports = pool;
