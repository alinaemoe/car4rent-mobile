import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface CatalogHeaderProps {
  startDate: string | null;
  endDate: string | null;
  onOpenCalendar: () => void;
  onOpenFilters: () => void;
}

export const CatalogHeader = ({
  startDate,
  endDate,
  onOpenCalendar,
  onOpenFilters,
}: CatalogHeaderProps) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  // Функция для сборки красивого текста с вложенными стилями
  const renderDateRange = () => {
    if (!startDate) return <Text>{t("select_dates")}</Text>;

    const startD = new Date(startDate);
    const startMonth = t(`months_short_${startD.getMonth()}`);
    const startDay = startD.getDate();
    const startStr = `${startMonth} ${startDay}`; // "Апр 30"

    // Если выбрали только первую дату
    if (startDate && !endDate) {
      return <Text>{startStr} - ...</Text>;
    }

    // Если выбрали обе даты
    if (startDate && endDate) {
      const endD = new Date(endDate);
      const endMonth = t(`months_short_${endD.getMonth()}`);
      const endDay = endD.getDate();
      const endStr = `${endMonth} ${endDay}`; // "Мая 9"

      const diffTime = Math.abs(endD.getTime() - startD.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const count = diffDays === 0 ? 1 : diffDays;

      const daysStr = t("days_count", { count }); // "9 суток"

      // ВОТ ЗДЕСЬ МАГИЯ: Оборачиваем "сутки" в отдельный <Text> с цветом textSecondary
      return (
        <Text>
          {startStr} - {endStr}
          <Text style={{ color: colors.textSecondary, fontWeight: "400" }}>
            {`, ${daysStr}`}
          </Text>
        </Text>
      );
    }

    return <Text>{t("select_dates")}</Text>;
  };

  return (
    <View
      style={[
        styles.headerContainer,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingBottom: 12,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.dateInput, { backgroundColor: colors.surface }]}
        activeOpacity={0.8}
        onPress={onOpenCalendar}
      >
        <Text
          style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "500" }}
        >
          {renderDateRange()}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.accent} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.filterBtn, { backgroundColor: colors.surface }]}
        onPress={onOpenFilters}
        activeOpacity={0.8}
      >
        <Ionicons name="options-outline" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  dateInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
});
