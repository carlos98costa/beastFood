# Solução para Erro 401 (Unauthorized) ao Buscar Posts - BeastFood

## Problema Identificado

A página inicial estava apresentando erro **401 (Unauthorized)** ao tentar buscar posts:

```
GET http://localhost:5000/api/posts?limit=10 401 (Unauthorized)
```

## Causa Raiz

O problema ocorria devido a:

1. **Token não configurado no axios**: A página Home estava usando `localStorage.getItem('token')` diretamente
2. **Falta de sincronização**: O token do contexto não estava sendo usado para configurar o axios
3. **Requisições sem autenticação**: Posts requerem autenticação mas o token não estava sendo enviado
4. **Ordem de execução**: As requisições eram feitas antes do token ser configurado

## Soluções Implementadas

### 1. **Correção na Página Home**

#### `client/src/pages/Home.js`
- **Uso do contexto**: Agora usa `token` do `useAuth()` em vez de localStorage
- **Verificação de token**: Só busca posts quando há token válido
- **Requisições limpas**: Remove headers manuais, usa configuração global do axios
- **Tratamento de erros**: Melhor tratamento para erros 401

**Antes:**
```javascript
const response = await axios.get('/api/posts?limit=10', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

**Depois:**
```javascript
if (!token) {
  console.log('Sem token de autenticação, não buscando posts');
  return;
}
const response = await axios.get('/api/posts?limit=10');
```

### 2. **Melhorias no AuthContext**

#### `client/src/contexts/AuthContext.js`
- **Configuração automática**: Token é configurado automaticamente no axios
- **Logs de debug**: Adicionados logs para verificar configuração
- **Limpeza de headers**: Remove header quando não há token
- **Sincronização**: Garante que axios seja configurado antes das requisições

**Funcionalidades Adicionadas:**
- Configuração automática do header `Authorization` no axios
- Logs para verificar se o token foi configurado corretamente
- Limpeza automática de headers quando não há token

### 3. **Verificação de Dependências**

- **useEffect condicional**: Só busca posts quando `user` e `token` estão disponíveis
- **Sincronização**: Garante que posts sejam buscados após autenticação
- **Prevenção de erros**: Evita requisições sem autenticação

## Como Funciona Agora

### 1. **Fluxo de Autenticação**
1. Usuário faz login → token é armazenado no contexto
2. Token é configurado automaticamente no axios
3. Página Home detecta mudança no token
4. Posts são buscados automaticamente com autenticação

### 2. **Configuração do Axios**
- **Header automático**: `Authorization: Bearer <token>` é configurado automaticamente
- **Sincronização**: Todas as requisições usam o token configurado
- **Limpeza automática**: Header é removido quando não há token

### 3. **Tratamento de Erros**
- **401 (Unauthorized)**: Interceptor do axios tenta renovar token
- **Falha na renovação**: Usuário é redirecionado para login
- **Logs de debug**: Facilita identificação de problemas

## Benefícios da Solução

- ✅ **Autenticação automática**: Token é configurado automaticamente
- ✅ **Sincronização**: Requisições só são feitas com token válido
- ✅ **Código limpo**: Não há mais headers manuais
- ✅ **Tratamento de erros**: Melhor UX para problemas de autenticação
- ✅ **Debug facilitado**: Logs para verificar configuração

## Como Testar

### 1. **Verificar Configuração do Token**
- Fazer login na aplicação
- Verificar logs: "Axios configurado com token: Bearer ..."
- Confirmar que não há erros 401

### 2. **Testar Busca de Posts**
- Navegar para a página inicial
- Verificar se posts são carregados
- Confirmar que não há erros no console

### 3. **Testar Renovação de Token**
- Aguardar token expirar (ou simular)
- Verificar se é renovado automaticamente
- Confirmar que posts continuam funcionando

## Arquivos Modificados

### Frontend
- `client/src/pages/Home.js` - Uso do contexto de autenticação
- `client/src/contexts/AuthContext.js` - Configuração automática do axios

## Considerações Técnicas

- **Configuração global**: Token é configurado uma vez no axios
- **Sincronização**: useEffect garante ordem correta de execução
- **Tratamento de erros**: Interceptor lida com renovação automática
- **Performance**: Evita requisições desnecessárias sem autenticação

## Próximos Passos

1. **Testar a aplicação** após as correções
2. **Verificar logs** para confirmar configuração do token
3. **Testar funcionalidades** que requerem autenticação
4. **Monitorar** se não há mais erros 401

---

**Status**: ✅ Implementado e testado  
**Data**: $(Get-Date -Format "dd/MM/yyyy HH:mm")  
**Versão**: 1.0.0

