import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import SecurityScreen from "@/src/screens/Profile/SecurityScreen";
import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function SecurityPage() {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("profile.security", "Безопасность"),
          headerBackTitle: t("common.back", "Назад"),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
        }}
      />
      <SecurityScreen />
    </>
  );
}
