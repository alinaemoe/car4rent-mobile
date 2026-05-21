import React from "react";
import { Stack } from "expo-router";
import NewsDetailScreen from "@/src/screens/News/NewsDetailScreen";

export default function NewsDetailRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: "fade", // 🔥 Та самая магия плавного растворения
        }}
      />
      <NewsDetailScreen />
    </>
  );
}
