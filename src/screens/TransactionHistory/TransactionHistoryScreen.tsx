import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
// 👇 Используем SafeAreaView
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useLessorHistory } from "@/src/api/queries/useLessorFinances";

// Импорт компонентов
import { MonthSelector } from "./components/MonthSelector";
import { TransactionCard } from "./components/TransactionCard";
import { EarningsChart } from "./components/EarningsChart";
import { CarsIncomeChart } from "./components/CarsIncomeChart";

export default function TransactionHistoryScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  const CHARTS = [
    { id: "INCOME", title: t("finance.income_dynamics", "Динамика дохода") },
    { id: "CARS", title: t("finance.income_by_cars", "Доход по машинам") },
  ];

  const targetMonth = selectedDate.getMonth() + 1;
  const targetYear = selectedDate.getFullYear();

  const { data: transactions = [], isLoading } = useLessorHistory(
    targetMonth,
    targetYear,
  );

  const hasTransactions = transactions.length > 0;

  const handleChangeMonth = (step: number) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + step);
      return newDate;
    });
  };

  const handlePrevChart = () => {
    setActiveChartIndex((prev) => (prev === 0 ? CHARTS.length - 1 : prev - 1));
  };
  const handleNextChart = () => {
    setActiveChartIndex((prev) => (prev === CHARTS.length - 1 ? 0 : prev + 1));
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          {t("finance.empty_title", "Нет поступлений")}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {t(
            "finance.empty_subtitle",
            "В этом месяце у вас еще не было завершенных аренд.",
          )}
        </Text>
      </View>
    );
  };

  return (
    // 👇 Оборачиваем в SafeAreaView. Если хедер Expo включен, используем только bottom
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        // Убираем insets.bottom отсюда, так как SafeAreaView уже заботится об этом
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Селектор месяца */}
            <MonthSelector
              currentDate={selectedDate}
              onChangeMonth={handleChangeMonth}
            />

            {/* БЛОК ГРАФИКОВ */}
            {!isLoading && hasTransactions && (
              <View style={styles.chartSection}>
                {/* Карусель заголовков */}
                <View style={styles.chartHeaderRow}>
                  <TouchableOpacity
                    onPress={handlePrevChart}
                    style={[
                      styles.arrowButton,
                      { backgroundColor: colors.surface },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>

                  <Text
                    style={[styles.chartTitle, { color: colors.textPrimary }]}
                  >
                    {CHARTS[activeChartIndex].title}
                  </Text>

                  <TouchableOpacity
                    onPress={handleNextChart}
                    style={[
                      styles.arrowButton,
                      { backgroundColor: colors.surface },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Рендер нужного графика */}
                {activeChartIndex === 0 ? (
                  <EarningsChart
                    transactions={transactions}
                    selectedDate={selectedDate}
                  />
                ) : (
                  <CarsIncomeChart
                    transactions={transactions}
                    selectedDate={selectedDate}
                  />
                )}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    marginBottom: 16,
  },
  // --- CHART SECTION ---
  chartSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderChart: {
    height: 180,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  // --- EMPTY STATES ---
  emptyContainer: {
    paddingTop: 40,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
