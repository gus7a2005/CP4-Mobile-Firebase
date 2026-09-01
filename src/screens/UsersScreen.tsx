import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { subscribeToCompatibleUsers } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import { UserItem } from "@/components/UserItem";
import type { ChatUser } from "@/types/user";
import type { AppStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "Users">;

export function UsersScreen({ navigation }: Props): React.JSX.Element {
  const { chatUser, signOut } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToCompatibleUsers(
      chatUser,
      (nextUsers) => {
        setUsers(nextUsers);
        setIsLoading(false);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );

    // Listener de `users/` removido ao sair da tela ou trocar de usuário logado.
    return unsubscribe;
  }, [chatUser]);

  const handleSelectUser = useCallback(
    (selectedUser: ChatUser) => {
      navigation.navigate("Chat", {
        otherUid: selectedUser.uid,
        otherName: selectedUser.name,
      });
    },
    [navigation]
  );

  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  if (!chatUser) {
    return <Loading label="Carregando usuário..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Contatos</Text>
          <Text style={styles.headerSubtitle}>
            Logado como {chatUser.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Text style={styles.signOutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ErrorMessage message={error} />

      {isLoading ? (
        <Loading label="Carregando contatos..." />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <UserItem user={item} onPress={handleSelectUser} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum contato disponível ainda.{"\n"}
                {chatUser.provider === "password"
                  ? "Assim que alguém entrar com Google ou Apple, aparecerá aqui."
                  : "Assim que alguém entrar com e-mail e senha, aparecerá aqui."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  signOutText: {
    color: "#DC2626",
    fontWeight: "500",
    fontSize: 14,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },
});
