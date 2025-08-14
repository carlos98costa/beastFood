const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function checkRestaurantsTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela restaurants...\n');
    
    // 1. Verificar se a tabela existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurants'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela restaurants não encontrada');
      return;
    }
    
    console.log('✅ Tabela restaurants encontrada');
    
    // 2. Verificar estrutura da tabela
    const structureQuery = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estrutura da tabela restaurants:');
    console.log('=' .repeat(80));
    console.log('Coluna'.padEnd(25) + 'Tipo'.padEnd(20) + 'Nulo'.padEnd(8) + 'Padrão'.padEnd(20));
    console.log('=' .repeat(80));
    
    structureQuery.rows.forEach(row => {
      const column = row.column_name.padEnd(25);
      const type = row.data_type.padEnd(20);
      const nullable = (row.is_nullable === 'YES' ? 'SIM' : 'NÃO').padEnd(8);
      const defaultValue = (row.column_default || '').padEnd(20);
      
      console.log(`${column}${type}${nullable}${defaultValue}`);
    });
    
    // 3. Verificar alguns registros
    const sampleQuery = await pool.query(`
      SELECT 
        id,
        name,
        source_type,
        source_id,
        main_photo_url,
        logo_url,
        description,
        phone,
        website,
        cuisine_type,
        price_range,
        owner_id,
        created_at,
        updated_at
      FROM restaurants 
      LIMIT 3;
    `);
    
    console.log('\n📊 Amostra de registros:');
    console.log('=' .repeat(80));
    
    sampleQuery.rows.forEach((row, index) => {
      console.log(`\n🔸 Registro ${index + 1}:`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Nome: ${row.name}`);
      console.log(`   Fonte: ${row.source_type || 'N/A'}`);
      console.log(`   ID da Fonte: ${row.source_id || 'N/A'}`);
      console.log(`   Foto Principal: ${row.main_photo_url || 'N/A'}`);
      console.log(`   Logo: ${row.logo_url || 'N/A'}`);
      console.log(`   Descrição: ${row.description ? row.description.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   Telefone: ${row.phone || 'N/A'}`);
      console.log(`   Website: ${row.website || 'N/A'}`);
      console.log(`   Tipo de Cozinha: ${row.cuisine_type || 'N/A'}`);
      console.log(`   Faixa de Preço: ${row.price_range || 'N/A'}`);
      console.log(`   Dono ID: ${row.owner_id || 'N/A'}`);
      console.log(`   Criado em: ${row.created_at || 'N/A'}`);
      console.log(`   Atualizado em: ${row.updated_at || 'N/A'}`);
    });
    
    // 4. Verificar total de registros
    const countQuery = await pool.query('SELECT COUNT(*) as total FROM restaurants');
    console.log(`\n📈 Total de restaurantes: ${countQuery.rows[0].total}`);
    
    // 5. Verificar índices
    const indexesQuery = await pool.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'restaurants';
    `);
    
    console.log('\n🔍 Índices da tabela:');
    if (indexesQuery.rows.length > 0) {
      indexesQuery.rows.forEach(row => {
        console.log(`   - ${row.indexname}: ${row.indexdef}`);
      });
    } else {
      console.log('   Nenhum índice encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  } finally {
    await pool.end();
  }
}

checkRestaurantsTable();
