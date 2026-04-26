import React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

const { width } = Dimensions.get("window");

interface Props {
  data: any[];
  scrollX: Animated.Value;
}

export const Pagination = ({ data, scrollX }: Props) => {
  const colors = useAppColors();

  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        // Вычисляем анимацию для каждой точки на основе скролла
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        // Ширина: от 8px (точка) до 24px (пилюля)
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: "clamp",
        });

        // Цвет: плавно перетекает из серого в акцентный
        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: [colors.border, colors.accent, colors.border],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={i.toString()}
            style={[
              styles.dot,
              {
                width: dotWidth,
                backgroundColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
