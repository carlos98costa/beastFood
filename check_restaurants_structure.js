const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function checkRestaurantsStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela restaurants...');
    
    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurants'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela "restaurants" não existe!');
      console.log('💡 Execute o script setup_database.bat primeiro');
      return;
    }
    
    console.log('✅ Tabela "restaurants" existe');
    
    // Verificar estrutura da tabela
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estrutura da tabela restaurants:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
    // Verificar número de registros
    const count = await pool.query('SELECT COUNT(*) FROM restaurants');
    console.log(`\n📊 Total de restaurantes: ${count.rows[0].count}`);
    
    // Verificar se PostGIS está disponível
    try {
      const postgisCheck = await pool.query('SELECT PostGIS_Version()');
      console.log(`\n🗺️ PostGIS disponível: ${postgisCheck.rows[0].postgis_version}`);
    } catch (error) {
      console.log('\n⚠️ PostGIS não disponível');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  } finally {
    await pool.end();
  }
}

checkRestaurantsStructure();
