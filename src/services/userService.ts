import { onValue, ref, type Unsubscribe } from "firebase/database";
import { database } from "./firebase";
import { canUsersChat } from "@/utils/chatRules";
import type { ChatUser, StoredUser } from "@/types/user";

/**
 * Escuta a lista completa de usuários em `users/` e retorna,
 * via callback, apenas os que são compatíveis com `currentUser`
 * de acordo com a regra de provedores (chatRules.ts).
 *
 * Retorna a função de unsubscribe, que deve ser chamada ao
 * desmontar a tela para evitar listeners pendurados.
 */
export function subscribeToCompatibleUsers(
  currentUser: ChatUser,
  onUsers: (users: ChatUser[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const usersRef = ref(database, "users");

  return onValue(
    usersRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUsers([]);
        return;
      }

      const raw = snapshot.val() as Record<string, StoredUser>;
      const compatibleUsers: ChatUser[] = Object.values(raw)
        .filter((storedUser) =>
          canUsersChat(
            currentUser.uid,
            currentUser.provider,
            storedUser.uid,
            storedUser.provider
          )
        )
        .map((storedUser) => ({
          uid: storedUser.uid,
          name: storedUser.name,
          email: storedUser.email,
          provider: storedUser.provider,
        }));

      onUsers(compatibleUsers);
    },
    () => {
      onError("Não foi possível carregar a lista de contatos.");
    }
  );
}
