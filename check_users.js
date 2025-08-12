const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco...');
    
    const result = await pool.query('SELECT id, name, username, email, created_at FROM users');
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco');
      console.log('💡 Você precisa criar um usuário primeiro!');
    } else {
      console.log(`✅ Encontrados ${result.rows.length} usuário(s):`);
      result.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Nome: ${user.name}, Username: ${user.username}, Email: ${user.email}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();
