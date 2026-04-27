import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  style?: ViewStyle | ViewStyle[];
  borderRadius?: number;
}

export const Skeleton = ({ style, borderRadius = 8 }: Props) => {
  const colors = useAppColors();
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Бесконечная плавная пульсация (shimmer)
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: colors.skeletonHighlight,
          opacity: anim,
          borderRadius: borderRadius,
        },
      ]}
    />
  );
};
