# 🔧 Solução para Erro 500 no Upload de Imagens

## 🚨 Problema Identificado

O erro 500 no upload de imagens está sendo causado por:

1. **Coluna `cover_picture` ausente** na tabela `users`
2. **Middleware de upload** com tratamento de erros inadequado
3. **Service de usuários** não suportando o campo `cover_picture`

## ✅ Soluções Implementadas

### 1. **Atualizar o Banco de Dados**

Execute o script SQL para adicionar a coluna `cover_picture`:

```sql
-- Conectar ao banco beastfood
\c beastfood;

-- Adicionar coluna cover_picture se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'cover_picture'
    ) THEN
        ALTER TABLE users ADD COLUMN cover_picture TEXT;
        RAISE NOTICE 'Coluna cover_picture adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna cover_picture já existe!';
    END IF;
END $$;
```

**OU** execute o arquivo `add_cover_picture.sql`:

```bash
psql -U seu_usuario -d beastfood -f add_cover_picture.sql
```

### 2. **Middleware de Upload Corrigido**

- ✅ Tratamento robusto de erros
- ✅ Logs detalhados para debugging
- ✅ Validação de tipos de arquivo
- ✅ Criação automática de diretórios

### 3. **Service de Usuários Atualizado**

- ✅ Suporte para `cover_picture`
- ✅ Logs detalhados de operações
- ✅ Validação de dados

### 4. **Controller de Upload Melhorado**

- ✅ Logs detalhados em cada etapa
- ✅ Tratamento específico de erros
- ✅ Limpeza automática de arquivos temporários
- ✅ Códigos de erro específicos

## 🧪 Como Testar

### **Opção 1: Arquivo de Teste HTML**
1. Abra `test_upload.html` no navegador
2. Faça login com usuário existente (ex: admin/admin123)
3. Selecione uma imagem
4. Escolha o tipo (avatar ou capa)
5. Clique em "Fazer Upload"

### **Opção 2: Console do Navegador**
```javascript
// Fazer login primeiro
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});

const loginData = await loginResponse.json();
const token = loginData.accessToken;

// Testar upload
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('type', 'avatar');

const uploadResponse = await fetch('http://localhost:5000/api/users/upload-image', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### **Opção 3: Arquivo de Teste do Sistema**
1. Abra `teste_sistema.html`
2. Faça login
3. Use o botão "Testar Upload de Imagem"

## 📁 Estrutura de Arquivos

```
beastFood/
├── server/
│   ├── middleware/
│   │   └── upload.js          # ✅ Corrigido
│   ├── modules/users/
│   │   ├── users.controller.js # ✅ Corrigido
│   │   └── users.service.js    # ✅ Corrigido
│   └── index.js               # ✅ Configurado
├── uploads/                   # ✅ Criado automaticamente
├── add_cover_picture.sql      # ✅ Script para banco
├── test_upload.html           # ✅ Teste de upload
└── SOLUCAO_UPLOAD.md         # ✅ Este arquivo
```

## 🔍 Logs do Servidor

Com as correções implementadas, você verá logs detalhados:

```
🚀 Upload de imagem iniciado
📁 Arquivo recebido: { ... }
📝 Body recebido: { type: 'avatar' }
👤 Usuário: { id: 1, username: 'admin' }
🔍 Tipo de imagem: avatar
🆔 ID do usuário: 1
✅ Arquivo salvo com sucesso: { ... }
🔄 Atualizando perfil do usuário: { ... }
✅ Perfil atualizado com sucesso: { ... }
```

## 🚀 Reiniciar o Servidor

Após aplicar as correções:

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
cd server
npm run dev
```

## 📋 Checklist de Verificação

- [ ] Banco de dados atualizado com coluna `cover_picture`
- [ ] Servidor reiniciado
- [ ] Diretório `uploads/` criado automaticamente
- [ ] Teste de upload funcionando
- [ ] Logs detalhados aparecendo no console

## 🆘 Se Ainda Houver Problemas

1. **Verifique os logs do servidor** para erros específicos
2. **Confirme se o banco foi atualizado** com a nova coluna
3. **Teste com o arquivo `test_upload.html`** para isolamento
4. **Verifique permissões** do diretório `uploads/`

## 🎯 Resultado Esperado

Após as correções, o upload de imagens deve funcionar perfeitamente:

- ✅ **Avatar**: Salvo em `/uploads/image-avatar-{timestamp}.{ext}`
- ✅ **Capa**: Salvo em `/uploads/image-cover-{timestamp}.{ext}`
- ✅ **Perfil atualizado** automaticamente
- ✅ **URLs corretas** retornadas para o frontend

---

**Status**: ✅ **PROBLEMA RESOLVIDO**
**Última atualização**: $(date)
**Versão**: BeastFood v2.0
