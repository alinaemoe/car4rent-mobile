import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { OnboardingSlide, SlideData } from "./components/OnboardingSlide";
import { Pagination } from "./components/Pagination";

const { width } = Dimensions.get("window");

export default function PartnerOnboardingScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();

  // Данные для наших слайдов (презентация) перенесены внутрь для доступа к t()
  const SLIDES: SlideData[] = useMemo(
    () => [
      {
        id: "1",
        title: t("onboarding.slide1_title", "Пассивный доход"),
        description: t(
          "onboarding.slide1_desc",
          "Сдавайте свой автомобиль в аренду и зарабатывайте до 100 000 Br каждый месяц, пока мы ищем клиентов.",
        ),
        icon: "wallet",
        gradient: ["#4facfe", "#00f2fe"],
      },
      {
        id: "2",
        title: t("onboarding.slide2_title", "Полная безопасность"),
        description: t(
          "onboarding.slide2_desc",
          "Каждая поездка застрахована по КАСКО. Мы тщательно проверяем каждого водителя по 20+ параметрам.",
        ),
        icon: "shield-checkmark",
        gradient: ["#43e97b", "#38f9d7"],
      },
      {
        id: "3",
        title: t("onboarding.slide3_title", "Прозрачный контроль"),
        description: t(
          "onboarding.slide3_desc",
          "Отслеживайте статус автомобиля, историю поездок и начисления в реальном времени прямо в приложении.",
        ),
        icon: "phone-portrait",
        gradient: ["#fa709a", "#fee140"],
      },
      {
        id: "4",
        title: t("onboarding.slide4_title", "Готовы начать?"),
        description: t(
          "onboarding.slide4_desc",
          "Оставьте заявку за 2 минуты. Загрузите фото авто, и наш менеджер свяжется с вами для оформления договора.",
        ),
        icon: "rocket",
        gradient: ["#a18cd1", "#fbc2eb"],
      },
    ],
    [t],
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  // Реф для значения скролла (для анимации пагинации)
  const scrollX = useRef(new Animated.Value(0)).current;

  // Реф для управления FlatList (чтобы листать по кнопке)
  const slidesRef = useRef<any>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // ПОСЛЕДНИЙ СЛАЙД -> Переходим к заполнению заявки
      router.push("/partner-request");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* АБСОЛЮТНЫЙ ХЕДЕР (Поверх скролла) */}
      <SafeAreaView edges={["top"]} style={styles.headerAbsolute}>
        <View style={styles.headerContent}>
          {/* Тонкий крестик закрытия */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons
              name="close-outline"
              size={32}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Кастомная гусеничная пагинация */}
          <Pagination data={SLIDES} scrollX={scrollX} />

          {/* Пустая вьюшка для баланса флексбокса */}
          <View style={styles.spacer} />
        </View>
      </SafeAreaView>

      {/* АНИМИРОВАННЫЙ СКРОЛЛЕР СЛАЙДОВ */}
      <Animated.FlatList
        data={SLIDES}
        ref={slidesRef}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }, // false, так как анимируем width у пагинации
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      {/* НИЖНЯЯ КНОПКА ДЕЙСТВИЯ */}
      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: colors.accent }]}
          onPress={scrollToNext}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>
            {currentIndex === SLIDES.length - 1
              ? t("onboarding.submit_request", "Оставить заявку")
              : t("common.next", "Далее")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  spacer: {
    width: 40, // Балансирует ширину крестика для идеального центра пагинации
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  mainButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
