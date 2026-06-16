const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function checkAdminUsers() {
  try {
    console.log('🔍 Verificando usuários administradores...');
    
    // Verificar se a tabela users existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela users não encontrada');
      return;
    }
    
    // Verificar estrutura da tabela users
    const structureCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura da tabela users:');
    structureCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar se há usuários
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Total de usuários: ${usersCount.rows[0].count}`);
    
    // Verificar usuários por role
    const usersByRole = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY count DESC;
    `);
    
    console.log('\n🔑 Usuários por role:');
    usersByRole.rows.forEach(row => {
      console.log(`   - ${row.role}: ${row.count}`);
    });
    
    // Verificar usuários admin
    const adminUsers = await pool.query(`
      SELECT id, username, email, role, created_at 
      FROM users 
      WHERE role = 'admin' 
      ORDER BY created_at DESC;
    `);
    
    console.log('\n👑 Usuários administradores:');
    if (adminUsers.rows.length === 0) {
      console.log('   ❌ Nenhum usuário administrador encontrado');
      
      // Verificar se há usuários para promover
      const regularUsers = await pool.query(`
        SELECT id, username, email, role, created_at 
        FROM users 
        WHERE role != 'admin' 
        ORDER BY created_at DESC 
        LIMIT 5;
      `);
      
      if (regularUsers.rows.length > 0) {
        console.log('\n💡 Usuários que podem ser promovidos a admin:');
        regularUsers.rows.forEach(user => {
          console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
        });
        
        // Perguntar se quer promover o primeiro usuário
        const firstUser = regularUsers.rows[0];
        console.log(`\n🚀 Para promover ${firstUser.username} a admin, execute:`);
        console.log(`   UPDATE users SET role = 'admin' WHERE id = ${firstUser.id};`);
      }
    } else {
      adminUsers.rows.forEach(user => {
        console.log(`   ✅ ${user.username} (${user.email}) - Criado em ${user.created_at}`);
      });
    }
    
    // Verificar se há problemas de permissão
    console.log('\n🔒 Verificando permissões...');
    const roleCheck = await pool.query(`
      SELECT DISTINCT role FROM users ORDER BY role;
    `);
    
    console.log('Roles disponíveis:', roleCheck.rows.map(r => r.role).join(', '));
    
    // Verificar se há usuários sem role
    const usersWithoutRole = await pool.query(`
      SELECT COUNT(*) FROM users WHERE role IS NULL OR role = '';
    `);
    
    if (usersWithoutRole.rows[0].count > 0) {
      console.log(`⚠️  Usuários sem role definido: ${usersWithoutRole.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await pool.end();
  }
}

checkAdminUsers();
