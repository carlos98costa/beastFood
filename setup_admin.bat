@echo off
echo ========================================
echo Configurando Sistema de Administracao
echo ========================================
echo.

echo 1. Adicionando coluna role à tabela users...
psql -U postgres -d beastfood -f add_role_column.sql

echo.
echo 2. Definindo usuario como administrador...
psql -U postgres -d beastfood -f set_admin_user.sql

echo.
echo ========================================
echo Configuracao concluida!
echo ========================================
echo.
echo Agora o usuario 'carlos' deve ter acesso ao painel admin.
echo Reinicie o servidor e o cliente para aplicar as mudancas.
echo.
pause


