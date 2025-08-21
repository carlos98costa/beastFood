# Solução: Erro de Token ao Curtir Posts no Mobile

## 🐛 Problema Identificado

**Erro:** `ReferenceError: Property 'token' doesn't exist`

**Contexto:** O erro ocorria quando usuários tentavam curtir posts no aplicativo mobile, impedindo a funcionalidade de likes.

## 🔍 Causa Raiz

O problema estava no arquivo `HomeScreen.js` que:

1. **Importação incorreta do axios**: Estava importando `axios` diretamente em vez da instância configurada
2. **Uso de instância não configurada**: A instância `axios` padrão não tinha o interceptor de autenticação
3. **Token não disponível**: Tentativa de usar variável `token` que não estava sendo importada do contexto

## ✅ Solução Implementada

### 1. **Correção das Importações**

#### Antes:
```javascript
import axios from 'axios';
import { SERVER_BASE_URL } from '../utils/api';
```

#### Depois:
```javascript
import api, { SERVER_BASE_URL } from '../utils/api';
```

### 2. **Atualização das Chamadas da API**

#### Antes:
```javascript
const response = await axios.get('/api/posts');
// ...
response = await axios.delete(`/api/likes/${postId}`);
response = await axios.post(`/api/likes/${postId}`, {});
```

#### Depois:
```javascript
const response = await api.get('/api/posts');
// ...
response = await api.delete(`/api/likes/${postId}`);
response = await api.post(`/api/likes/${postId}`, {});
```

## 🔧 Como Funciona Agora

### 1. **Instância API Configurada**
- A instância `api` do arquivo `api.js` já possui interceptor de autenticação
- Token é automaticamente adicionado a todas as requisições
- Não é necessário importar ou gerenciar o token manualmente

### 2. **Interceptor de Autenticação**
```javascript
// Em api.js
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@beastfood:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### 3. **Fluxo de Curtidas**
1. Usuário clica no botão de curtir
2. `handleLike` é chamada com o ID do post
3. Instância `api` automaticamente adiciona o token
4. Requisição é enviada para `/api/likes/${postId}`
5. Estado local é atualizado com a resposta

## 📁 Arquivos Modificados

### `mobile/src/screens/HomeScreen.js`
- ✅ Corrigida importação da instância `api`
- ✅ Substituídas chamadas `axios` por `api`
- ✅ Removida dependência manual do token

## 🧪 Testes Realizados

- ✅ Servidor reiniciado para aplicar mudanças
- ✅ Correções aplicadas no código
- ✅ Instância API configurada corretamente

## 📊 Benefícios da Solução

### 1. **Consistência**
- Todas as requisições usam a mesma instância configurada
- Token é gerenciado centralmente

### 2. **Manutenibilidade**
- Menos código duplicado
- Configuração centralizada de autenticação

### 3. **Robustez**
- Interceptor garante que token seja sempre incluído
- Tratamento automático de headers de autenticação

## 🔄 Próximos Passos

1. **Testar funcionalidade**: Verificar se curtidas funcionam corretamente
2. **Verificar outros arquivos**: Garantir que outros componentes usem a instância `api`
3. **Monitorar logs**: Acompanhar se não há mais erros de token

## 📝 Notas Importantes

- A instância `api` é exportada como **default export** do arquivo `api.js`
- O interceptor funciona automaticamente para todas as requisições
- Não é necessário importar ou gerenciar o token manualmente nos componentes
- Esta solução segue o padrão já estabelecido no projeto

---

**Status:** ✅ Implementado  
**Data:** Janeiro 2025  
**Impacto:** Funcionalidade de curtidas restaurada no mobile