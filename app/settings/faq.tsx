import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import FaqScreen from "@/src/screens/Profile/FaqScreen";

export default function FaqPage() {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("faq.header", "FAQ"),
          headerBackTitle: t("back", "Назад"),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
        }}
      />
      <FaqScreen />
    </>
  );
}
