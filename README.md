# Meu App React Native

Aplicativo mobile desenvolvido com React Native e Expo para gerenciamento de eventos, com integração de mapas e sistema de autenticação.

## 📱 Sobre o Projeto

Este é um aplicativo mobile que permite:
- **Gerenciar eventos**: Criar, visualizar e editar eventos
- **Buscar eventos**: Sistema de busca por nome, categoria e localização
- **Visualização em mapa**: Ver eventos em um mapa interativo usando Google Maps
- **Autenticação**: Sistema de login e registro de usuários
- **Categorias e locais**: Organização de eventos por categorias e locais

### Tecnologias Utilizadas

- **React Native** 0.81.5
- **Expo SDK** 54
- **Expo Router** - Navegação baseada em arquivos
- **React Native Maps** - Integração com Google Maps
- **TypeScript** - Tipagem estática
- **Context API** - Gerenciamento de estado (autenticação)
- **EAS Build** - Build e publicação de aplicativos

---

## 🚀 Como Testar Localmente

### Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/

2. **npm** ou **yarn** (vem com Node.js)

3. **Expo CLI** (opcional, mas recomendado)
   ```bash
   npm install -g expo-cli
   ```

4. **EAS CLI** (para builds)
   ```bash
   npm install -g eas-cli
   ```

5. **Android Studio** (para testar no Android)
   - Download: https://developer.android.com/studio
   - Instale o Android SDK e configure um emulador

6. **Expo Go** (opcional, para testar rapidamente)
   - Baixe no Google Play Store ou App Store

### Configuração do Ambiente

1. **Clone o repositório** (se ainda não tiver)
   ```bash
   git clone <url-do-repositorio>
   cd app/frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente** (se necessário)
   
   Crie um arquivo `.env` na raiz do frontend com:
   ```env
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_do_google_maps
   ```
   
   > **Nota**: A chave do Google Maps já está configurada no código, mas é recomendado usar variáveis de ambiente para produção.

4. **Verifique se o backend está rodando**
   
   O app se conecta com a API em: `https://app-react-native-production.up.railway.app`
   
   Se você quiser usar um backend local, configure a URL em `app.config.js` ou `utils/apiConfig.ts`.

### Executando o App

#### Opção 1: Usando Expo Go (Mais Rápido)

1. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```
   
   Ou com cache limpo:
   ```bash
   npm run start:clear
   ```

2. **Escaneie o QR Code**
   - Abra o app **Expo Go** no seu celular
   - Escaneie o QR Code que aparece no terminal
   - O app será carregado no seu dispositivo

#### Opção 2: Emulador Android

1. **Inicie o emulador Android** (via Android Studio)

2. **Execute o app**
   ```bash
   npm run android
   ```
   
   Ou para build limpo:
   ```bash
   npm run android:clean
   ```

#### Opção 3: Build de Desenvolvimento Local

```bash
npm run start:dev
```

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor Expo |
| `npm run start:dev` | Inicia com dev client |
| `npm run start:lan` | Inicia com rede LAN habilitada |
| `npm run start:clear` | Inicia limpando o cache |
| `npm run android` | Executa no Android (emulador/dispositivo) |
| `npm run android:clean` | Executa no Android com build limpo |
| `npm run android:release` | Executa build de release no Android |
| `npm run ios` | Executa no iOS (apenas macOS) |
| `npm run web` | Executa na web |
| `npm run lint` | Executa o linter |

---

## 📦 Como Gerar APK para Outros Usuários

Existem duas formas principais de gerar um APK:

### Método 1: Build Local (Recomendado para Testes)

Este método gera o APK na sua máquina local. É mais rápido e não requer conta EAS, mas precisa de configuração do ambiente Android.

#### Pré-requisitos para Build Local

1. **Android Studio** instalado
2. **Android SDK** configurado
3. **JAVA_HOME** configurado (JDK 11 ou superior)
4. **ANDROID_HOME** configurado

#### Passos

1. **Instale o EAS CLI** (se ainda não tiver)
   ```bash
   npm install -g eas-cli
   ```

2. **Faça login no EAS** (opcional, mas recomendado)
   ```bash
   eas login
   ```

3. **Gere o APK de Preview** (para distribuição interna)
   ```bash
   npm run build:preview-local
   ```
   
   Ou para produção:
   ```bash
   npm run build:prod-local
   ```
   
   Ou para desenvolvimento:
   ```bash
   npm run build:dev-local
   ```

4. **Localização do APK**
   
   Após o build, o APK estará em:
   ```
   frontend/android/app/build/outputs/apk/release/app-release.apk
   ```
   
   Ou no diretório que o EAS indicar no final do processo.

### Método 2: Build na Nuvem (EAS Build)

Este método usa os servidores da Expo para gerar o APK. Não precisa de configuração local do Android, mas requer conta EAS.

#### Pré-requisitos

1. **Conta Expo** (gratuita)
   - Crie em: https://expo.dev/

2. **EAS CLI instalado**
   ```bash
   npm install -g eas-cli
   ```

#### Passos

1. **Faça login no EAS**
   ```bash
   eas login
   ```

2. **Configure o projeto** (primeira vez)
   ```bash
   eas build:configure
   ```

3. **Gere o APK de Preview** (para distribuição interna)
   ```bash
   npm run build:preview
   ```
   
   Ou para produção:
   ```bash
   npm run build:production
   ```

4. **Aguarde o build**
   - O build será processado na nuvem (pode levar 10-20 minutos)
   - Você receberá um link para baixar o APK quando estiver pronto

5. **Baixe o APK**
   - Acesse https://expo.dev/accounts/[seu-usuario]/projects/meuAppReactNative/builds
   - Ou use o link fornecido no terminal
   - Baixe o APK e compartilhe com outros usuários

### Perfis de Build Disponíveis

O projeto possui 3 perfis configurados no `eas.json`:

1. **development** - Para desenvolvimento, com dev client
2. **preview** - Para testes internos (APK)
3. **production** - Para produção (APK)

### Distribuindo o APK

1. **Envie o arquivo APK** para os usuários (via email, Google Drive, etc.)

2. **Instruções para instalar**:
   - O usuário precisa permitir "Fontes desconhecidas" nas configurações do Android
   - Caminho: Configurações → Segurança → Fontes desconhecidas (pode variar por versão)
   - Abra o arquivo APK e instale

3. **Alternativa**: Use serviços como:
   - Firebase App Distribution
   - TestFlight (para iOS)
   - Google Play Internal Testing

---

## 🔧 Configurações Importantes

### Google Maps API Key

O app usa Google Maps para visualização de eventos. A chave está configurada em `app.config.js`, mas para produção é recomendado:

1. Criar uma chave no Google Cloud Console
2. Configurar restrições de segurança
3. Usar variável de ambiente: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### Backend API

O app se conecta com o backend em:
- Produção: `https://app-react-native-production.up.railway.app`

Para mudar, edite `app.config.js` (campo `extra.apiBaseUrl`) ou `utils/apiConfig.ts`.

### Package Name

O package name do Android está configurado como:
- `com.aldenirtakeshi.meuAppReactNative`

Para mudar, edite `app.config.js` (campo `android.package`).

---

## 🐛 Solução de Problemas

### Erro ao iniciar o app

```bash
# Limpe o cache e reinstale dependências
npm run start:clear
# Ou
rm -rf node_modules
npm install
```

### Erro no build Android

```bash
# Limpe o build do Android
cd android
./gradlew clean
cd ..
npm run android:clean
```

### Erro de permissão no Android

Verifique se o `AndroidManifest.xml` tem as permissões necessárias (câmera, localização, etc.).

### Problemas com Google Maps

- Verifique se a chave da API está correta
- Confirme que a API do Google Maps está habilitada no Google Cloud Console
- Verifique as restrições da chave (Android package name)

---

## 📝 Estrutura do Projeto

```
frontend/
├── app/                    # Rotas (Expo Router)
│   ├── (tabs)/            # Navegação por tabs
│   ├── event/             # Páginas de eventos
│   ├── login.tsx          # Tela de login
│   └── register.tsx       # Tela de registro
├── components/            # Componentes reutilizáveis
├── contexts/              # Context API (AuthContext)
├── services/              # Serviços de API
├── utils/                 # Utilitários
├── assets/                # Imagens e recursos
├── android/               # Código nativo Android
├── app.config.js          # Configuração do Expo
├── eas.json               # Configuração do EAS Build
└── package.json           # Dependências
```

---

## 📚 Recursos Adicionais

- [Documentação Expo](https://docs.expo.dev/)
- [Documentação React Native](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

---

## 👨‍💻 Desenvolvido por

Alden

---

## 📄 Licença

MIT

