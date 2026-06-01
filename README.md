# BeastFood

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-Mobile-000020?logo=expo&logoColor=white)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)

**BeastFood** é uma rede social gastronômica full-stack criada como projeto de portfólio profissional. A aplicação permite descobrir restaurantes, publicar avaliações com fotos, interagir com outros usuários, favoritar estabelecimentos e explorar sugestões com apoio de integrações externas como Google Places, OpenStreetMap e IA.

O objetivo do projeto é demonstrar domínio em desenvolvimento web moderno, arquitetura backend modular, autenticação JWT, integração com APIs externas, banco relacional, upload de imagens, deploy em cloud e construção de uma experiência de produto completa.

---

## Demonstração

- **Frontend:** https://beast-food-nine.vercel.app
- **Backend/API:** https://beastfood.onrender.com
- **Healthcheck:** https://beastfood.onrender.com/api/health

> Observação: por estar hospedado em serviços gratuitos/cloud, o backend pode levar alguns segundos para responder na primeira requisição após um período de inatividade.

---

## Principais recursos

### Experiência social

- Cadastro e login de usuários com autenticação JWT.
- Perfil público e privado com avatar, capa, bio e estatísticas.
- Sistema de seguidores e lista de seguindo/seguidores.
- Feed com avaliações gastronômicas em formato de posts.
- Curtidas, comentários e páginas individuais de publicação.

### Restaurantes e descoberta

- Listagem e busca de restaurantes.
- Página de detalhes com galeria, informações, serviços, horários e links úteis.
- Favoritos por usuário.
- Cadastro e edição de restaurantes.
- Upload e gerenciamento de fotos.
- Integração com base local, Google Places e OpenStreetMap.

### Administração e fluxo profissional

- Painel administrativo para gerenciamento do ecossistema.
- Fluxo para dono de restaurante.
- Solicitações de restaurantes pendentes.
- Notificações internas.
- Configuração de CORS para frontend em produção e previews da Vercel.

### Inteligência e dados externos

- Busca/sugestões com IA.
- Consulta ao Google Places.
- Importação/sincronização de estabelecimentos via OpenStreetMap.
- Estrutura preparada para enriquecer dados de restaurantes e melhorar a descoberta gastronômica.

---

## Stack técnica

### Frontend web

- **React 18**
- **React Router DOM** para rotas SPA
- **Context API** para autenticação global
- **Axios** para comunicação com API
- **React Hot Toast** para feedbacks
- **React Icons** para iconografia
- **Leaflet / React Leaflet** para mapas
- **GSAP** para animações pontuais
- **CSS responsivo** com foco em experiência mobile e desktop

### Backend

- **Node.js**
- **Express**
- **PostgreSQL** com queries parametrizadas
- **JWT** e refresh token
- **bcryptjs** para hash de senha
- **Multer** para uploads
- **Helmet**, **CORS**, **Rate Limit** e **Compression**
- Arquitetura modular por domínio

### Mobile

- **React Native**
- **Expo**
- **React Navigation**
- **AsyncStorage**
- **Expo Location** e **Image Picker**

### Deploy

- **Vercel** para o frontend React
- **Render** para o backend Express
- **PostgreSQL gerenciado/local**, conforme ambiente

---

## Arquitetura do projeto

```txt
beastFood/
├── client/                         # Frontend web em React
│   └── src/
│       ├── components/             # Componentes reutilizáveis e modais
│       ├── contexts/               # AuthContext e estado global
│       ├── pages/                  # Home, Login, Profile, Restaurants, etc.
│       └── utils/                  # Configuração de API e resolução de URLs
│
├── server/                         # Backend Node.js/Express
│   ├── config/                     # Banco, JWT, performance e CORS
│   ├── middleware/                 # Auth, upload e permissões
│   ├── modules/                    # Módulos de domínio
│   │   ├── admin/                  # Administração
│   │   ├── ai-restaurant-search/   # Busca com IA
│   │   ├── auth/                   # Autenticação
│   │   ├── google-places/          # Integração Google Places
│   │   ├── notifications/          # Notificações
│   │   ├── osm-estabelecimentos/   # Integração OpenStreetMap
│   │   ├── pending-restaurants/    # Aprovação de restaurantes
│   │   ├── restaurant-owner/       # Fluxo de dono de restaurante
│   │   ├── restaurants/            # Fotos, recursos e serviços
│   │   └── users/                  # Usuários e perfis
│   ├── routes/                     # Rotas sociais: posts, comentários, likes...
│   └── index.js                    # Bootstrap do servidor Express
│
├── mobile/                         # Aplicativo mobile React Native/Expo
├── setup_database.sql              # Script inicial do banco
├── vercel.json                     # Configuração do deploy web
└── env_example.txt                 # Exemplo de variáveis de ambiente
```

---

## Rotas principais da API

| Grupo | Descrição |
| --- | --- |
| `GET /api/health` | Healthcheck da API |
| `/api/auth` | Registro, login e autenticação |
| `/api/users` | Perfis, dados de usuário e relações sociais |
| `/api/restaurants` | Restaurantes, detalhes e favoritos |
| `/api/restaurant-photos` | Galeria e fotos de restaurantes |
| `/api/restaurant-features` | Serviços, recursos e diferenciais dos restaurantes |
| `/api/posts` | Feed e avaliações publicadas |
| `/api/comments` | Comentários e respostas |
| `/api/likes` | Curtidas em posts/comentários |
| `/api/favorites` | Restaurantes favoritos |
| `/api/follows` | Seguir/deixar de seguir usuários |
| `/api/search` | Busca geral |
| `/api/google-places` | Consulta e persistência de dados do Google Places |
| `/api/osm-estabelecimentos` | Dados do OpenStreetMap |
| `/api/ai-restaurant-search` | Sugestões e busca com IA |
| `/api/admin` | Recursos administrativos |
| `/api/restaurant-owner` | Recursos para donos de restaurantes |

