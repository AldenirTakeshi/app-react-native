# Meu App React Native - Finanças Pessoais

App de finanças pessoais com autenticação JWT e persistência de dados.

## 🚀 Tecnologias

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticação
- bcrypt para hash de senhas

### Frontend

- React Native + Expo
- Expo Router para navegação
- Expo Secure Store para armazenamento seguro
- TypeScript

## 📋 Pré-requisitos

- Node.js (versão 18+)
- MongoDB (local ou Atlas)
- Expo CLI
- Android Studio (para build APK)

## 🛠️ Instalação e Configuração

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. Configuração do MongoDB

Certifique-se de que o MongoDB está rodando localmente ou configure a string de conexão no arquivo `backend/src/config/database.ts`.

### 4. Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/meuappreactnative
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789
NODE_ENV=development
```

## 🏃‍♂️ Executando o Projeto

### Backend

```bash
cd backend

# Popular usuários de teste
npm run seed

# Executar em modo desenvolvimento
npm run dev
```

O backend estará disponível em: `http://localhost:3001`

### Frontend

```bash
cd frontend

# Executar o app
npm start
```

## 📱 Credenciais de Teste

Após executar o seed, você pode usar:

- **Email:** joao@teste.com | **Senha:** 123456
- **Email:** maria@teste.com | **Senha:** 123456
- **Email:** pedro@teste.com | **Senha:** 123456

## 🔧 Endpoints da API

### Autenticação

- `POST /auth/login` - Login do usuário

  ```json
  {
    "email": "joao@teste.com",
    "password": "123456"
  }
  ```

- `GET /auth/me` - Obter dados do usuário autenticado
  - Headers: `Authorization: Bearer <token>`

## 📦 Build APK

### Instalar EAS CLI

```bash
npm install -g @expo/eas-cli
```

### Configurar EAS

```bash
cd frontend
eas login
eas build:configure
```

### Gerar APK

```bash
# Build de desenvolvimento
eas build --platform android --profile preview
```

## ✅ Checklist Parte 1 - Concluído

- [x] Backend: `/auth/login`, `/auth/me` funcionando
- [x] Mobile: Tela de Login e persistência do token (expo-secure-store)
- [x] Perfil simples mostrando name e email e botão Sair
- [x] APK (debug) disponível

## 🎯 Funcionalidades Implementadas

### Backend

- ✅ Modelo User com Mongoose
- ✅ Autenticação JWT
- ✅ Middleware de autenticação
- ✅ Endpoints de login e me
- ✅ Script para popular usuários de teste
- ✅ Validação de dados
- ✅ Hash de senhas com bcrypt

### Frontend

- ✅ Tela de login responsiva
- ✅ Contexto de autenticação
- ✅ Persistência de token com expo-secure-store
- ✅ Navegação condicional (login vs tabs)
- ✅ Tela de perfil com dados do usuário
- ✅ Botão de logout
- ✅ Configuração para build APK

## 🔄 Próximos Passos

- [ ] Implementar registro de usuários
- [ ] Adicionar validação de formulários
- [ ] Implementar refresh token
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD
