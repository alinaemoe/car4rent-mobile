import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"; // 👇 Добавляем это
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import TransactionHistoryScreen from "@/src/screens/TransactionHistory/TransactionHistoryScreen";

export default function TransactionHistoryPage() {
  const colors = useAppColors();

  return (
    <>
      {/* 👇 Это заставит системные иконки (время, батарея) 
         автоматически менять цвет (белый/черный) под тему 
      */}
      <StatusBar style="auto" />

      <Stack.Screen
        options={{
          headerShown: true,
          title: "История выплат",
          headerBackTitle: "Назад",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />
      <TransactionHistoryScreen />
    </>
  );
}
