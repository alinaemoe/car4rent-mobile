import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface MenuItemType {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string; // Например, "Русский" для Языка
  onPress: () => void;
  iconColor?: string;
  titleColor?: string;
  hideChevron?: boolean;
  rightComponent?: React.ReactNode;
}

interface Props {
  title?: string;
  items: MenuItemType[];
}

export const MenuSection = ({ title, items }: Props) => {
  const colors = useAppColors();

  return (
    <View style={styles.container}>
      {title && title.trim() !== "" && (
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={item.title}>
              <TouchableOpacity
                style={styles.row}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.iconColor || colors.textPrimary}
                  />
                </View>

                <Text
                  style={[
                    styles.itemTitle,
                    { color: item.titleColor || colors.textPrimary },
                  ]}
                >
                  {item.title}
                </Text>

                <View style={styles.rightContent}>
                  {item.value && (
                    <Text
                      style={[
                        styles.itemValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.value}
                    </Text>
                  )}
                  {item.rightComponent ? (
                    item.rightComponent
                  ) : !item.hideChevron ? (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  ) : null}
                </View>
              </TouchableOpacity>

              {/* Разделитель между элементами (кроме последнего) */}
              {!isLast && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden", // Чтобы углы обрезались
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    flex: 1,
    fontWeight: "500",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemValue: {
    fontSize: 16,
    marginRight: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68, // Начинается сразу после иконки
  },
});
