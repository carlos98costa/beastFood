const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

(async () => {
  try {
    await pool.query(
      'ALTER TABLE pending_restaurants ADD COLUMN IF NOT EXISTS post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE'
    );
    console.log('Coluna post_id adicionada');
  } catch (error) {
    console.error('Erro ao adicionar coluna post_id:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
