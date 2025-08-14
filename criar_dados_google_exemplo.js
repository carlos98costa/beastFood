const pool = require('./server/config/database');
require('dotenv').config();

// Dados de exemplo do Google Places para Franca-SP
const estabelecimentosExemplo = [
  {
    place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    nome: 'McDonald\'s Franca',
    tipo: 'fast_food',
    endereco: 'Av. Dr. Ismael Alonso y Alonso, 1234',
    cidade: 'Franca',
    latitude: -20.5390,
    longitude: -47.4025,
    rating: 4.1,
    user_ratings_total: 1250,
    price_level: 1,
    phone_number: '(16) 3701-1234',
    website: 'https://www.mcdonalds.com.br',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJrTLr-GyuEmsRBfy61i59si8',
    nome: 'Subway Franca Shopping',
    tipo: 'fast_food',
    endereco: 'Av. Dr. Flávio Rocha, 4300',
    cidade: 'Franca',
    latitude: -20.5415,
    longitude: -47.4055,
    rating: 4.2,
    user_ratings_total: 890,
    price_level: 1,
    phone_number: '(16) 3702-5678',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJKaFTabGvEmsRBfy61i59si9',
    nome: 'Restaurante Villa Bianca',
    tipo: 'restaurant',
    endereco: 'Rua Voluntários da Pátria, 2100',
    cidade: 'Franca',
    latitude: -20.5370,
    longitude: -47.3995,
    rating: 4.6,
    user_ratings_total: 430,
    price_level: 3,
    phone_number: '(16) 3711-9999',
    website: 'https://villabianca.com.br',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJLeFfpBGvEmsRwfx61i59si0',
    nome: 'Starbucks Franca',
    tipo: 'cafe',
    endereco: 'Av. Major Nicácio, 2200',
    cidade: 'Franca',
    latitude: -20.5385,
    longitude: -47.4015,
    rating: 4.4,
    user_ratings_total: 680,
    price_level: 2,
    phone_number: '(16) 3703-4567',
    website: 'https://www.starbucks.com.br',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJMfGgqCGuEmsRxgy62j60tj1',
    nome: 'Empório Casa do Pão',
    tipo: 'bakery',
    endereco: 'Rua General Carneiro, 1500',
    cidade: 'Franca',
    latitude: -20.5400,
    longitude: -47.4035,
    rating: 4.3,
    user_ratings_total: 320,
    price_level: 2,
    phone_number: '(16) 3704-1122',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJNgHhriKuEmsRyhy63k61uk2',
    nome: 'Boteco do Zé',
    tipo: 'bar',
    endereco: 'Rua Marechal Deodoro, 1800',
    cidade: 'Franca',
    latitude: -20.5360,
    longitude: -47.3985,
    rating: 4.5,
    user_ratings_total: 550,
    price_level: 2,
    phone_number: '(16) 3705-8899',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJOhIisiOuEmsRziz64l62vl3',
    nome: 'Pizza Hut Franca',
    tipo: 'restaurant',
    endereco: 'Av. Champagnat, 2500',
    cidade: 'Franca',
    latitude: -20.5420,
    longitude: -47.4045,
    rating: 4.0,
    user_ratings_total: 890,
    price_level: 2,
    phone_number: '(16) 3706-2233',
    website: 'https://www.pizzahut.com.br',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJPiJjtjSuEmsR0j065m73wm4',
    nome: 'Café Cultura',
    tipo: 'cafe',
    endereco: 'Praça Nossa Senhora da Conceição, 120',
    cidade: 'Franca',
    latitude: -20.5345,
    longitude: -47.3975,
    rating: 4.7,
    user_ratings_total: 280,
    price_level: 2,
    phone_number: '(16) 3707-3344',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJQjKkukWuEmsR1k176n84xn5',
    nome: 'Churrascaria Boi na Brasa',
    tipo: 'restaurant',
    endereco: 'Rua Coronel Arantes, 1900',
    cidade: 'Franca',
    latitude: -20.5395,
    longitude: -47.4020,
    rating: 4.4,
    user_ratings_total: 650,
    price_level: 3,
    phone_number: '(16) 3708-4455',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJRkLlvlauEmsR2l287o95yo6',
    nome: 'Gelato Italiano',
    tipo: 'food',
    endereco: 'Av. Dr. Ismael Alonso y Alonso, 1800',
    cidade: 'Franca',
    latitude: -20.5380,
    longitude: -47.4010,
    rating: 4.6,
    user_ratings_total: 420,
    price_level: 2,
    phone_number: '(16) 3709-5566',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJSlMmwmeuEmsR3m398p06zp7',
    nome: 'Burguer King Franca',
    tipo: 'fast_food',
    endereco: 'Av. Champagnat, 2800',
    cidade: 'Franca',
    latitude: -20.5425,
    longitude: -47.4050,
    rating: 4.1,
    user_ratings_total: 780,
    price_level: 1,
    phone_number: '(16) 3710-6677',
    website: 'https://www.burgerking.com.br',
    business_status: 'OPERATIONAL'
  },
  {
    place_id: 'ChIJTmNnxnmuEmsR4n409q17aq8',
    nome: 'Restaurante Dona Maria',
    tipo: 'restaurant',
    endereco: 'Rua Frederico Moura, 800',
    cidade: 'Franca',
    latitude: -20.5355,
    longitude: -47.3990,
    rating: 4.8,
    user_ratings_total: 340,
    price_level: 2,
    phone_number: '(16) 3711-7788',
    business_status: 'OPERATIONAL'
  }
];

