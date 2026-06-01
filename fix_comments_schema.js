const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function fixCommentsSchema() {
  try {
    console.log('🔧 Corrigindo schema da tabela comments...');

    await pool.query(`
      ALTER TABLE comments
      ADD COLUMN IF NOT EXISTS parent_comment_id INT REFERENCES comments(id) ON DELETE CASCADE
    `);
    console.log('✅ Coluna comments.parent_comment_id garantida');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id
      ON comments(parent_comment_id)
    `);
    console.log('✅ Índice idx_comments_parent_comment_id garantido');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_post_parent
      ON comments(post_id, parent_comment_id)
    `);
    console.log('✅ Índice idx_comments_post_parent garantido');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, user_id)
      )
    `);
    console.log('✅ Tabela comment_likes garantida');

    const columns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'comments'
      ORDER BY ordinal_position
    `);

    console.log('📋 Colunas atuais de comments:');
    columns.rows.forEach((row) => console.log(` - ${row.column_name}: ${row.data_type}`));
  } catch (error) {
    console.error('❌ Erro ao corrigir schema de comentários:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

fixCommentsSchema();
