import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { axiosInstance } from "@/src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch } from "@/src/store";
import { setCredentials } from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";

interface Props {
  email: string;
  onBack: () => void;
  // 👇 Добавили коллбэк для передачи данных на 3-й шаг
  onSuccess: (user: any, token: string) => void;
}

export const OtpVerification = ({ email, onBack, onSuccess }: Props) => {
  const colors = useAppColors();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) return setErrorText("Введите 6-значный код");

    setIsLoading(true);
    setErrorText("");

    try {
      const response = await axiosInstance.post("/auth/verify-email", {
        email,
        otp,
      });
      const { access_token, refresh_token, user } = response.data;

      // Токены физически сохраняем, чтобы следующий лоад был успешным
      await storage.setTokens(access_token, refresh_token);

      // 🔥 БОЛЬШЕ НЕТ DISPATCH ЗДЕСЬ! Передаем наверх
      onSuccess(user, access_token);
    } catch (error: any) {
      setErrorText(error.response?.data?.message || "Неверный код");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorText("");
    try {
      await axiosInstance.post("/auth/resend-otp", { email });
      alert("Новый код отправлен на вашу почту!");
    } catch (error: any) {
      setErrorText(error.response?.data?.message || "Ошибка отправки кода");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Проверьте почту
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Мы отправили 6-значный код на{"\n"}
          <Text style={{ fontWeight: "bold", color: colors.textPrimary }}>
            {email}
          </Text>
        </Text>

        {errorText ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errorText}
          </Text>
        ) : null}

        <View
          style={[styles.inputWrapper, { backgroundColor: colors.surface }]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.otpInput, { color: colors.textPrimary }]}
            placeholder="000000"
            placeholderTextColor={colors.border}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.accent }]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Подтвердить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendBtn}
          onPress={handleResend}
          disabled={isResending}
        >
          {isResending ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Text style={[styles.resendText, { color: colors.accent }]}>
              Отправить код снова
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Отступ под статус бар
  },
  backBtn: {
    paddingHorizontal: 24,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
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
  },
  inputWrapper: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 32,
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
    marginBottom: 24,
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
  resendBtn: {
    padding: 8,
  },
  resendText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
