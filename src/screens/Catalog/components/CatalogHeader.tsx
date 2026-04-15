import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
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
}: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.headerContainer, { borderBottomColor: colors.border }]}
    >
      <TouchableOpacity
        style={[styles.dateInput, { backgroundColor: colors.surface }]}
        activeOpacity={0.8}
        onPress={onOpenCalendar}
      >
        <Text
          style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "500" }}
        >
          {startDate && endDate
            ? `${startDate} - ${endDate}`
            : t("select_dates", "Выберите даты")}
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
    borderBottomWidth: 1,
    paddingBottom: 12,
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
