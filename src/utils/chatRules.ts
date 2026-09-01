import type { AuthProvider } from "@/types/user";

/**
 * Regra principal do trabalho:
 *
 *   E-mail/Senha ↔ Google
 *   E-mail/Senha ↔ Apple
 *
 * Não permitido:
 *   E-mail/Senha ↔ E-mail/Senha
 *   Google ↔ Google
 *   Apple ↔ Apple
 *   Google ↔ Apple
 *
 * Em resumo: só é permitido conversar quando um dos lados é
 * "password" e o outro é um provedor social ("google" ou "apple").
 */
export function canProvidersChat(
  providerA: AuthProvider,
  providerB: AuthProvider
): boolean {
  const isSocial = (provider: AuthProvider): boolean =>
    provider === "google" || provider === "apple";

  const oneIsPassword = providerA === "password" || providerB === "password";
  const bothAreSameProvider = providerA === providerB;
  const oneIsSocialOnly =
    (providerA === "password" && isSocial(providerB)) ||
    (providerB === "password" && isSocial(providerA));

  return oneIsPassword && !bothAreSameProvider && oneIsSocialOnly;
}

/**
 * Impede que um usuário inicie uma conversa consigo mesmo,
 * independentemente do provedor.
 */
export function canUsersChat(
  currentUid: string,
  currentProvider: AuthProvider,
  targetUid: string,
  targetProvider: AuthProvider
): boolean {
  if (currentUid === targetUid) {
    return false;
  }
  return canProvidersChat(currentProvider, targetProvider);
}

/**
 * Gera um id determinístico e estável para a conversa 1-para-1
 * entre dois uids, independente da ordem em que são passados.
 * Isso garante que A->B e B->A sempre resolvam para a mesma sala.
 */
export function buildConversationId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}
