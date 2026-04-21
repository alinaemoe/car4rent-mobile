import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

import { LoginForm } from "./components/LoginForm";

export default function LoginScreen() {
  const colors = useAppColors();

  // 🔥 Берем чистый фон и ведем к акцентному полупрозрачному фону
  const gradientColors = [colors.background, colors.gradientEnd] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      // 👇 Направляем градиент из левого верхнего в правый нижний угол
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      // 👇 Магия: 40% экрана сверху будет чистым цветом background, и только потом начнется плавный переход
      locations={[0.4, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <LoginForm />
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
});
