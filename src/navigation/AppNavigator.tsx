import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";
import { LoginScreen } from "@/screens/LoginScreen";
import { SignUpScreen } from "@/screens/SignUpScreen";
import { UsersScreen } from "@/screens/UsersScreen";
import { ChatScreen } from "@/screens/ChatScreen";

/**
 * Params tipados de cada stack, usados por `NativeStackScreenProps`
 * dentro de cada tela para tipar `navigation` e `route` sem `any`.
 */
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Users: undefined;
  Chat: { otherUid: string; otherName: string };
};

export type AuthStackScreenProps<RouteName extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, RouteName>;

export type AppStackScreenProps<RouteName extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, RouteName>;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator(): React.JSX.Element {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigatorStack(): React.JSX.Element {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="Users"
        component={UsersScreen}
        options={{ title: "Contatos" }}
      />
      <AppStack.Screen name="Chat" component={ChatScreen} />
    </AppStack.Navigator>
  );
}

/**
 * Decide entre o fluxo de autenticação e o fluxo principal do app
 * com base exclusivamente no estado vindo do Firebase Authentication
 * (via AuthContext), nunca em um usuário fixo/hardcoded.
 */
export function AppNavigator(): React.JSX.Element {
  const { chatUser, isLoading } = useAuth();

  if (isLoading) {
    return <Loading label="Verificando sessão..." />;
  }

  return (
    <NavigationContainer>
      {chatUser ? <AppNavigatorStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
