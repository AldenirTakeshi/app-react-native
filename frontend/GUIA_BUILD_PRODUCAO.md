# 🚀 Guia Completo de Build de Produção

## 📋 Índice

1. [⚠️ IMPORTANTE: Problema de Caminho no Windows](#problema-caminho-windows)
2. [Preparação para Produção](#preparação)
3. [Opção 1: EAS Build (Nuvem) - RECOMENDADO](#eas-build-nuvem)
4. [Opção 2: EAS Build Local](#eas-build-local)
5. [Opção 3: Build Manual](#build-manual)
6. [Distribuição do APK/AAB](#distribuição)
7. [Publicar na Google Play Store](#google-play-store)

---

## ⚠️ IMPORTANTE: Problema de Caminho no Windows {#problema-caminho-windows}

### 🔴 Erro Comum: "Filename longer than 260 characters"

Se você ver este erro ao fazer build:

```
ninja: error: Stat(...): Filename longer than 260 characters
```

**Causa:** Windows tem um limite de 260 caracteres para caminhos de arquivos. React Native + node_modules gera caminhos muito longos.

---

### ✅ Solução 1: Habilitar Caminhos Longos (RECOMENDADO)

Esta é a solução permanente e resolve o problema de uma vez por todas.

#### Passo 1: Abrir PowerShell como Administrador

1. Pressione `Win + X`
2. Selecione **"Windows PowerShell (Administrador)"** ou **"Terminal (Administrador)"**

#### Passo 2: Executar o comando

```powershell
New-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled' -Value 1 -PropertyType DWORD -Force
```

#### Passo 3: Reiniciar o computador

Após reiniciar, o problema estará resolvido permanentemente.

#### Passo 4: Verificar se funcionou

Após reiniciar, volte ao projeto e teste:

```bash
cd frontend
npm run android:release
```

---

### ✅ Solução 2: Mover Projeto para Caminho Curto (ALTERNATIVA)

Se você não tem acesso de administrador, mova o projeto para um caminho mais curto.

#### Opção A: Usar C:\projects\app

```bash
# 1. Feche todos os editores e terminais

# 2. Mova a pasta do projeto:
#    Origem: C:\Users\alden\Documentos\meuAppReactNative
#    Destino: C:\projects\app

# 3. Abra o novo caminho no editor

# 4. Reinstale dependências
cd C:\projects\app\frontend
npm install

# 5. Tente o build novamente
npm run android:release
```

#### Opção B: Usar qualquer caminho curto

Quanto mais curto o caminho, melhor:

```
✅ C:\app\
✅ C:\projects\app\
✅ C:\dev\meuapp\
❌ C:\Users\alden\Documentos\meuAppReactNative\  (muito longo!)
```

---

### 🔍 Como saber se o problema foi resolvido?

Execute o build. Se não aparecer o erro de 260 caracteres, está resolvido! ✅

---

## 🔧 Preparação para Produção {#preparação}

### 1. Atualizar versão do app

Edite `frontend/app.config.js` ou `frontend/app.json`:

```javascript
{
  "expo": {
    "version": "1.0.1",  // ← Incrementar a cada release
    "android": {
      "versionCode": 2    // ← SEMPRE incrementar (número inteiro)
    }
  }
}
```

**Importante:**

- `version`: Versão legível (1.0.0, 1.0.1, 1.1.0...)
- `versionCode`: Número inteiro que SEMPRE cresce (1, 2, 3, 4...)

### 2. Configurar variáveis de ambiente

Crie/edite `frontend/.env.production`:

```bash
EXPO_PUBLIC_API_BASE_URL=https://app-react-native-production.up.railway.app
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=SUA_API_KEY_DE_PRODUCAO
```

### 3. Verificar configurações

```bash
cd frontend

# Verificar se há problemas
npx expo-doctor

# Atualizar dependências se necessário
npx expo install --fix
```

---

## ☁️ Opção 1: EAS Build (Nuvem) - RECOMENDADO {#eas-build-nuvem}

### Vantagens:

- ✅ Mais fácil e rápido
- ✅ Não precisa de Android Studio
- ✅ Build otimizado automaticamente
- ✅ Gera AAB (Android App Bundle) para Play Store
- ✅ Suporte técnico da Expo
- ✅ CI/CD integrado

### Desvantagens:

- ❌ Usa créditos (gratuito tem limite)
- ❌ Precisa de internet
- ❌ Builds demoram mais (fila)

### 🔑 1. Fazer login no EAS

```bash
cd frontend

# Login (criar conta se não tiver)
npx eas login

# Ou criar conta nova
npx eas register
```

### 📦 2. Configurar o projeto

```bash
# Configurar EAS (só precisa fazer 1x)
npx eas build:configure
```

Isso cria/atualiza o `eas.json`.

### 🏗️ 3. Fazer o build de produção

```bash
# APK (para distribuição direta)
npx eas build --platform android --profile production

# AAB (para Google Play Store) - RECOMENDADO
npx eas build --platform android --profile production --auto-submit
```

**O que acontece:**

1. ⏱️ Envia código para os servidores da Expo
2. 🏗️ Compila na nuvem (15-30 minutos)
3. ✅ Disponibiliza link para download do APK/AAB
4. 📱 Instale ou publique na Play Store

### 📥 4. Baixar o APK/AAB

```bash
# Listar builds
npx eas build:list

# Baixar o último build
npx eas build:download
```

Ou acesse: https://expo.dev/accounts/[seu-usuario]/projects/[seu-projeto]/builds

---

## 💻 Opção 2: EAS Build Local {#eas-build-local}

### Vantagens:

- ✅ Não usa créditos
- ✅ Mais rápido que build na nuvem
- ✅ Controle total do processo

### Desvantagens:

- ❌ Precisa de Android Studio instalado
- ❌ Requer mais configuração
- ❌ Precisa de máquina potente

### 🔧 1. Pré-requisitos

- ✅ Android Studio instalado
- ✅ Android SDK configurado
- ✅ Java JDK 11+ instalado

### 🏗️ 2. Fazer o build local

```bash
cd frontend

# APK de produção
npm run build:prod-local

# Ou comando completo:
npx eas build --platform android --profile production --local
```

**Tempo:** 10-20 minutos

### 📁 3. Encontrar o APK

```
frontend/build-[timestamp]/app-release.apk
```

---

## 🔨 Opção 3: Build Manual (Mais Rápido) {#build-manual}

### Vantagens:

- ✅ MUITO rápido (2-5 minutos)
- ✅ Não usa créditos
- ✅ Não precisa de EAS

### Desvantagens:

- ❌ Gera APK sem assinatura de release
- ❌ Não otimizado como EAS
- ❌ Não pode publicar na Play Store sem assinar

### 🏗️ 1. Build de release

```bash
cd frontend

# Gerar APK de release
npm run android:release

# Ou comando completo:
npx expo run:android --variant release
```

### 📁 2. Encontrar o APK

```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

### ⚠️ 3. Assinar manualmente (se for publicar na Play Store)

```bash
# Gerar keystore (só uma vez)
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Configurar gradle
# Editar android/gradle.properties:
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=sua-senha
MYAPP_RELEASE_KEY_PASSWORD=sua-senha
```

---

## 📊 Comparação das Opções

| Critério   | EAS Nuvem      | EAS Local      | Manual             |
| ---------- | -------------- | -------------- | ------------------ |
| Velocidade | 🟡 15-30min    | 🟢 10-20min    | 🟢 2-5min          |
| Facilidade | 🟢 Muito fácil | 🟡 Médio       | 🟡 Médio           |
| Otimização | 🟢 Máxima      | 🟢 Máxima      | 🟡 Boa             |
| Play Store | 🟢 Sim         | 🟢 Sim         | 🟡 Precisa assinar |
| Custo      | 🟡 Créditos    | 🟢 Grátis      | 🟢 Grátis          |
| Requisitos | 🟢 Só internet | 🟡 Android SDK | 🟡 Android SDK     |

---

## 📱 Distribuição do APK/AAB {#distribuição}

### 1. Distribuição Direta (APK)

**Para testers/clientes:**

```bash
# Compartilhar APK via:
- Google Drive
- Dropbox
- Email
- WhatsApp
- Telegram
```

**Instalar:**

1. Ativar "Fontes desconhecidas" no Android
2. Baixar o APK
3. Clicar para instalar

### 2. Firebase App Distribution

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Distribuir
firebase appdistribution:distribute app-release.apk \
  --app 1:123456789:android:abcd \
  --groups testers
```

### 3. TestFlight (para iOS)

Para iOS, use o EAS Build + TestFlight da Apple.

---

## 🏪 Publicar na Google Play Store {#google-play-store}

### 📋 Pré-requisitos

1. ✅ Conta Google Play Console ($25 único)
2. ✅ AAB (Android App Bundle) assinado
3. ✅ Ícones e screenshots
4. ✅ Descrição do app
5. ✅ Política de privacidade

### 🚀 Passo a Passo

#### 1. Criar app na Play Console

1. Acesse: https://play.google.com/console
2. "Criar app"
3. Preencha informações básicas

#### 2. Preparar assets

**Ícone:**

- 512x512 PNG
- Sem transparência

**Screenshots:**

- Mínimo 2 por tipo de dispositivo
- 16:9 ou 9:16

**Descrição:**

- Título: até 50 caracteres
- Descrição curta: até 80 caracteres
- Descrição completa: até 4000 caracteres

#### 3. Upload do AAB

```bash
# Gerar AAB com EAS
npx eas build --platform android --profile production

# Fazer upload na Play Console
# Console → App → Produção → Criar nova versão
```

#### 4. Preencher formulários

- ✅ Classificação de conteúdo
- ✅ Público-alvo
- ✅ Política de privacidade
- ✅ Informações de contato

#### 5. Enviar para revisão

1. Revisar tudo
2. "Enviar para revisão"
3. ⏱️ Aguardar aprovação (1-7 dias)

### 🔄 Atualizações Futuras

```bash
# 1. Incrementar versionCode no app.config.js
"versionCode": 3  // Era 2, agora 3

# 2. Fazer novo build
npx eas build --platform android --profile production

# 3. Upload na Play Console
# Console → Produção → Criar nova versão
```

---

## 🎯 Recomendação Final

### Para Testes/Beta:

```bash
# Rápido e fácil
npm run android:release
```

### Para Produção/Play Store:

```bash
# Melhor qualidade
npx eas build --platform android --profile production
```

### Para Desenvolvimento Contínuo:

```bash
# Setup CI/CD com GitHub Actions + EAS
```

---

## 📝 Checklist de Produção

Antes de fazer o build final:

- [ ] Versão incrementada no app.config.js
- [ ] versionCode incrementado
- [ ] Testado em dispositivos reais
- [ ] Google Maps API Key de produção
- [ ] Backend apontando para produção
- [ ] Ícones e splash screen finalizados
- [ ] Sem console.logs desnecessários
- [ ] Tratamento de erros implementado
- [ ] Política de privacidade criada
- [ ] Termos de uso criados (se necessário)

---

## 🆘 Problemas Comuns

### Build falha com "Keystore not found"

**Solução:** EAS gera keystore automaticamente na primeira vez:

```bash
npx eas build --platform android --profile production
# Escolha: "Generate new keystore"
```

### "App not signed correctly"

**Solução:** Use EAS Build ou assine manualmente.

### "Version code must be incremented"

**Solução:** Incremente o `versionCode` no app.config.js.

### Build muito lento

**Solução:** Use EAS Build local ou build manual.

---

## 📞 Recursos Úteis

- **EAS Docs:** https://docs.expo.dev/build/introduction/
- **Play Console:** https://play.google.com/console
- **Expo Forums:** https://forums.expo.dev/
- **App Signing:** https://docs.expo.dev/app-signing/app-credentials/

---

## 🎯 Instruções de Build - DEPOIS DE RESOLVER O CAMINHO

### ⚠️ ANTES DE COMEÇAR:

1. ✅ Certifique-se de ter resolvido o problema de caminho do Windows (veja a primeira seção)
2. ✅ Reiniciou o computador (se habilitou caminhos longos)
3. ✅ OU moveu o projeto para `C:\projects\app` (ou outro caminho curto)

---

### 📱 Build Rápido para Testes (2-5 minutos)

Este é o mais rápido para testar em dispositivo real:

```bash
# Navegue até o frontend
cd frontend

# Limpe builds anteriores (opcional)
cd android
.\gradlew.bat clean
cd ..

# Gere o APK de release
npm run android:release
```

**APK gerado em:**

```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

**Para instalar no celular via cabo USB:**

```bash
# Verifique se o celular está conectado
adb devices

# Instale
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

### 🏗️ Build EAS Cloud para Produção (15-30 minutos)

Este é o recomendado para publicar na Google Play Store:

```bash
cd frontend

# 1. Login no EAS (se ainda não fez)
npx eas login

# 2. Build de produção
npx eas build --platform android --profile production

# 3. Aguardar...
# O build será feito na nuvem

# 4. Baixar quando terminar
npx eas build:download
```

**Para acompanhar:**

- Acesse: https://expo.dev

---

### 💻 Build EAS Local (10-20 minutos)

Alternativa que não usa créditos e é mais rápido que a nuvem:

```bash
cd frontend

# Build local com EAS
npx eas build --platform android --profile production --local
```

**APK/AAB gerado em:**

```
frontend/build-[timestamp]/app-release.aab
```

---

### 🔄 Se o Build Falhar Novamente

#### Problema: Erro de caminho longo ainda aparece

**Solução:** Você provavelmente não reiniciou o computador após habilitar caminhos longos.

1. Reinicie o computador
2. Tente novamente

**OU** mova o projeto para `C:\projects\app`:

```bash
# 1. Feche tudo
# 2. Mova a pasta manualmente
# 3. Abra o novo caminho no editor
# 4. Reinstale dependências:

cd C:\projects\app\frontend
npm install

# 5. Tente o build novamente
npm run android:release
```

---

#### Problema: Erro de assinatura (signing)

**Solução:** Use o EAS Build que gera keystore automaticamente:

```bash
npx eas build --platform android --profile production
# Escolha: "Generate new keystore"
```

---

#### Problema: NODE_ENV não definido

**Solução:** Defina a variável antes do build:

```bash
# Windows PowerShell
$env:NODE_ENV="production"
npm run android:release

# Ou edite android/gradle.properties e adicione:
org.gradle.project.NODE_ENV=production
```

---

### 📦 Depois do Build: Distribuir o APK

#### Opção 1: Instalar via USB

```bash
adb install caminho/do/app-release.apk
```

#### Opção 2: Compartilhar o APK

1. Envie o arquivo APK via:

   - Google Drive
   - WhatsApp
   - Email
   - Dropbox

2. No celular Android:
   - Ative "Fontes desconhecidas" nas configurações
   - Baixe e instale o APK

#### Opção 3: Publicar na Google Play Store

1. Faça build com EAS (gera AAB assinado)
2. Crie conta na Play Console ($25 único)
3. Faça upload do AAB
4. Preencha informações do app
5. Envie para revisão

---

## 🎉 Resumo Executivo

### Para Testes/Beta (RÁPIDO):

```bash
cd frontend
npm run android:release
# APK em: android/app/build/outputs/apk/release/app-release.apk
```

### Para Produção/Play Store (QUALIDADE):

```bash
cd frontend

# 1. Atualizar versão em app.config.js
# version: "1.0.1"
# versionCode: 2

# 2. Build de produção
npx eas build --platform android --profile production

# 3. Aguardar e baixar
# Acesse: https://expo.dev

# 4. Publicar na Play Store!
```

**Pronto para produção!** 🚀
