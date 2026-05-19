import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Toast } from "@/src/components/Toast";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export default function SupportScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();

  const handleOpenTelegram = async () => {
    const url = "https://t.me/ddiwow";
    try {
      await Linking.openURL(url);
    } catch (error) {
      Toast.error(
        t("common.error", "Ошибка"),
        t("support.err_telegram", "Не удалось открыть Telegram."),
      );
    }
  };

  const handleCall = async () => {
    const url = "tel:+79991234567";
    try {
      await Linking.openURL(url);
    } catch (error) {
      Toast.error(
        t("common.error", "Ошибка"),
        t("support.err_calls", "Ваше устройство не поддерживает звонки."),
      );
    }
  };

  const handleEmail = async () => {
    const email = "support@car4rent.com";
    const subject = "Помощь с приложением Car4Rent";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      Toast.error(
        t("common.error", "Ошибка"),
        t("support.err_email", "Не удалось открыть почтовый клиент."),
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === 1. ГЛАВНЫЙ БЛОК ПРИВЕТСТВИЯ (Hero Section) === */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.heroIconBox,
              { backgroundColor: `${colors.accent}15` },
            ]}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color={colors.accent}
            />
          </View>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            {t("support.title", "Мы всегда на связи")}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {t(
              "support.subtitle",
              "Выберите удобный способ общения. Наша команда готова помочь вам с любым вопросом.",
            )}
          </Text>
        </View>

        {/* === 2. КАРТОЧКИ СВЯЗИ (Action Hub) === */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t("support.contact_methods", "Способы связи")}
        </Text>
        <View style={[styles.island, { backgroundColor: colors.surface }]}>
          {/* Telegram */}
          <TouchableOpacity
            style={[
              styles.actionRow,
              { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
            ]}
            onPress={handleOpenTelegram}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#0088cc15" }]}>
                <Ionicons
                  name="paper-plane-outline"
                  size={22}
                  color="#0088cc"
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.actionTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  Telegram
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {t("support.tg_hint", "Отвечаем за 2 минуты")}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>

          {/* Телефон */}
          <TouchableOpacity
            style={[
              styles.actionRow,
              { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
            ]}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${colors.success}15` },
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={22}
                  color={colors.success}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.actionTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {t("support.phone", "Позвонить нам")}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  +7 (999) 123-45-67
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${colors.warning}15` },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={colors.warning}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.actionTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {t("support.email", "Написать на почту")}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  support@car4rent.com
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>

        {/* === 3. ГРАФИК РАБОТЫ (Изящный текст) === */}
        <View style={styles.workHoursContainer}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.workHoursText, { color: colors.textSecondary }]}>
            {t(
              "support.working_hours",
              "Служба поддержки работает с 9:00 до 21:00 по МСК",
            )}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },

  // --- Hero Section ---
  heroSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 16,
  },
  heroIconBox: {
    width: 96,
    height: 96,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
  },

  // --- Карточки связи (Islands) ---
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 12,
  },
  island: {
    borderRadius: 20,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 76,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },

  // --- График работы (Исцеленный) ---
  workHoursContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    paddingHorizontal: 20,
  },
  workHoursText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});
