@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    BACKUP DO BANCO BEASTFOOD
echo ========================================
echo.

:: Configurações
set DB_NAME=beastfood
set DB_USER=postgres
set BACKUP_DIR=backups
set DATE_FORMAT=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE_FORMAT=%DATE_FORMAT: =0%

:: Criar pasta de backup se não existir
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Nome do arquivo de backup
set BACKUP_FILE=%BACKUP_DIR%\beastfood_backup_%DATE_FORMAT%.sql

echo [1/3] Criando backup do banco %DB_NAME%...
echo Arquivo: %BACKUP_FILE%
echo.

:: Executar backup
pg_dump -U %DB_USER% -h localhost -d %DB_NAME% > "%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo [2/3] Backup criado com sucesso!
    
    :: Verificar tamanho do arquivo
    for %%A in ("%BACKUP_FILE%") do set FILE_SIZE=%%~zA
    echo Tamanho: %FILE_SIZE% bytes
    
    :: Comprimir backup (opcional)
    echo [3/3] Comprimindo backup...
    powershell -Command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
    
    if %errorlevel% equ 0 (
        echo ✅ Backup comprimido: %BACKUP_FILE%.zip
        del "%BACKUP_FILE%"
    ) else (
        echo ⚠️  Backup não foi comprimido, arquivo original mantido
    )
    
    echo.
    echo 🎉 Backup concluído com sucesso!
    echo 📁 Local: %BACKUP_FILE%.zip
    echo.
    
) else (
    echo ❌ ERRO: Falha ao criar backup
    echo.
    echo 💡 Verifique:
    echo    1. Se o PostgreSQL está rodando
    echo    2. Se as credenciais estão corretas
    echo    3. Se o banco %DB_NAME% existe
    echo.
)

:: Manter apenas os últimos 10 backups
echo 🔄 Limpando backups antigos...
for /f "tokens=*" %%i in ('dir /b /o-d "%BACKUP_DIR%\beastfood_backup_*.zip" 2^>nul') do (
    set /a count+=1
    if !count! gtr 10 (
        echo Removendo: %%i
        del "%BACKUP_DIR%\%%i"
    )
)

echo.
echo ✅ Limpeza concluída. Mantidos os últimos 10 backups.
echo.
pause
