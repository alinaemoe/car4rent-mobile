import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter, Href } from "expo-router";

// Наши хуки и утилиты
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { logout, selectIsLessor } from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";
import { axiosInstance } from "@/src/api/axios-instance";

function CustomDrawerContent(props: any) {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isGuest = useAppSelector((state) => state.auth?.isGuest ?? false);
  const isLessor = useAppSelector(selectIsLessor);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Пытаемся разлогинить юзера на бэкенде (чтобы убить refresh-токен в базе)
      if (!isGuest) {
        await axiosInstance.post("/auth/logout");
      }
    } catch (error: any) {
      // 2. Игнорируем ошибку 401. Если он уже "не авторизован", то и логаут на бэке не нужен.
      if (error.response?.status !== 401) {
        console.warn("Ошибка при логауте на бэке:", error.message);
      }
    } finally {
      // 3. Железно зачищаем всё на клиенте
      await storage.removeTokens();
      await storage.setGuestMode(false);
      queryClient.clear(); // Сносим кэш React Query (машины, заявки и тд)
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
        {!isGuest && !isLessor && (
          <TouchableOpacity
            style={styles.drawerBanner}
            onPress={() => router.push("/partner")}
          >
            <LinearGradient
              colors={[colors.accent, "#4facfe"]}
              style={styles.drawerGradient}
            >
              <Ionicons name="rocket-outline" size={20} color="#fff" />
              <Text style={styles.drawerBannerText}>Сдать свой автомобиль</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
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
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  drawerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  drawerBannerText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 14,
  },
});
