import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useNews, NewsItem } from "@/src/api/queries/useNews";

export default function NewsScreen() {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const currentLang = i18n.language as "ru" | "en";

  const { data: newsList, isLoading, refetch, isRefetching } = useNews();

  const getLocalizedText = (obj: { ru: string; en: string }) => {
    return obj?.[currentLang] || obj?.ru || "";
  };

  const getBadgeStyles = (badgeText: string) => {
    const txt = badgeText.toLowerCase();
    if (txt === "акция" || txt === "promo")
      return { color: "#FF4B4B", bg: "rgba(255, 75, 75, 0.15)" };
    if (txt === "новинка" || txt === "new")
      return { color: colors.accent, bg: `${colors.accent}25` };
    return { color: colors.textPrimary, bg: "rgba(150, 150, 150, 0.2)" };
  };

  const renderNewsCard = ({
    item,
    index,
  }: {
    item: NewsItem;
    index: number;
  }) => {
    const badgeInfo = getBadgeStyles(getLocalizedText(item.badge));
    const isLast = index === (newsList?.length ?? 0) - 1;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          router.push({ pathname: "/news/[id]", params: { id: item.id } })
        }
        style={[
          styles.articleContainer,
          // Добавляем разделитель для всех статей, кроме последней
          !isLast && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* ЖУРНАЛЬНАЯ ОБЛОЖКА (БЕЗ РАМОК) */}
        <View style={styles.imageBox}>
          <Image source={{ uri: item.image_url }} style={styles.cardImage} />

          {/* Стеклянный бейдж */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: badgeInfo.bg,
                borderColor: `${badgeInfo.color}30`,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeInfo.color }]}>
              {getLocalizedText(item.badge).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ЧИСТЫЙ ТЕКСТОВЫЙ БЛОК */}
        <View style={styles.textContent}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={3}
          >
            {getLocalizedText(item.title)}
          </Text>
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {getLocalizedText(item.text)}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString(
                currentLang === "ru" ? "ru-RU" : "en-US",
                { day: "numeric", month: "long" },
              )}
            </Text>

            <View style={styles.readMoreBtn}>
              <Text style={[styles.readMoreText, { color: colors.accent }]}>
                {t("news.read_more", "Читать")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={colors.accent}
                style={{ marginTop: 2 }}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={newsList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNewsCard}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerEmpty}>
            <Ionicons
              name="newspaper-outline"
              size={64}
              color={colors.border}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("news_empty", "Лента новостей пока пуста")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerEmpty: { flex: 1, alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: "500" },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // === СТАТЬЯ (БЕЗ КОРОБКИ) ===
  articleContainer: {
    paddingBottom: 32, // Воздух снизу
    marginBottom: 32, // Воздух до следующей статьи
  },

  // === ИЗОБРАЖЕНИЕ ===
  imageBox: {
    width: "100%",
    height: 240, // Крупное, киношное соотношение
    borderRadius: 20, // Красивое скругление
    overflow: "hidden",
    position: "relative",
    marginBottom: 16, // Отступ до текста
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // === БЕЙДЖ ===
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    // На iOS можно добавить блюр, если используешь BlurView, но и с полупрозрачным bg отлично
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  // === ТЕКСТ ===
  textContent: {
    paddingHorizontal: 4, // Чуть-чуть отступаем от краев, чтобы визуально выровнять с картинкой
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },

  // === ФУТЕР ===
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
