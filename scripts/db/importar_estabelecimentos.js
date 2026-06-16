const fs = require('fs');
const path = require('path');
const pool = require('./server/config/database');

class ImportadorEstabelecimentos {
  constructor() {
    this.estabelecimentosProcessados = 0;
    this.erros = [];
  }

  // Importar de arquivo JSON
  async importarDeJSON(caminhoArquivo) {
    try {
      console.log(`📁 Lendo arquivo: ${caminhoArquivo}`);
      
      if (!fs.existsSync(caminhoArquivo)) {
        throw new Error(`Arquivo não encontrado: ${caminhoArquivo}`);
      }

      const dados = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf8'));
      
      if (!Array.isArray(dados)) {
        throw new Error('O arquivo deve conter um array de estabelecimentos');
      }

      console.log(`📊 ${dados.length} estabelecimentos encontrados no arquivo`);
      
      for (const estabelecimento of dados) {
        await this.processarEstabelecimento(estabelecimento);
      }

      this.mostrarResumo();
      
    } catch (error) {
      console.error('❌ Erro ao importar arquivo JSON:', error.message);
      throw error;
    }
  }

  // Importar de arquivo CSV
  async importarDeCSV(caminhoArquivo) {
    try {
      console.log(`📁 Lendo arquivo CSV: ${caminhoArquivo}`);
      
      if (!fs.existsSync(caminhoArquivo)) {
        throw new Error(`Arquivo não encontrado: ${caminhoArquivo}`);
      }

      const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
      const linhas = conteudo.split('\n').filter(linha => linha.trim());
      
      if (linhas.length < 2) {
        throw new Error('CSV deve ter pelo menos cabeçalho e uma linha de dados');
      }

      // Processar cabeçalho
      const cabecalho = linhas[0].split(',').map(col => col.trim().replace(/"/g, ''));
      console.log('📋 Colunas encontradas:', cabecalho);

      // Processar dados
      for (let i = 1; i < linhas.length; i++) {
        const valores = this.parseCSVLine(linhas[i]);
        
        if (valores.length !== cabecalho.length) {
          console.warn(`⚠️ Linha ${i + 1} ignorada - número de colunas incorreto`);
          continue;
        }

        const estabelecimento = {};
        cabecalho.forEach((col, index) => {
          estabelecimento[col] = valores[index];
        });

        await this.processarEstabelecimento(estabelecimento);
      }

      this.mostrarResumo();
      
    } catch (error) {
      console.error('❌ Erro ao importar arquivo CSV:', error.message);
      throw error;
    }
  }

  // Processar um estabelecimento individual
  async processarEstabelecimento(dados) {
    try {
      // Normalizar nomes das propriedades
      const estabelecimento = this.normalizarDados(dados);
      
      // Validar dados obrigatórios
      if (!estabelecimento.nome || !estabelecimento.tipo) {
        this.erros.push(`Estabelecimento ignorado - nome ou tipo faltando: ${JSON.stringify(dados)}`);
        return;
      }

      // Inserir no banco
      const query = `
        INSERT INTO estabelecimentos (osm_id, nome, tipo, endereco, telefone, cidade, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (osm_id) DO UPDATE SET
          nome = EXCLUDED.nome,
          tipo = EXCLUDED.tipo,
          endereco = EXCLUDED.endereco,
          telefone = EXCLUDED.telefone,
          cidade = EXCLUDED.cidade,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          updated_at = NOW()
        RETURNING id, nome
      `;

      const valores = [
        estabelecimento.osm_id || null,
        estabelecimento.nome,
        estabelecimento.tipo,
        estabelecimento.endereco || null,
        estabelecimento.telefone || null,
        estabelecimento.cidade || 'Franca',
        estabelecimento.latitude || null,
        estabelecimento.longitude || null
      ];

      const resultado = await pool.query(query, valores);
      this.estabelecimentosProcessados++;
      
      if (this.estabelecimentosProcessados % 100 === 0) {
        console.log(`✅ ${this.estabelecimentosProcessados} estabelecimentos processados...`);
      }

    } catch (error) {
      this.erros.push(`Erro ao processar estabelecimento ${dados.nome || 'sem nome'}: ${error.message}`);
    }
  }

  // Normalizar dados de diferentes formatos
  normalizarDados(dados) {
    const mapeamento = {
      // Possíveis variações de nomes de campos
      nome: ['nome', 'name', 'titulo', 'title', 'estabelecimento'],
      tipo: ['tipo', 'type', 'categoria', 'category', 'amenity'],
      endereco: ['endereco', 'address', 'addr:full', 'addr:street', 'location'],
      telefone: ['telefone', 'phone', 'contact:phone', 'tel'],
      cidade: ['cidade', 'city', 'addr:city'],
      latitude: ['latitude', 'lat', 'y', 'coord_lat'],
      longitude: ['longitude', 'lng', 'lon', 'x', 'coord_lng'],
      osm_id: ['osm_id', 'id', 'osmid', 'osm:id']
    };

    const estabelecimento = {};

    // Mapear campos
    Object.keys(mapeamento).forEach(campoDestino => {
      const possiveisNomes = mapeamento[campoDestino];
      
      for (const nome of possiveisNomes) {
        const valor = dados[nome] || dados[nome.toLowerCase()] || dados[nome.toUpperCase()];
        if (valor !== undefined && valor !== null && valor !== '') {
          estabelecimento[campoDestino] = valor;
          break;
        }
      }
    });

    // Converter coordenadas para números
    if (estabelecimento.latitude) {
      estabelecimento.latitude = parseFloat(estabelecimento.latitude);
      if (isNaN(estabelecimento.latitude)) estabelecimento.latitude = null;
    }
    
    if (estabelecimento.longitude) {
      estabelecimento.longitude = parseFloat(estabelecimento.longitude);
      if (isNaN(estabelecimento.longitude)) estabelecimento.longitude = null;
    }

    // Converter osm_id para número
    if (estabelecimento.osm_id) {
      estabelecimento.osm_id = parseInt(estabelecimento.osm_id);
      if (isNaN(estabelecimento.osm_id)) estabelecimento.osm_id = null;
    }

    return estabelecimento;
  }

  // Parser simples para CSV
  parseCSVLine(linha) {
    const resultado = [];
    let valorAtual = '';
    let dentroAspas = false;
    
    for (let i = 0; i < linha.length; i++) {
      const char = linha[i];
      
      if (char === '"') {
        dentroAspas = !dentroAspas;
      } else if (char === ',' && !dentroAspas) {
        resultado.push(valorAtual.trim());
        valorAtual = '';
      } else {
        valorAtual += char;
      }
    }
    
    resultado.push(valorAtual.trim());
    return resultado.map(val => val.replace(/^"|"$/g, ''));
  }

  // Mostrar resumo da importação
  mostrarResumo() {
    console.log('\n📊 RESUMO DA IMPORTAÇÃO');
    console.log('=' * 50);
    console.log(`✅ Estabelecimentos processados: ${this.estabelecimentosProcessados}`);
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
    
    console.log('\n✨ Importação concluída!');
  }

  // Importar dados de exemplo (para testes)
  async importarDadosExemplo() {
    const dadosExemplo = [
      {
        osm_id: 2001,
        nome: 'Pizzaria Dona Maria',
        tipo: 'restaurant',
        endereco: 'Rua das Palmeiras, 456, Centro',
        telefone: '(16) 3721-5555',
        cidade: 'Franca',
        latitude: -20.5395,
        longitude: -47.4025
      },
      {
        osm_id: 2002,
        nome: 'Café Bourbon',
        tipo: 'cafe',
        endereco: 'Av. Dr. Ismael Alonso y Alonso, 789',
        telefone: '(16) 3722-6666',
        cidade: 'Franca',
        latitude: -20.5350,
        longitude: -47.4000
      },
      {
        osm_id: 2003,
        nome: 'Hamburgueria Central',
        tipo: 'fast_food',
        endereco: 'Rua Nove de Julho, 321',
        telefone: '(16) 3723-7777',
        cidade: 'Franca',
        latitude: -20.5415,
        longitude: -47.4035
      },
      {
        osm_id: 2004,
        nome: 'Restaurante Mineiro',
        tipo: 'restaurant',
        endereco: 'Rua General Osório, 654',
        telefone: '(16) 3724-8888',
        cidade: 'Franca',
        latitude: -20.5380,
        longitude: -47.4015
      },
      {
        osm_id: 2005,
        nome: 'Sorveteria Gelatto',
        tipo: 'ice_cream',
        endereco: 'Praça Barão da Franca, 111',
        telefone: '(16) 3725-9999',
        cidade: 'Franca',
        latitude: -20.5365,
        longitude: -47.3995
      }
    ];

    console.log('🎲 Importando dados de exemplo...');
    
    for (const estabelecimento of dadosExemplo) {
      await this.processarEstabelecimento(estabelecimento);
    }

    this.mostrarResumo();
  }
}

// Função principal para execução direta
async function main() {
  const importador = new ImportadorEstabelecimentos();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('📚 IMPORTADOR DE ESTABELECIMENTOS');
      console.log('================================');
      console.log('Uso:');
      console.log('  node importar_estabelecimentos.js <arquivo.json>  # Importar JSON');
      console.log('  node importar_estabelecimentos.js <arquivo.csv>   # Importar CSV');
      console.log('  node importar_estabelecimentos.js --exemplo       # Dados de exemplo');
      console.log('');
      console.log('Formatos suportados:');
      console.log('  JSON: Array de objetos com propriedades dos estabelecimentos');
      console.log('  CSV:  Primeira linha com cabeçalhos, demais com dados');
      console.log('');
      console.log('Campos reconhecidos:');
      console.log('  nome, tipo, endereco, telefone, cidade, latitude, longitude, osm_id');
      return;
    }

    const argumento = args[0];

    if (argumento === '--exemplo') {
      await importador.importarDadosExemplo();
    } else if (argumento.endsWith('.json')) {
      await importador.importarDeJSON(argumento);
    } else if (argumento.endsWith('.csv')) {
      await importador.importarDeCSV(argumento);
    } else {
      console.error('❌ Formato de arquivo não suportado. Use .json ou .csv');
      process.exit(1);
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

module.exports = ImportadorEstabelecimentos;

