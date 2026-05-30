const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function resetPassword() {
  try {
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = 4');
    if (result.rows.length === 0) {
      console.log('Usuário ID 4 não encontrado');
      return;
    }
    const user = result.rows[0];
    console.log(`Resetando senha para: ${user.username} (${user.email})`);

    const novaSenha = '123456';
    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, 4]);

    console.log(`Senha alterada para: ${novaSenha}`);
    console.log('Faça login com essa senha e troque depois.');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

resetPassword();
