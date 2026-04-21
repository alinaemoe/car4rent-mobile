import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

// Вычисляем ширину карточки: 1 полная карточка + 20% следующей
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

export const CarHowItWorks = () => {
  const { t } = useTranslation();
  const colors = useAppColors();

  // Шаги аренды строго под нашу B2C логику (без связи с владельцами)
  const steps = [
    {
      id: 1,
      icon: "calendar",
      title: t("how_it_works.step1_title", "Оставьте заявку"),
      desc: t(
        "how_it_works.step1_desc",
        "Выберите нужные даты и время аренды в календаре",
      ),
    },
    {
      id: 2,
      icon: "headset",
      title: t("how_it_works.step2_title", "Дождитесь звонка"),
      desc: t(
        "how_it_works.step2_desc",
        "Наш менеджер свяжется с вами для подтверждения заявки",
      ),
    },
    {
      id: 3,
      icon: "card",
      title: t("how_it_works.step3_title", "Оплатите аренду"),
      desc: t(
        "how_it_works.step3_desc",
        "После оплаты автомобиль будет надежно забронирован за вами",
      ),
    },
    {
      id: 4,
      icon: "car-sport",
      title: t("how_it_works.step4_title", "Получите авто"),
      desc: t(
        "how_it_works.step4_desc",
        "Заберите машину в пункте выдачи или оформите доставку",
      ),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t("how_it_works.main_title", "Как это работает")}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 16} // Плавный скролл по одной карточке (Ширина + gap)
        decelerationRate="fast"
      >
        {steps.map((step) => (
          <View
            key={step.id}
            style={[
              styles.stepCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            {/* ВЕРХНЯЯ ЧАСТЬ: Иллюстрация (Занимает 2/3) */}
            <View style={styles.illustrationArea}>
              {/* Фоновая абстрактная фигура (имитация рисунка) */}
              <View
                style={[styles.blob, { backgroundColor: colors.surface }]}
              />

              {/* Главная иконка */}
              <Ionicons
                name={step.icon as any}
                size={72}
                color={colors.accent}
                style={styles.mainIcon}
              />

              {/* Маленький зеленый бейдж-галочка (как на твоем скрине) */}
              <View
                style={[
                  styles.successBadge,
                  { backgroundColor: colors.success },
                ]}
              >
                <Ionicons name="checkmark-sharp" size={16} color="#fff" />
              </View>
            </View>

            {/* НИЖНЯЯ ЧАСТЬ: Текст (Занимает 1/3) */}
            <View style={styles.textArea}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                {step.title}
              </Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                {step.desc}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    marginBottom: 12,
    borderRadius: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16, // Отступ между карточками
  },
  stepCard: {
    width: CARD_WIDTH,
    height: 300, // Фиксированная высота карточки
    borderRadius: 24,
    borderWidth: 1, // Тонкая обводка, как на скринах
    overflow: "hidden",
  },

  // === ИЛЛЮСТРАЦИЯ (2/3 высоты) ===
  illustrationArea: {
    flex: 2, // Берет 2 части пространства
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  blob: {
    position: "absolute",
    width: 140,
    height: 130,
    borderRadius: 50,
    transform: [{ rotate: "-15deg" }], // Немного кривая форма для абстракции
  },
  mainIcon: {
    zIndex: 2,
  },
  successBadge: {
    position: "absolute",
    right: "25%",
    bottom: "20%",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
    borderWidth: 3,
    borderColor: "#fff", // Белая обводка вокруг зеленой галочки
  },

  // === ТЕКСТ (1/3 высоты) ===
  textArea: {
    flex: 1, // Берет 1 часть пространства
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
