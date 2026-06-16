const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurant_photos (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        photo_order INTEGER DEFAULT 0,
        is_main BOOLEAN DEFAULT FALSE,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela restaurant_photos criada com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

createTable();
