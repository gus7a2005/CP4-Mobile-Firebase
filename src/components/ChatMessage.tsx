import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

type ChatMessageProps = {
  message: ChatMessageType;
  isOwnMessage: boolean;
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function ChatMessageBubble({
  message,
  isOwnMessage,
}: ChatMessageProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.row,
        isOwnMessage ? styles.rowOwn : styles.rowOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text style={isOwnMessage ? styles.textOwn : styles.textOther}>
          {message.text}
        </Text>
        <Text
          style={[
            styles.time,
            isOwnMessage ? styles.timeOwn : styles.timeOther,
          ]}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    marginVertical: 4,
    flexDirection: "row",
  },
  rowOwn: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bubbleOwn: {
    backgroundColor: "#4F46E5",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },
  textOwn: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  textOther: {
    color: "#111827",
    fontSize: 15,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  timeOwn: {
    color: "#E0E7FF",
  },
  timeOther: {
    color: "#6B7280",
  },
});
