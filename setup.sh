#!/bin/bash

echo "🚀 BeastFood Setup Script"
echo "=========================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env_example.txt .env
    echo "⚠️  Por favor, edite o arquivo .env com suas configurações antes de continuar."
    echo "   Pressione Enter quando terminar..."
    read
else
    echo "✅ Arquivo .env já existe"
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Iniciar banco de dados
echo "🐘 Iniciando PostgreSQL com PostGIS..."
docker-compose up -d postgres

echo "⏳ Aguardando banco de dados inicializar..."
sleep 10

# Verificar se o banco está funcionando
echo "🔍 Verificando conexão com o banco..."
if docker exec beastfood_postgres pg_isready -U postgres; then
    echo "✅ Banco de dados funcionando!"
else
    echo "❌ Erro ao conectar com o banco de dados"
    exit 1
fi

# Instalar dependências do servidor
echo "📦 Instalando dependências do servidor..."
cd server
npm install

# Verificar se as dependências foram instaladas
if [ $? -eq 0 ]; then
    echo "✅ Dependências do servidor instaladas"
else
    echo "❌ Erro ao instalar dependências do servidor"
    exit 1
fi

cd ..

# Instalar dependências do cliente
echo "📦 Instalando dependências do cliente..."
cd client
npm install

# Verificar se as dependências foram instaladas
if [ $? -eq 0 ]; then
    echo "✅ Dependências do cliente instaladas"
else
    echo "❌ Erro ao instalar dependências do cliente"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique se o arquivo .env está configurado corretamente"
echo "2. Inicie o servidor: cd server && npm start"
echo "3. Inicie o cliente: cd client && npm start"
echo "4. Acesse pgAdmin em: http://localhost:5050 (admin@beastfood.com / admin123)"
echo ""
echo "🗄️  Banco de dados:"
echo "   - Host: localhost"
echo "   - Porta: 5432"
echo "   - Database: beastfood"
echo "   - Usuário: postgres"
echo "   - Senha: beastfood123"
echo ""
echo "🔗 URLs:"
echo "   - API: http://localhost:5000/api"
echo "   - Cliente: http://localhost:3000"
echo "   - pgAdmin: http://localhost:5050"
echo ""
echo "Para parar os serviços: docker-compose down"
echo "Para ver logs: docker-compose logs -f"