async function inserirDadosExemplo() {
  try {
    console.log('🎲 Inserindo dados de exemplo do Google Places...');
    
    let inseridos = 0;
    let atualizados = 0;
    
    for (const estabelecimento of estabelecimentosExemplo) {
      const query = `
        INSERT INTO estabelecimentos_google (
          place_id, nome, tipo, endereco, cidade, latitude, longitude,
          rating, user_ratings_total, price_level, phone_number, website,
          business_status, criado_em, atualizado_em
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )
        ON CONFLICT (place_id) DO UPDATE SET
          nome = EXCLUDED.nome,
          tipo = EXCLUDED.tipo,
          endereco = EXCLUDED.endereco,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          rating = EXCLUDED.rating,
          user_ratings_total = EXCLUDED.user_ratings_total,
          price_level = EXCLUDED.price_level,
          phone_number = EXCLUDED.phone_number,
          website = EXCLUDED.website,
          business_status = EXCLUDED.business_status,
          atualizado_em = NOW()
        RETURNING (xmax = 0) AS foi_inserido
      `;

      const valores = [
        estabelecimento.place_id,
        estabelecimento.nome,
        estabelecimento.tipo,
        estabelecimento.endereco,
        estabelecimento.cidade,
        estabelecimento.latitude,
        estabelecimento.longitude,
        estabelecimento.rating,
        estabelecimento.user_ratings_total,
        estabelecimento.price_level,
        estabelecimento.phone_number,
        estabelecimento.website || null,
        estabelecimento.business_status
      ];

      const resultado = await pool.query(query, valores);
      
      if (resultado.rows[0].foi_inserido) {
        inseridos++;
      } else {
        atualizados++;
      }
    }
    
    console.log('\n📊 RESUMO DA INSERÇÃO');
    console.log('=' .repeat(30));
    console.log(`✅ Estabelecimentos inseridos: ${inseridos}`);
    console.log(`🔄 Estabelecimentos atualizados: ${atualizados}`);
    console.log(`📍 Total de estabelecimentos Google Places: ${estabelecimentosExemplo.length}`);
    
    // Mostrar estatísticas
    const stats = await pool.query(`
      SELECT 
        tipo,
        COUNT(*) as quantidade,
        ROUND(AVG(rating), 2) as rating_medio,
        SUM(user_ratings_total) as total_avaliacoes
      FROM estabelecimentos_google 
      WHERE NOT permanently_closed
      GROUP BY tipo 
      ORDER BY quantidade DESC
    `);
    
    console.log('\n📈 ESTATÍSTICAS POR TIPO:');
    stats.rows.forEach(stat => {
      console.log(`   ${stat.tipo}: ${stat.quantidade} estabelecimentos, rating médio ${stat.rating_medio}, ${stat.total_avaliacoes} avaliações`);
    });
    
    console.log('\n✨ Dados de exemplo inseridos com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro ao inserir dados de exemplo:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  inserirDadosExemplo();
}

module.exports = { inserirDadosExemplo, estabelecimentosExemplo };

