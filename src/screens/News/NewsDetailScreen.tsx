import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useNews } from "@/src/api/queries/useNews";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "ru" | "en";
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const { data: newsList } = useNews();

  // Ищем текущую новость и её индекс
  const currentIndex = newsList?.findIndex((n) => n.id === Number(id)) ?? -1;
  const news = newsList?.[currentIndex];

  // Определяем соседние новости для навигации
  const prevNews = currentIndex > 0 ? newsList![currentIndex - 1] : null;
  const nextNews =
    currentIndex !== -1 && currentIndex < (newsList?.length ?? 0) - 1
      ? newsList![currentIndex + 1]
      : null;

  if (!news) return null;

  const getLocalizedText = (obj: any) => obj?.[currentLang] || obj?.ru || "";

  // Функция для перехода к другой новости (replace, чтобы не плодить историю)
  const navigateToNews = (targetId: number) => {
    router.replace({ pathname: "/news/[id]", params: { id: targetId } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ПЛАВАЮЩАЯ КНОПКА НАЗАД */}
      <TouchableOpacity
        style={[
          styles.backBtn,
          {
            top: Math.max(insets.top + 10, 20),
            backgroundColor: "rgba(0,0,0,0.4)",
          },
        ]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} // Отступ под бар навигации
        bounces={false} // Отключаем резинку сверху для монолитности
      >
        {/* ЖУРНАЛЬНАЯ ОБЛОЖКА ВО ВСЮ ШИРИНУ (БЕЗ СКРУГЛЕНИЙ) */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: news.image_url }} style={styles.heroImage} />

          {/* Градиент, который плавно растворяет низ картинки в цвет фона приложения */}
          <LinearGradient
            colors={["transparent", colors.background]}
            style={styles.gradientFade}
          />
        </View>

        {/* ЧИСТЫЙ КОНТЕНТ (БЕЗ КАРТОЧЕК И ТЕНЕЙ) */}
        <View
          style={[
            styles.articleContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.metaRow}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {getLocalizedText(news.badge).toUpperCase()}
            </Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {new Date(news.created_at).toLocaleDateString(
                currentLang === "ru" ? "ru-RU" : "en-US",
                { day: "numeric", month: "long" },
              )}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {getLocalizedText(news.title)}
          </Text>

          <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
            {getLocalizedText(news.text)}
          </Text>
        </View>
      </ScrollView>

      {/* НИЖНИЙ БАР НАВИГАЦИИ (ПЛАВАЮЩИЙ) */}
      <View
        style={[
          styles.bottomNavContainer,
          {
            backgroundColor: colors.background,
            shadowColor: isDark ? "#979797" : "#000000",
            shadowOpacity: isDark ? 0.01 : 0.08,
            borderTopColor: "transparent",
            paddingBottom: Platform.OS === "ios" ? 32 : 18,
          },
        ]}
      >
        {prevNews ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateToNews(prevNews.id)}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>
              {t("common.prev", "Предыдущая")}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.navButton} /> // Пустой блок для баланса flex-space-between
        )}

        {nextNews ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateToNews(nextNews.id)}
          >
            <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>
              {t("common.next", "Следующая")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    right: 20, // Перенес крестик вправо (как в Apple News/статьях)
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
    // Размытие фона для крестика
    backdropFilter: "blur(10px)",
  },

  // === ГЕРОЙ-ИЗОБРАЖЕНИЕ ===
  heroWrapper: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.45,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120, // Длинный плавный переход
  },

  // === СТАТЬЯ ===
  articleContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    // Никаких бордеров, теней и маргинов. Контент идет прямо на фоне.
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 28, // Огромный заголовок в стиле глянца
    fontWeight: "900",
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 18, // Крупный текст для удобного чтения
    lineHeight: 28,
    fontWeight: "400",
    opacity: 0.9,
  },

  // === НАВИГАЦИЯ МЕЖДУ СТАТЬЯМИ ===
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 6,
  },
});
