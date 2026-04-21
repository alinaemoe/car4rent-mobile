import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

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
  const { t } = useTranslation();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("checkout.select_date", "Выберите дату");
    const d = new Date(dateString);
    return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}, ${d.getFullYear()} в 12:00`;
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
