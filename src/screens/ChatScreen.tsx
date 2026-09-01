import React, { useEffect, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { ChatMessage } from "@/types/chat";
import type { AppStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "Chat">;

export function ChatScreen({ route, navigation }: Props): React.JSX.Element {
  const { otherUid, otherName } = route.params;
  const { chatUser } = useAuth();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    navigation.setOptions({ title: otherName });
  }, [navigation, otherName]);

  if (!chatUser) {
    return <Loading label="Carregando usuário..." />;
  }

  return (
    <ChatScreenContent
      currentUid={chatUser.uid}
      otherUid={otherUid}
      listRef={listRef}
    />
  );
}

type ChatScreenContentProps = {
  currentUid: string;
  otherUid: string;
  listRef: React.RefObject<FlatList<ChatMessage>>;
};

function ChatScreenContent({
  currentUid,
  otherUid,
  listRef,
}: ChatScreenContentProps): React.JSX.Element {
  const { messages, isLoading, isSending, error, sendText } = useChat(
    currentUid,
    otherUid
  );

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, listRef]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ErrorMessage message={error} />

      {isLoading ? (
        <Loading label="Carregando mensagens..." />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <ChatMessageBubble
              message={item}
              isOwnMessage={item.senderId === currentUid}
            />
          )}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhuma mensagem ainda.{"\n"}Envie a primeira!
              </Text>
            </View>
          }
        />
      )}

      <ChatInput onSend={sendText} isSending={isSending} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  messagesList: {
    padding: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 20,
  },
});
