import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import NewsScreen from "@/src/screens/News/NewsScreen"; // Наш люксовый экран

export default function NewsPage() {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("drawer_news", "Новости"),
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          // Кнопка открытия нашего кастомного Drawer (справа)
          headerRight: () => (
            <DrawerToggleButton tintColor={colors.textPrimary} />
          ),
        }}
      />
      <NewsScreen />
    </>
  );
}
