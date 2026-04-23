import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Href } from "expo-router";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch } from "@/src/store";
import { setCredentials } from "@/src/store/slices/authSlice";

interface Props {
  authData: {
    user: any;
    token: string;
  };
}

export const RegistrationSuccess = ({ authData }: Props) => {
  const colors = useAppColors();
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Вариант 1: Юзер хочет посмотреть машины
  const handleLater = () => {
    // Просто закидываем в Redux. Глобальный роутер увидит это и сам выкинет его в Каталог (Tabs).
    dispatch(setCredentials(authData));
  };

  // Вариант 2: Юзер готов грузить доки прямо сейчас
  const handleUploadNow = () => {
    // 1. Авторизуем его
    dispatch(setCredentials(authData));

    // 2. И сразу принудительно кидаем на экран загрузки доков.
    // Небольшой таймаут нужен, чтобы глобальный _layout успел отрендерить (drawer) группу
    setTimeout(() => {
      router.replace("/(drawer)/upload-docs" as Href);
    }, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View
          style={[styles.iconCircle, { backgroundColor: colors.successBg }]}
        >
          <Ionicons name="checkmark-outline" size={48} color={colors.success} />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Аккаунт создан!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Добро пожаловать в Car4Rent.{"\n"}
          Чтобы забронировать авто, нам понадобятся ваши документы (Паспорт и
          Права).
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          onPress={handleUploadNow}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Загрузить документы сейчас</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleLater}>
          <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>
            Позже, хочу посмотреть машины
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    width: "100%",
  },
  primaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  secondaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
