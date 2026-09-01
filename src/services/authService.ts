import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  type Unsubscribe,
  type User as FirebaseUser,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { auth, database } from "./firebase";
import type {
  AuthProvider,
  ChatUser,
  SignInPayload,
  SignUpPayload,
  StoredUser,
} from "@/types/user";

/**
 * Converte um FirebaseUser + provider já conhecido no ChatUser
 * usado no restante do app.
 */
function toChatUser(user: FirebaseUser, provider: AuthProvider): ChatUser {
  return {
    uid: user.uid,
    name: user.displayName ?? user.email ?? "Usuário",
    email: user.email,
    provider,
  };
}

/**
 * Grava/atualiza o perfil do usuário em `users/{uid}`.
 * É essencial para a tela de contatos conseguir listar
 * "nome + provedor" de outros usuários.
 */
async function upsertUserProfile(chatUser: ChatUser): Promise<void> {
  const userRef = ref(database, `users/${chatUser.uid}`);
  const snapshot = await get(userRef);

  const storedUser: StoredUser = {
    uid: chatUser.uid,
    name: chatUser.name,
    email: chatUser.email,
    provider: chatUser.provider,
    createdAt: snapshot.exists()
      ? (snapshot.val() as StoredUser).createdAt
      : Date.now(),
  };

  await set(userRef, storedUser);
}

/**
 * Traduz os códigos de erro do Firebase Auth em mensagens
 * compreensíveis para o usuário final (pt-BR).
 */
export function translateAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado.";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "auth/network-request-failed":
      return "Falha de conexão. Verifique sua internet.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente em instantes.";
    default:
      return "Não foi possível completar a operação. Tente novamente.";
  }
}

/**
 * Cria uma conta com e-mail e senha, define o displayName
 * e persiste o perfil em `users/{uid}` com provider = "password".
 */
export async function signUpWithEmail(
  payload: SignUpPayload
): Promise<ChatUser> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    payload.email,
    payload.password
  );
  await updateProfile(credential.user, { displayName: payload.name });

  const chatUser = toChatUser(credential.user, "password");
  chatUser.name = payload.name;
  await upsertUserProfile(chatUser);
  return chatUser;
}

/**
 * Login com e-mail e senha.
 */
export async function signInWithEmail(
  payload: SignInPayload
): Promise<ChatUser> {
  const credential = await signInWithEmailAndPassword(
    auth,
    payload.email,
    payload.password
  );
  const chatUser = toChatUser(credential.user, "password");
  await upsertUserProfile(chatUser);
  return chatUser;
}

/**
 * Login com Google via `expo-auth-session`.
 * A tela de login é responsável por rodar o fluxo do
 * `useAuthRequest`/`promptAsync` e obter o `idToken`; aqui apenas
 * trocamos esse idToken por uma sessão do Firebase e persistimos
 * o perfil com provider = "google".
 */
export async function signInWithGoogleIdToken(
  idToken: string
): Promise<ChatUser> {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  const chatUser = toChatUser(userCredential.user, "google");
  await upsertUserProfile(chatUser);
  return chatUser;
}

/**
 * Login com Apple usando `expo-apple-authentication`.
 * Disponível apenas em iOS físico/simulador com um dev build
 * (não funciona dentro do Expo Go). Gera o nonce criptográfico
 * exigido pela Apple e troca a identityToken pelo Firebase.
 */
export async function signInWithApple(): Promise<ChatUser> {
  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Apple Sign-In não está disponível neste dispositivo.");
  }

  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!appleCredential.identityToken) {
    throw new Error("Não foi possível obter o token da Apple.");
  }

  const provider = new OAuthProvider("apple.com");
  const firebaseCredential = provider.credential({
    idToken: appleCredential.identityToken,
    rawNonce,
  });

  const userCredential = await signInWithCredential(auth, firebaseCredential);
  const chatUser = toChatUser(userCredential.user, "apple");

  // A Apple só envia o nome completo no primeiro login;
  // nas próximas vezes é preciso reaproveitar o que já foi salvo.
  const fullName = appleCredential.fullName;
  if (fullName?.givenName) {
    const composedName = [fullName.givenName, fullName.familyName]
      .filter(Boolean)
      .join(" ");
    chatUser.name = composedName;
    await updateProfile(userCredential.user, { displayName: composedName });
  }

  await upsertUserProfile(chatUser);
  return chatUser;
}

/**
 * Encerra a sessão atual. O AuthContext escuta `onAuthStateChanged`
 * e automaticamente limpa o estado/navega de volta para o login.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Descobre o provider "lógico" (password | google | apple) a partir
 * do FirebaseUser, consultando o perfil salvo em `users/{uid}`
 * (fonte confiável, já que o SDK só expõe `providerId` técnico).
 */
export async function resolveChatUser(
  user: FirebaseUser
): Promise<ChatUser | null> {
  const snapshot = await get(ref(database, `users/${user.uid}`));
  if (!snapshot.exists()) {
    return null;
  }
  const stored = snapshot.val() as StoredUser;
  return {
    uid: user.uid,
    name: stored.name,
    email: stored.email,
    provider: stored.provider,
  };
}

/**
 * Assina mudanças de estado de autenticação do Firebase.
 * Retorna a função de unsubscribe para ser usada em um useEffect.
 */
export function subscribeToAuthChanges(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
