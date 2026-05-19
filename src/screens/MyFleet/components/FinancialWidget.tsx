import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface FinancialWidgetProps {
  totalEarned: number;
  pendingPayout: number;
  month: number; // 1-12
  year: number;
  onMonthSelectPress: () => void;
  onWidgetPress: () => void;
  style?: ViewStyle;
}

export const FinancialWidget = ({
  totalEarned,
  pendingPayout,
  month,
  year,
  onMonthSelectPress,
  onWidgetPress,
  style,
}: FinancialWidgetProps) => {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();

  // Форматируем месяц с заглавной буквы
  const date = new Date(year, month - 1);
  const monthName = new Intl.DateTimeFormat(i18n.language || "ru", {
    month: "long",
  }).format(date);
  const formattedMonth = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(i18n.language || "ru", {
      style: "currency",
      currency: "BYN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onWidgetPress}
        style={[
          styles.shadowContainer,
          // Цвет тени зависит от темы
          { shadowColor: colors.widgetGradientStart },
        ]}
      >
        <LinearGradient
          colors={[colors.widgetGradientStart, colors.widgetGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {/* --- ВЕРХНЯЯ СТРОКА: Выбор месяца --- */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onMonthSelectPress}
              style={[
                styles.monthSelector,
                { backgroundColor: colors.widgetOverlay },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.monthText, { color: colors.widgetText }]}>
                {formattedMonth}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.widgetText}
                style={styles.chevron}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.arrowContainer,
                { backgroundColor: colors.widgetOverlay },
              ]}
            >
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.widgetText}
              />
            </View>
          </View>

          {/* --- СРЕДНЯЯ СТРОКА: Сумма --- */}
          <View style={styles.mainContent}>
            <Text style={[styles.label, { color: colors.widgetTextDim }]}>
              {t("fleet.earned", "Заработано")}
            </Text>
            <Text
              style={[styles.totalEarned, { color: colors.widgetText }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(totalEarned)}
            </Text>
          </View>

          {/* --- НИЖНЯЯ СТРОКА: В ожидании --- */}
          <View style={styles.footerRow}>
            <View
              style={[
                styles.pendingBadge,
                { backgroundColor: "rgba(0, 0, 0, 0.25)" },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.gold}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[styles.pendingLabel, { color: colors.widgetTextDim }]}
              >
                {t("fleet.pending", "Ожидает выплаты")}:
              </Text>
              <Text style={[styles.pendingAmount, { color: colors.gold }]}>
                {formatMoney(pendingPayout)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  shadowContainer: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  container: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  monthText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chevron: {
    marginLeft: 4,
    marginTop: 2,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalEarned: {
    fontSize: 36,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pendingLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginRight: 6,
  },
  pendingAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
});
