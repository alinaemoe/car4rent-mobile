import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { axiosInstance } from "@/src/api/axios-instance";
import { AlertDialog } from "@/src/components/Alert";
import { Toast } from "@/src/components/Toast";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import {
  logout,
  selectIsLessor,
  updateUser,
} from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";
import { LessorBanner } from "./components/LessorBanner";

// Компоненты
import { MenuSection } from "./components/MenuSection";
import { ProfileHeader } from "./components/ProfileHeader";
import { DocStatus, VerificationBanner } from "./components/VerificationBanner";

export default function ProfileScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const user = useAppSelector((state) => state.auth.user);
  const isLessor = useAppSelector(selectIsLessor);
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Гостю профиль не обновляем, чтобы не ловить 401 ошибку
      if (isGuest) return;

      const fetchFreshProfile = async () => {
        try {
          const response = await axiosInstance.get("/users/profile");
          // Закидываем свежие данные (включая массив documents) в Redux
          dispatch(updateUser(response.data));
        } catch (error) {
          console.log("Не удалось обновить профиль в фоне", error);
        }
      };

      fetchFreshProfile();
    }, [isGuest, dispatch]),
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (!isGuest) {
        await axiosInstance.post("/auth/logout");
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.warn("Logout backend error:", error.message);
      }
    } finally {
      await storage.removeTokens();
      await storage.setGuestMode(false);

      queryClient.clear();

      dispatch(logout());
      setIsLoggingOut(false);
    }
  };

  const handleLogoutPress = () => {
    if (isGuest) {
      handleLogout();
      return;
    }
    AlertDialog.alert(
      t("profile.logout_title", "Выход из аккаунта"),
      t("profile.logout_msg", "Вы уверены, что хотите выйти? Все активные сеансы будут завершены."),
      [
        {
          text: t("profile.logout_cancel", "Отмена"),
          style: "cancel",
        },
        {
          text: t("profile.logout_confirm", "Выйти"),
          style: "destructive",
          onPress: handleLogout,
        },
      ],
    );
  };

  const handletoast = async () => {
    Toast.error(
      t("profile.updated_title", "Профиль обновлен"),
      t("profile.updated_msg", "Ваши данные успешно сохранены."),
    );
  };

  const getDocStatus = (): DocStatus => {
    if (isGuest) return "GUEST";
    if (user?.is_documents_verified) return "VERIFIED";

    if (user?.documents && user.documents.length > 0) {
      // 1. Если хотя бы один документ отклонен — трубим тревогу (REJECTED)
      const hasRejected = user.documents.some((d) => d.status === "REJECTED");
      if (hasRejected) return "REJECTED";

      // 2. Проверяем, загружены ли ОБА обязательных документа
      const hasPassport = user.documents.some((d) => d.type === "PASSPORT");
      const hasLicense = user.documents.some(
        (d) => d.type === "DRIVER_LICENSE",
      );

      // Если оба загружены и нет отклоненных -> значит они на проверке (PENDING)
      if (hasPassport && hasLicense) return "PENDING";

      // Если загружен только один (например, паспорт), то верификация еще не закончена
      return "UNVERIFIED";
    }

    return "UNVERIFIED";
  };

  const docStatus = getDocStatus();

  // В реальном приложении мы бы брали docStatus из Redux (отдельный thunk или поле в User).
  // Пока мы симулируем это на основе is_verified (UNVERIFIED если фолс).

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
      {!isGuest && !isLessor && (
        <View style={styles.bannerContainer}>
          <LessorBanner onPress={() => router.push("/partner")} />
        </View>
      )}

      {/* 3. НАВИГАЦИЯ: Сгруппированная (Islands) */}
      {!isGuest && (
        <MenuSection
          title={t("profile.menu_account", "Аккаунт")}
          items={[
            {
              icon: "person-outline",
              title: t("profile.menu_personal_data", "Личные данные"),
              onPress: () => router.push("/settings/personal-data"),
            },
            {
              icon: "shield-checkmark-outline",
              title: t("profile.menu_security", "Безопасность"),
              onPress: () => router.push("/settings/security"),
            },
            {
              icon: "document-text-outline",
              title: t("profile.menu_documents", "Мои документы"),
              // Просто пушим на этот же экран, но без параметра from="registration"
              onPress: () => router.push("/(drawer)/upload-docs"),
            },
          ]}
        />
      )}

      <MenuSection
        title={t("profile.menu_app", "Приложение")}
        items={[
          {
            icon: "heart-outline",
            title: t("profile.menu_favorites", "Избранные авто"),
            onPress: () => {
              // 👇 Переходим на экран каталога и прокидываем параметр
              // Если твой каталог лежит в корне табов, то pathname: "/"
              router.push({
                pathname: "/", // или "/(drawer)/(tabs)" в зависимости от роутера
                params: { showFavorites: "true" },
              });
            },
          },
          {
            icon: "color-palette-outline",
            title: t("profile.menu_theme", "Оформление"),
            onPress: () => router.push("/settings/theme"), // 👈 Проваливаемся
          },
          {
            icon: "language-outline",
            title: t("profile.menu_language", "Язык"),
            onPress: () => router.push("/settings/language"), // 👈 Проваливаемся
          },
        ]}
      />

      <MenuSection
        title={t("profile.menu_help", "Помощь")}
        items={[
          {
            icon: "help-circle-outline",
            title: t("profile.menu_faq", "Частые вопросы (FAQ)"),
            onPress: () => router.push("/settings/faq"),
          },
          {
            icon: "chatbubble-ellipses-outline",
            title: t("profile.menu_support", "Служба поддержки"),
            onPress: () => router.push("/settings/support"),
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
              ? t("profile.menu_login", "Войти или Зарегистрироваться")
              : t("profile.menu_logout", "Выйти из аккаунта"),
            iconColor: isGuest ? colors.accent : colors.error,
            titleColor: isGuest ? colors.accent : colors.error,
            onPress: handleLogoutPress,
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
