import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  currentDate: Date;
  onChangeMonth: (step: number) => void;
}

export const MonthSelector = ({ currentDate, onChangeMonth }: Props) => {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();

  // Форматируем: "Май 2026"
  const monthName = new Intl.DateTimeFormat(i18n.language || "ru", {
    month: "long",
  }).format(currentDate);
  const formattedDate = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${currentDate.getFullYear()}`;

  // Проверка: не даем листать в будущее (позже текущего месяца)
  const now = new Date();
  const isFuture =
    currentDate.getMonth() >= now.getMonth() &&
    currentDate.getFullYear() >= now.getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        onPress={() => onChangeMonth(-1)}
        style={[styles.button, { backgroundColor: colors.background }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={colors.accent}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
          {formattedDate}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onChangeMonth(1)}
        disabled={isFuture}
        style={[
          styles.button,
          { backgroundColor: colors.background, opacity: isFuture ? 0.3 : 1 },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
