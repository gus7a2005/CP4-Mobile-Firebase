/**
 * Provedores de autenticação suportados pelo app.
 * A regra de negócio do chat depende diretamente desse valor.
 */
export type AuthProvider = "password" | "google" | "apple";

/**
 * Representa o usuário autenticado, já normalizado a partir do
 * Firebase Authentication (não deve ser confundido com o
 * FirebaseUser bruto retornado pelo SDK).
 */
export type ChatUser = {
  uid: string;
  name: string;
  email: string | null;
  provider: AuthProvider;
};

/**
 * Formato exato em que o usuário é persistido em `users/{uid}`
 * no Realtime Database.
 */
export type StoredUser = {
  uid: string;
  name: string;
  email: string | null;
  provider: AuthProvider;
  createdAt: number;
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

/**
 * Estado de autenticação exposto pelo AuthContext/useAuth.
 */
export type AuthState = {
  chatUser: ChatUser | null;
  isLoading: boolean;
  error: string | null;
};
