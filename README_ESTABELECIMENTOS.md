# API REST de Estabelecimentos Gastronômicos

## 🎯 Visão Geral

Esta API REST completa foi implementada para servir dados de estabelecimentos gastronômicos usando **Node.js + Express + PostgreSQL + PostGIS**. A API oferece funcionalidades avançadas de busca geoespacial e gerenciamento de dados.

## 🏗️ Arquitetura

### Estrutura de Pastas
```
server/
├── modules/estabelecimentos/
│   ├── estabelecimentos.service.js     # Lógica de negócio
│   ├── estabelecimentos.controller.js  # Controladores das rotas
│   └── estabelecimentos.routes.js      # Definição das rotas
├── config/
│   ├── database.js                     # Conexão PostgreSQL existente
│   └── estabelecimentos.sql            # Script de criação da tabela
└── index.js                           # Servidor principal (integrado)

importar_estabelecimentos.js            # Script de importação de dados
```

## 🗄️ Banco de Dados

### Tabela: `estabelecimentos`

```sql
CREATE TABLE estabelecimentos (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    cidade VARCHAR(100) DEFAULT 'Franca',
    estado VARCHAR(2) DEFAULT 'SP',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    geom GEOMETRY(POINT, 4326),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Recursos PostGIS
- **Geometria**: Campo `geom` para consultas espaciais eficientes
- **Índices espaciais**: GIST index para performance
- **Funções espaciais**: ST_Distance, ST_DWithin, ST_MakePoint
- **Trigger automático**: Atualiza geometria quando lat/lng mudam

## 🚀 Endpoints da API

### Base URL: `/api/estabelecimentos`

#### 1. **GET /** - Informações da API
```
GET /api/estabelecimentos/
```
Retorna informações sobre a API e estatísticas gerais.

#### 2. **GET /estabelecimentos** - Listar com Paginação
```
GET /api/estabelecimentos/estabelecimentos?page=1&limit=20&search=pizza&tipo=restaurant&cidade=Franca
```

**Parâmetros:**
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20, máx: 100)
- `search` (opcional): Busca por nome
- `tipo` (opcional): Filtrar por tipo
- `cidade` (opcional): Filtrar por cidade

#### 3. **GET /estabelecimentos/:id** - Buscar por ID
```
GET /api/estabelecimentos/estabelecimentos/123
```

#### 4. **GET /estabelecimentos/nome/:nome** - Buscar por Nome
```
GET /api/estabelecimentos/estabelecimentos/nome/pizzaria
```
Usa busca por similaridade (PostgreSQL `similarity`).

#### 5. **GET /estabelecimentos/tipo/:tipo** - Buscar por Tipo
```
GET /api/estabelecimentos/estabelecimentos/tipo/restaurant
```

**Tipos comuns:**
- `restaurant` - Restaurantes
- `cafe` - Cafés
- `fast_food` - Fast food
- `bar` - Bares
- `bakery` - Padarias
- `ice_cream` - Sorveterias

#### 6. **GET /estabelecimentos/proximos** - Busca por Proximidade 🗺️
```
GET /api/estabelecimentos/estabelecimentos/proximos?lat=-20.5386&lon=-47.4008&raio=2000
```

**Parâmetros:**
- `lat` (obrigatório): Latitude
- `lon` (obrigatório): Longitude  
- `raio` (opcional): Raio em metros (padrão: 2000, máx: 50000)

**Resposta inclui:**
- `distancia_m`: Distância em metros do ponto central

#### 7. **GET /estabelecimentos/alteracoes** - Últimas Alterações
```
GET /api/estabelecimentos/estabelecimentos/alteracoes?limit=20
```

#### 8. **GET /estabelecimentos/estatisticas** - Estatísticas
```
GET /api/estabelecimentos/estabelecimentos/estatisticas
```

#### 9. **GET /estabelecimentos/busca** - Busca Avançada
```
GET /api/estabelecimentos/estabelecimentos/busca?nome=pizza&tipo=restaurant&lat=-20.5386&lon=-47.4008&raio=5000
```

#### 10. **POST /estabelecimentos** - Criar Estabelecimento
```json
POST /api/estabelecimentos/estabelecimentos
Content-Type: application/json

{
  "osm_id": 12345,
  "nome": "Pizzaria Nova",
  "tipo": "restaurant", 
  "endereco": "Rua das Flores, 123",
  "telefone": "(16) 3721-1234",
  "cidade": "Franca",
  "latitude": -20.5386,
  "longitude": -47.4008
}
```

#### 11. **PUT /estabelecimentos/:id** - Atualizar
```json
PUT /api/estabelecimentos/estabelecimentos/123
Content-Type: application/json

