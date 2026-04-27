import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import CarStatsScreen from "@/src/screens/CarStats/CarStatsScreen";

// 👇 1. Импортируем наш хук цветов
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export default function CarStatsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useAppColors(); // 👇 2. Инициализируем

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Статистика авто",
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
