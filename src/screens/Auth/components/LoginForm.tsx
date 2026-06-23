import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { axiosInstance } from "@/src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch } from "@/src/store";
import { setCredentials, setGuestMode } from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";

// Регулярка для email (для быстрой проверки на фронте)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm = () => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Ошибки конкретных полей (подсветка границы + текст под инпутом)
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // Общая ошибка (неверный логин/пароль, сбой сервера) — текстом над кнопкой
  const [generalError, setGeneralError] = useState("");

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    const trimmedEmail = email.trim();
    let hasError = false;

    if (!trimmedEmail) {
      setEmailError(t("auth.enter_email", "Введите email"));
      hasError = true;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError(t("auth.enter_valid_email", "Введите корректный email"));
      hasError = true;
    }

    if (!password) {
      setPasswordError(t("auth.enter_password", "Введите пароль"));
      hasError = true;
    }

    if (hasError) return;
    setIsLoading(true);

    try {
      const authRes = await axiosInstance.post("/auth/login", {
        email: trimmedEmail,
        password,
      });
      const { access_token, refresh_token } = authRes.data;

      await storage.setTokens(access_token, refresh_token);

      const profileRes = await axiosInstance.get("/users/profile");
      dispatch(setCredentials({ user: profileRes.data, token: access_token }));
    } catch (error: any) {
      // Серверная ошибка (неверный email/пароль и т.п.) — это общая ошибка формы
      setGeneralError(
        error.response?.data?.message ||
          t("auth.login_error", "Ошибка авторизации"),
      );
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t("auth.login_title", "Вход")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("auth.welcome_back", "Рады видеть вас снова")}
        </Text>
      </View>

      {/* Поле EMAIL */}
      <View style={styles.fieldGroup}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: emailError ? colors.error : "transparent",
            },
          ]}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder={t("auth.email_placeholder", "Email")}
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
          />
        </View>
        {emailError ? (
          <Text style={[styles.fieldError, { color: colors.error }]}>
            {emailError}
          </Text>
        ) : null}
      </View>

      {/* Поле ПАРОЛЬ */}
      <View style={styles.fieldGroup}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: passwordError ? colors.error : "transparent",
            },
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
            placeholder={t("auth.password_placeholder", "Пароль")}
            placeholderTextColor={colors.placeholder}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError("");
            }}
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
        {passwordError ? (
          <Text style={[styles.fieldError, { color: colors.error }]}>
            {passwordError}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.forgotBtn}
        onPress={() => router.push("/(auth)/forgot-password")}
      >
        <Text style={[styles.forgotText, { color: colors.accent }]}>
          {t("auth.forgot_password", "Забыли пароль?")}
        </Text>
      </TouchableOpacity>

      {/* Общая ошибка — текстом над кнопкой, по центру, без плашки */}
      {generalError ? (
        <Text style={[styles.generalError, { color: colors.error }]}>
          {generalError}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.accent }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>
            {t("auth.login_button", "Войти")}
          </Text>
        )}
      </TouchableOpacity>

      {/* ФУТЕР С НАВИГАЦИЕЙ */}
      <View style={styles.footer}>
        <View style={styles.footerLinkRow}>
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
            {t("auth.no_account", "Нет аккаунта? ")}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text
              style={{ color: colors.accent, fontSize: 15, fontWeight: "bold" }}
            >
              {t("auth.register_link", "Зарегистрироваться")}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleGuestLogin} style={styles.guestBtn}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {t("auth.continue_as_guest", "Продолжить как гость")}
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
  fieldGroup: {
    marginBottom: 16,
  },
  fieldError: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
    marginLeft: 4,
  },
  generalError: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
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
