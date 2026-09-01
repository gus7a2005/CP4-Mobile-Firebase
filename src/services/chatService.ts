import {
  get,
  onValue,
  push,
  query,
  orderByChild,
  ref,
  serverTimestamp,
  set,
  type Unsubscribe,
} from "firebase/database";
import { database } from "./firebase";
import { buildConversationId } from "@/utils/chatRules";
import type { ChatMessage, Conversation } from "@/types/chat";

/**
 * Garante que a conversa 1-para-1 entre dois uids exista.
 * Se já existir (mesmo id determinístico), apenas a retorna;
 * caso contrário, cria com exatamente dois participantes.
 */
export async function findOrCreateConversation(
  currentUid: string,
  otherUid: string
): Promise<Conversation> {
  const conversationId = buildConversationId(currentUid, otherUid);
  const conversationRef = ref(database, `conversations/${conversationId}`);
  const snapshot = await get(conversationRef);

  if (snapshot.exists()) {
    return snapshot.val() as Conversation;
  }

  const newConversation: Conversation = {
    id: conversationId,
    participants: [currentUid, otherUid],
    createdAt: Date.now(),
  };

  await set(conversationRef, newConversation);
  return newConversation;
}

/**
 * Envia uma mensagem para dentro de `messages/{conversationId}`.
 * Usa `push` para gerar um id único e ordenável por chave.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error("A mensagem não pode estar vazia.");
  }

  const messagesRef = ref(database, `messages/${conversationId}`);
  const newMessageRef = push(messagesRef);

  const messagePayload: Omit<ChatMessage, "id"> = {
    conversationId,
    senderId,
    receiverId,
    text: trimmed,
    createdAt: Date.now(),
  };

  await set(newMessageRef, {
    ...messagePayload,
    // serverTimestamp garante ordenação confiável mesmo com
    // relógios de dispositivo divergentes; createdAt local fica
    // como fallback imediato para a UI otimista.
    serverCreatedAt: serverTimestamp(),
  });
}

/**
 * Escuta em tempo real todas as mensagens de uma conversa,
 * ordenadas por `createdAt`. Retorna a função de unsubscribe,
 * que DEVE ser chamada ao sair da tela de chat.
 */
export function listenToMessages(
  conversationId: string,
  onMessages: (messages: ChatMessage[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const messagesQuery = query(
    ref(database, `messages/${conversationId}`),
    orderByChild("createdAt")
  );

  return onValue(
    messagesQuery,
    (snapshot) => {
      if (!snapshot.exists()) {
        onMessages([]);
        return;
      }

      const raw = snapshot.val() as Record<string, Omit<ChatMessage, "id">>;
      const messages: ChatMessage[] = Object.entries(raw)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => a.createdAt - b.createdAt);

      onMessages(messages);
    },
    () => {
      onError("Não foi possível carregar as mensagens.");
    }
  );
}
