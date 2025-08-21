# Modo Convidado - BeastFood Mobile

## Visão Geral

O modo convidado permite que usuários explorem o aplicativo BeastFood sem a necessidade de criar uma conta ou fazer login. Esta funcionalidade foi implementada para permitir que novos usuários conheçam o sistema antes de decidirem se cadastrar.

## Funcionalidades Disponíveis para Convidados

### ✅ O que convidados podem fazer:

- **Explorar restaurantes**: Visualizar lista de restaurantes, detalhes, fotos e informações
- **Ver posts**: Navegar pelo feed de posts de outros usuários
- **Buscar estabelecimentos**: Usar a funcionalidade de busca para encontrar restaurantes
- **Visualizar perfis**: Ver perfis de outros usuários (apenas visualização)
- **Navegar pelo app**: Acessar todas as telas principais através das abas de navegação

### ❌ O que convidados NÃO podem fazer:

- **Criar posts**: Não é possível criar novas postagens
- **Curtir posts**: Não é possível curtir ou descurtir posts
- **Comentar**: Não é possível adicionar comentários
- **Editar posts**: Não é possível editar posts existentes
- **Excluir posts**: Não é possível excluir posts
- **Gerenciar perfil**: Não é possível editar informações pessoais
- **Favoritar restaurantes**: Não é possível marcar restaurantes como favoritos

## Como Ativar o Modo Convidado

1. Na tela de login, abaixo dos botões de login, há um separador visual com "ou"
2. Clique no botão "Continuar como Convidado"
3. O usuário será redirecionado para a tela principal do app
4. As abas de navegação mostrarão indicadores visuais de que está no modo convidado

## Indicadores Visuais do Modo Convidado

### Barra de Navegação
- **Cor de fundo**: Amarelo claro (`#fef3c7`) em vez de branco
- **Borda superior**: Laranja (`#f59e0b`) em vez de cinza
- **Títulos das abas**: Incluem "(Convidado)" para maior clareza

### Tela de Perfil
- **Título**: "Modo Convidado" em vez de "Meu Perfil"
- **Botão de ação**: Ícone de saída (`exit-outline`) em vez de logout
- **Conteúdo**: Informações sobre o que pode ser feito como convidado
- **Botões de ação**: "Fazer Login" e "Criar Conta"

## Como Sair do Modo Convidado

### Opção 1: Através do Perfil
1. Vá para a aba "Convidado" (última aba)
2. Clique no botão de saída (ícone vermelho no canto superior direito)
3. Confirme a ação no alerta
4. Será redirecionado para a tela de login

### Opção 2: Fazer Login
1. Vá para a aba "Convidado"
2. Clique em "Fazer Login"
3. Complete o processo de autenticação
4. O modo convidado será automaticamente desativado

### Opção 3: Criar Conta
1. Vá para a aba "Convidado"
2. Clique em "Criar Conta"
3. Complete o processo de registro
4. O modo convidado será automaticamente desativado

## Implementação Técnica

### Contexto de Autenticação
```javascript
const { isGuestMode, enableGuestMode, disableGuestMode } = useAuth();
```

### Estados do Sistema
- `isAuthenticated`: Usuário logado com token válido
- `isGuestMode`: Usuário em modo convidado
- `!isAuthenticated && !isGuestMode`: Usuário não autenticado (tela de login)

### Navegação
- **Usuários autenticados**: Acesso completo a todas as funcionalidades
- **Usuários convidados**: Acesso limitado (sem criação/edição)
- **Usuários não autenticados**: Apenas telas de login/registro

## Experiência do Usuário

### Fluxo de Onboarding
1. **Primeira execução**: Usuário vê tela de login
2. **Exploração**: Pode escolher "Continuar como Convidado"
3. **Descoberta**: Navega pelo app e conhece as funcionalidades
4. **Decisão**: Decide se quer criar conta ou fazer login
5. **Conversão**: Completa o processo de autenticação

### Benefícios
- **Reduz barreira de entrada**: Usuários podem testar antes de se comprometer
- **Aumenta conversão**: Usuários que conhecem o app têm mais probabilidade de se cadastrar
- **Melhora retenção**: Usuários que se cadastram já conhecem o valor do app
- **Feedback antecipado**: Permite identificar problemas de UX antes do cadastro

## Considerações de Segurança

- **Acesso somente leitura**: Convidados não podem modificar dados
- **Sem persistência**: Dados de convidados não são salvos no servidor
- **Rate limiting**: Aplicado normalmente para evitar abuso
- **Validação**: Todas as operações são validadas no servidor

## Monitoramento e Analytics

### Métricas Recomendadas
- **Taxa de conversão**: Convidados → Usuários registrados
- **Tempo de exploração**: Quanto tempo ficam no modo convidado
- **Funcionalidades mais usadas**: Quais recursos exploram mais
- **Pontos de abandono**: Onde desistem de usar o app

### Eventos de Tracking
- `guest_mode_activated`: Usuário ativa modo convidado
- `guest_mode_exited`: Usuário sai do modo convidado
- `guest_to_login`: Convidado vai para tela de login
- `guest_to_register`: Convidado vai para tela de registro

## Futuras Melhorias

### Funcionalidades Adicionais
- **Favoritos temporários**: Salvar favoritos localmente durante a sessão
- **Histórico de navegação**: Mostrar restaurantes visitados recentemente
- **Recomendações**: Sugerir restaurantes baseado na navegação
- **Tutorial interativo**: Guia para novos usuários

### Personalização
- **Preferências locais**: Salvar configurações de busca localmente
- **Filtros personalizados**: Aplicar filtros baseados na localização
- **Notificações push**: Alertas sobre novos restaurantes na área

## Conclusão

O modo convidado é uma funcionalidade essencial para aplicativos de descoberta de restaurantes, pois permite que usuários explorem o valor do app antes de se comprometerem com um cadastro. A implementação atual oferece uma experiência rica e informativa, mantendo a segurança e incentivando a conversão para usuários registrados.
