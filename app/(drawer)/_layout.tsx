import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Наши хуки и утилиты
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { logout, selectIsLessor } from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";
import { axiosInstance } from "@/src/api/axios-instance";

// 1. СОЗДАЕМ КАСТОМНОЕ СОДЕРЖИМОЕ БОКОВОГО МЕНЮ
function CustomDrawerContent(props: any) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Говорим бэкенду "забудь мой refresh токен"
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Ошибка при логауте на бэке:", error);
      // Даже если бэк недоступен (нет интернета), мы всё равно продолжаем логаут локально!
    } finally {
      // 2. Сносим оба токена из хранилища телефона
      await storage.removeTokens();
      // 3. Выкидываем юзера из Redux (роутер сразу поймает это и кинет на экран логина)
      dispatch(logout());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Верхняя часть меню: стандартный список экранов (Новости, FAQ и тд) */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Нижняя часть меню: Кнопка "Выйти", прижатая к низу */}
      <View
        style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          {isLoggingOut ? (
            <ActivityIndicator
              color={colors.error}
              style={{ marginRight: 15 }}
            />
          ) : (
            <Ionicons
              name="log-out-outline"
              size={24}
              color={colors.error}
              style={{ marginRight: 15 }}
            />
          )}
          <Text
            style={{ color: colors.error, fontSize: 16, fontWeight: "600" }}
          >
            {t("drawer_logout", "Выйти")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 2. ГЛАВНЫЙ КОМПОНЕНТ РАЗМЕТКИ
export default function DrawerLayout() {
  const colors = useAppColors();
  const { t } = useTranslation();
  const isLessor = useAppSelector(selectIsLessor);

  return (
    <Drawer
      // 👇 Подключаем наш кастомный компонент
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerType: "front",
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 300,
        },
        drawerActiveTintColor: colors.accent,
        drawerInactiveTintColor: colors.textPrimary,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: t("drawer_home", "Главная"),
          drawerItemStyle: { display: "none" }, // Прячем табы из самого бокового меню
        }}
      />
      <Drawer.Screen
        name="news"
        options={{ title: t("drawer_news", "Новости") }}
      />
      <Drawer.Screen
        name="faq"
        options={{ title: t("drawer_faq", "Частые вопросы (FAQ)") }}
      />
      <Drawer.Screen
        name="partner"
        options={{ title: t("drawer_partner", "Стать партнером") }}
      />
      {isLessor && (
        <Drawer.Screen name="my-fleet" options={{ title: "Мой автопарк" }} />
      )}
    </Drawer>
  );
}
