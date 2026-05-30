const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurant_services (
        id SERIAL PRIMARY KEY,
        restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        service_type VARCHAR(50) NOT NULL,
        is_available BOOLEAN DEFAULT true
      )
    `);
    console.log('restaurant_services criada');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurant_highlights (
        id SERIAL PRIMARY KEY,
        restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        highlight_text TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('restaurant_highlights criada');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurant_status (
        id SERIAL PRIMARY KEY,
        restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        is_open BOOLEAN DEFAULT true,
        status_message TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('restaurant_status criada');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, user_id)
      )
    `);
    console.log('comment_likes criada');

    console.log('Todas as tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

createTables();
