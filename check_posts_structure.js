const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function checkPostsStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela posts...');
    
    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela "posts" não existe!');
      return;
    }
    
    console.log('✅ Tabela "posts" existe');
    
    // Verificar estrutura da tabela
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estrutura da tabela posts:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
    // Verificar número de registros
    const count = await pool.query('SELECT COUNT(*) FROM posts');
    console.log(`\n📊 Total de posts: ${count.rows[0].count}`);
    
    // Verificar o último post criado
    const lastPost = await pool.query(`
      SELECT id, content, created_at, 
             EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_ago,
             EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_ago
      FROM posts 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (lastPost.rows.length > 0) {
      const post = lastPost.rows[0];
      console.log(`\n📝 Último post:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Conteúdo: ${post.content}`);
      console.log(`   Criado em: ${post.created_at}`);
      console.log(`   Segundos atrás: ${post.seconds_ago}`);
      console.log(`   Horas atrás: ${post.hours_ago}`);
    }
    
    // Verificar configuração de timezone do banco
    const timezone = await pool.query('SHOW timezone');
    console.log(`\n🌍 Timezone do banco: ${timezone.rows[0].TimeZone}`);
    
    // Verificar hora atual do banco
    const now = await pool.query('SELECT NOW() as current_time');
    console.log(`🕐 Hora atual do banco: ${now.rows[0].current_time}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  } finally {
    await pool.end();
  }
}

checkPostsStructure();
