# ==============================
# SCRIPT PARA IMPORTAR DADOS DO OPENSTREETMAP PARA FRANCA-SP
# ==============================
# 
# Este script extrai dados de estabelecimentos (restaurantes, bares, cafés, lanchonetes)
# da região de Franca-SP usando dados do OpenStreetMap
#
# Pré-requisitos:
# 1. PostgreSQL com extensão PostGIS instalada
# 2. osmconvert64.exe (ferramenta para converter/recortar arquivos OSM)
# 3. osm2pgsql.exe (ferramenta para importar dados OSM no PostgreSQL)
# 4. Arquivo sudeste-latest.osm.pbf baixado do Geofabrik
#
# Download dos dados OSM: https://download.geofabrik.de/south-america/brazil/sudeste.html
# ==============================

# ==============================
# CONFIGURAÇÕES
# ==============================
# Nome do banco de dados no PostgreSQL
$dbName = "beastfood"
# Usuário do PostgreSQL
$dbUser = "postgres"
# Caminho para osmconvert64.exe
$osmconvert = "C:\OSM\osmconvert64-0.8.8p.exe"
# Caminho para osm2pgsql.exe
$osm2pgsql = "C:\OSM\osm2pgsql-bin\osm2pgsql.exe"
# Caminho para arquivo original baixado (Sudeste)
$osmFile = "C:\OSM\sudeste-latest.osm.pbf"
# Bounding box de Franca-SP (coordenadas aproximadas da cidade)
$bbox = "-47.495,-20.616,-47.330,-20.450"
# Nome do arquivo recortado
$osmFranca = "C:\OSM\franca.osm.pbf"

Write-Host "=== INICIANDO IMPORTAÇÃO DE DADOS OSM PARA FRANCA-SP ===" -ForegroundColor Green
Write-Host ""

# Verificar se os arquivos necessários existem
Write-Host "Verificando arquivos necessários..." -ForegroundColor Yellow

if (-Not (Test-Path $osmconvert)) {
    Write-Host "❌ ERRO: osmconvert64.exe não encontrado em $osmconvert" -ForegroundColor Red
    Write-Host "Baixe de: https://wiki.openstreetmap.org/wiki/Osmconvert" -ForegroundColor Yellow
    exit 1
}

if (-Not (Test-Path $osm2pgsql)) {
    Write-Host "❌ ERRO: osm2pgsql.exe não encontrado em $osm2pgsql" -ForegroundColor Red
    Write-Host "Baixe de: https://osm2pgsql.org/doc/install.html" -ForegroundColor Yellow
    exit 1
}

