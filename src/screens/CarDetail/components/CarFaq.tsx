import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

// Включаем анимации для Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// МОКОВЫЕ ДАННЫЕ (Потом это будет приходить из React Query)
const MOCK_FAQS = [
  {
    id: 1,
    title: {
      ru: "Каковы дальнейшие действия после нажатия на «Забронировать»?",
      en: "What are the next steps after clicking «Book»?",
    },
    desc: {
      ru: "• Если это ваша первая аренда, необходимо загрузить документы в профиле и дождаться проверки, которая в среднем занимает 15-30 минут.\n\n• Далее необходимо дождаться подтверждения от сервиса, после чего оплатить аренду. В приложении появится детализированная инструкция по получению авто.",
      en: "• If this is your first rental, you need to upload documents and wait for verification (takes 15-30 mins).\n\n• Next, wait for service confirmation, then pay. Detailed instructions will appear in the app.",
    },
  },
  {
    id: 2,
    title: {
      ru: "Как получить автомобиль?",
      en: "How to get the car?",
    },
    desc: {
      ru: "Вы можете забрать автомобиль в нашем пункте выдачи (адрес указан на карте выше) или заказать доставку по вашему адресу при оформлении брони.",
      en: "You can pick up the car at our location (see map above) or order delivery to your address during booking.",
    },
  },
  {
    id: 3,
    title: {
      ru: "Как вернуть автомобиль?",
      en: "How to return the car?",
    },
    desc: {
      ru: "1. Привезите автомобиль в назначенное время.\n2. Уровень топлива должен быть таким же, как при получении.\n3. Сделайте фото-фиксацию состояния авто через приложение и завершите аренду.",
      en: "1. Return the car on time.\n2. Fuel level must match the initial level.\n3. Take photos of the car via the app and end the rental.",
    },
  },
  {
    id: 4,
    title: {
      ru: "В каком состоянии автомобиль должен вернуться?",
      en: "In what condition should the car be returned?",
    },
    desc: {
      ru: "Автомобиль должен быть возвращен чистым (или вы можете оплатить мойку при возврате). Салон должен быть без повреждений и следов курения.",
      en: "The car must be returned clean. The interior must be undamaged and smoke-free.",
    },
  },
];

export const CarFaq = () => {
  const { t, i18n } = useTranslation();
  const colors = useAppColors();

  // Храним ID раскрытого вопроса (null = все закрыты)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Хелпер для вытаскивания правильного языка из объекта {ru: "", en: ""}
  const getLocalizedText = (textObj: { ru: string; en: string }) => {
    const lang = i18n.language as "ru" | "en";
    return textObj[lang] || textObj.ru; // Fallback на русский, если что
  };

  const toggleExpand = (id: number) => {
    // Говорим React Native плавно анимировать следующее изменение стейта
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // Если кликнули на уже открытый — закрываем, иначе открываем новый
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        {t("car_detail.faq_title", "Ответы на вопросы")}
      </Text>

      {MOCK_FAQS.map((faq, index) => {
        const isExpanded = expandedId === faq.id;
        const isLast = index === MOCK_FAQS.length - 1;

        return (
          <View
            key={faq.id}
            style={[
              styles.faqItem,
              // Линия-разделитель снизу для всех, кроме последнего элемента
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
                style={[styles.questionText, { color: colors.textPrimary }]}
              >
                {getLocalizedText(faq.title)}
              </Text>
              <Ionicons
                name={isExpanded ? "close" : "add"}
                size={24}
                color={colors.textPrimary}
                style={{ marginLeft: 16 }}
              />
            </TouchableOpacity>

            {/* Если раскрыто — показываем текст */}
            {isExpanded && (
              <View style={styles.answerContainer}>
                <Text
                  style={[styles.answerText, { color: colors.textSecondary }]}
                >
                  {getLocalizedText(faq.desc)}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 24, // В нашем стиле
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  faqItem: {
    paddingVertical: 16,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  answerContainer: {
    marginTop: 12,
    paddingRight: 30, // Чтобы текст не прилипал к правому краю, где крестик
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
