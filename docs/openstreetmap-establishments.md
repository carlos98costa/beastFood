# 🗺️ OpenStreetMap - Estabelecimentos de Franca-SP

Esta funcionalidade permite consultar estabelecimentos de alimentação (restaurantes, bares, cafés e lanchonetes) da cidade de Franca-SP utilizando dados do OpenStreetMap.

## 📋 Visão Geral

O sistema utiliza dados do OpenStreetMap para fornecer informações sobre estabelecimentos de alimentação na região de Franca-SP. Os dados são importados através de um script PowerShell que:

1. Baixa dados OSM da região Sudeste
2. Recorta para apenas Franca-SP
3. Importa no PostgreSQL com PostGIS
4. Cria uma view com os estabelecimentos filtrados

## 🏗️ Arquitetura

### Componentes Criados

- **Script PowerShell**: `importar-franca.ps1` - Importa dados OSM
- **Serviço**: `server/modules/osm-estabelecimentos/osm-estabelecimentos.service.js`
- **Controller**: `server/modules/osm-estabelecimentos/osm-estabelecimentos.controller.js`
- **Rotas**: `server/modules/osm-estabelecimentos/osm-estabelecimentos.routes.js`
- **Teste**: `test_osm_estabelecimentos.html`

### View do Banco de Dados

A view `estabelecimentos_franca` é criada automaticamente e contém:

```sql
CREATE VIEW estabelecimentos_franca AS
SELECT
    COALESCE(name, 'Sem nome') AS nome,
    amenity,
    ST_X(ST_Transform(way, 4326)) AS longitude,
    ST_Y(ST_Transform(way, 4326)) AS latitude,
    'point' as geometry_type,
    osm_id
FROM planet_osm_point
WHERE amenity IN ('restaurant', 'bar', 'cafe', 'fast_food')
  AND name IS NOT NULL
  AND name != ''

UNION ALL

SELECT
    COALESCE(name, 'Sem nome') AS nome,
    amenity,
    ST_X(ST_Centroid(ST_Transform(way, 4326))) AS longitude,
    ST_Y(ST_Centroid(ST_Transform(way, 4326))) AS latitude,
    'polygon' as geometry_type,
    osm_id
FROM planet_osm_polygon
WHERE amenity IN ('restaurant', 'bar', 'cafe', 'fast_food')
  AND name IS NOT NULL
  AND name != '';
```

## 🚀 Configuração e Instalação

### Pré-requisitos

