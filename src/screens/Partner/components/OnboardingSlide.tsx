import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export interface SlideData {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
}

interface Props {
  item: SlideData;
}

export const OnboardingSlide = ({ item }: Props) => {
  const colors = useAppColors();
  const { width } = useWindowDimensions();
  const circleSize = width * 0.7;

  return (
    <View
      style={[styles.container, { width, backgroundColor: colors.background }]}
    >
      <View style={styles.imageContainer}>
        {/* Анимированный градиентный круг как "иллюстрация" */}
        <LinearGradient
          colors={item.gradient}
          style={[styles.circle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon} size={100} color="#ffffff" />
        </LinearGradient>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {item.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    flex: 0.4,
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
});
