import CarStatsScreen from "@/src/screens/CarStats/CarStatsScreen";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

// 👇 1. Импортируем наш хук цветов
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useTranslation } from "react-i18next";

export default function CarStatsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useAppColors(); // 👇 2. Инициализируем
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("stats.header_title", "Статистика авто"),
          headerBackTitle: "Назад",
          headerShadowVisible: false,

          // 👇 3. Красим хедер в цвет темы!
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />
      <CarStatsScreen carId={Number(id)} />
    </>
  );
}
