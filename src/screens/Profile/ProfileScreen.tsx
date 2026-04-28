import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, Href } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector, useAppDispatch } from "@/src/store";
import {
  logout,
  updateUser,
  selectIsLessor,
} from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";
import { axiosInstance } from "@/src/api/axios-instance";
import { Toast } from "@/src/components/Toast";
import { LessorBanner } from "./components/LessorBanner";

// Компоненты
import { ProfileHeader } from "./components/ProfileHeader";
import { VerificationBanner, DocStatus } from "./components/VerificationBanner";
import { MenuSection } from "./components/MenuSection";

export default function ProfileScreen() {
  const colors = useAppColors();
  const router = useRouter();

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
      // 3. Игнорируем 401, чтобы не пугать юзера, если токен и так протух
      if (error.response?.status !== 401) {
        console.warn("Logout backend error:", error.message);
      }
    } finally {
      // 4. Очищаем всё: токены, флаг гостя, а главное — КЭШ React Query
      await storage.removeTokens();
      await storage.setGuestMode(false);

      queryClient.clear(); // 👈 ЭТО САМОЕ ВАЖНОЕ (очистит "Мои машины", "Заявки" и т.д.)

      dispatch(logout());
      setIsLoggingOut(false);
    }
  };

  const handletoast = async () => {
    Toast.error("Профиль обновлен", "Ваши данные успешно сохранены.");
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
            onPress: () => router.push("/settings/theme"), // 👈 Проваливаемся
          },
          {
            icon: "language-outline",
            title: "Язык",
            onPress: () => router.push("/settings/language"), // 👈 Проваливаемся
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
            onPress: handletoast,
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
