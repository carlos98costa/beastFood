# BeastFood Mobile - Build Local (Sem EAS)

## Opções de Build e Teste

### 1. Teste com Expo Go (Mais Rápido)

**Pré-requisitos:**
- Instale o app "Expo Go" no seu celular (Android/iOS)
- Certifique-se que o celular e computador estão na mesma rede WiFi

**Como testar:**
```bash
cd mobile
npm start
```

1. Execute o comando acima
2. Um QR code aparecerá no terminal
3. Abra o Expo Go no seu celular
4. Escaneie o QR code
5. O app será carregado no seu dispositivo

**Vantagens:**
- ✅ Muito rápido para testar
- ✅ Não precisa de builds
- ✅ Hot reload funciona
- ✅ Funciona em Android e iOS

**Limitações:**
- ❌ Algumas funcionalidades nativas podem não funcionar
- ❌ Precisa do Expo Go instalado
- ❌ Não é um APK instalável

### 2. Build Local com Expo Prebuild

**Pré-requisitos para Android:**
- Android Studio instalado
- Android SDK configurado
- Java JDK 11 ou superior

**Passos:**

1. **Gerar projeto nativo:**
   ```bash
   cd mobile
   npx expo prebuild --platform android
   ```

2. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Localizar APK:**
   O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

### 3. Build com React Native CLI (Alternativa)

**Se o Expo prebuild não funcionar:**

1. **Ejetar do Expo:**
   ```bash
   npx expo eject
   ```

2. **Build com React Native:**
   ```bash
   npx react-native run-android --variant=release
   ```

### 4. Usando Expo Development Build

**Para funcionalidades nativas completas:**

1. **Instalar expo-dev-client:**
   ```bash
   npx expo install expo-dev-client
   ```

2. **Gerar development build:**
   ```bash
   npx expo run:android
   ```

## Configuração do Android Studio

### Instalação
1. Baixe Android Studio: https://developer.android.com/studio
2. Instale com as configurações padrão
3. Abra Android Studio
4. Vá em Tools > SDK Manager
5. Instale Android SDK Platform 33 (ou mais recente)
6. Instale Android SDK Build-Tools

### Variáveis de Ambiente
Adicione ao seu PATH:
```
ANDROID_HOME=C:\Users\SeuUsuario\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

## Testando o APK

### No Emulador Android
1. Abra Android Studio
2. Vá em Tools > AVD Manager
3. Crie um dispositivo virtual
4. Inicie o emulador
5. Arraste o APK para o emulador

### No Dispositivo Real
1. Ative "Opções do desenvolvedor" no Android:
   - Vá em Configurações > Sobre o telefone
   - Toque 7 vezes em "Número da versão"
2. Ative "Depuração USB" nas opções do desenvolvedor
3. Conecte o dispositivo via USB
4. Execute: `adb install caminho/para/app-release.apk`

### Instalação Manual
1. Transfira o APK para o dispositivo
2. Abra o arquivo APK no dispositivo
3. Permita "Instalar de fontes desconhecidas"
4. Instale o aplicativo

## Scripts Úteis

Adicione estes scripts ao `package.json`:

```json
{
  "scripts": {
    "prebuild:android": "npx expo prebuild --platform android",
    "build:android:local": "cd android && ./gradlew assembleRelease",
    "build:android:debug": "cd android && ./gradlew assembleDebug",
    "install:android": "cd android && ./gradlew installRelease",
    "clean:android": "cd android && ./gradlew clean"
  }
}
```

## Troubleshooting

### Erro: "Android SDK not found"
- Instale Android Studio
- Configure ANDROID_HOME
- Reinicie o terminal

### Erro: "Java not found"
- Instale JDK 11: https://adoptium.net/
- Configure JAVA_HOME

### Erro: "Gradle build failed"
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### APK muito grande
- Ative ProGuard no `android/app/build.gradle`:
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Comparação de Métodos

| Método | Velocidade | Facilidade | APK Real | Funcionalidades |
|--------|------------|------------|----------|----------------|
| Expo Go | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ |
| Expo Prebuild | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| React Native CLI | ⭐⭐ | ⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| EAS Build | ⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |

## Recomendação

1. **Para desenvolvimento/teste rápido:** Use Expo Go
2. **Para APK de teste:** Use Expo Prebuild
3. **Para produção:** Configure EAS Build (requer conta)

---

**Nota:** O método Expo Go é o mais rápido para testar o aplicativo. Para gerar um APK instalável, use o Expo Prebuild com Android Studio.