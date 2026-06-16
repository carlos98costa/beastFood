const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function checkCarlosUser() {
  try {
    console.log('🔍 Verificando usuário "carlos"...');
    
    // Verificar se o usuário 'carlos' existe
    const userCheck = await pool.query(`
      SELECT id, username, email, role, created_at 
      FROM users 
      WHERE username = 'carlos';
    `);
    
    if (userCheck.rows.length === 0) {
      console.log('❌ Usuário "carlos" não encontrado');
      
      // Listar todos os usuários disponíveis
      const allUsers = await pool.query(`
        SELECT id, username, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC;
      `);
      
      console.log('\n👥 Usuários disponíveis:');
      allUsers.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role || 'sem role'}`);
      });
      
      // Sugerir criar usuário 'carlos'
      console.log('\n💡 Para criar usuário "carlos":');
      console.log('1. Execute o script add_role_column.sql');
      console.log('2. Execute o script set_admin_user.sql');
      console.log('3. Ou crie manualmente um usuário com username "carlos"');
      
    } else {
      const user = userCheck.rows[0];
      console.log('✅ Usuário "carlos" encontrado:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Username: ${user.username}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role || 'sem role'}`);
      console.log(`   - Criado em: ${user.created_at}`);
      
      if (user.role === 'admin') {
        console.log('\n👑 Usuário já é administrador!');
      } else {
        console.log('\n⚠️  Usuário não é administrador');
        console.log('Para promover a admin, execute:');
        console.log(`   UPDATE users SET role = 'admin' WHERE username = 'carlos';`);
      }
    }
    
    // Verificar se a coluna role existe
    console.log('\n🔍 Verificando estrutura da tabela users...');
    const structureCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `);
    
    if (structureCheck.rows.length === 0) {
      console.log('❌ Coluna "role" não existe na tabela users');
      console.log('Execute o script add_role_column.sql primeiro');
    } else {
      console.log('✅ Coluna "role" existe na tabela users');
      const roleCol = structureCheck.rows[0];
      console.log(`   - Tipo: ${roleCol.data_type}`);
      console.log(`   - Nullable: ${roleCol.is_nullable}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await pool.end();
  }
}

checkCarlosUser();
