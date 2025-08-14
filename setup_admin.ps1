# Script PowerShell para configurar sistema de administração
# Execute como administrador se necessário

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configurando Sistema de Administracao" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o PostgreSQL está instalado
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL encontrado:" -ForegroundColor Green
        Write-Host $psqlVersion -ForegroundColor Gray
    } else {
        Write-Host "❌ PostgreSQL não encontrado no PATH" -ForegroundColor Red
        Write-Host "Certifique-se de que o PostgreSQL está instalado e no PATH" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao verificar PostgreSQL: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Adicionando coluna role à tabela users..." -ForegroundColor Yellow

# Executar script SQL para adicionar coluna role
try {
    psql -U postgres -d beastfood -f "add_role_column.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Coluna role adicionada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao adicionar coluna role" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao executar script SQL: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Definindo usuario como administrador..." -ForegroundColor Yellow

# Executar script SQL para definir usuário como admin
try {
    psql -U postgres -d beastfood -f "set_admin_user.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Usuario definido como administrador!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao definir usuario como admin" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao executar script SQL: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Reinicie o servidor: cd server; npm start" -ForegroundColor White
Write-Host "2. Reinicie o cliente: cd client; npm start" -ForegroundColor White
Write-Host "3. Faça login novamente para ver o painel admin" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Para verificar:" -ForegroundColor Yellow
Write-Host "- Abra o console do navegador após login" -ForegroundColor White
Write-Host "- Digite: console.log('User:', user)" -ForegroundColor White
Write-Host "- Deve mostrar o campo 'role': 'admin'" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Resultado esperado:" -ForegroundColor Yellow
Write-Host "- Botão 'Painel Admin' aparece na navbar" -ForegroundColor White
Write-Host "- Modal do painel administrativo abre" -ForegroundColor White

Write-Host ""
Read-Host "Pressione Enter para continuar..."
