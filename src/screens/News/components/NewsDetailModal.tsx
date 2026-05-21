import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { NewsItem } from "@/src/api/queries/useNews";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  news: NewsItem | null;
  onClose: () => void;
  getLocalizedText: (obj: any) => string;
  getBadgeStyles: (badgeText: string) => { color: string; bg: string };
}

export const NewsDetailModal = ({
  visible,
  news,
  onClose,
  getLocalizedText,
  getBadgeStyles,
}: Props) => {
  const colors = useAppColors();
  if (!news) return null;

  const badgeInfo = getBadgeStyles(getLocalizedText(news.badge));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* КНОПКА ЗАКРЫТИЯ СВЕРХУ КАРТЫ */}
        <SafeAreaView style={styles.closeBtnArea}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ГЛАВНЫЙ ГЕРОЙ-БАННЕР */}
          <View style={styles.imageBox}>
            <Image source={{ uri: news.image_url }} style={styles.image} />
          </View>

          {/* НАВЫСАЮЩИЙ СТЕКЛЯННЫЙ ОСТРОВ КОНТЕНТА */}
          <View
            style={[
              styles.contentIsland,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {/* Тонкий блик на ребре карточки */}
            <View style={styles.glassHighlight} />

            <View style={[styles.badge, { backgroundColor: badgeInfo.bg }]}>
              <Text style={[styles.badgeText, { color: badgeInfo.color }]}>
                {getLocalizedText(news.badge).toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {getLocalizedText(news.title)}
            </Text>

            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(news.created_at).toLocaleDateString()}
            </Text>

            <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
              {getLocalizedText(news.text)}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtnArea: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 99,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  imageBox: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.38,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentIsland: {
    marginTop: -35, // 🔥 Фирменный глубокий наезд на картинку
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    borderTopWidth: 1.5,
    minHeight: SCREEN_HEIGHT * 0.65,
  },
  glassHighlight: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Симуляция блика на стекле
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 32,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "400",
    opacity: 0.95,
  },
});
