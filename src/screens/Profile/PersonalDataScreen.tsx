import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Toast } from "@/src/components/Toast";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector } from "@/src/store";

export default function PersonalDataScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();

  const user = useAppSelector((state) => state.auth.user);

  // Локальные стейты
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");

  // 🔥 ВЫЧИСЛЯЕМ, ЕСТЬ ЛИ ИЗМЕНЕНИЯ (для блокировки кнопки)
  const hasChanges =
    firstName.trim() !== (user?.first_name || "") ||
    lastName.trim() !== (user?.last_name || "");

  const handleAvatarChange = () => {
    console.log("Открываем ImagePicker...");
    Toast.info(
      t("profile.photo_change_title", "Смена фото"),
      t("profile.photo_change_msg", "Загрузка фото скоро появится!"),
    );
  };

  const handleSave = () => {
    if (!hasChanges) return;

    console.log("Отправка на бэк: PATCH /users/profile", {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    });
    Toast.success(
      t("common.success", "Успешно"),
      t("profile.update_success", "Ваши данные обновлены."),
    );
  };

  const initial = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : "U";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* === 1. РОСКОШНЫЙ БЛОК АВАТАРА === */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarChange} activeOpacity={0.8}>
            <View
              style={[styles.avatarCircle, { backgroundColor: colors.accent }]}
            >
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>

            {/* 🔥 УВЕЛИЧЕННЫЙ И ЭКСПРЕССИВНЫЙ БЕЙДЖ КАМЕРЫ */}
            <View
              style={[
                styles.editBadge,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.background,
                },
              ]}
            >
              <Ionicons name="camera" size={20} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* === 2. РЕДАКТИРУЕМЫЕ ДАННЫЕ === */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t("profile.basic_info", "Основная информация")}
        </Text>
        <View style={[styles.island, { backgroundColor: colors.surface }]}>
          {/* Поле: Имя */}
          <View
            style={[
              styles.stackedInputContainer,
              { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
            ]}
          >
            <Text
              style={[styles.stackedLabel, { color: colors.textSecondary }]}
            >
              {t("profile.first_name", "Имя")}
            </Text>
            <TextInput
              style={[styles.stackedInput, { color: colors.textPrimary }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor={colors.border}
              placeholder={t(
                "profile.first_name_placeholder",
                "Введите ваше имя",
              )}
            />
          </View>

          {/* Поле: Фамилия */}
          <View style={styles.stackedInputContainer}>
            <Text
              style={[styles.stackedLabel, { color: colors.textSecondary }]}
            >
              {t("profile.last_name", "Фамилия")}
            </Text>
            <TextInput
              style={[styles.stackedInput, { color: colors.textPrimary }]}
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor={colors.border}
              placeholder={t(
                "profile.last_name_placeholder",
                "Введите вашу фамилию",
              )}
            />
          </View>
        </View>

        {/* === 3. ЗАБЛОКИРОВАННЫЕ ДАННЫЕ (Контакты) === */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textSecondary, marginTop: 28 },
          ]}
        >
          {t("profile.contacts", "Контакты")}
        </Text>
        <View style={[styles.island, { backgroundColor: colors.surface }]}>
          {/* Поле: Телефон */}
          <View
            style={[
              styles.stackedInputContainer,
              {
                borderBottomColor: colors.border,
                borderBottomWidth: 0.5,
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.stackedLabel, { color: colors.textSecondary }]}
              >
                {t("profile.phone", "Телефон")}
              </Text>
              <Text
                style={[styles.lockedText, { color: colors.textSecondary }]}
              >
                {user?.phone || "+7 (***) ***-**-**"}
              </Text>
            </View>
            {/* Дофаминовый замочек */}
            <View
              style={[
                styles.lockIconBox,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={18}
                color={colors.textSecondary}
              />
            </View>
          </View>

          {/* Поле: Email */}
          <View
            style={[
              styles.stackedInputContainer,
              { flexDirection: "row", alignItems: "center" },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.stackedLabel, { color: colors.textSecondary }]}
              >
                {t("profile.email", "Электронная почта")}
              </Text>
              <Text
                style={[styles.lockedText, { color: colors.textSecondary }]}
              >
                {user?.email || t("profile.not_specified", "Не указан")}
              </Text>
            </View>
            <View
              style={[
                styles.lockIconBox,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={18}
                color={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <Text style={[styles.lockedHint, { color: colors.textSecondary }]}>
          {t(
            "profile.locked_hint",
            "Телефон и почта привязаны к аккаунту в целях безопасности. Для их изменения обратитесь в поддержку.",
          )}
        </Text>
      </ScrollView>

      {/* === 4. УМНАЯ КНОПКА СОХРАНЕНИЯ === */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.accent,
              opacity: hasChanges ? 1 : 0.4, // 🔥 Делаем кнопку бледной, если нет изменений
            },
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={!hasChanges} // 🔥 Физически отключаем клик
        >
          <Text style={styles.saveButtonText}>
            {t("common.save", "Сохранить изменения")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 40,
  },

  // --- Аватар ---
  avatarSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  avatarCircle: {
    width: 100, // Сделали аватарку чуть больше (было 90)
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  editBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 36, // 🔥 Увеличили значок камеры (было 28)
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3, // Толстая рамка цвета фона, чтобы прорезать аватарку
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // --- Островки и Формы (Stacked Inputs) ---
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 12,
  },
  island: {
    borderRadius: 20, // Более скругленные, современные углы
    overflow: "hidden",
  },
  stackedInputContainer: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 72, // Даем больше воздуха
    justifyContent: "center",
  },
  stackedLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  stackedInput: {
    fontSize: 17, // Крупный, уверенный шрифт для ввода
    fontWeight: "600",
    padding: 0,
  },

  // --- Заблокированные поля ---
  lockedText: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 2,
  },
  lockIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedHint: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  // --- Футер и Кнопка ---
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 24,
    borderTopWidth: 0.5,
  },
  saveButton: {
    height: 54, // Массивная, удобная кнопка
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
