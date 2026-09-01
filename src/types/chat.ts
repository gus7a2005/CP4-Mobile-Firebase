/**
 * Uma conversa é sempre estritamente 1 para 1.
 * `participants` é uma tupla de exatamente dois uids.
 */
export type Conversation = {
  id: string;
  participants: [string, string];
  createdAt: number;
};

/**
 * Mensagem trocada dentro de uma conversa.
 */
export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: number;
};

/**
 * Formato de mensagem antes de ser persistida (sem id, gerado pelo
 * `push` do Realtime Database).
 */
export type NewChatMessage = Omit<ChatMessage, "id">;

/**
 * Estado de carregamento/erro de uma lista assíncrona (mensagens,
 * contatos, etc.), reutilizado pelos hooks do app.
 */
export type AsyncListState<T> = {
  data: T[];
  isLoading: boolean;
  error: string | null;
};
