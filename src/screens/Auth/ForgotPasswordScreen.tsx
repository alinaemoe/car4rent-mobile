import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { axiosInstance } from "@/src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Toast } from "@/src/components/Toast";

type Step = "email" | "otp";

export default function ForgotPasswordScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();
  const router = useRouter();
  const otpRef = useRef<TextInput>(null);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRef.current?.focus(), 100);
    }
  }, [step]);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      return setErrorText(
        t("auth.enter_email", "Введите email"),
      );
    }

    setIsLoading(true);
    setErrorText("");

    try {
      await axiosInstance.post("/auth/forgot-password", {
        email: email.trim(),
      });
      Toast.success(
        t("common.success", "Успешно"),
        t("auth.code_sent", "Код отправлен на вашу почту"),
      );
      setStep("otp");
    } catch (error: any) {
      setErrorText(
        error.response?.data?.message ||
          t("auth.send_code_error", "Ошибка отправки кода"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) {
      return setErrorText(
        t("auth.enter_6_digit_code", "Введите 6-значный код"),
      );
    }
    if (newPassword.length < 6) {
      return setErrorText(
        t("auth.password_min_length", "Пароль должен быть не менее 6 символов"),
      );
    }

    setIsLoading(true);
    setErrorText("");

    try {
      await axiosInstance.post("/auth/reset-password", {
        email: email.trim(),
        otp,
        newPassword,
      });
      Toast.success(
        t("common.success", "Успешно"),
        t("auth.password_reset", "Пароль успешно изменен"),
      );
      router.replace("/(auth)/login");
    } catch (error: any) {
      setErrorText(
        error.response?.data?.message ||
          t("auth.reset_error", "Ошибка сброса пароля"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const gradientColors = [colors.background, colors.gradientEnd] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0.4, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => {
              if (step === "otp") {
                setStep("email");
                setErrorText("");
              } else {
                router.back();
              }
            }}
            style={styles.backBtn}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.content}>
          {step === "email" ? (
            <>
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accentBg }]}>
                  <Ionicons name="lock-open-outline" size={32} color={colors.accent} />
                </View>
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {t("auth.forgot_password_title", "Забыли пароль?")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t(
                  "auth.forgot_password_subtitle",
                  "Введите email, и мы отправим код для сброса пароля",
                )}
              </Text>

              {errorText ? (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errorText}
                </Text>
              ) : null}

              <View
                style={[styles.inputWrapper, { backgroundColor: colors.surface }]}
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
                  placeholderTextColor={colors.border}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.accent }]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {t("auth.send_code", "Отправить код")}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accentBg }]}>
                  <Ionicons name="key-outline" size={32} color={colors.accent} />
                </View>
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {t("auth.reset_password", "Сброс пароля")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t("auth.reset_password_subtitle", "Введите код из письма и новый пароль")}
              </Text>

              {errorText ? (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errorText}
                </Text>
              ) : null}

              <View
                style={[styles.otpWrapper, { backgroundColor: colors.surface }]}
              >
                <TextInput
                  ref={otpRef}
                  style={[styles.otpInput, { color: colors.textPrimary }]}
                  placeholder="000000"
                  placeholderTextColor={colors.border}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>

              <View
                style={[styles.inputWrapper, { backgroundColor: colors.surface }]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder={t("auth.new_password", "Новый пароль")}
                  placeholderTextColor={colors.border}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={newPassword}
                  onChangeText={setNewPassword}
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

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.accent }]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {t("auth.reset_button", "Сбросить пароль")}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
  },
  backBtn: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  errorText: {
    marginBottom: 16,
    fontWeight: "500",
    fontSize: 15,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    width: "100%",
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
  otpWrapper: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  otpInput: {
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 16,
    textAlign: "center",
    width: "100%",
  },
  submitBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
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
});
