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

# Crie o arquivo .env em server/.env
# Windows (PowerShell)
New-Item -ItemType File -Path .env -Force | Out-Null
notepad .env

# Inicie o servidor
npm start
```

Exemplo de `server/.env`:
```
# Porta do servidor
PORT=5000

# URL do cliente para CORS
CLIENT_URL=http://localhost:3000

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beastfood
DB_USER=postgres
DB_PASSWORD=postgres

# Autenticação
JWT_SECRET=defina_um_segredo_forte
JWT_REFRESH_SECRET=defina_um_refresh_segredo

# Integrações (opcional)
GOOGLE_PLACES_API_KEY=coloque_sua_chave
OPENAI_API_KEY=coloque_sua_chave

# Ambiente
NODE_ENV=development
```

### 3. Configuração do Cliente
```bash
cd client
npm install

# Inicie o aplicativo React
npm start
```

### 4. Mobile (React Native / Expo)
```bash
cd mobile
npm install

# Ajuste a URL da API em mobile/src/utils/api.js (const API_URL)
# Use o IP da sua máquina na rede local, ex: http://192.168.0.10:5000/api

# Inicie o app
npx expo start
```
Build Android (EAS): consulte `mobile/README_BUILD.md` e `mobile/CONFIGURACAO_ANDROID_SDK.md`.

## 🏗️ Estrutura do Projeto

```
beastFood/
├── client/                      # Frontend Web (React)
│   └── src/
│       ├── components/          # UI e modais (ex: RestaurantPhotoManager)
│       ├── pages/               # Páginas (Home, Profile, Restaurants...)
│       ├── contexts/            # AuthContext
│       └── utils/resolveUrl.js  # Resolve base de imagens/URLs
├── server/                      # Backend API (Node.js/Express)
│   ├── config/                  # DB, JWT, performance/CORS
│   ├── middleware/              # auth, upload, admin
│   ├── modules/                 # Módulos de domínio
│   │   ├── ai-restaurant-search # Busca por IA (OpenAI + Google Places)
│   │   ├── google-places        # Dados/queries Google Places (no DB)
│   │   ├── osm-estabelecimentos # Import/sync OSM para restaurants
│   │   ├── restaurants          # Restaurants, photos, features
│   │   ├── notifications        # Notificações
│   │   ├── admin                # Painel admin
│   │   └── restaurant-owner     # Fluxos de dono de restaurante
│   ├── routes/                  # Rotas sociais: posts, comments, likes...
│   └── index.js                 # App Express e montagem das rotas
├── mobile/                      # App Mobile (React Native/Expo)
│   ├── src/                     # Telas, navegação e serviços
│   └── android/                 # Projeto Android nativo/EAS
└── setup_database.sql           # Script SQL inicial
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

## 🔗 Integrações

- **Google Places**: consulta e base local (usa `GOOGLE_PLACES_API_KEY` para busca externa);
- **OpenStreetMap (OSM)**: importação/sincronização de estabelecimentos para `restaurants`;
- **OpenAI**: sugestões de restaurantes na busca por IA (usa `OPENAI_API_KEY`).

## ⚙️ Variáveis de Ambiente (resumo)

- **Servidor**: `PORT`, `CLIENT_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_PLACES_API_KEY`, `OPENAI_API_KEY`, `NODE_ENV`.
- **Cliente (web)**: usa `client/src/utils/resolveUrl.js` para apontar para `http://localhost:5000` em desenvolvimento; em produção, sirva o client no mesmo domínio da API ou ajuste esse util.
- **Mobile**: editar `mobile/src/utils/api.js` e configurar `API_URL` (ex.: `http://SEU_IP:5000/api`).

## 📊 API Endpoints

Grupos principais montados em `server/index.js`:

- `GET /api/health` – Healthcheck
- `/api/auth` – registro, login, refresh
- `/api/users` – perfil, seguidores/seguindo
- `/api/restaurants` – CRUD, favoritos per-user, detalhes
- `/api/restaurant-photos` – CRUD de fotos de restaurante
- `/api/restaurant-features` – recursos/serviços do restaurante
- `/api/posts` – feed e posts com fotos
- `/api/comments` – comentários e respostas
- `/api/likes` – likes em posts/comentários
- `/api/favorites` – favoritos de restaurantes
- `/api/follows` – seguir/deixar de seguir usuários
- `/api/search` – buscas gerais
- `/api/google-places` – consulta base local/externa de Places
- `/api/osm-estabelecimentos` – dados OSM e status
- `/api/ai-restaurant-search` – busca/sugestões com IA
- `/api/admin` e `/api/restaurant-owner` – fluxos administrativos e do dono

## 🧪 Testes

Ainda não há suíte automatizada publicada neste repo. Recomendado: adicionar testes de API (Jest/Supertest) e testes de UI (Cypress/React Testing Library).

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

## 📥 Importação de Dados

- Scripts: `importar_estabelecimentos.js`, `importar_google_places.js` e serviços OSM em `server/modules/osm-estabelecimentos/`.
- Consulte também: `README_INTEGRACAO_OSM_SISTEMA.md`, `README_OSM_ESTABELECIMENTOS.md`, `GOOGLE_PLACES_IMPLEMENTADO.md`.

## 🚀 Deploy (resumo)

- Configure variáveis em `server/.env` e `CLIENT_URL` para CORS;
- Rode o backend com `NODE_ENV=production` (PM2 recomendado) e banco PostgreSQL gerenciado;
- Faça build do web: `cd client && npm run build` e sirva via Nginx/serve no mesmo domínio da API ou ajuste `resolveUrl.js`;
- Exponha o diretório `uploads/` (o servidor já serve em `/uploads`).

## 📚 Documentação complementar

- `README_PAINEL_ADMIN.md`
- `SISTEMA_COMENTARIOS.md` e `SISTEMA_DE_COMENTARIOS_AVANCADO.md`
- `SISTEMA_IA_RESTAURANTES.md`
- `README_INTEGRACAO_OSM_SISTEMA.md` e `README_OSM_ESTABELECIMENTOS.md`
- `PAGINA_RESTAURANTES.md` e `PAGINA_DETALHES_RESTAURANTE.md`

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

Este projeto utiliza licença MIT. Caso o arquivo `LICENSE` não esteja presente, adicione-o antes de distribuir.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**BeastFood** - Transformando a experiência de descoberta gastronômica! 🍕🍜🍔

