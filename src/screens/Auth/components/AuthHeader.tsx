import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  title: string;
  onBack: () => void;
}

export const AuthHeader = ({ title, onBack }: Props) => {
  const colors = useAppColors();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: colors.background, zIndex: 10 }}
    >
      <View style={styles.stickyHeader}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="chevron-back-outline"
            size={28}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <View
        style={[styles.headerDivider, { backgroundColor: colors.border }]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  stickyHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
  },
  backBtn: {
    justifyContent: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    opacity: 0.7,
  },
});
