import { useFaqs } from "@/src/api/queries/useFaqs";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useRefetchOnFocus } from "@/src/hooks/useRefetchOnFocus";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FaqScreen() {
  const { t, i18n } = useTranslation();
  const colors = useAppColors();

  // 🔥 Подключаем наш умный хук
  const { data: faqs, isLoading, refetch } = useFaqs();

  // Свежий FAQ при каждом заходе на экран
  useRefetchOnFocus(refetch);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getLocalizedText = (textObj: { ru: string; en: string }) => {
    if (!textObj) return "";
    const lang = i18n.language as "ru" | "en";
    return textObj[lang] || textObj.ru;
  };

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Герой-блок */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.heroIconBox,
                { backgroundColor: `${colors.accent}15` },
              ]}
            >
              <Ionicons
                name="help-buoy-outline"
                size={48}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              {t("faq.title", "Ответы на вопросы")}
            </Text>
            <Text
              style={[styles.heroSubtitle, { color: colors.textSecondary }]}
            >
              {t(
                "faq.subtitle",
                "Собрали для вас самую важную информацию об аренде.",
              )}
            </Text>
          </View>

          {/* Островок с аккордеоном */}
          <View style={[styles.island, { backgroundColor: colors.surface }]}>
            {faqs?.map((faq, index) => {
              const isExpanded = expandedId === faq.id;
              const isLast = index === faqs.length - 1;

              return (
                <View
                  key={faq.id}
                  style={[
                    styles.faqItem,
                    !isLast && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleExpand(faq.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.questionText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {getLocalizedText(faq.question)}
                    </Text>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: isExpanded
                            ? colors.accent
                            : colors.background,
                        },
                      ]}
                    >
                      <Ionicons
                        name={isExpanded ? "remove" : "add"}
                        size={20}
                        color={isExpanded ? "#fff" : colors.textPrimary}
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.answerContainer}>
                      <Text
                        style={[
                          styles.answerText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {getLocalizedText(faq.answer)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 60,
  },

  // --- Hero Section ---
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
  },

  // --- Accordion ---
  island: {
    borderRadius: 24,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  faqItem: {
    paddingVertical: 18,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700", // Сделали жирнее
    lineHeight: 22,
    paddingRight: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  answerContainer: {
    marginTop: 12,
    paddingRight: 16, // Оставляем воздух справа
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
