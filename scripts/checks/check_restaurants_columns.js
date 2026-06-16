const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beastfood',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function check() {
  const r = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='restaurants' ORDER BY ordinal_position"
  );
  console.log(r.rows.map(c => c.column_name).join('\n'));
  await pool.end();
}
check();
