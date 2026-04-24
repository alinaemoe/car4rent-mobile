import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { axiosInstance } from "@/src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch } from "@/src/store";
import { setCredentials, setGuestMode } from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";

// Регулярка для email (для быстрой проверки на фронте)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm = () => {
  const colors = useAppColors();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleLogin = async () => {
    setErrorText("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return setErrorText("Введите email и пароль");
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return setErrorText("Введите корректный email");
    }

    setIsLoading(true);

    try {
      // 1. Логинимся, получаем Access и Refresh токены
      const authRes = await axiosInstance.post("/auth/login", {
        email: trimmedEmail,
        password,
      });
      const { access_token, refresh_token } = authRes.data;

      // 2. Сохраняем токены физически
      await storage.setTokens(access_token, refresh_token);

      // 3. Запрашиваем данные профиля по новому токену
      const profileRes = await axiosInstance.get("/users/profile");
      console.log("✅ PROFILE DATA:", JSON.stringify(profileRes.data, null, 2));
      // 4. Пишем в Redux -> Logic в _layout.tsx сама перекинет нас вTabs
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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Вход</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Рады видеть вас снова
        </Text>
      </View>

      {errorText ? (
        <View
          style={[styles.errorBox, { backgroundColor: `${colors.error}15` }]}
        >
          <Text style={{ color: colors.error, fontWeight: "500" }}>
            {errorText}
          </Text>
        </View>
      ) : null}

      {/* Поле EMAIL */}
      <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={colors.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Email"
          placeholderTextColor={colors.border}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Поле ПАРОЛЬ */}
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: colors.surface, marginBottom: 12 },
        ]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={colors.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Пароль"
          placeholderTextColor={colors.border}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.forgotBtn}>
        <Text style={[styles.forgotText, { color: colors.accent }]}>
          Забыли пароль?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.accent }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Войти</Text>
        )}
      </TouchableOpacity>

      {/* ФУТЕР С НАВИГАЦИЕЙ */}
      <View style={styles.footer}>
        <View style={styles.footerLinkRow}>
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
            Нет аккаунта?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text
              style={{ color: colors.accent, fontSize: 15, fontWeight: "bold" }}
            >
              Зарегистрироваться
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleGuestLogin} style={styles.guestBtn}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Продолжить как гость
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100, // Высокий отступ сверху
    paddingBottom: 40,
    flexGrow: 1, // Чтобы футер прижимался к низу
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 8,
    marginRight: -8,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  footer: {
    marginTop: "auto", // Прижимает футер к низу ScrollView
    paddingTop: 40,
    alignItems: "center",
  },
  footerLinkRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  guestBtn: {
    padding: 8,
  },
});
