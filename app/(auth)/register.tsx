import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { axiosInstance } from "../../src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const colors = useAppColors();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleRegister = async () => {
    if (
      !form.email ||
      !form.password ||
      !form.first_name ||
      !form.last_name ||
      !form.phone
    ) {
      return setErrorText("Заполните все поля");
    }

    setIsLoading(true);
    setErrorText("");

    try {
      await axiosInstance.post("/users", form);
      // Успешно! Перекидываем на логин (или можно сразу залогинить)
      router.back();
    } catch (error: any) {
      setErrorText(error.response?.data?.message || "Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
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
        Регистрация 📝
      </Text>

      {errorText ? (
        <Text style={{ color: colors.error, marginBottom: 12 }}>
          {errorText}
        </Text>
      ) : null}

      {(["email", "password", "first_name", "last_name", "phone"] as const).map(
        (field) => (
          <TextInput
            key={field}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              color: colors.textPrimary,
            }}
            placeholder={field.replace("_", " ").toUpperCase()}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={field === "password"}
            autoCapitalize="none"
            value={form[field]}
            onChangeText={(text) => setForm({ ...form, [field]: text })}
          />
        ),
      )}

      <TouchableOpacity
        style={{
          backgroundColor: colors.accent,
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Создать аккаунт
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginTop: 20, alignItems: "center" }}
      >
        <Text style={{ color: colors.accent }}>Уже есть аккаунт? Войти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
