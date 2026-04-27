import React from "react";
import { Stack } from "expo-router";
// Заглушка, сам экран сверстаем в следующем шаге
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

import TransactionHistoryScreen from "@/src/screens/TransactionHistory/TransactionHistoryScreen";

export default function TransactionHistoryPage() {
  const colors = useAppColors();
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "История выплат",
          headerBackTitle: "Назад", // Для iOS
          headerShadowVisible: false, // Убираем полоску под хедером для красоты
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />
      <TransactionHistoryScreen />
    </>
  );
}
