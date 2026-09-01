import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  resolveChatUser,
  signOut as authSignOut,
  subscribeToAuthChanges,
  translateAuthError,
} from "@/services/authService";
import type { AuthState, ChatUser } from "@/types/user";

export type AuthContextValue = AuthState & {
  /** Chamado pelas telas de login/cadastro após autenticar com sucesso. */
  setChatUser: (user: ChatUser) => void;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

/**
 * Provider global: escuta `onAuthStateChanged` do Firebase e mantém
 * o `ChatUser` (perfil já resolvido do Realtime Database) sincronizado
 * com o restante do app via Context.
 */
export function AuthProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [chatUser, setChatUserState] = useState<ChatUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setError(null);

      if (!firebaseUser) {
        setChatUserState(null);
        setIsLoading(false);
        return;
      }

      resolveChatUser(firebaseUser)
        .then((resolvedUser) => {
          setChatUserState(resolvedUser);
        })
        .catch((caughtError: unknown) => {
          setError(translateAuthError(caughtError));
          setChatUserState(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    return unsubscribe;
  }, []);

  const setChatUser = useCallback((user: ChatUser) => {
    setError(null);
    setChatUserState(user);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setChatUserState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ chatUser, isLoading, error, setChatUser, signOut }),
    [chatUser, isLoading, error, setChatUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
