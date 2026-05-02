import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import PersonalDataScreen from "@/src/screens/Profile/PersonalDataScreen";

export default function PersonalDataPage() {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("profile.personal_data_title", "Личные данные"),
          headerBackTitle: t("back", "Назад"),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background }, // Делаем хедер в цвет фона экрана
          headerTintColor: colors.textPrimary,
        }}
      />
      <PersonalDataScreen />
    </>
  );
}
