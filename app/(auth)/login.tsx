import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAppDispatch } from "../../src/store";
import { setCredentials, setGuestMode } from "../../src/store/slices/authSlice";
import { storage } from "../../src/utils/storage";
import { axiosInstance } from "../../src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const colors = useAppColors();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return setErrorText("Введите email и пароль");
    setIsLoading(true);
    setErrorText("");

    try {
      // 1. Логинимся, получаем Access и Refresh токены
      const authRes = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      const { access_token, refresh_token } = authRes.data;

      // 2. Сохраняем в безопасное хранилище
      await storage.setTokens(access_token, refresh_token);

      // 3. Запрашиваем данные профиля по новому токену
      const profileRes = await axiosInstance.get("/users/profile");

      // 4. Пишем в Redux -> Роутер сам выкинет нас в (tabs)
      dispatch(setCredentials({ user: profileRes.data, token: access_token }));
    } catch (error: any) {
      setErrorText(error.response?.data?.message || "Ошибка авторизации");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    await storage.setGuestMode(true);
    dispatch(setGuestMode());
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 24,
          color: colors.textPrimary,
        }}
      >
        Вход 🔐
      </Text>

      {errorText ? (
        <Text style={{ color: colors.error, marginBottom: 12 }}>
          {errorText}
        </Text>
      ) : null}

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          color: colors.textPrimary,
        }}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          borderRadius: 8,
          marginBottom: 24,
          color: colors.textPrimary,
        }}
        placeholder="Пароль"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={{
          backgroundColor: colors.accent,
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Войти</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(auth)/register")}
        style={{ marginTop: 20, alignItems: "center" }}
      >
        <Text style={{ color: colors.accent }}>Нет аккаунта? Создать</Text>
      </TouchableOpacity>

      {/* Кнопка Skip (Гость) */}
      <TouchableOpacity
        onPress={handleGuestLogin} // 👈 Используем новую функцию
        style={{ marginTop: 30, alignItems: "center" }}
      >
        <Text style={{ color: colors.textSecondary }}>
          Продолжить как гость
        </Text>
      </TouchableOpacity>
    </View>
  );
}
