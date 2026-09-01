# 💬 ChatFirebaseApp

Aplicativo de chat 1 para 1 desenvolvido em **React Native + TypeScript**,
utilizando **Expo** e **Firebase** (Authentication + Realtime Database),
como parte do CheckPoint 1 de Mobile Development & IoT.

## 📖 Descrição

O aplicativo permite que dois usuários troquem mensagens em tempo real,
desde que autenticados por provedores compatíveis. Cada conversa é
estritamente entre duas pessoas — não há chats em grupo nem salas
públicas. A regra de negócio central é:

- Um usuário autenticado com **e-mail/senha** só pode conversar com
  usuários autenticados via **Google** ou **Apple**.
- Usuários do mesmo provedor (ex.: Google ↔ Google) **não** podem
  conversar entre si.

## 🧰 Tecnologias utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/) — **SDK 54**
- TypeScript (modo `strict`, sem uso de `any`)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
  (e-mail/senha, Google, Apple)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- React Navigation (Native Stack)
- `expo-auth-session` (login Google) e `expo-apple-authentication` (login Apple)

## 🔥 Serviços Firebase utilizados

- **Firebase Authentication** — cadastro, login e identificação dos usuários
  pelo `uid`.
- **Firebase Realtime Database** — armazenamento de perfis (`users`),
  conversas (`conversations`) e mensagens (`messages`), com sincronização
  em tempo real via listeners (`onValue`).

## 🗃️ Estrutura de dados no Realtime Database

```
users
  └── uid
       ├── uid
       ├── name
       ├── email
       ├── provider   ("password" | "google" | "apple")
       └── createdAt

conversations
  └── conversationId        (uid_A + "_" + uid_B, ordenados)
       ├── id
       ├── participants     [uidA, uidB]
       └── createdAt

messages
  └── conversationId
       └── messageId
            ├── conversationId
            ├── senderId
            ├── receiverId
            ├── text
            └── createdAt
```

## 🧱 Estrutura do projeto

```
chat-firebase-app/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── .env.example
├── firebase-rules/
│   └── database.rules.json
└── src/
    ├── components/
    │   ├── ChatInput.tsx
    │   ├── ChatMessage.tsx
    │   ├── ErrorMessage.tsx
    │   ├── Loading.tsx
    │   └── UserItem.tsx
    ├── contexts/
    │   └── AuthContext.tsx
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useChat.ts
    ├── navigation/
    │   └── AppNavigator.tsx
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── SignUpScreen.tsx
    │   ├── UsersScreen.tsx
    │   └── ChatScreen.tsx
    ├── services/
    │   ├── firebase.ts
    │   ├── authService.ts
    │   ├── userService.ts
    │   └── chatService.ts
    ├── types/
    │   ├── user.ts
    │   └── chat.ts
    └── utils/
        └── chatRules.ts
```

## ⚙️ Configuração do Firebase

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com/).
2. Em **Build > Authentication > Sign-in method**, habilite os provedores:
   - **E-mail/senha**
   - **Google**
   - **Apple**
3. Em **Build > Realtime Database**, crie o banco (modo "locked", ou seja,
   regras fechadas por padrão) e depois publique o conteúdo de
   `firebase-rules/database.rules.json` (aba **Rules**).
4. Em **Configurações do projeto > Geral**, adicione um app **Web** e copie
   as credenciais (`apiKey`, `authDomain`, `databaseURL`, etc.).
5. Para o login Google, crie um **OAuth Client ID** em
   [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)
   (tipo "Web application" funciona com `expo-auth-session`, tanto no Expo Go
   quanto em dev build).
6. Para o login Apple:
   - Habilite a capability **Sign In with Apple** no seu Apple Developer
     account e no `app.json` (já habilitada via `"usesAppleSignIn": true`).
   - O Apple Sign-In **só funciona em iOS** (dispositivo físico ou
     simulador) e **não funciona dentro do Expo Go** — é necessário gerar um
     *development build* (`expo-dev-client`/EAS Build), pois depende de um
     módulo nativo.
7. Copie `.env.example` para `.env` e preencha todas as variáveis com as
   credenciais obtidas nos passos anteriores.

## ▶️ Instruções de execução

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# preencha o .env com as credenciais do Firebase e do Google OAuth

# 3. Rodar o projeto
npx expo start
```

- Para **Android/iOS via Expo Go**: escaneie o QR code exibido no terminal
  (login com e-mail/senha e Google funcionam no Expo Go; o login com Apple
  exige um development build, veja abaixo).
- Para **Web**: pressione `w` no terminal do Expo, ou `npx expo start --web`.
- Para testar o **login com Apple** (necessário para a nota completa em
  iOS): gere um development build com
  `npx expo run:ios` (requer macOS + Xcode) ou via
  [EAS Build](https://docs.expo.dev/develop/development-builds/introduction/).

### Testando a troca de mensagens

Como cada conversa exige dois provedores diferentes, o teste completo
requer duas contas em dois dispositivos/simuladores (ou dois usuários
logados em sessões separadas):

1. Crie uma conta com e-mail/senha em um dispositivo.
2. Faça login com Google (ou Apple) em outro dispositivo/simulador.
3. Em qualquer um dos dois, abra a tela de Contatos, selecione o outro
   usuário e troque mensagens — a atualização deve aparecer
   automaticamente nos dois aparelhos, sem recarregar a tela.

## 📸 Prints da aplicação

> Adicione aqui capturas de tela da tela de Login, da tela de Contatos e
> da tela de Chat (com mensagens enviadas e recebidas) após rodar o
> aplicativo.

## 👥 Integrantes

- RM556289 - Gustavo Moreno Coelho
- RM555177 - Matheus Alves
- RM559098 - Gustavo Atanazio
- RM556010 - Igor Soos
- RM556617 - Nicolas Aquino

> ⚠️ **Atenção:** substitua `RM00000` pelo RM real antes de entregar —
> sem o RM correto de todos os integrantes, o trabalho recebe nota zero
> (regra do enunciado). Se o trabalho for em grupo, adicione uma linha
> por integrante (máximo 5).
