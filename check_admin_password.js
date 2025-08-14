const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function checkAdminPassword() {
  try {
    console.log('🔍 Verificando dados do usuário Admin...');
    
    const result = await pool.query(
      'SELECT id, name, username, email, password_hash, role, created_at FROM users WHERE username = $1',
      ['Admin']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário Admin não encontrado');
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ Usuário Admin encontrado:');
    console.log('   - ID:', user.id);
    console.log('   - Nome:', user.name);
    console.log('   - Username:', user.username);
    console.log('   - Email:', user.email);
    console.log('   - Role:', user.role);
    console.log('   - Criado em:', user.created_at);
    console.log('   - Password hash:', user.password_hash ? 'Presente' : 'Ausente');
    
    if (user.role === 'admin') {
      console.log('\n👑 Usuário é administrador! ✅');
    } else {
      console.log('\n❌ Usuário NÃO é administrador!');
      console.log('   Role atual:', user.role);
    }
    
    // Verificar se existe usuário 'carlos'
    const carlosResult = await pool.query(
      'SELECT id, username, email, role FROM users WHERE username = $1',
      ['carlos']
    );
    
    if (carlosResult.rows.length > 0) {
      const carlos = carlosResult.rows[0];
      console.log('\n👤 Usuário carlos encontrado:');
      console.log('   - ID:', carlos.id);
      console.log('   - Username:', carlos.username);
      console.log('   - Email:', carlos.email);
      console.log('   - Role:', carlos.role);
    } else {
      console.log('\n❌ Usuário carlos não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await pool.end();
  }
}

checkAdminPassword();
