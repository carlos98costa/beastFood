# 🍽️ Sistema de Restaurantes Pendentes - BeastFood

## 📋 Visão Geral

O sistema de restaurantes pendentes permite que usuários sugiram novos restaurantes através de posts de avaliação. Essas sugestões ficam pendentes até serem aprovadas ou rejeitadas por um administrador.

## 🚀 Funcionalidades Implementadas

### ✅ Para Usuários
- **Sugerir Novo Restaurante**: Ao criar um post, usuários podem sugerir um restaurante que não existe no sistema
- **Campos Detalhados**: Nome, descrição, endereço, tipo de culinária, faixa de preço, telefone e website
- **Status de Aprovação**: Usuários recebem notificações quando suas sugestões são aprovadas ou rejeitadas
- **Histórico**: Visualizar todas as suas sugestões pendentes

### ✅ Para Administradores
- **Painel de Aprovação**: Nova aba no painel administrativo para gerenciar restaurantes pendentes
- **Revisão Detalhada**: Ver todas as informações da sugestão, incluindo a avaliação do usuário
- **Aprovação/Rejeição**: Aprovar para criar o restaurante ou rejeitar com observações
- **Notificações**: Receber notificações automáticas sobre novas sugestões
- **Observações**: Adicionar notas sobre a decisão tomada

## 🗄️ Estrutura do Banco de Dados

### Novas Tabelas
- **`pending_restaurants`**: Armazena sugestões pendentes
- **`notifications`**: Sistema de notificações para usuários e admins

### Modificações nas Tabelas Existentes
- **`users`**: Adicionada coluna `role` para controle de acesso
- **`restaurants`**: Adicionadas colunas de status e aprovação
- **`posts`**: Suporte para posts de sugestão

## 🔧 Instalação e Configuração

### 1. Executar Migração do Banco
```bash
# Windows
run_migration.bat

# Linux/Mac
psql -U postgres -d beastfood -f migrate_pending_restaurants.sql
```

### 2. Verificar Configuração
- Certifique-se de que existe pelo menos um usuário com role `admin`
- Verifique se as novas rotas estão funcionando

### 3. Testar Funcionalidades
- Criar um post sugerindo um novo restaurante
- Verificar se aparece no painel de administração
- Testar aprovação e rejeição

## 📱 Como Usar

### Para Usuários

#### 1. Criar Post com Sugestão
1. Acesse "Nova Avaliação"
2. Clique em "🆕 Sugerir Novo Restaurante"
3. Preencha os dados do restaurante:
   - Nome (obrigatório)
   - Endereço (obrigatório)
   - Descrição
   - Tipo de culinária
   - Faixa de preço
   - Telefone
   - Website
4. Escreva sua avaliação e dê uma nota
5. Adicione fotos (opcional)
6. Envie o post

#### 2. Acompanhar Status
- Suas sugestões aparecem como "Sugestão de Restaurante" no feed
- Aguarde a aprovação de um administrador
- Receba notificações sobre o status

### Para Administradores

#### 1. Acessar Painel de Aprovação
1. Abra o painel administrativo
2. Clique na aba "⏳ Pendentes"
3. Veja todas as sugestões pendentes

#### 2. Revisar Sugestão
1. Clique em "👁️ Ver" na sugestão desejada
2. Analise todas as informações:
   - Dados do restaurante
   - Avaliação do usuário
   - Fotos enviadas
3. Adicione observações se necessário

#### 3. Aprovar ou Rejeitar
- **Aprovar**: Cria o restaurante no sistema e notifica o usuário
- **Rejeitar**: Marca como rejeitado e notifica o usuário com suas observações

## 🔌 API Endpoints

### Restaurantes Pendentes
- `GET /api/pending-restaurants` - Listar pendentes (admin)
- `GET /api/pending-restaurants/:id` - Detalhes de um pendente (admin)
- `PUT /api/pending-restaurants/:id/approve` - Aprovar restaurante (admin)
- `PUT /api/pending-restaurants/:id/reject` - Rejeitar restaurante (admin)
- `GET /api/pending-restaurants/count` - Contar pendentes (admin)
- `GET /api/pending-restaurants/user/me` - Pendentes do usuário logado

### Posts com Sugestões
- `POST /api/posts` - Criar post (suporte para `restaurant_suggestion`)

## 🔔 Sistema de Notificações

### Tipos de Notificação
- **`new_restaurant_suggestion`**: Para admins sobre nova sugestão
- **`restaurant_approved`**: Para usuário sobre aprovação
- **`restaurant_rejected`**: Para usuário sobre rejeição

### Como Funciona
1. Usuário cria sugestão → Admin recebe notificação
2. Admin aprova/rejeita → Usuário recebe notificação
3. Notificações aparecem em tempo real via SSE

## 🎨 Interface do Usuário

### Componentes Atualizados
- **`CreatePostModal`**: Campos adicionais para sugestões
- **`AdminPanel`**: Nova aba para restaurantes pendentes
- **`Navbar`**: Indicador de notificações

### Estilos CSS
- Layout responsivo para campos adicionais
- Modal de detalhes para administradores
- Badges e indicadores visuais

## 🧪 Testes e Validação

### Cenários de Teste
1. **Criação de Sugestão**
   - Preencher todos os campos obrigatórios
   - Verificar se aparece no painel admin
   - Confirmar notificação para admins

2. **Aprovação de Sugestão**
   - Aprovar como admin
   - Verificar se restaurante é criado
   - Confirmar notificação para usuário

3. **Rejeição de Sugestão**
   - Rejeitar com observações
   - Verificar status atualizado
   - Confirmar notificação para usuário

### Validações
- Campos obrigatórios (nome, endereço)
- Formato de URLs e telefones
- Limites de caracteres
- Permissões de acesso

## 🚨 Solução de Problemas

### Problemas Comuns
1. **Migração falha**
   - Verificar conexão com banco
   - Confirmar permissões de usuário
   - Executar script manualmente

2. **Notificações não funcionam**
   - Verificar configuração SSE
   - Confirmar permissões de admin
   - Verificar logs do servidor

3. **Interface não carrega**
   - Verificar console do navegador
   - Confirmar rotas da API
   - Verificar permissões de usuário

### Logs e Debug
- Console do navegador para erros de frontend
- Logs do servidor para erros de backend
- Banco de dados para verificar dados

## 🔮 Próximas Melhorias

### Funcionalidades Futuras
- **Moderação em Lote**: Aprovar/rejeitar múltiplas sugestões
- **Filtros Avançados**: Por tipo de culinária, localização, etc.
- **Histórico de Decisões**: Log completo de aprovações/rejeições
- **Sistema de Pontos**: Recompensar usuários por sugestões aprovadas
- **Integração com APIs**: Verificar dados automaticamente

### Otimizações
- **Cache de Sugestões**: Melhorar performance do painel admin
- **Paginação Avançada**: Para grandes volumes de sugestões
- **Busca e Filtros**: Encontrar sugestões específicas rapidamente

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do sistema
2. Consultar documentação da API
3. Verificar permissões de usuário
4. Testar em ambiente de desenvolvimento

---

**Sistema desenvolvido para BeastFood** 🍽️
**Versão**: 1.0.0
**Data**: Janeiro 2025