{
  "nome": "Pizzaria Nova (Atualizada)",
  "telefone": "(16) 3721-5678"
}
```

#### 12. **DELETE /estabelecimentos/:id** - Excluir
```
DELETE /api/estabelecimentos/estabelecimentos/123
```

## 📥 Importação de Dados

### Script: `importar_estabelecimentos.js`

#### Uso Básico
```bash
# Dados de exemplo para teste
node importar_estabelecimentos.js --exemplo

# Importar de arquivo JSON
node importar_estabelecimentos.js dados.json

# Importar de arquivo CSV
node importar_estabelecimentos.js dados.csv

# Ajuda
node importar_estabelecimentos.js
```

#### Formato JSON
```json
[
  {
    "osm_id": 123,
    "nome": "Restaurante Exemplo",
    "tipo": "restaurant",
    "endereco": "Rua das Flores, 123",
    "telefone": "(16) 3721-1234",
    "cidade": "Franca",
    "latitude": -20.5386,
    "longitude": -47.4008
  }
]
```

#### Formato CSV
```csv
nome,tipo,endereco,telefone,cidade,latitude,longitude
"Restaurante Exemplo","restaurant","Rua das Flores, 123","(16) 3721-1234","Franca",-20.5386,-47.4008
```

#### Campos Reconhecidos
O importador reconhece automaticamente variações de nomes:
- **Nome**: `nome`, `name`, `titulo`, `title`
- **Tipo**: `tipo`, `type`, `categoria`, `amenity`
- **Endereço**: `endereco`, `address`, `addr:full`
- **Telefone**: `telefone`, `phone`, `contact:phone`
- **Coordenadas**: `latitude`/`longitude`, `lat`/`lng`, `y`/`x`

## 🛠️ Configuração e Instalação

### 1. Banco de Dados
```bash
# Executar script de criação da tabela
psql -d beastfood -f server/config/estabelecimentos.sql
```

### 2. Servidor (já integrado)
O módulo está automaticamente integrado ao servidor principal do BeastFood. Apenas inicie o servidor:

```bash
npm run dev
```

### 3. Teste da API
```bash
# Verificar se está funcionando
curl http://localhost:5000/api/estabelecimentos/

# Buscar estabelecimentos
curl http://localhost:5000/api/estabelecimentos/estabelecimentos

# Busca por proximidade (Centro de Franca)
curl "http://localhost:5000/api/estabelecimentos/estabelecimentos/proximos?lat=-20.5386&lon=-47.4008&raio=2000"
```

## 📊 Exemplos de Uso

### Buscar pizzarias próximas
```javascript
fetch('/api/estabelecimentos/estabelecimentos/busca?nome=pizza&lat=-20.5386&lon=-47.4008&raio=3000')
  .then(response => response.json())
  .then(data => console.log(data.estabelecimentos));
```

### Listar todos os cafés
```javascript
fetch('/api/estabelecimentos/estabelecimentos/tipo/cafe')
  .then(response => response.json())
  .then(data => console.log(data.estabelecimentos));
```

### Busca paginada com filtros
```javascript
fetch('/api/estabelecimentos/estabelecimentos?page=1&limit=10&search=restaurante&cidade=Franca')
  .then(response => response.json())
  .then(data => {
    console.log('Estabelecimentos:', data.estabelecimentos);
    console.log('Paginação:', data.pagination);
  });
```

## 🔧 Recursos Avançados

### 1. **Busca por Similaridade**
Usa a extensão `pg_trgm` do PostgreSQL para encontrar nomes similares mesmo com erros de digitação.

### 2. **Consultas Geoespaciais**
- Busca por raio usando `ST_DWithin`
- Cálculo de distância com `ST_Distance`
- Geometria automaticamente atualizada via trigger

### 3. **Performance**
- Índices otimizados (GIN, GIST, B-tree)
- Paginação eficiente
- Cache de geometria

### 4. **Validações**
- Coordenadas válidas (-90 a 90 lat, -180 a 180 lng)
- Limites de paginação
- Sanitização de entrada

### 5. **Tratamento de Erros**
- Respostas padronizadas
- Logs detalhados
- Status codes HTTP apropriados

## 🚀 Próximos Passos

1. **Cache**: Implementar Redis para cache de consultas frequentes
2. **Rate Limiting**: Limites específicos por endpoint
3. **Autenticação**: Proteção para rotas de modificação (POST/PUT/DELETE)
4. **Documentação**: Swagger/OpenAPI
5. **Testes**: Suite de testes automatizados
6. **Monitoramento**: Métricas e logs estruturados

## 📱 Integração com Frontend

A API está pronta para ser consumida pelo frontend React do BeastFood. Endpoints podem ser facilmente integrados aos componentes existentes para:

- Busca de estabelecimentos por proximidade
- Listagem categorizada 
- Integração com mapas (Google Maps, Leaflet)
- Funcionalidades de check-in e avaliação

---

**Versão**: 1.0.0  
**Compatibilidade**: BeastFood v2.1+  
**Banco**: PostgreSQL 12+ com PostGIS 3+

