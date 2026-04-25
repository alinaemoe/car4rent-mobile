import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Rental } from "@/src/api/queries/useRentals";

interface Props {
  rental: Rental;
  onReviewPress?: () => void;
  onBookAgainPress?: () => void;
  onFindOtherPress?: () => void;
}

const SUPPORT_PHONE = "+79991234567";

export const RentalCardActions = ({
  rental,
  onReviewPress,
  onBookAgainPress,
  onFindOtherPress,
}: Props) => {
  const colors = useAppColors();

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {
      Alert.alert("Ошибка", "Не удалось открыть набор номера");
    });
  };

  const renderContent = () => {
    if (rental.status === "CREATED") return null;

    if (rental.status === "APPROVED") {
      return (
        <TouchableOpacity
          style={[styles.actionBtnOutline, { borderColor: colors.border }]}
          onPress={handleCallSupport}
        >
          <Ionicons
            name="call-outline"
            size={16}
            color={colors.textPrimary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.actionBtnTextOutline, { color: colors.textPrimary }]}
          >
            Связаться с сервисом
          </Text>
        </TouchableOpacity>
      );
    }

    if (rental.status === "ACTIVE") {
      return (
        <TouchableOpacity
          style={[styles.actionBtnPrimary, { backgroundColor: colors.accent }]}
          onPress={handleCallSupport}
        >
          <Ionicons
            name="headset-outline"
            size={16}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.actionBtnTextPrimary}>Служба поддержки</Text>
        </TouchableOpacity>
      );
    }

    if (rental.status === "COMPLETED") {
      if (!rental.has_review) {
        return (
          <TouchableOpacity
            style={[
              styles.actionBtnPrimary,
              { backgroundColor: colors.accent },
            ]}
            onPress={onReviewPress}
          >
            <Ionicons
              name="star-outline"
              size={16}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionBtnTextPrimary}>Оценить поездку</Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          style={[styles.actionBtnOutline, { borderColor: colors.border }]}
          onPress={onBookAgainPress}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color={colors.textPrimary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.actionBtnTextOutline, { color: colors.textPrimary }]}
          >
            Забронировать снова
          </Text>
        </TouchableOpacity>
      );
    }

    if (rental.status === "CANCELED" || rental.status === "REJECTED") {
      return (
        <TouchableOpacity
          style={[
            styles.actionBtnPrimary,
            { backgroundColor: colors.textPrimary },
          ]}
          onPress={onFindOtherPress}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color={colors.background}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.actionBtnTextPrimary, { color: colors.background }]}
          >
            Подобрать другое авто
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const content = renderContent();

  if (!content) return null;

  return <View style={styles.actionsContainer}>{content}</View>;
};

const styles = StyleSheet.create({
  actionsContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnTextPrimary: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnTextOutline: { fontSize: 14, fontWeight: "600" },
});