1. **PostgreSQL com PostGIS** instalado
2. **osmconvert64.exe** - [Download aqui](https://wiki.openstreetmap.org/wiki/Osmconvert)
3. **osm2pgsql.exe** - [Download aqui](https://osm2pgsql.org/doc/install.html)
4. **Dados OSM do Sudeste** - [Download aqui](https://download.geofabrik.de/south-america/brazil/sudeste.html)

### Estrutura de Diretórios Recomendada

```
C:\OSM\
├── osmconvert64.exe
├── osm2pgsql-bin\
│   └── osm2pgsql.exe
├── sudeste-latest.osm.pbf
└── franca.osm.pbf (será criado)
```

### Instalação

1. **Configurar ferramentas OSM**:
   ```powershell
   # Criar diretório
   mkdir C:\OSM
   
   # Baixar e extrair osmconvert64.exe
   # Baixar e extrair osm2pgsql
   # Baixar sudeste-latest.osm.pbf
   ```

2. **Executar o script de importação**:
   ```powershell
   # Executar como Administrador
   Set-ExecutionPolicy RemoteSigned
   .\importar-franca.ps1
   ```

3. **Verificar importação**:
   ```sql
   -- No PostgreSQL
   SELECT COUNT(*) FROM estabelecimentos_franca;
   SELECT amenity, COUNT(*) FROM estabelecimentos_franca GROUP BY amenity;
   ```

## 📚 API Endpoints

### Base URL: `/api/osm-estabelecimentos`

#### 1. Status da View
```http
GET /api/osm-estabelecimentos/status
```
Verifica se a view existe e tem dados.

#### 2. Estatísticas
```http
GET /api/osm-estabelecimentos/stats
```
Retorna estatísticas gerais dos estabelecimentos.

#### 3. Tipos Disponíveis
```http
GET /api/osm-estabelecimentos/amenities
```
Lista todos os tipos (amenity) disponíveis.

#### 4. Listar Estabelecimentos
```http
GET /api/osm-estabelecimentos?page=1&limit=20&amenity=restaurant&search=pizza
```
Lista estabelecimentos com paginação e filtros.

**Parâmetros:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20, máximo: 100)
- `amenity` (opcional): Tipo do estabelecimento (restaurant, bar, cafe, fast_food)
- `search` (opcional): Busca por nome
- `latitude`, `longitude`, `raio` (opcionais): Busca por proximidade

#### 5. Buscar por Nome
```http
GET /api/osm-estabelecimentos/search?nome=pizza&limit=20
```
Busca estabelecimentos por nome.

#### 6. Buscar Próximos
```http
GET /api/osm-estabelecimentos/nearby?latitude=-20.533&longitude=-47.400&raio=1000&limit=15
```
Busca estabelecimentos próximos a um ponto.

#### 7. Buscar por Tipo
```http
GET /api/osm-estabelecimentos/amenity/restaurant?limit=50
```
Busca estabelecimentos por tipo específico.

#### 8. Buscar por OSM ID
```http
GET /api/osm-estabelecimentos/{osmId}
```
Busca estabelecimento específico por OSM ID.

#### 9. Busca Avançada
```http
POST /api/osm-estabelecimentos/advanced-search
Content-Type: application/json

{
  "nome": "pizza",
  "amenity": "restaurant",
  "latitude": -20.533,
  "longitude": -47.400,
  "raio": 2000,
  "geometry_type": "point",
  "limit": 30
}
```

## 🎯 Tipos de Estabelecimentos (Amenity)

| Tipo | Descrição | Cor no Teste |
|------|-----------|--------------|
| `restaurant` | Restaurantes | 🔴 Vermelho |
| `bar` | Bares | 🟣 Roxo |
| `cafe` | Cafés | 🟠 Laranja |
| `fast_food` | Lanchonetes | 🔵 Azul |

## 🧪 Testes

### Arquivo de Teste HTML
Execute o arquivo `test_osm_estabelecimentos.html` para testar todas as funcionalidades:

1. **Status da View**: Verifica se os dados estão disponíveis
2. **Estatísticas**: Mostra distribuição por tipo e geometria
3. **Busca por Nome**: Teste com "pizza", "bar", etc.
4. **Busca por Proximidade**: Use sua localização atual
5. **Filtros por Tipo**: Teste cada amenity
6. **Busca Avançada**: Combine múltiplos critérios

### Testes via Terminal
```bash
# 1. Verificar status
curl http://localhost:5000/api/osm-estabelecimentos/status

# 2. Obter estatísticas
curl http://localhost:5000/api/osm-estabelecimentos/stats

# 3. Buscar restaurantes
curl "http://localhost:5000/api/osm-estabelecimentos/amenity/restaurant?limit=5"

# 4. Buscar próximos (centro de Franca)
curl "http://localhost:5000/api/osm-estabelecimentos/nearby?latitude=-20.533&longitude=-47.400&raio=1000"
```

## 🔧 Resolução de Problemas

### 1. View não existe
**Erro**: `view_exists: false`
**Solução**: Execute o script `importar-franca.ps1`

### 2. View existe mas sem dados
**Erro**: `total_records: 0`
**Possíveis causas**:
- Dados OSM não têm estabelecimentos com nome na região
- Bounding box incorreto
- Dados OSM desatualizados

### 3. Erro ao executar script PowerShell
**Erro**: `execution policy`
**Solução**: 
```powershell
Set-ExecutionPolicy RemoteSigned
```

### 4. Erro de conexão com PostgreSQL
**Verificar**:
- Banco `beastFood` existe
- Usuário `postgres` tem permissões
- PostGIS está instalado
- Variáveis de ambiente no `.env`

## 📊 Estrutura de Resposta da API

### Resposta Padrão
```json
{
  "success": true,
  "data": [
    {
      "nome": "Pizzaria do João",
      "amenity": "restaurant",
      "longitude": -47.400123,
      "latitude": -20.533456,
      "geometry_type": "point",
      "osm_id": "123456789",
      "distancia_metros": 250.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Resposta de Erro
```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "error": "Detalhes do erro"
}
```

## 🔄 Atualizações dos Dados

Para atualizar os dados OSM:

1. **Baixar nova versão** do arquivo `sudeste-latest.osm.pbf`
2. **Remover arquivo recortado**: `Remove-Item C:\OSM\franca.osm.pbf`
3. **Executar script novamente**: `.\importar-franca.ps1`

**Nota**: O script recria a view, então todos os dados serão atualizados.

## 🌟 Próximas Melhorias

- [ ] Cache de consultas frequentes
- [ ] Integração com Google Places para dados complementares
- [ ] Suporte a outros tipos de estabelecimentos
- [ ] Busca por endereço/CEP
- [ ] Avaliações e comentários dos estabelecimentos OSM
- [ ] Sincronização automática de dados
- [ ] Mapa interativo no frontend

## 🤝 Contribuição

Para contribuir com melhorias:

1. Teste os endpoints com diferentes cenários
2. Reporte bugs ou inconsistências
3. Sugira novos filtros ou funcionalidades
4. Contribua com otimizações de consultas SQL
5. Melhore a documentação

## 📝 Changelog

### v1.0.0 (Atual)
- ✅ Importação de dados OSM via script PowerShell
- ✅ API completa para consulta de estabelecimentos
- ✅ Busca por proximidade com PostGIS
- ✅ Filtros por tipo, nome e localização
- ✅ Paginação e estatísticas
- ✅ Testes HTML interativos
- ✅ Documentação completa


