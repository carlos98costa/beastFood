const { Pool } = require('pg');

console.log('🔍 Verificando tabela restaurant_photos...\n');

// Configuração do banco
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function checkRestaurantPhotos() {
  try {
    console.log('1️⃣ Conectando ao banco de dados...');
    
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados');
    
    // Verificar se a tabela restaurant_photos existe
    console.log('\n2️⃣ Verificando se a tabela restaurant_photos existe...');
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_photos'
      );
    `;
    
    const tableExistsResult = await client.query(tableExistsQuery);
    const tableExists = tableExistsResult.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Tabela restaurant_photos existe');
      
      // Verificar estrutura da tabela
      console.log('\n3️⃣ Verificando estrutura da tabela restaurant_photos...');
      const structureQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'restaurant_photos' 
        ORDER BY ordinal_position
      `;
      
      const structureResult = await client.query(structureQuery);
      console.log('📋 Estrutura da tabela restaurant_photos:');
      structureResult.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      // Verificar se há dados na tabela
      console.log('\n4️⃣ Verificando dados na tabela restaurant_photos...');
      const countQuery = 'SELECT COUNT(*) as total FROM restaurant_photos';
      const countResult = await client.query(countQuery);
      const totalPhotos = parseInt(countResult.rows[0].total);
      
      console.log(`📊 Total de fotos na tabela: ${totalPhotos}`);
      
      if (totalPhotos > 0) {
        // Verificar algumas fotos
        console.log('\n5️⃣ Verificando primeiras fotos...');
        const photosQuery = `
          SELECT rp.*, r.name as restaurant_name
          FROM restaurant_photos rp
          JOIN restaurants r ON rp.restaurant_id = r.id
          ORDER BY rp.created_at DESC
          LIMIT 5
        `;
        
        const photosResult = await client.query(photosQuery);
        console.log('🔸 Primeiras fotos:');
        photosResult.rows.forEach(photo => {
          console.log(`   - Restaurante: ${photo.restaurant_name}`);
          console.log(`     Foto: ${photo.photo_url}`);
          console.log(`     Ordem: ${photo.photo_order}`);
          console.log(`     Criada em: ${photo.created_at}`);
          console.log('');
        });
      }
      
    } else {
      console.log('❌ Tabela restaurant_photos NÃO existe');
      
      // Verificar se há outras tabelas relacionadas a fotos
      console.log('\n6️⃣ Verificando outras tabelas de fotos...');
      const otherTablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%photo%'
        ORDER BY table_name
      `;
      
      const otherTablesResult = await client.query(otherTablesQuery);
      if (otherTablesResult.rows.length > 0) {
        console.log('🔍 Tabelas relacionadas a fotos encontradas:');
        otherTablesResult.rows.forEach(row => {
          console.log(`   - ${row.table_name}`);
        });
      } else {
        console.log('❌ Nenhuma tabela de fotos encontrada');
      }
    }
    
    // Verificar se os restaurantes têm campos de imagem diretos
    console.log('\n7️⃣ Verificando campos de imagem diretos nos restaurantes...');
    const directImagesQuery = `
      SELECT id, name, main_photo_url, logo_url, image_url
      FROM restaurants 
      WHERE main_photo_url IS NOT NULL OR logo_url IS NOT NULL OR image_url IS NOT NULL
      ORDER BY id
      LIMIT 5
    `;
    
    const directImagesResult = await client.query(directImagesQuery);
    if (directImagesResult.rows.length > 0) {
      console.log('🔸 Restaurantes com imagens diretas:');
      directImagesResult.rows.forEach(restaurant => {
        console.log(`   - ${restaurant.name} (ID: ${restaurant.id})`);
        console.log(`     main_photo_url: ${restaurant.main_photo_url || 'N/A'}`);
        console.log(`     logo_url: ${restaurant.logo_url || 'N/A'}`);
        console.log(`     image_url: ${restaurant.image_url || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhum restaurante com imagens diretas encontrado');
    }
    
    await client.release();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

// Executar verificação
checkRestaurantPhotos();
