# BeastFood Mobile - Guia de Build e Teste

## Pré-requisitos

### Para Desenvolvimento
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app no seu dispositivo móvel (Android/iOS)

### Para Builds de Produção
- Conta no Expo (gratuita)
- EAS CLI (`npm install -g @expo/cli`)
- Para iOS: Conta de desenvolvedor Apple (paga)
- Para Android: Conta Google Play Console (taxa única)

## Configuração Inicial

1. **Instalar dependências:**
   ```bash
   cd mobile
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Crie um arquivo `.env` na pasta mobile
   - Adicione a URL da sua API:
     ```
     API_URL=http://seu-servidor:3001
     ```

## Testando o Aplicativo

### 1. Teste em Desenvolvimento (Expo Go)

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Ou para plataforma específica
npm run android  # Abre no emulador Android
npm run ios      # Abre no simulador iOS
```

**Como testar:**
1. Instale o app "Expo Go" no seu celular
2. Execute `npm start` no terminal
3. Escaneie o QR code que aparece no terminal/navegador
4. O app será carregado no seu dispositivo

### 2. Teste com Build de Preview (APK)

```bash
# Gerar APK para teste (não precisa de conta de desenvolvedor)
npm run build:android:preview
```

Este comando gera um arquivo APK que pode ser instalado diretamente em dispositivos Android.

## Gerando Builds para Produção

### Configuração Inicial do EAS

1. **Login no Expo:**
   ```bash
   npx expo login
   ```

2. **Configurar projeto EAS:**
   ```bash
   npx eas build:configure
   ```

### Builds Android

```bash
# APK para testes (instalação direta)
npm run build:android:preview

# AAB para Google Play Store
npm run build:android:production
```

### Builds iOS

```bash
# Build para TestFlight/App Store
npm run build:ios:production
```

**Nota:** Builds iOS requerem conta de desenvolvedor Apple ($99/ano)

### Builds para Ambas Plataformas

```bash
# Preview (APK + iOS para teste)
npm run build:all:preview

# Produção (AAB + iOS para stores)
npm run build:all:production
```

## Estrutura de Builds

### Perfis de Build (eas.json)

- **development**: Para desenvolvimento com Expo Go
- **preview**: Gera APK para teste direto no dispositivo
- **production**: Gera AAB/IPA para publicação nas stores

### Tipos de Build

- **APK**: Arquivo instalável diretamente no Android
- **AAB**: Formato otimizado para Google Play Store
- **IPA**: Arquivo para iOS (TestFlight/App Store)

## Testando Funcionalidades Específicas

### Geolocalização
- Teste em dispositivo real (emuladores podem ter limitações)
- Permita acesso à localização quando solicitado
- Teste em diferentes locais para verificar busca de restaurantes próximos

### Câmera
- Teste captura de fotos
- Teste seleção de imagens da galeria
- Verifique upload de múltiplas imagens

### Navegação
- Teste todas as telas e transições
- Verifique botão voltar em cada tela
- Teste navegação por abas

## Distribuição

### Para Testes (APK)
1. Gere o build preview: `npm run build:android:preview`
2. Baixe o APK do link fornecido pelo EAS
3. Envie o arquivo APK para testadores
4. Instale com "Instalar de fontes desconhecidas" habilitado

### Para Produção
1. **Google Play Store:**
   - Gere AAB: `npm run build:android:production`
   - Faça upload no Google Play Console
   - Configure listagem da loja
   - Publique

2. **Apple App Store:**
   - Gere IPA: `npm run build:ios:production`
   - Upload automático para TestFlight
   - Configure no App Store Connect
   - Submeta para revisão

## Troubleshooting

### Problemas Comuns

1. **Erro de permissões:**
   - Verifique se as permissões estão no app.json
   - Teste em dispositivo real

2. **Erro de API:**
   - Verifique se o servidor está rodando
   - Confirme a URL da API no código

3. **Build falha:**
   - Verifique logs no EAS Dashboard
   - Confirme configurações no app.json

4. **App não carrega:**
   - Limpe cache: `npx expo start --clear`
   - Reinstale dependências: `rm -rf node_modules && npm install`

### Logs e Debug

```bash
# Ver logs detalhados
npx expo start --dev-client

# Limpar cache
npx expo start --clear

# Ver builds no dashboard
npx eas build:list
```

## Próximos Passos

1. **Testes:**
   - Teste em diferentes dispositivos Android
   - Teste em diferentes versões do iOS
   - Teste com conexões lentas

2. **Otimizações:**
   - Implementar splash screen personalizada
   - Adicionar ícones personalizados
   - Otimizar tamanho do bundle

3. **Publicação:**
   - Configurar screenshots para as stores
   - Escrever descrições das lojas
   - Configurar políticas de privacidade

## Comandos Úteis

```bash
# Desenvolvimento
npm start                    # Iniciar servidor dev
npm run android             # Abrir no Android
npm run ios                 # Abrir no iOS

# Builds
npm run build:android:preview    # APK para teste
npm run build:android:production # AAB para Play Store
npm run build:ios:production     # IPA para App Store

# Utilitários
npx expo install            # Instalar dependências compatíveis
npx expo doctor             # Verificar problemas
npx eas build:list          # Listar builds
npx eas build:cancel        # Cancelar build
```

---

**Dica:** Sempre teste primeiro com `build:android:preview` antes de fazer builds de produção, pois é mais rápido e não consome créditos de build pagos.