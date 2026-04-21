import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export default function UploadDocsScreen() {
  const colors = useAppColors();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Шапка экрана */}
      <SafeAreaView
        edges={["top"]}
        style={{
          backgroundColor: colors.background,
          zIndex: 10,
          elevation: 5,
        }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Верификация
          </Text>
        </View>
        <View
          style={[styles.headerDivider, { backgroundColor: colors.border }]}
        />
      </SafeAreaView>

      {/* Контент-заглушка */}
      <View style={styles.content}>
        <Ionicons
          name="document-text-outline"
          size={80}
          color={colors.textSecondary}
          style={{ marginBottom: 24, opacity: 0.5 }}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Загрузка документов
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Скоро здесь появится флоу загрузки паспорта и водительского
          удостоверения с использованием камеры.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
