import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  signInWithApple,
  signInWithEmail,
  signInWithGoogleIdToken,
  translateAuthError,
} from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { AuthStackParamList } from "@/navigation/AppNavigator";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const { setChatUser } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const isAppleAvailable = useMemo(() => Platform.OS === "ios", []);

  const handleEmailLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const chatUser = await signInWithEmail({ email: email.trim(), password });
      setChatUser(chatUser);
    } catch (caughtError) {
      setError(translateAuthError(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, setChatUser]);

  const handleGoogleLogin = useCallback(async () => {
    setError(null);
    try {
      const result = await promptGoogleAsync();
      if (result.type !== "success") {
        return;
      }
      // No fluxo de id_token puro (web), o token vem em params, não em `authentication`.
      const idToken = result.authentication?.idToken ?? result.params?.id_token;
      if (!idToken) {
        setError("Não foi possível obter as credenciais do Google.");
        return;
      }
      setIsSubmitting(true);
      const chatUser = await signInWithGoogleIdToken(idToken);
      setChatUser(chatUser);
    } catch (caughtError) {
      setError(translateAuthError(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }, [promptGoogleAsync, setChatUser]);

  // Reage ao resultado assíncrono retornado pelo fluxo do Google
  // (o `promptGoogleAsync` também resolve a Promise, mas o efeito
  // cobre o caso em que a resposta chega via listener de redirecionamento).
  useEffect(() => {
    if (googleResponse?.type === "error") {
      setError("Falha ao autenticar com o Google.");
    }
  }, [googleResponse]);

  const handleAppleLogin = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const chatUser = await signInWithApple();
      setChatUser(chatUser);
    } catch (caughtError) {
      setError(translateAuthError(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }, [setChatUser]);

  if (isSubmitting) {
    return <Loading label="Autenticando..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Bem-vindo</Text>
      <Text style={styles.subtitle}>Entre para começar a conversar</Text>

      <ErrorMessage message={error} />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="Campo de e-mail"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        accessibilityLabel="Campo de senha"
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleEmailLogin}>
        <Text style={styles.primaryButtonText}>Entrar com e-mail e senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.socialButton}
        onPress={handleGoogleLogin}
        accessibilityRole="button"
        accessibilityLabel="Entrar com Google"
      >
        <Text style={styles.socialButtonText}>Continuar com Google</Text>
      </TouchableOpacity>

      {isAppleAvailable ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={styles.appleButton}
          onPress={handleAppleLogin}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    color: "#111827",
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  linkText: {
    color: "#4F46E5",
    textAlign: "center",
    marginTop: 14,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 12,
  },
  socialButtonText: {
    color: "#111827",
    fontWeight: "500",
    fontSize: 15,
  },
  appleButton: {
    height: 48,
    width: "100%",
  },
});
