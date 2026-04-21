import React, { useState } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, Href } from "expo-router";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector, useAppDispatch } from "@/src/store";
import { logout } from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";
import { axiosInstance } from "@/src/api/axios-instance";

// Компоненты
import { ProfileHeader } from "./components/ProfileHeader";
import { VerificationBanner } from "./components/VerificationBanner";
import { MenuSection } from "./components/MenuSection";

export default function ProfileScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (!isGuest) await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.log("Logout backend error (ignored)");
    } finally {
      await storage.removeTokens();
      await storage.setGuestMode(false);
      dispatch(logout());
      setIsLoggingOut(false);
    }
  };

  // В реальном приложении мы бы брали docStatus из Redux (отдельный thunk или поле в User).
  // Пока мы симулируем это на основе is_verified (UNVERIFIED если фолс).
  const docStatus = isGuest
    ? "GUEST"
    : user?.is_verified
      ? "VERIFIED"
      : "UNVERIFIED";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. ШАПКА: Кто я? */}
      <ProfileHeader user={user} isGuest={isGuest} />

      {/* 2. БАННЕР ВЕРИФИКАЦИИ */}
      <View style={styles.bannerContainer}>
        <VerificationBanner
          status={docStatus}
          onPress={() => router.push("/(drawer)/upload-docs" as Href)} // Сделаем этот экран позже
        />
      </View>

      {/* 3. НАВИГАЦИЯ: Сгруппированная (Islands) */}
      {!isGuest && (
        <MenuSection
          title="Аккаунт"
          items={[
            {
              icon: "person-outline",
              title: "Личные данные",
              onPress: () => {},
            },
            {
              icon: "shield-checkmark-outline",
              title: "Безопасность",
              onPress: () => {},
            },
            {
              icon: "document-text-outline",
              title: "Мои документы",
              onPress: () => {},
            },
          ]}
        />
      )}

      <MenuSection
        title="Приложение"
        items={[
          { icon: "heart-outline", title: "Избранные авто", onPress: () => {} },
          {
            icon: "color-palette-outline",
            title: "Оформление",
            value: "Системное",
            onPress: () => {},
          },
          {
            icon: "language-outline",
            title: "Язык",
            value: "Русский",
            onPress: () => {},
          },
        ]}
      />

      <MenuSection
        title="Помощь"
        items={[
          {
            icon: "help-circle-outline",
            title: "Частые вопросы (FAQ)",
            onPress: () => {},
          },
          {
            icon: "chatbubble-ellipses-outline",
            title: "Служба поддержки",
            onPress: () => {},
          },
        ]}
      />

      {/* 4. ОПАСНАЯ ЗОНА */}
      <MenuSection
        title=" "
        items={[
          {
            icon: isGuest ? "log-in-outline" : "log-out-outline",
            title: isGuest
              ? "Войти или Зарегистрироваться"
              : "Выйти из аккаунта",
            iconColor: isGuest ? colors.accent : colors.error,
            titleColor: isGuest ? colors.accent : colors.error,
            onPress: handleLogout,
            rightComponent: isLoggingOut ? (
              <ActivityIndicator color={colors.error} />
            ) : undefined,
            hideChevron: true,
          },
        ]}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  bannerContainer: {
    marginBottom: 24,
  },
});
