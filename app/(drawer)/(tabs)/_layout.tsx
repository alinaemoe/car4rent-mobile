import React from "react";
import { Tabs } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export default function TabLayout() {
  const colors = useAppColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Каталог",
          tabBarIcon: ({ color }) => (
            <Ionicons name="car-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Мои Брони",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      {/* Перехватываем клик и открываем дровер */}
      <Tabs.Screen
        name="_menu_dummy"
        options={{
          title: "Меню",
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu-outline" size={24} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault(); // Останавливаем обычный переход на экран
            navigation.dispatch(DrawerActions.openDrawer()); // Открываем боковое меню
          },
        })}
      />
    </Tabs>
  );
}
