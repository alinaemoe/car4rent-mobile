import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { TransactionHistoryItem } from "@/src/api/queries/useLessorFinances";

interface Props {
  transactions: TransactionHistoryItem[];
  selectedDate: Date;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const EarningsChart = ({ transactions, selectedDate }: Props) => {
  const colors = useAppColors();

  const { chartData, yAxisLabels, maxValue, totalIncome, noOfSections } =
    useMemo(() => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const dailyIncome = new Array(daysInMonth).fill(0);
      let total = 0;

      transactions.forEach((tx) => {
        if (tx.lessor_income) {
          const txDate = new Date(tx.created_at);
          if (txDate.getMonth() === month && txDate.getFullYear() === year) {
            const dayIndex = txDate.getDate() - 1;
            dailyIncome[dayIndex] += Number(tx.lessor_income);
            total += Number(tx.lessor_income);
          }
        }
      });

      const data = dailyIncome.map((value, index) => {
        const day = index + 1;
        const showLabel = day === 1 || day % 5 === 0 || day === daysInMonth;
        return {
          value,
          label: showLabel ? day.toString() : "",
          hideDataPoint: true,
        };
      });

      const maxInc = Math.max(...dailyIncome);
      const sections = 4;

      let step = 1000;
      if (maxInc > 0) {
        const roughStep = maxInc / sections;
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep || 1)));
        step = Math.ceil(roughStep / magnitude) * magnitude;
      }

      const finalMax = step * sections;
      const labels = [];
      for (let i = 0; i <= sections; i++) {
        const val = i * step;
        if (val >= 1000) {
          labels.push(`${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`);
        } else {
          labels.push(val.toString());
        }
      }

      return {
        chartData: data,
        yAxisLabels: labels,
        maxValue: finalMax,
        totalIncome: total,
        noOfSections: sections,
      };
    }, [transactions, selectedDate]);

  // 👇 ФИКС ОШИБКИ: Мемоизируем pointerConfig, чтобы он не пересоздавался каждый рендер
  const pointerConfig = useMemo(
    () => ({
      pointerStripHeight: 160,
      pointerStripColor: colors.accent,
      pointerStripWidth: 2,
      pointerColor: colors.accent,
      radius: 6,
      pointerLabelWidth: 100,
      pointerLabelHeight: 50,
      activatePointersOnLongPress: true, // Обязательно true для скроллящихся списков
      // autoAdjustPointerLabelPosition: true, <--- УДАЛИЛИ, ИЗ-ЗА НЕГО БЫЛ БАГ
      pointerLabelComponent: (items: any) => {
        const item = items[0];
        const dayIndex = chartData.findIndex((d) => d === item) + 1;
        return (
          <View
            style={[
              styles.tooltip,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.tooltipDate, { color: colors.textSecondary }]}>
              {dayIndex} числа
            </Text>
            <Text style={[styles.tooltipValue, { color: colors.textPrimary }]}>
              {item.value} ₽
            </Text>
          </View>
        );
      },
    }),
    [colors, chartData],
  ); // Зависимости: пересоздаем только если сменилась тема или данные

  const CHART_WIDTH = SCREEN_WIDTH - 96;

  return (
    <View style={[styles.chartWrapper, { backgroundColor: colors.surface }]}>
      {totalIncome === 0 ? (
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            В этом месяце пока нет доходов
          </Text>
        </View>
      ) : (
        <LineChart
          data={chartData}
          width={CHART_WIDTH}
          height={180}
          maxValue={maxValue}
          noOfSections={noOfSections}
          yAxisLabelTexts={yAxisLabels}
          yAxisLabelWidth={36}
          curved
          areaChart
          color={colors.accent}
          startFillColor={colors.accent}
          endFillColor={colors.surface}
          startOpacity={0.4}
          endOpacity={0.05}
          hideRules={false}
          rulesType="dashed"
          rulesColor={colors.border}
          yAxisColor="transparent"
          xAxisColor={colors.border}
          yAxisTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
          xAxisLabelTextStyle={{
            color: colors.textSecondary,
            fontSize: 11,
            marginBottom: 4,
          }}
          pointerConfig={pointerConfig}
          isAnimated
          animationDuration={1200}
          initialSpacing={10}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 16,
    paddingRight: 16,
    paddingLeft: 4,
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
  tooltip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
    marginLeft: -25,
  },
  tooltipDate: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
