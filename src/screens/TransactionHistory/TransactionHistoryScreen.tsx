import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useLessorHistory } from "@/src/api/queries/useLessorFinances";

// Импорт компонентов
import { MonthSelector } from "./components/MonthSelector";
import { TransactionCard } from "./components/TransactionCard";

export default function TransactionHistoryScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Стейт выбранного месяца (по умолчанию текущий)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Передаем месяц (1-12) и год в хук.
  // getMonth() возвращает 0-11, поэтому прибавляем 1.
  const targetMonth = selectedDate.getMonth() + 1;
  const targetYear = selectedDate.getFullYear();

  const { data: transactions = [], isLoading } = useLessorHistory(
    targetMonth,
    targetYear,
  );

  // Хендлер переключения месяца (-1 назад, +1 вперед)
  const handleChangeMonth = (step: number) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + step);
      return newDate;
    });
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        // ШАПКА: Выбор месяца
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <MonthSelector
              currentDate={selectedDate}
              onChangeMonth={handleChangeMonth}
            />
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    marginBottom: 16,
  },
  emptyContainer: {
    paddingTop: 80,
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
