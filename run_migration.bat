@echo off
echo ========================================
echo    MIGRACAO BEASTFOOD - RESTAURANTES PENDENTES
echo ========================================
echo.

echo Conectando ao banco de dados...
echo.

REM Substitua as credenciais conforme necessário
psql -U postgres -d beastfood -f migrate_pending_restaurants.sql

echo.
echo ========================================
echo    MIGRACAO CONCLUIDA!
echo ========================================
echo.
echo Verifique se não houve erros acima.
echo.
pause
