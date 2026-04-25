import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export default function CheckoutSuccessScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View
          style={[styles.iconCircle, { backgroundColor: colors.successBg }]}
        >
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t("checkout.success_title", "Бронь оформлена!")}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t(
            "checkout.success_desc",
            "Автомобиль успешно забронирован. Владелец скоро подтвердит вашу заявку. Вы можете отслеживать статус в разделе поездок.",
          )}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          onPress={() => {
            // Кидаем юзера в логическую вкладку "Мои поездки"
            // 👇 Замени на актуальный путь к табам, когда мы их создадим
            router.replace("/(drawer)/(tabs)/rentals");
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>
            {t("checkout.go_to_trips", "Перейти к поездкам")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/")}
        >
          <Text
            style={[styles.secondaryBtnText, { color: colors.textSecondary }]}
          >
            {t("common.back_to_home", "На главную")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  footer: { paddingBottom: 24 },
  primaryBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  secondaryBtn: { height: 56, justifyContent: "center", alignItems: "center" },
  secondaryBtnText: { fontSize: 16, fontWeight: "600" },
});
