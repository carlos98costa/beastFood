const axios = require('axios');
const pool = require('./server/config/database');
require('dotenv').config();

class GooglePlacesImporter {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyAji2Na5P9Lgh4F3j9c-6QpBNJ2YMuhtA4';
    this.lat = parseFloat(process.env.GOOGLE_PLACES_CITY_LAT) || -20.5386;
    this.lon = parseFloat(process.env.GOOGLE_PLACES_CITY_LNG) || -47.4039;
    this.radius = parseInt(process.env.GOOGLE_PLACES_RADIUS) || 5000;
    
    // Tipos de estabelecimentos para buscar
    this.types = ['restaurant', 'cafe', 'bar', 'bakery', 'meal_takeaway', 'food'];
    
    this.importados = 0;
    this.atualizados = 0;
    this.erros = [];
    
    console.log(`🗺️  Configuração do Google Places:`);
    console.log(`   📍 Localização: ${this.lat}, ${this.lon} (Franca-SP)`);
    console.log(`   📏 Raio: ${this.radius}m`);
    console.log(`   🔑 API Key: ${this.apiKey.substring(0, 10)}...`);
  }

  async importarTodos() {
    try {
      console.log('🚀 Iniciando importação do Google Places...\n');
      
      for (const tipo of this.types) {
        console.log(`📋 Buscando estabelecimentos do tipo: ${tipo}`);
        await this.importarPorTipo(tipo);
        
        // Aguardar 2 segundos entre tipos para respeitar rate limits
        await this.aguardar(2000);
      }
      
      this.mostrarResumo();
      
    } catch (error) {
      console.error('💥 Erro durante a importação:', error.message);
      throw error;
    }
  }

  async importarPorTipo(tipo) {
    let nextPageToken = null;
    let pagina = 1;

    do {
      try {
        console.log(`   📄 Processando página ${pagina} do tipo ${tipo}...`);
        
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.append('location', `${this.lat},${this.lon}`);
        url.searchParams.append('radius', this.radius.toString());
        url.searchParams.append('type', tipo);
        url.searchParams.append('key', this.apiKey);
        
        if (nextPageToken) {
          url.searchParams.append('pagetoken', nextPageToken);
        }

        const response = await axios.get(url.toString());
        const data = response.data;

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          console.error(`❌ Erro na API Google Places: ${data.status} - ${data.error_message || 'Erro desconhecido'}`);
          
          if (data.status === 'REQUEST_DENIED') {
            throw new Error(`API Key inválida ou sem permissões. Status: ${data.status}`);
          }
          
          break;
        }

        if (!data.results || data.results.length === 0) {
          console.log(`   ℹ️  Nenhum resultado encontrado para ${tipo} na página ${pagina}`);
          break;
        }

        // Processar resultados
        for (const place of data.results) {
          await this.processarEstabelecimento(place, tipo);
        }

        console.log(`   ✅ Página ${pagina} processada: ${data.results.length} estabelecimentos`);

        nextPageToken = data.next_page_token || null;
        
        // Aguardar antes da próxima página (requisito do Google)
        if (nextPageToken) {
          console.log(`   ⏳ Aguardando 3 segundos para próxima página...`);
          await this.aguardar(3000);
        }
        
        pagina++;

      } catch (error) {
        console.error(`❌ Erro ao processar página ${pagina} do tipo ${tipo}:`, error.message);
        this.erros.push(`Tipo ${tipo}, página ${pagina}: ${error.message}`);
        break;
      }

    } while (nextPageToken && pagina <= 3); // Máximo 3 páginas por tipo
  }

  async processarEstabelecimento(place, tipoOriginal) {
    try {
      // Buscar detalhes adicionais do estabelecimento
      const detalhes = await this.buscarDetalhes(place.place_id);
      
      const dados = {
        place_id: place.place_id,
        nome: place.name,
        tipo: this.mapearTipo(tipoOriginal, place.types),
        endereco: place.vicinity || detalhes?.formatted_address || null,
        cidade: 'Franca',
        estado: 'SP',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || null,
        user_ratings_total: place.user_ratings_total || null,
        price_level: place.price_level || null,
        photo_reference: place.photos?.[0]?.photo_reference || null,
        phone_number: detalhes?.formatted_phone_number || null,
        website: detalhes?.website || null,
        google_url: detalhes?.url || null,
        business_status: place.business_status || 'OPERATIONAL',
        permanently_closed: place.permanently_closed || false,
        opening_hours: detalhes?.opening_hours ? JSON.stringify(detalhes.opening_hours) : null
      };

      const resultado = await this.salvarEstabelecimento(dados);
      
      if (resultado === 'inserido') {
        this.importados++;
      } else if (resultado === 'atualizado') {
        this.atualizados++;
      }

      if ((this.importados + this.atualizados) % 10 === 0) {
        console.log(`   📊 Progresso: ${this.importados} novos, ${this.atualizados} atualizados`);
      }

    } catch (error) {
      this.erros.push(`Erro ao processar ${place.name}: ${error.message}`);
      console.error(`❌ Erro ao processar ${place.name}:`, error.message);
    }
  }

  async buscarDetalhes(placeId) {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.append('place_id', placeId);
      url.searchParams.append('fields', 'formatted_address,formatted_phone_number,website,url,opening_hours');
      url.searchParams.append('key', this.apiKey);

      const response = await axios.get(url.toString());
      const data = response.data;

      if (data.status === 'OK') {
        return data.result;
      }
      
      return null;
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar detalhes para ${placeId}:`, error.message);
      return null;
    }
  }

  async salvarEstabelecimento(dados) {
    const query = `
      INSERT INTO estabelecimentos_google (
        place_id, nome, tipo, endereco, cidade, estado, latitude, longitude,
        rating, user_ratings_total, price_level, photo_reference,
        phone_number, website, google_url, business_status, permanently_closed,
        opening_hours, criado_em, atualizado_em
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
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
        photo_reference = EXCLUDED.photo_reference,
        phone_number = EXCLUDED.phone_number,
        website = EXCLUDED.website,
        google_url = EXCLUDED.google_url,
        business_status = EXCLUDED.business_status,
        permanently_closed = EXCLUDED.permanently_closed,
        opening_hours = EXCLUDED.opening_hours,
        atualizado_em = NOW()
      RETURNING (xmax = 0) AS foi_inserido
    `;

    const valores = [
      dados.place_id, dados.nome, dados.tipo, dados.endereco, dados.cidade, dados.estado,
      dados.latitude, dados.longitude, dados.rating, dados.user_ratings_total,
      dados.price_level, dados.photo_reference, dados.phone_number, dados.website,
      dados.google_url, dados.business_status, dados.permanently_closed, dados.opening_hours
    ];

    const resultado = await pool.query(query, valores);
    return resultado.rows[0].foi_inserido ? 'inserido' : 'atualizado';
  }

  mapearTipo(tipoOriginal, tipos) {
    // Mapear tipos do Google Places para tipos simplificados
    const mapeamento = {
      'restaurant': 'restaurant',
      'cafe': 'cafe',
      'bar': 'bar',
      'bakery': 'bakery',
      'meal_takeaway': 'fast_food',
      'food': 'restaurant'
    };

    // Verificar tipos secundários para melhor classificação
    if (tipos?.includes('meal_takeaway')) return 'fast_food';
    if (tipos?.includes('bakery')) return 'bakery';
    if (tipos?.includes('cafe')) return 'cafe';
    if (tipos?.includes('bar')) return 'bar';
    if (tipos?.includes('restaurant')) return 'restaurant';

    return mapeamento[tipoOriginal] || 'restaurant';
  }

  async aguardar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  mostrarResumo() {
    console.log('\n📊 RESUMO DA IMPORTAÇÃO DO GOOGLE PLACES');
    console.log('=' .repeat(50));
    console.log(`✅ Estabelecimentos importados: ${this.importados}`);
    console.log(`🔄 Estabelecimentos atualizados: ${this.atualizados}`);
    console.log(`❌ Erros encontrados: ${this.erros.length}`);
    
    if (this.erros.length > 0) {
      console.log('\n🔍 DETALHES DOS ERROS:');
      this.erros.slice(0, 10).forEach((erro, index) => {
        console.log(`${index + 1}. ${erro}`);
      });
      
      if (this.erros.length > 10) {
        console.log(`... e mais ${this.erros.length - 10} erros`);
      }
    }
    
    console.log('\n✨ Importação do Google Places concluída!');
  }

  // Método para importar tipos específicos
  async importarTipoEspecifico(tipo) {
    console.log(`🎯 Importando apenas estabelecimentos do tipo: ${tipo}`);
    await this.importarPorTipo(tipo);
    this.mostrarResumo();
  }

  // Método para atualizar estabelecimentos existentes
  async atualizarExistentes() {
    try {
      console.log('🔄 Atualizando estabelecimentos existentes...');
      
      const resultado = await pool.query('SELECT place_id FROM estabelecimentos_google');
      const placeIds = resultado.rows.map(row => row.place_id);
      
      console.log(`📍 Encontrados ${placeIds.length} estabelecimentos para atualizar`);
      
      for (const placeId of placeIds) {
        try {
          const detalhes = await this.buscarDetalhes(placeId);
          
          if (detalhes) {
            await pool.query(`
              UPDATE estabelecimentos_google 
              SET phone_number = $2, website = $3, google_url = $4, atualizado_em = NOW()
              WHERE place_id = $1
            `, [placeId, detalhes.formatted_phone_number, detalhes.website, detalhes.url]);
            
            this.atualizados++;
          }
          
          // Rate limiting
          await this.aguardar(100);
          
        } catch (error) {
          this.erros.push(`Erro ao atualizar ${placeId}: ${error.message}`);
        }
      }
      
      this.mostrarResumo();
      
    } catch (error) {
      console.error('💥 Erro ao atualizar estabelecimentos:', error.message);
      throw error;
    }
  }
}

// Função principal para execução direta
async function main() {
  const importer = new GooglePlacesImporter();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('📚 IMPORTADOR DO GOOGLE PLACES API');
      console.log('==================================');
      console.log('Uso:');
      console.log('  node importar_google_places.js                    # Importar todos os tipos');
      console.log('  node importar_google_places.js --tipo restaurant  # Importar tipo específico');
      console.log('  node importar_google_places.js --atualizar        # Atualizar existentes');
      console.log('  node importar_google_places.js --help             # Mostrar esta ajuda');
      console.log('');
      console.log('Tipos disponíveis:');
      console.log('  restaurant, cafe, bar, bakery, meal_takeaway, food');
      console.log('');
      console.log('⚠️  Certifique-se de ter configurado GOOGLE_PLACES_API_KEY no .env');
      return;
    }

    const comando = args[0];

    if (comando === '--help') {
      return main();
    } else if (comando === '--tipo' && args[1]) {
      await importer.importarTipoEspecifico(args[1]);
    } else if (comando === '--atualizar') {
      await importer.atualizarExistentes();
    } else if (comando === '--todos') {
      await importer.importarTodos();
    } else {
      // Comando padrão
      await importer.importarTodos();
    }

  } catch (error) {
    console.error('💥 Erro durante a importação:', error.message);
    process.exit(1);
  } finally {
    // Fechar conexão com o banco
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = GooglePlacesImporter;
