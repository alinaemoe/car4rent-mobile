import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { PartnershipRequest } from "@/src/api/queries/usePartnershipRequests";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  request: PartnershipRequest;
  onDelete: (id: number) => void;
}

export const RequestCard = ({ request, onDelete }: Props) => {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);

  // 1. Форматируем дату подачи
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language || "ru", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // 2. Настройка статусов
  const isRejected = request.status === "REJECTED";
  const statusConfig = isRejected
    ? {
        label: t("fleet.request.rejected", "Отклонено"),
        color: colors.error,
        bg: colors.errorBg,
        icon: "close-circle-outline" as const,
      }
    : {
        label: t("fleet.request.pending", "На проверке"),
        color: colors.accent, // Или любой цвет для "в процессе"
        bg: colors.accentBg,
        icon: "time-outline" as const,
      };

  // 3. Берем первое фото (если юзер его прикреплял)
  const previewImage =
    request.photos && request.photos.length > 0 ? request.photos[0] : null;

  // 4. Отрисовка красной кнопки под свайпом (ТОЛЬКО ДЛЯ REJECTED)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          swipeableRef.current?.close(); // Закрываем свайп перед удалением (для красоты анимации)
          onDelete(request.id);
        }}
        style={[styles.deleteButton, { backgroundColor: colors.error }]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={28} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const CardContent = () => (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: isRejected ? 0.7 : 1, // Отклоненные делаем чуть прозрачными
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* --- СЛЕВА: ФОТО ИЛИ ПЛЕЙСХОЛДЕР --- */}
        {previewImage ? (
          <Image
            source={{ uri: previewImage }}
            style={[styles.image, { backgroundColor: colors.skeleton }]}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: colors.skeleton },
            ]}
          >
            <Ionicons
              name="car-outline"
              size={24}
              color={colors.textSecondary}
            />
          </View>
        )}

        {/* --- СПРАВА: ИНФОРМАЦИЯ --- */}
        <View style={styles.infoRight}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.carName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {request.car_brand} {request.car_model}
            </Text>
            <Text style={[styles.yearText, { color: colors.textSecondary }]}>
              {request.car_year}
            </Text>
          </View>

          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {t("fleet.request.date", "Подана:")}{" "}
            {formatDate(request.created_at)}
          </Text>

          {/* Бейдж статуса */}
          <View style={{ alignSelf: "flex-start", marginTop: 8 }}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Ionicons
                name={statusConfig.icon}
                size={14}
                color={statusConfig.color}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // 5. Обертка Swipeable (активна только если заявка REJECTED)
  if (isRejected) {
    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2} // Чувствительность свайпа
        rightThreshold={40} // Насколько нужно свайпнуть, чтобы сработало
        containerStyle={styles.swipeableContainer}
      >
        <CardContent />
      </Swipeable>
    );
  }

  // Если заявка NEW — просто возвращаем карточку (свайп отключен)
  return (
    <View style={styles.swipeableContainer}>
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    // Скрываем всё, что вылезает за границы, чтобы красный фон удаления не торчал углами
    overflow: "hidden",
  },
  cardContainer: {
    padding: 12,
    borderWidth: 1, // Тонкая рамка для визуального отличия от одобренных машин
    borderRadius: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 14,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  infoRight: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  carName: {
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1, // Чтобы длинное имя не выталкивало год
  },
  yearText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "400",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  deleteButton: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    // Тянется на всю высоту карточки
    height: "100%",
  },
});
