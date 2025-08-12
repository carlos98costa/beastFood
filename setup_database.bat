@echo off
echo ========================================
echo    CONFIGURANDO BANCO DE DADOS BEASTFOOD
echo ========================================
echo.

echo 1. Criando banco de dados...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE beastfood;"
if %errorlevel% neq 0 (
    echo ERRO: Falha ao criar banco de dados
    pause
    exit /b 1
)

echo.
echo 2. Habilitando extensão PostGIS...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d beastfood -c "CREATE EXTENSION IF NOT EXISTS postgis;"
if %errorlevel% neq 0 (
    echo ERRO: Falha ao habilitar PostGIS
    pause
    exit /b 1
)

echo.
echo 3. Executando script de configuração...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d beastfood -f "%~dp0setup_database.sql"
if %errorlevel% neq 0 (
    echo ERRO: Falha ao executar script de configuração
    pause
    exit /b 1
)

echo.
echo ========================================
echo    BANCO CONFIGURADO COM SUCESSO!
echo ========================================
echo.
echo Agora execute: npm run dev
pause
