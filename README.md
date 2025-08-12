# 🍽️ BeastFood - Sistema de Avaliação de Restaurantes

Um sistema completo para avaliação e descoberta de restaurantes, desenvolvido com React, Node.js e PostgreSQL.

## ✨ Funcionalidades Principais

### 👤 Sistema de Usuários
- **Registro e Login**: Sistema completo de autenticação com JWT
- **Perfil de Usuário**: Página de perfil estilo Facebook com foto, informações e feed de avaliações
- **Gerenciamento de Conta**: Edição de perfil e alteração de senha

### 🏪 Gestão de Restaurantes
- **Cadastro de Restaurantes**: Adicionar novos estabelecimentos
- **Busca e Filtros**: Encontrar restaurantes por nome, tipo de culinária e localização
- **Detalhes Completos**: Informações, fotos e avaliações de cada restaurante

### 📝 Sistema de Avaliações
- **Posts com Avaliações**: Criar avaliações com texto, fotos e notas (1-5 estrelas)
- **Feed de Avaliações**: Timeline de avaliações recentes
- **Interações**: Sistema de curtidas e comentários
- **Fotos**: Upload e exibição de imagens dos pratos

### 🔍 Busca e Descoberta
- **Busca Inteligente**: Encontrar restaurantes e avaliações
- **Filtros Avançados**: Por tipo de culinária, avaliação e localização
- **Mapas**: Visualização geográfica dos restaurantes

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### 1. Configuração do Banco de Dados
```bash
# Execute o script de configuração
./setup_database.bat

# Ou manualmente:
psql -U postgres -f setup_database.sql
```

### 2. Configuração do Servidor
```bash
cd server
npm install

# Configure as variáveis de ambiente
cp env_example.txt .env
# Edite o arquivo .env com suas configurações

# Inicie o servidor
npm start
```

### 3. Configuração do Cliente
```bash
cd client
npm install

# Inicie o aplicativo React
npm start
```

## 🏗️ Estrutura do Projeto

```
beastFood/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Contextos React (Auth)
│   │   └── ...
├── server/                 # Backend Node.js
│   ├── config/            # Configurações (DB, JWT)
│   ├── middleware/        # Middlewares (Auth)
│   ├── modules/           # Módulos da aplicação
│   ├── routes/            # Rotas da API
│   └── ...
└── setup_database.sql     # Script de configuração do banco
```

## 🎨 Página de Perfil do Usuário

### ✨ Características
- **Design Moderno**: Interface similar ao Facebook com layout responsivo
- **Header do Perfil**: Foto de capa, avatar circular e informações principais
- **Estatísticas**: Contador de avaliações, seguidores e seguindo
- **Feed de Avaliações**: Timeline das avaliações do usuário com paginação
- **Sidebar Informativa**: Detalhes do usuário e informações da conta

### 🔧 Funcionalidades
- **Perfil Pessoal**: Visualizar e editar próprio perfil
- **Perfil de Outros**: Visualizar perfis de outros usuários
- **Feed Personalizado**: Todas as avaliações do usuário em ordem cronológica
- **Responsivo**: Funciona perfeitamente em dispositivos móveis

### 📱 Layout Responsivo
- **Desktop**: Layout em grid com sidebar e feed principal
- **Tablet**: Sidebar move para baixo do feed
- **Mobile**: Layout otimizado para telas pequenas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18**: Framework principal
- **CSS3**: Estilos modernos com Flexbox e Grid
- **Axios**: Cliente HTTP para API
- **React Router**: Navegação entre páginas
- **Context API**: Gerenciamento de estado global

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **PostgreSQL**: Banco de dados relacional
- **JWT**: Autenticação e autorização
- **Multer**: Upload de arquivos

### Banco de Dados
- **PostgreSQL**: SGBD principal
- **Índices**: Otimização para consultas frequentes
- **Relacionamentos**: Estrutura normalizada

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovação de token
- `GET /api/auth/verify` - Verificação de token

### Usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `PUT /api/users/profile` - Atualizar perfil
- `PUT /api/users/password` - Alterar senha

### Restaurantes
- `GET /api/restaurants` - Listar restaurantes
- `POST /api/restaurants` - Criar restaurante
- `GET /api/restaurants/:id` - Detalhes do restaurante

### Posts/Avaliações
- `GET /api/posts` - Feed de avaliações
- `POST /api/posts` - Criar avaliação
- `GET /api/posts/:id` - Detalhes da avaliação

## 🧪 Testes

Execute o arquivo `teste_sistema.html` no navegador para testar todas as funcionalidades da API:

```bash
# Abra no navegador
open teste_sistema.html
```

## 🔒 Segurança

- **JWT Tokens**: Autenticação segura com refresh automático
- **Validação**: Validação de entrada em todas as rotas
- **CORS**: Configuração adequada para desenvolvimento
- **SQL Injection**: Proteção com queries parametrizadas

## 🚧 Desenvolvimento

### Scripts Disponíveis
```bash
# Servidor
npm run dev          # Modo desenvolvimento
npm start           # Modo produção

# Cliente
npm start           # Desenvolvimento
npm run build      # Build de produção
npm test           # Executar testes
```

### Estrutura de Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**BeastFood** - Transformando a experiência de descoberta gastronômica! 🍕🍜🍔

