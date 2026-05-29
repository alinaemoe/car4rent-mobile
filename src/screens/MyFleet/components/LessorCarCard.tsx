import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AlertDialog } from "@/src/components/Alert";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

// Типизация машины (расширенная для партнера)
export interface LessorCar {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  images?: { url: string; is_main: boolean }[];
  // Бэкенд может присылать дату окончания текущей аренды (опционально)
  active_rental_end_date?: string;
}

interface Props {
  car: LessorCar;
  onPress: (carId: number) => void;
  onToggleVisibility: (carId: number, isVisible: boolean) => void;
}

export const LessorCarCard = ({ car, onPress, onToggleVisibility }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  // 1. Ищем главную фотку
  const mainImage =
    car.images?.find((img) => img.is_main)?.url || car.images?.[0]?.url;

  // 2. Настройка статусов и цветов
  const getStatusConfig = () => {
    switch (car.status) {
      case "AVAILABLE":
        return {
          label: t("fleet.status.available", "Доступна"),
          color: colors.success,
          bg: colors.successBg,
        };
      case "RENTED":
        // Если бэкенд прислал дату окончания аренды — форматируем её
        let rentLabel = t("fleet.status.rented", "В поездке");
        if (car.active_rental_end_date) {
          const endDate = new Date(car.active_rental_end_date);
          const day = endDate.getDate().toString().padStart(2, "0");
          const month = (endDate.getMonth() + 1).toString().padStart(2, "0");
          // 👈 Оборачиваем всю фразу с переменными
          rentLabel = t("fleet.status.rented_until", {
            defaultValue: "В поездке до {{day}}.{{month}}",
            day,
            month,
          });
        }
        return {
          label: rentLabel,
          color: colors.warningText || colors.warning,
          bg: colors.warningBg,
        };
      case "MAINTENANCE":
      default:
        return {
          label: t("fleet.status.hidden", "Скрыта"),
          color: colors.textSecondary,
          bg: colors.border,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isRented = car.status === "RENTED";
  const isAvailable = car.status === "AVAILABLE";

  // 3. Логика переключения Тумблера
  const handleToggle = (newValue: boolean) => {
    if (isRented) return; // Защита (хотя свитч и так disabled)

    if (!newValue) {
      // Если ПРЯЧЕМ машину -> показываем Alert
      AlertDialog.alert(
        t("fleet.alert.hide_title", "Снять авто с публикации?"),
        t(
          "fleet.alert.hide_message",
          "Машина пропадет из каталога и вы не будете получать новые брони.",
        ),
        [
          {
            text: t("buttons.cancel", "Отмена"),
            style: "cancel",
          },
          {
            text: t("buttons.hide", "Скрыть"),
            style: "destructive",
            onPress: () => onToggleVisibility(car.id, false),
          },
        ],
      );
    } else {
      // Если ВОЗВРАЩАЕМ машину -> переключаем мгновенно
      onToggleVisibility(car.id, true);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(car.id)}
      style={[styles.cardContainer, { backgroundColor: colors.surface }]}
    >
      <View style={styles.contentRow}>
        {/* --- СЛЕВА: ФОТО --- */}
        <Image
          source={{ uri: mainImage }}
          style={[styles.image, { backgroundColor: colors.skeleton }]}
          contentFit="cover"
          transition={200}
        />

        {/* --- ПО ЦЕНТРУ: ИНФО --- */}
        <View style={styles.infoCenter}>
          <View style={{ alignSelf: "flex-start", marginBottom: 6 }}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <View style={styles.nameContainer}>
              <Text
                style={[styles.carName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {car.brand} {car.model}
              </Text>
              {/* Легкий градиент для скрытия длинных имен (опционально) */}
              <LinearGradient
                colors={["transparent", colors.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fadeOverlay}
                pointerEvents="none"
              />
            </View>
          </View>

          <View style={styles.specsRow}>
            <Text style={[styles.yearText, { color: colors.textSecondary }]}>
              {car.year}
            </Text>
            {!!car.license_plate && (
              <View
                style={[
                  styles.licenseBadge,
                  { backgroundColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.licenseText, { color: colors.textPrimary }]}
                >
                  {car.license_plate}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* --- СПРАВА: ТУМБЛЕР --- */}
        <View style={styles.toggleRight}>
          <Switch
            value={isAvailable}
            onValueChange={handleToggle}
            disabled={isRented}
            // Кастомизация цветов свитча под дизайн-систему
            trackColor={{
              false: colors.border,
              true: colors.successBg || colors.accentBg,
            }}
            thumbColor={
              isAvailable
                ? colors.success || colors.accent
                : colors.textSecondary
            }
            // На iOS свитч имеет свой фон
            ios_backgroundColor={colors.border}
            style={Platform.OS === "ios" ? { transform: [{ scale: 0.9 }] } : {}}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    // Тень
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32, // Круглая миниатюра, как в RentalCardHeader
    marginRight: 14,
  },
  infoCenter: {
    flex: 1,
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    width: "100%",
  },
  nameContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  carName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  fadeOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  yearText: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 8,
  },
  licenseBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  licenseText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  toggleRight: {
    paddingLeft: 12,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
