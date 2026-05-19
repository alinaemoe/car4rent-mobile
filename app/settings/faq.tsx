import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import FaqScreen from "@/src/screens/Profile/FaqScreen";
import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function FaqPage() {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("faq.header", "FAQ"),
          headerBackTitle: t("common.back", "Назад"),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
        }}
      />
      <FaqScreen />
    </>
  );
}
