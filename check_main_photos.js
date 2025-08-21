const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Verificando consistência entre photo_order=0 e main_photo_url...');

const pool = new Pool({
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 5432,
	database: process.env.DB_NAME || 'beastfood',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || '123456'
});

async function checkMainPhotos() {
	const client = await pool.connect();
	try {
		// Buscar inconsistências entre a foto com menor ordem (0) e a main_photo_url do restaurante
		const mismatchQuery = `
			SELECT 
				r.id,
				r.name,
				r.main_photo_url AS current_main,
				rp0.photo_url AS expected_main
			FROM restaurants r
			LEFT JOIN LATERAL (
				SELECT photo_url
				FROM restaurant_photos rp
				WHERE rp.restaurant_id = r.id
				ORDER BY rp.photo_order ASC, rp.created_at ASC
				LIMIT 1
			) rp0 ON TRUE
			WHERE (rp0.photo_url IS NOT NULL AND r.main_photo_url IS DISTINCT FROM rp0.photo_url)
			   OR (rp0.photo_url IS NULL AND r.main_photo_url IS NOT NULL)
			ORDER BY r.id
		`;

		const totalRestaurantsRes = await client.query('SELECT COUNT(*)::int AS total FROM restaurants');
		const mismatchesRes = await client.query(mismatchQuery);

		const total = totalRestaurantsRes.rows[0].total;
		const mismatches = mismatchesRes.rows;

		console.log(`\n📊 Restaurantes verificados: ${total}`);
		console.log(`⚠️ Inconsistências encontradas: ${mismatches.length}`);

		if (mismatches.length > 0) {
			console.log('\nDetalhes das inconsistências:');
			for (const row of mismatches) {
				console.log(`- ID ${row.id} | ${row.name}`);
				console.log(`  • main_photo_url atual: ${row.current_main || 'NULL'}`);
				console.log(`  • Esperado (photo_order=0): ${row.expected_main || 'NULL'}`);
			}
		}

		// Modo correção opcional
		if (process.argv.includes('--fix')) {
			if (mismatches.length === 0) {
				console.log('\n✅ Nada a corrigir.');
			} else {
				console.log('\n🛠️ Corrigindo main_photo_url com base em photo_order=0...');
				await client.query('BEGIN');
				try {
					for (const row of mismatches) {
						await client.query(
							`UPDATE restaurants SET main_photo_url = $1, updated_at = NOW() WHERE id = $2`,
							[row.expected_main, row.id]
						);
					}
					await client.query('COMMIT');
					console.log('✅ Correção aplicada com sucesso.');
				} catch (err) {
					await client.query('ROLLBACK');
					console.error('❌ Erro ao corrigir:', err.message);
					process.exitCode = 1;
				}
			}
		}
	} catch (error) {
		console.error('❌ Erro na verificação:', error.message);
		if (error.stack) console.error(error.stack);
		process.exitCode = 1;
	} finally {
		client.release();
		await pool.end();
	}
}

checkMainPhotos();


