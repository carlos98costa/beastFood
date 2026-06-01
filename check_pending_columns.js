const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});
(async () => {
  try {
    const r = await pool.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'pending_restaurants' ORDER BY ordinal_position"
    );
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (error) {
    console.error('Erro ao verificar colunas de pending_restaurants:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
