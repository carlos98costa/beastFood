# 🚀 Solução Rápida - Painel Administrativo

## ❌ Problema
O botão "Painel Admin" não aparece na navbar porque o campo `role` não existe no banco de dados.

## ✅ Solução em 3 Passos

### 1️⃣ Executar Script SQL
```bash
# Conectar ao banco
psql -U postgres -d beastfood

# Executar no psql:
\i add_role_column.sql
\i set_admin_user.sql
```

### 2️⃣ Reiniciar Servidor
```bash
cd server
npm start
```

### 3️⃣ Reiniciar Cliente
```bash
cd client
npm start
```

## 🔧 Scripts Automáticos

### Windows (PowerShell)
```powershell
.\scripts\windows\setup_admin.ps1
```

### Windows (Batch)
```cmd
setup_admin.bat
```

## 🎯 Resultado
Após fazer login novamente, o botão "Painel Admin" aparecerá na navbar.

## 📁 Arquivos Criados
- `add_role_column.sql` - Adiciona campo role
- `set_admin_user.sql` - Define usuário como admin
- `scripts/windows/setup_admin.ps1` - Script PowerShell
- `setup_admin.bat` - Script Batch
- `SOLUCAO_PAINEL_ADMIN.md` - Solução detalhada

---
**Status**: ✅ **Pronto para uso**
**Tempo estimado**: 5 minutos


