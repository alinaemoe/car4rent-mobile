import { TransactionHistoryItem } from "@/src/api/queries/useLessorFinances";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

interface Props {
  transactions: TransactionHistoryItem[];
  selectedDate: Date;
}

// Премиальная палитра цветов
const PIE_COLORS = [
  "#4facfe", // Голубой
  "#43e97b", // Зеленый
  "#fa709a", // Розовый
  "#fee140", // Желтый
  "#b224ef", // Фиолетовый
  "#f56b2a", // Оранжевый
  "#00f2fe", // Циан
  "#38f9d7", // Мятный
];

export const CarsIncomeChart = ({ transactions, selectedDate }: Props) => {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();

  // Стейт для выделенной дольки
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const { pieData, totalIncome, legendData } = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    let total = 0;
    const carsMap = new Map<number, { name: string; value: number }>();

    transactions.forEach((tx) => {
      if (tx.car && tx.lessor_income) {
        const txDate = new Date(tx.created_at);
        if (txDate.getMonth() === month && txDate.getFullYear() === year) {
          const uniqueKey =
            tx.car.license_plate || `${tx.car.brand}-${tx.car.model}`;

          const existing = carsMap.get(uniqueKey as any) || {
            name: `${tx.car.brand} ${tx.car.model}`,
            value: 0,
          };

          existing.value += Number(tx.lessor_income);
          total += Number(tx.lessor_income);

          carsMap.set(uniqueKey as any, existing);
        }
      }
    });

    const sortedCars = Array.from(carsMap.values()).sort(
      (a, b) => b.value - a.value,
    );

    const formattedLegend = sortedCars.map((car, index) => {
      const percentage = total > 0 ? Math.round((car.value / total) * 100) : 0;
      return {
        ...car,
        color: PIE_COLORS[index % PIE_COLORS.length],
        percentage,
      };
    });

    const formattedPieData = formattedLegend.map((car, index) => {
      return {
        value: car.value,
        color: car.color,
        // Если индекс совпадает со стейтом — долька "фокусируется" (выдвигается)
        focused: focusedIndex === index,
      };
    });

    return {
      pieData: formattedPieData,
      totalIncome: total,
      legendData: formattedLegend,
    };
  }, [transactions, selectedDate, focusedIndex]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(i18n.language || "ru", {
      // 👈 Динамическая локаль
      style: "currency",
      currency: "BYN",
      maximumFractionDigits: 0,
    }).format(amount);

  if (totalIncome === 0 || pieData.length === 0) {
    return (
      <View style={[styles.chartWrapper, { backgroundColor: colors.surface }]}>
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("finance.no_data_cars", "Нет данных по машинам за этот месяц")}
          </Text>
        </View>
      </View>
    );
  }

  // Рендер центрального текста (Динамический Тултип!)
  const renderCenterLabel = () => {
    // Если есть выделенная долька
    if (focusedIndex !== null && legendData[focusedIndex]) {
      const selected = legendData[focusedIndex];
      return (
        <View style={styles.centerLabel}>
          <Text
            style={[styles.centerLabelValue, { color: colors.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatMoney(selected.value)}
          </Text>
          <Text
            style={[styles.centerLabelText, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {selected.name}
          </Text>
          {/* Маленький яркий процент под названием */}
          <View
            style={[
              styles.percentBadge,
              { backgroundColor: selected.color + "20" },
            ]}
          >
            <Text style={[styles.percentText, { color: selected.color }]}>
              {selected.percentage}%
            </Text>
          </View>
        </View>
      );
    }

    // По умолчанию (если ничего не выбрано)
    return (
      <View style={styles.centerLabel}>
        <Text
          style={[styles.centerLabelValue, { color: colors.textPrimary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatMoney(totalIncome)}
        </Text>
        <Text style={[styles.centerLabelText, { color: colors.textSecondary }]}>
          {t("finance.total", "Итого")}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.chartWrapper, { backgroundColor: colors.surface }]}>
      {/* САМ ГРАФИК */}
      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          donut
          radius={100}
          innerRadius={70} // Чуть увеличили дырку бублика, чтобы влез текст
          innerCircleColor={colors.surface}
          centerLabelComponent={renderCenterLabel}
          isAnimated
          animationDuration={800}
          // Включаем интерактивность по клику
          focusOnPress
          // Перехватываем клик для изменения центрального текста
          onPress={(item: any, index: number) => {
            // Если кликнули на ту же дольку — снимаем фокус
            setFocusedIndex(focusedIndex === index ? null : index);
          }}
        />
      </View>

      {/* ЛЕГЕНДА (Список машин) */}
      <View style={styles.legendContainer}>
        {legendData.map((item, index) => {
          // Если есть фокус, приглушаем невыбранные элементы легенды
          const isFaded = focusedIndex !== null && focusedIndex !== index;

          return (
            <View
              key={index}
              style={[styles.legendRow, { opacity: isFaded ? 0.4 : 1 }]}
            >
              <View style={styles.legendLeft}>
                <View
                  style={[styles.colorDot, { backgroundColor: item.color }]}
                />
                <Text
                  style={[styles.legendName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.legendPercent,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.percentage}%
                </Text>
              </View>
              <Text style={[styles.legendValue, { color: colors.textPrimary }]}>
                {formatMoney(item.value)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyChart: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  // --- Стили Центрального Текста ---
  centerLabel: {
    justifyContent: "center",
    alignItems: "center",
    width: 110, // Ограничиваем, чтобы текст не наезжал на сам бублик
  },
  centerLabelValue: {
    fontSize: 18,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  centerLabelText: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  percentBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  percentText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  // --- Стили Легенды ---
  legendContainer: {
    width: "100%",
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendName: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  legendPercent: {
    fontSize: 13,
    marginLeft: 8,
    fontWeight: "500",
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
});
