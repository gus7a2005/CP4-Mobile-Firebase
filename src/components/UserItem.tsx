import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ChatUser } from "@/types/user";

type UserItemProps = {
  user: ChatUser;
  onPress: (user: ChatUser) => void;
};

const PROVIDER_LABEL: Record<ChatUser["provider"], string> = {
  password: "E-mail e senha",
  google: "Google",
  apple: "Apple",
};

export function UserItem({ user, onPress }: UserItemProps): React.JSX.Element {
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(user)}
      accessibilityRole="button"
      accessibilityLabel={`Conversar com ${user.name}`}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.provider}>{PROVIDER_LABEL[user.provider]}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  provider: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
