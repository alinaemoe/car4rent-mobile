import React, { useState } from "react";
import { StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

import { RegisterForm } from "./components/RegisterForm";
import { OtpVerification } from "./components/OtpVerification";
import { RegistrationSuccess } from "./components/RegistrationSuccess"; // 👈 Новый компонент

export default function RegisterScreen() {
  const colors = useAppColors();

  // Теперь у нас 3 шага
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  // Временное хранилище для данных юзера, пока он не выберет "Сейчас" или "Позже"
  const [authData, setAuthData] = useState<{ user: any; token: string } | null>(
    null,
  );

  const handleRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email);
    setStep(2);
  };

  const handleOtpSuccess = (user: any, token: string) => {
    setAuthData({ user, token });
    setStep(3); // 👈 Переключаем на 3-й шаг вместо редиректа
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
        {step === 1 && <RegisterForm onSuccess={handleRegistrationSuccess} />}
        {step === 2 && (
          <OtpVerification
            email={registeredEmail}
            onBack={() => setStep(1)}
            onSuccess={handleOtpSuccess} // 👈 Передаем новый проп
          />
        )}
        {step === 3 && authData && <RegistrationSuccess authData={authData} />}
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
