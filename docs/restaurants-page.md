# Página de Restaurantes - BeastFood

## Visão Geral

A página de restaurantes é uma funcionalidade completa que permite aos usuários explorar, buscar e filtrar restaurantes cadastrados na plataforma BeastFood.

## Funcionalidades

### 🔍 Busca e Filtros
- **Busca por termo**: Busca restaurantes por nome, descrição ou tipo de cozinha
- **Filtro por tipo de cozinha**: 15 tipos diferentes (Italiana, Japonesa, Chinesa, etc.)
- **Filtro por faixa de preço**: 5 níveis (R$ a R$ R$ R$ R$ R$)
- **Ordenação**: Por nome, avaliação, preço ou data de criação

### 📱 Interface Responsiva
- Design moderno com cards de restaurante
- Layout responsivo para mobile e desktop
- Animações suaves e transições
- Loading states e mensagens de erro

### 🎯 Exibição de Informações
- Nome e descrição do restaurante
- Avaliação média com estrelas
- Tipo de cozinha
- Endereço
- Faixa de preço
- Imagem do restaurante (ou placeholder)

### 📄 Paginação
- 12 restaurantes por página
- Navegação entre páginas
- Contador de páginas

## Estrutura dos Arquivos

```
client/src/pages/
├── Restaurants.js      # Componente principal
└── Restaurants.css     # Estilos da página

server/modules/restaurants/
├── restaurants.controller.js  # Controller atualizado
└── restaurants.service.js     # Serviço com ordenação
```

## Rotas da API

### GET /api/restaurants
- **Parâmetros**:
  - `limit`: Número de restaurantes por página (padrão: 20)
  - `offset`: Número de restaurantes para pular (para paginação)
  - `cuisine_type`: Tipo de cozinha para filtrar
  - `price_range`: Faixa de preço para filtrar (1-5)
  - `sort_by`: Campo para ordenação (name, rating, price_range, created_at)

- **Resposta**:
```json
{
  "restaurants": [...],
  "total": 100
}
```

### GET /api/restaurants/search
- **Parâmetros**:
  - `q`: Termo de busca
  - `limit`: Número máximo de resultados

## Como Usar

1. **Navegação**: Acesse `/restaurants` ou clique em "Restaurantes" na navbar
2. **Busca**: Digite um termo na barra de busca e pressione Enter
3. **Filtros**: Clique em "Filtros" para abrir painel de filtros avançados
4. **Ordenação**: Use o dropdown para ordenar por diferentes critérios
5. **Paginação**: Navegue entre as páginas usando os botões de navegação

## Tecnologias Utilizadas

- **Frontend**: React, CSS3, React Icons
- **Backend**: Node.js, Express, PostgreSQL
- **Estilização**: CSS Grid, Flexbox, Variáveis CSS
- **Estado**: React Hooks (useState, useEffect)

## Melhorias Futuras

- [ ] Cache de resultados de busca
- [ ] Filtros por localização/geolocalização
- [ ] Favoritos e avaliações diretas na lista
- [ ] Comparação de restaurantes
- [ ] Histórico de buscas
- [ ] Recomendações personalizadas

## Testes

Use o arquivo `test_restaurants.html` para testar as APIs:
- Busca de restaurantes
- Filtros e ordenação
- Busca por termo
- Busca por ID

## Notas de Implementação

- A ordenação por avaliação considera restaurantes sem avaliação por último
- A busca por termo não suporta paginação (retorna máximo de 12 resultados)
- Os filtros são aplicados em tempo real
- A interface é totalmente responsiva
- Suporte a imagens de restaurante com fallback para placeholder
