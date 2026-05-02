import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import SupportScreen from "@/src/screens/Profile/SupportScreen";

export default function SupportPage() {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("profile.support", "Служба поддержки"),
          headerBackTitle: t("back", "Назад"),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
        }}
      />
      <SupportScreen />
    </>
  );
}