if (-Not (Test-Path $osmFile)) {
    Write-Host "❌ ERRO: Arquivo OSM não encontrado em $osmFile" -ForegroundColor Red
    Write-Host "Baixe de: https://download.geofabrik.de/south-america/brazil/sudeste.html" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Todos os arquivos necessários foram encontrados" -ForegroundColor Green
Write-Host ""

# ==============================
# ETAPA 1: CORTAR ARQUIVO PARA APENAS FRANCA-SP
# ==============================
Write-Host "=== CORTANDO ARQUIVO PARA APENAS FRANCA-SP ===" -ForegroundColor Green
Write-Host "Bounding box: $bbox" -ForegroundColor Cyan
Write-Host "Arquivo origem: $osmFile" -ForegroundColor Cyan
Write-Host "Arquivo destino: $osmFranca" -ForegroundColor Cyan
Write-Host ""

try {
    & $osmconvert $osmFile -b="$bbox" --complete-ways -o="$osmFranca"
    if (Test-Path $osmFranca) {
        $size = (Get-Item $osmFranca).length / 1MB
        Write-Host "✅ Arquivo recortado criado com sucesso ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
    } else {
        throw "Arquivo não foi criado"
    }
} catch {
    Write-Host "❌ ERRO ao cortar arquivo OSM: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ==============================
# ETAPA 2: IMPORTAR NO POSTGIS
# ==============================
Write-Host "=== IMPORTANDO NO POSTGIS ===" -ForegroundColor Green
Write-Host "Banco de dados: $dbName" -ForegroundColor Cyan
Write-Host "Usuário: $dbUser" -ForegroundColor Cyan
Write-Host ""

try {
    & $osm2pgsql -d $dbName -U $dbUser --create --slim -G --hstore --latlong $osmFranca
    Write-Host "✅ Dados importados no PostGIS com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO ao importar no PostGIS: $_" -ForegroundColor Red
    Write-Host "Verifique se o banco '$dbName' existe e se o usuário '$dbUser' tem permissões" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ==============================
# ETAPA 3: CRIAR VIEW DE ESTABELECIMENTOS
# ==============================
Write-Host "=== CRIANDO VIEW DE ESTABELECIMENTOS ===" -ForegroundColor Green

$viewSQL = @"
-- Remover view existente se houver
DROP VIEW IF EXISTS estabelecimentos_franca;

-- Criar nova view com estabelecimentos de Franca-SP
-- Inclui restaurantes, bares, cafés e lanchonetes
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

-- Comentário na view
COMMENT ON VIEW estabelecimentos_franca IS 'View com estabelecimentos de alimentação em Franca-SP extraídos do OpenStreetMap';
"@

# Salvar SQL temporário
$tempSQL = "C:\OSM\criar_view.sql"
try {
    $viewSQL | Out-File -Encoding UTF8 $tempSQL
    Write-Host "✅ Arquivo SQL temporário criado: $tempSQL" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO ao criar arquivo SQL: $_" -ForegroundColor Red
    exit 1
}

# Executar no PostgreSQL
Write-Host "Executando SQL no PostgreSQL..." -ForegroundColor Yellow
try {
    psql -U $dbUser -d $dbName -f $tempSQL
    Write-Host "✅ View 'estabelecimentos_franca' criada com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO ao executar SQL: $_" -ForegroundColor Red
    Write-Host "Verifique se o psql está no PATH e se as credenciais estão corretas" -ForegroundColor Yellow
    exit 1
}

# Limpar arquivo temporário
try {
    Remove-Item $tempSQL -Force
    Write-Host "✅ Arquivo temporário removido" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Aviso: Não foi possível remover arquivo temporário $tempSQL" -ForegroundColor Yellow
}

Write-Host ""

# ==============================
# ETAPA 4: VERIFICAR RESULTADOS
# ==============================
Write-Host "=== VERIFICANDO RESULTADOS ===" -ForegroundColor Green

try {
    $countQuery = "SELECT COUNT(*) as total FROM estabelecimentos_franca;"
    $result = psql -U $dbUser -d $dbName -t -c $countQuery
    $total = $result.Trim()
    
    if ($total -gt 0) {
        Write-Host "✅ View criada com sucesso! Total de estabelecimentos encontrados: $total" -ForegroundColor Green
    } else {
        Write-Host "⚠️ View criada, mas nenhum estabelecimento foi encontrado" -ForegroundColor Yellow
        Write-Host "Isso pode indicar que não há dados na região especificada" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Não foi possível verificar o número de registros" -ForegroundColor Yellow
}

Write-Host ""

# ==============================
# FINALIZAÇÃO
# ==============================
Write-Host "=== PROCESSO CONCLUÍDO ===" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Dados do OpenStreetMap importados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Verificar os dados: SELECT * FROM estabelecimentos_franca LIMIT 10;" -ForegroundColor Cyan
Write-Host "2. Contar por tipo: SELECT amenity, COUNT(*) FROM estabelecimentos_franca GROUP BY amenity;" -ForegroundColor Cyan
Write-Host "3. Buscar por nome: SELECT * FROM estabelecimentos_franca WHERE nome ILIKE '%pizza%';" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tipos de estabelecimentos incluídos:" -ForegroundColor Yellow
Write-Host "- restaurant (Restaurantes)" -ForegroundColor Cyan
Write-Host "- bar (Bares)" -ForegroundColor Cyan
Write-Host "- cafe (Cafés)" -ForegroundColor Cyan
Write-Host "- fast_food (Lanchonetes)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para executar novamente, delete o arquivo recortado:" -ForegroundColor Yellow
Write-Host "Remove-Item '$osmFranca'" -ForegroundColor Cyan
