import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  startDate: string | null;
  endDate: string | null;
  destination: string;
  setDestination: (val: string) => void;
}

export const CheckoutForm = ({
  startDate,
  endDate,
  destination,
  setDestination,
}: Props) => {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("checkout.select_date", "Выберите дату");
    const d = new Date(dateString);

    // Форматируем саму дату (например: "12 апреля 2026 г.")
    const formattedDate = new Intl.DateTimeFormat(i18n.language || "ru", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);

    // Оборачиваем дату и время в t(), чтобы перевести предлог "в" (в англ. будет "at 12:00")
    return t("checkout.date_at_time", {
      defaultValue: "{{date}} в 12:00",
      date: formattedDate,
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={[styles.grayContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {formatDate(startDate)}
          </Text>
        </View>

        <View
          style={[styles.innerDivider, { backgroundColor: colors.border }]}
        />

        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {formatDate(endDate)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.grayContainer,
          {
            backgroundColor: colors.surface,
            marginTop: 12,
            paddingVertical: 4,
          },
        ]}
      >
        <View style={styles.dateRow}>
          <Ionicons
            name="paper-plane-outline"
            size={22}
            color={colors.textSecondary}
            style={[styles.inputIcon, { transform: [{ rotate: "-45deg" }] }]}
          />
          <TextInput
            placeholder={t("checkout.destination", "Куда едете?")}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.textPrimary }]}
            value={destination}
            onChangeText={setDestination}
            returnKeyType="done"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  grayContainer: { borderRadius: 12, paddingHorizontal: 16 },
  dateRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  inputIcon: { marginRight: 16 },
  dateText: { fontSize: 16, fontWeight: "400" },
  innerDivider: { height: 1, marginLeft: 38 },
  input: { flex: 1, fontSize: 16, padding: 0 },
});
