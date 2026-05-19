import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector } from "@/src/store";
import { storage } from "@/src/utils/storage";

export default function LanguageScreen() {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  // Берем языки из Redux (те самые, что прилетели с бэка)
  const languages = useAppSelector((state) => state.dictionaries.languages);
  const [activeLang, setActiveLang] = useState(i18n.language);

  useEffect(() => {
    setActiveLang(i18n.language);
  }, [i18n.language]);

  const handleSelect = async (code: string) => {
    setActiveLang(code);
    await i18n.changeLanguage(code); // Меняем локаль на лету
    await storage.setLanguage(code); // Сохраняем в кэш
    setTimeout(() => router.back(), 300); // Плавно уходим назад
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("settings.language", "Язык"),
          headerBackTitle: t("common.back", "Назад"),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />

      <View style={[styles.listContainer, { backgroundColor: colors.surface }]}>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.code}
          renderItem={({ item, index }) => {
            const isSelected = activeLang === item.code;
            return (
              <TouchableOpacity
                style={[
                  styles.item,
                  { borderBottomColor: colors.border },
                  index === languages.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleSelect(item.code)}
              >
                <View style={styles.leftSide}>
                  {item.icon_url && (
                    <Image
                      source={item.icon_url}
                      style={styles.flag}
                      contentFit="cover"
                    />
                  )}
                  <Text style={[styles.name, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                </View>

                {isSelected && (
                  <Ionicons name="checkmark" size={24} color={colors.accent} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  listContainer: { marginHorizontal: 16, borderRadius: 16, overflow: "hidden" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  leftSide: { flexDirection: "row", alignItems: "center" },
  flag: { width: 28, height: 28, marginRight: 12, borderRadius: 14 },
  name: { fontSize: 16, fontWeight: "500" },
});
