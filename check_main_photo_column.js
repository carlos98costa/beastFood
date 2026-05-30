const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'restaurants' AND column_name = 'main_photo_url'
    `);
    if (res.rows.length === 0) {
      await pool.query('ALTER TABLE restaurants ADD COLUMN main_photo_url TEXT');
      console.log('Coluna main_photo_url adicionada à tabela restaurants');
    } else {
      console.log('Coluna main_photo_url já existe');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

check();