---

## Destaques técnicos para portfólio

- **Aplicação full-stack realista:** frontend, backend, banco de dados, autenticação, uploads e deploy.
- **Arquitetura backend modular:** separação por domínios para facilitar manutenção e evolução.
- **Autenticação completa:** JWT, refresh token, proteção de rotas e contexto global no React.
- **Integrações externas:** Google Places, OpenStreetMap e IA para enriquecer a descoberta de restaurantes.
- **Experiência social:** feed, perfis, seguidores, comentários, curtidas e favoritos.
- **Pronto para produção:** CORS configurável, rate limit, helmet, compressão e variáveis de ambiente.
- **Responsividade:** interface adaptada para desktop e mobile.
- **Deploy separado:** frontend na Vercel e API no Render, simulando arquitetura comum em produtos SaaS modernos.

---

## Como rodar localmente

### Pré-requisitos

- Node.js 16+
- npm
- PostgreSQL 12+

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd beastFood
```

### 2. Configure as variáveis de ambiente

Use `env_example.txt` como referência e crie o arquivo `.env` adequado para o backend.

Exemplo:

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:3000
CLIENT_URLS=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=beastfood
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=defina_um_segredo_forte
JWT_REFRESH_SECRET=defina_um_refresh_segredo

GOOGLE_PLACES_API_KEY=sua_chave_google_places
OPENAI_API_KEY=sua_chave_openai
```

### 3. Configure o banco de dados

```bash
psql -U postgres -f setup_database.sql
```

Ou use o script auxiliar em ambientes Windows:

```bash
./setup_database.bat
```

### 4. Instale as dependências

```bash
npm install
cd client
npm install
```

### 5. Rode backend e frontend

Em um terminal, na raiz:

```bash
npm start
```

Em outro terminal:

```bash
cd client
npm start
```

A aplicação web ficará disponível em:

```txt
http://localhost:3000
```

A API ficará disponível em:

```txt
http://localhost:5000
```

---

## Mobile

O projeto também possui uma versão mobile em React Native/Expo.

```bash
cd mobile
npm install
npx expo start
```

Antes de rodar no dispositivo físico, ajuste a URL da API em `mobile/src/utils/api.js` para apontar para o IP da máquina na rede local, por exemplo:

```txt
http://192.168.0.10:5000/api
```

Documentos úteis:

- `mobile/README_BUILD.md`
- `mobile/CONFIGURACAO_ANDROID_SDK.md`

---

## Variáveis de ambiente importantes

| Variável | Uso |
| --- | --- |
| `PORT` | Porta do backend |
| `NODE_ENV` | Ambiente da aplicação |
| `CLIENT_URL` | Origem principal liberada no CORS |
| `CLIENT_URLS` | Lista de origens adicionais separadas por vírgula |
| `DB_HOST` | Host do PostgreSQL |
| `DB_PORT` | Porta do PostgreSQL |
| `DB_NAME` | Nome do banco |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Segredo do access token |
| `JWT_REFRESH_SECRET` | Segredo do refresh token |
| `GOOGLE_PLACES_API_KEY` | Integração com Google Places |
| `OPENAI_API_KEY` | Recursos de busca/sugestões com IA |
| `REACT_APP_API_URL` | URL pública da API usada pelo frontend em produção |

---

## Deploy

### Frontend — Vercel

Configuração recomendada para o app React em `client/`:

```txt
Root Directory: client
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

Variável de produção recomendada:

```env
REACT_APP_API_URL=https://beastfood.onrender.com
```

### Backend — Render

Configuração recomendada:

```txt
Build Command: npm install
Start Command: npm start
```

Variáveis importantes no Render:

```env
NODE_ENV=production
CLIENT_URL=https://beast-food-nine.vercel.app
CLIENT_URLS=https://beast-food-nine.vercel.app
JWT_SECRET=...
JWT_REFRESH_SECRET=...
DB_HOST=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
```

---

## Segurança e boas práticas aplicadas

- Senhas armazenadas com hash via `bcryptjs`.
- Autenticação baseada em JWT.
- Refresh token para sessão persistente.
- Proteção de rotas sensíveis por middleware.
- Queries parametrizadas no PostgreSQL.
- CORS configurável por ambiente.
- Rate limiting em produção.
- Headers de segurança com Helmet.
- Uploads tratados por middleware dedicado.

---

## Melhorias futuras

- Cobertura automatizada com testes de API e frontend.
- Pipeline CI/CD.
- Observabilidade com logs estruturados.
- Upload em storage externo, como Cloudinary ou S3.
- Cache para consultas frequentes de restaurantes.
- Dashboard administrativo mais completo.
- Melhorias de acessibilidade e performance.

---

## Autor

Desenvolvido por **Carlos Costa** como projeto de portfólio profissional, com foco em demonstrar habilidades práticas em desenvolvimento full-stack, integração com serviços externos, deploy cloud e construção de interfaces web modernas.

---

## Licença

Este projeto está sob licença MIT.

---

**BeastFood** — uma experiência social para descobrir, avaliar e compartilhar restaurantes.
