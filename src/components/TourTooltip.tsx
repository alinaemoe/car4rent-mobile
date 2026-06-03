import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useCopilot } from "react-native-copilot";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TourTooltipProps {
  labels: {
    skip?: string;
    next?: string;
    finish?: string;
  };
}

export const TourTooltip = ({ labels }: TourTooltipProps) => {
  const colors = useAppColors();
  const {
    goToNext,
    stop,
    currentStep,
    isLastStep,
    currentStepNumber,
    totalStepsNumber,
  } = useCopilot();

  const stepText = currentStep?.text || "";
  const [title, description] = stepText.split("|");

  // Рисуем современные точки-индикаторы
  const dots = [];
  for (let i = 0; i < totalStepsNumber; i++) {
    const isActive = i === currentStepNumber - 1;
    dots.push(
      <View
        key={i}
        style={[
          styles.dot,
          {
            backgroundColor: isActive ? colors.accent : colors.border,
            width: isActive ? 20 : 6, // Активная точка становится широкой полоской
          },
        ]}
      />,
    );
  }

  return (
    <View
      style={[styles.tooltipContainer, { backgroundColor: colors.surface }]}
    >
      {/* Прогресс-бар (Точки) */}
      <View style={styles.dotsRow}>{dots}</View>

      {/* Контент */}
      <View style={styles.contentWrapper}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        ) : null}
      </View>

      {/* Кнопки */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => stop()}
          activeOpacity={0.6}
          style={styles.skipBtn}
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {labels.skip || "Пропустить"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (isLastStep ? stop() : goToNext())}
          style={[styles.nextBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {isLastStep ? labels.finish || "Понятно" : labels.next || "Далее"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    borderRadius: 16,
    padding: 20,
    width: SCREEN_WIDTH - 40, // 🔥 Жесткая ширина: ширина экрана минус отступы по краям
    alignSelf: "center", // Центрируем
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  contentWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipBtn: {
    paddingVertical: 10,
    paddingRight: 20,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  nextBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
