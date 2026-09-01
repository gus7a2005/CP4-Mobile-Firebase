import { useCallback, useEffect, useMemo, useState } from "react";
import {
  findOrCreateConversation,
  listenToMessages,
  sendMessage,
} from "@/services/chatService";
import type { ChatMessage, Conversation } from "@/types/chat";

export type UseChatResult = {
  conversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendText: (text: string) => Promise<void>;
};

/**
 * Encapsula todo o ciclo de vida de uma conversa 1-para-1:
 * cria/localiza a conversa, assina as mensagens em tempo real
 * e expõe uma função de envio. Remove o listener automaticamente
 * ao desmontar ou ao trocar de conversa.
 */
export function useChat(currentUid: string, otherUid: string): UseChatResult {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    findOrCreateConversation(currentUid, otherUid)
      .then((createdConversation) => {
        if (isMounted) {
          setConversation(createdConversation);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Não foi possível abrir a conversa.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUid, otherUid]);

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const unsubscribe = listenToMessages(
      conversation.id,
      (nextMessages) => {
        setMessages(nextMessages);
        setIsLoading(false);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );

    // Listener removido sempre que a conversa muda ou o hook desmonta.
    return unsubscribe;
  }, [conversation]);

  const sendText = useCallback(
    async (text: string) => {
      if (!conversation) {
        return;
      }
      setIsSending(true);
      setError(null);
      try {
        await sendMessage(conversation.id, currentUid, otherUid, text);
      } catch {
        setError("Falha ao enviar a mensagem. Tente novamente.");
      } finally {
        setIsSending(false);
      }
    },
    [conversation, currentUid, otherUid]
  );

  return useMemo<UseChatResult>(
    () => ({ conversation, messages, isLoading, isSending, error, sendText }),
    [conversation, messages, isLoading, isSending, error, sendText]
  );
}
