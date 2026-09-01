import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/contexts/AuthContext";

/**
 * Hook de conveniência para acessar o AuthContext.
 * Lança erro cedo se usado fora do AuthProvider, o que evita
 * bugs silenciosos de `chatUser` sempre `undefined`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um <AuthProvider>.");
  }
  return context;
}
