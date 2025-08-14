const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Verificando imagens dos restaurantes no banco de dados...\n');

// Configuração do banco
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function checkRestaurantImages() {
  try {
    console.log('1️⃣ Conectando ao banco de dados...');
    
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados');
    
    // Verificar estrutura da tabela restaurants
    console.log('\n2️⃣ Verificando estrutura da tabela restaurants...');
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      AND column_name IN ('main_photo_url', 'logo_url')
      ORDER BY column_name
    `;
    
    const structureResult = await client.query(structureQuery);
    console.log('Colunas de imagem encontradas:');
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Verificar restaurantes com imagens
    console.log('\n3️⃣ Verificando restaurantes com imagens...');
    const imagesQuery = `
      SELECT id, name, main_photo_url, logo_url, source_type
      FROM restaurants 
      WHERE main_photo_url IS NOT NULL OR logo_url IS NOT NULL
      ORDER BY id
      LIMIT 10
    `;
    
    const imagesResult = await client.query(imagesQuery);
    console.log(`Encontrados ${imagesResult.rows.length} restaurantes com imagens:`);
    
    imagesResult.rows.forEach(restaurant => {
      console.log(`\n  🏪 ${restaurant.name} (ID: ${restaurant.id})`);
      console.log(`     Fonte: ${restaurant.source_type}`);
      if (restaurant.main_photo_url) {
        console.log(`     📸 Foto principal: ${restaurant.main_photo_url}`);
      }
      if (restaurant.logo_url) {
        console.log(`     🖼️ Logo: ${restaurant.logo_url}`);
      }
    });
    
    // Verificar todos os restaurantes (primeiros 5)
    console.log('\n4️⃣ Verificando primeiros 5 restaurantes...');
    const allQuery = `
      SELECT id, name, main_photo_url, logo_url, source_type
      FROM restaurants 
      ORDER BY id
      LIMIT 5
    `;
    
    const allResult = await client.query(allQuery);
    console.log('Primeiros 5 restaurantes:');
    
    allResult.rows.forEach(restaurant => {
      console.log(`\n  🏪 ${restaurant.name} (ID: ${restaurant.id})`);
      console.log(`     Fonte: ${restaurant.source_type}`);
      console.log(`     📸 Foto principal: ${restaurant.main_photo_url || 'Nenhuma'}`);
      console.log(`     🖼️ Logo: ${restaurant.logo_url || 'Nenhuma'}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erro ao verificar imagens:', error);
  } finally {
    await pool.end();
  }
}

// Executar verificação
checkRestaurantImages();
