import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface CarSpecRowProps {
  label: string;
  value: string | number;
}

export const CarSpecRow: React.FC<CarSpecRowProps> = ({ label, value }) => {
  const colors = useAppColors();

  return (
    <View style={styles.specRow}>
      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  specLabel: { fontSize: 15 },
  specValue: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    paddingLeft: 16,
  },
});
