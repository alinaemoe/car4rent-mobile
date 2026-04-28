import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Appearance,
} from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { storage } from "@/src/utils/storage";

type ThemeOption = "system" | "light" | "dark";

export default function ThemeScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();

  const [activeTheme, setActiveTheme] = useState<ThemeOption>("system");

  useEffect(() => {
    storage.getTheme().then(setActiveTheme);
  }, []);

  const handleSelect = async (theme: ThemeOption) => {
    setActiveTheme(theme);
    await storage.setTheme(theme);

    // Форсируем тему в приложении "на лету"
    if (theme === "system") {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(theme);
    }
  };

  const OPTIONS = [
    {
      id: "system",
      title: t("theme.system", "Системная"),
      icon: "settings-outline",
    },
    { id: "light", title: t("theme.light", "Светлая"), icon: "sunny-outline" },
    { id: "dark", title: t("theme.dark", "Темная"), icon: "moon-outline" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("settings.theme", "Оформление"),
          headerBackTitle: t("back", "Назад"),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t(
          "theme.hint",
          "Выберите тему приложения или используйте системные настройки устройства.",
        )}
      </Text>

      <View style={[styles.listContainer, { backgroundColor: colors.surface }]}>
        {OPTIONS.map((item, index) => {
          const isSelected = activeTheme === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.item,
                { borderBottomColor: colors.border },
                index === OPTIONS.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => handleSelect(item.id as ThemeOption)}
            >
              <View style={styles.leftSide}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={colors.textPrimary}
                  />
                </View>
                <Text style={[styles.name, { color: colors.textPrimary }]}>
                  {item.title}
                </Text>
              </View>

              {isSelected && (
                <Ionicons name="checkmark" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  hint: {
    marginHorizontal: 32,
    marginBottom: 16,
    fontSize: 13,
    textAlign: "center",
  },
  listContainer: { marginHorizontal: 16, borderRadius: 16, overflow: "hidden" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  leftSide: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  name: { fontSize: 16, fontWeight: "500" },
});
