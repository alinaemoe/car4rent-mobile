import React from "react";
import { Drawer } from "expo-router/drawer";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export default function DrawerLayout() {
  const colors = useAppColors();

  return (
    <Drawer
      screenOptions={{
        headerShown: false, // Прячем хедер самого дровера (сделаем свой на экранах)
        drawerPosition: "right", // 👈 ВЫЕЗЖАЕТ СПРАВА
        drawerType: "front", // Наезжает поверх контента
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 300,
        },
        drawerActiveTintColor: colors.accent,
        drawerInactiveTintColor: colors.textPrimary,
      }}
    >
      {/* Главный экран внутри дровера — это наши табы! */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Главная",
          drawerItemStyle: { display: "none" }, // Прячем табы из самого бокового меню
        }}
      />
      <Drawer.Screen name="news" options={{ title: "Новости" }} />
      <Drawer.Screen name="faq" options={{ title: "Частые вопросы (FAQ)" }} />
      <Drawer.Screen name="partner" options={{ title: "Стать партнером" }} />
    </Drawer>
  );
}
