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

function CustomDrawerContent(props: any) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isGuest = useAppSelector((state) => state.auth?.isGuest ?? false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 👇 2. Делаем запрос на логаут ТОЛЬКО если это реальный юзер
      if (!isGuest) {
        await axiosInstance.post("/auth/logout");
      }
    } catch (error) {
      console.error("Ошибка при логауте на бэке:", error);
    } finally {
      // 3. В любом случае (и для юзера, и для гостя) чистим хранилища
      await storage.removeTokens();
      await storage.setGuestMode(false); // На всякий случай зачищаем флаг гостя в памяти
      dispatch(logout()); // Выкидывает на экран авторизации
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

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

export default function DrawerLayout() {
  const colors = useAppColors();
  const { t } = useTranslation();
  const isLessor = useAppSelector(selectIsLessor);

  return (
    <Drawer
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
          drawerItemStyle: { display: "none" },
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
      {/* 👇 ПРАВИЛЬНОЕ СКРЫТИЕ ЭКРАНА */}
      <Drawer.Screen
        name="my-fleet"
        options={{
          title: "Мой автопарк",
          drawerItemStyle: { display: isLessor ? "flex" : "none" },
        }}
      />
    </Drawer>
  );
}
