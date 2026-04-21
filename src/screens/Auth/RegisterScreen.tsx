import React, { useState } from "react";
import { StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

import { RegisterForm } from "./components/RegisterForm";
import { OtpVerification } from "./components/OtpVerification";

export default function RegisterScreen() {
  const colors = useAppColors();

  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const handleRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email);
    setStep(2);
  };

  // 🔥 Тот же крутой диагональный градиент
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
        {step === 1 ? (
          <RegisterForm onSuccess={handleRegistrationSuccess} />
        ) : (
          <OtpVerification email={registeredEmail} onBack={() => setStep(1)} />
        )}
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
