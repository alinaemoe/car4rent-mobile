import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Toast } from "@/src/components/Toast";

export default function SecurityScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();

  // Стейт для полноэкранной модалки
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  // Стейты инпутов
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Независимые стейты для каждого "глазика"
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isPasswordValid =
    oldPassword.length >= 6 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

  const handleOpenPasswordModal = () => setPasswordModalVisible(true);

  const handleClosePasswordModal = () => {
    setPasswordModalVisible(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleChangePassword = () => {
    if (!isPasswordValid) return;
    console.log("Отправка на бэк: POST /auth/change-password");
    handleClosePasswordModal();
    Toast.success("Успешно", "Ваш пароль был изменен.");
  };

  const handleTerminateSessions = () => {
    Alert.alert(
      t("security.terminate_title", "Завершить другие сеансы?"),
      t(
        "security.terminate_msg",
        "Вы выйдете из аккаунта на всех остальных устройствах, кроме этого.",
      ),
      [
        { text: t("common.cancel", "Отмена"), style: "cancel" },
        {
          text: t("common.terminate", "Завершить"),
          style: "destructive",
          onPress: () =>
            Toast.success("Сеансы завершены", "Вы вышли с других устройств."),
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("security.delete_title", "Удаление аккаунта"),
      t(
        "security.delete_msg",
        "Это действие необратимо. Ваши данные будут скрыты из системы. Продолжить?",
      ),
      [
        { text: t("common.cancel", "Отмена"), style: "cancel" },
        {
          text: t("common.delete", "Удалить"),
          style: "destructive",
          onPress: () =>
            Toast.error("Аккаунт удален", "Жаль с вами расставаться 😢"),
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === 1. ДОСТУП === */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t("security.access", "Вход в приложение")}
        </Text>
        <View style={[styles.island, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleOpenPasswordModal}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.iconBox, { backgroundColor: colors.background }]}
              >
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={colors.textPrimary}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.actionTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {t("security.password", "Пароль")}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {t("security.last_changed", "Обновлен: 12 мая")}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>

        {/* === 2. АКТИВНЫЕ СЕАНСЫ === */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textSecondary, marginTop: 32 },
          ]}
        >
          {t("security.sessions", "Активные сеансы")}
        </Text>
        <View style={[styles.island, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.actionRow,
              { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
            ]}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.iconBox, { backgroundColor: colors.background }]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={colors.textPrimary}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.actionTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  iPhone 14 Pro
                </Text>
                <View style={styles.sessionStatus}>
                  <View
                    style={[
                      styles.onlineDot,
                      { backgroundColor: colors.success },
                    ]}
                  />
                  <Text
                    style={[styles.actionSubtitle, { color: colors.success }]}
                    numberOfLines={1}
                  >
                    {t(
                      "security.current_session",
                      "Текущее устройство · Москва",
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <View
                style={[styles.iconBox, { backgroundColor: colors.background }]}
              >
                <Ionicons
                  name="laptop-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.actionTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  MacBook Air (Web)
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {t("security.last_active", "12 мая · Санкт-Петербург")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.terminateLink}
          onPress={handleTerminateSessions}
          activeOpacity={0.6}
        >
          <Text style={[styles.terminateLinkText, { color: colors.accent }]}>
            {t("security.logout_others", "Завершить другие сеансы")}
          </Text>
        </TouchableOpacity>

        {/* === 3. УПРАВЛЕНИЕ АККАУНТОМ === */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textSecondary, marginTop: 40 },
          ]}
        >
          {t("security.account_management", "Управление аккаунтом")}
        </Text>
        <View style={[styles.island, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.iconBox, { backgroundColor: colors.background }]}
              >
                <Ionicons
                  name="person-remove-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.actionTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {t("security.delete_account", "Удалить аккаунт")}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {t("security.delete_hint", "Все данные будут стерты")}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* === НАТИВНАЯ МОДАЛКА (Стиль Apple Settings) === */}
      <Modal
        visible={isPasswordModalVisible}
        animationType="slide"
        presentationStyle="pageSheet" // 🔥 На iOS делает красивую карточку, которая не перекрывает статус бар
        onRequestClose={handleClosePasswordModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.background }} // Фон всей модалки
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleClosePasswordModal}
              style={styles.headerBtn}
            >
              <Text
                style={[styles.headerBtnText, { color: colors.textSecondary }]}
              >
                {t("common.cancel", "Отмена")}
              </Text>
            </TouchableOpacity>

            <Text
              style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}
            >
              {t("security.change_password_title", "Смена пароля")}
            </Text>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={!isPasswordValid}
              style={styles.headerBtn}
            >
              <Text
                style={[
                  styles.headerBtnText,
                  {
                    color: colors.accent,
                    opacity: isPasswordValid ? 1 : 0.4,
                    fontWeight: "bold",
                  },
                ]}
              >
                {t("common.save", "Готово")}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Группа 1: Старый пароль */}
            <Text
              style={[styles.inputGroupTitle, { color: colors.textSecondary }]}
            >
              {t("security.old_password_label", "Текущий пароль")}
            </Text>
            <View
              style={[styles.inputGroup, { backgroundColor: colors.surface }]}
            >
              <View style={styles.groupedInputRow}>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder={t("security.old_password", "Старый пароль")}
                  placeholderTextColor={colors.border}
                  secureTextEntry={!showOld}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowOld(!showOld)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showOld ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Группа 2: Новый пароль */}
            <Text
              style={[
                styles.inputGroupTitle,
                { color: colors.textSecondary, marginTop: 24 },
              ]}
            >
              {t("security.new_password_label", "Новый пароль")}
            </Text>
            <View
              style={[styles.inputGroup, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.groupedInputRow,
                  { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
                ]}
              >
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder={t("security.new_password", "Новый пароль")} // 🔥 Короткий плейсхолдер
                  placeholderTextColor={colors.border}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNew ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.groupedInputRow}>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder={t(
                    "security.confirm_password",
                    "Повторите пароль",
                  )}
                  placeholderTextColor={colors.border}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 🔥 Требования вынесены в элегантный Hint Text внизу */}
            <Text
              style={[styles.inputGroupHint, { color: colors.textSecondary }]}
            >
              {t(
                "security.password_hint",
                "Пароль должен состоять минимум из 6 символов. Мы рекомендуем использовать буквы, цифры и специальные знаки.",
              )}
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... стили главного экрана остаются без изменений ...
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 60 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 12,
  },
  island: { borderRadius: 20, overflow: "hidden" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 76,
  },
  actionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: { flex: 1, paddingRight: 12, justifyContent: "center" },
  actionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  actionSubtitle: { fontSize: 13 },
  sessionStatus: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  terminateLink: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  terminateLinkText: { fontSize: 15, fontWeight: "600" },

  // === СТИЛИ НАТИВНОЙ МОДАЛКИ (В стиле настроек) ===
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: Platform.OS === "ios" ? 56 : 64,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  headerBtn: {
    paddingVertical: 8,
    minWidth: 70,
  },
  headerBtnText: {
    fontSize: 17,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  inputGroupTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 12,
  },
  inputGroup: {
    borderRadius: 14,
    overflow: "hidden",
  },
  groupedInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    minHeight: 52,
  },
  modalInput: {
    flex: 1,
    fontSize: 17,
    height: "100%",
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  inputGroupHint: {
    marginTop: 12,
    marginHorizontal: 12,
    fontSize: 13,
    lineHeight: 18,
  },
});
