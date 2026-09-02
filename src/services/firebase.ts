import { Platform } from "react-native";
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Todas as chaves vêm de variáveis de ambiente EXPO_PUBLIC_*,
 * que o Expo injeta automaticamente em tempo de build.
 * Nunca deixe credenciais reais versionadas no repositório:
 * preencha um arquivo `.env` local a partir do `.env.example`.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// getReactNativePersistence não existe no build web do SDK; getAuth já
// usa persistência em localStorage/indexedDB nativamente nesse ambiente.
export const auth: Auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });

export const database: Database = getDatabase(app);

export default app;
