import React, { forwardRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { AppBottomSheet } from "@/src/components/AppBottomSheet";
import { Rental } from "@/src/api/queries/useRentals";
import { useCreateReview } from "@/src/api/queries/useReviews";
import { Toast } from "@/src/components/Toast";

interface Props {
  rental: Rental | null;
  onClose: () => void;
}

export const ReviewBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ rental, onClose }, ref) => {
    const colors = useAppColors();
    const { t } = useTranslation();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const { mutate: createReview, isPending } = useCreateReview();

    useEffect(() => {
      setRating(0);
      setComment("");
      setIsFocused(false);
    }, [rental]);

    if (!rental) return null;

    const mainImage =
      rental.car.images?.find((img) => img.is_main)?.url ||
      rental.car.images?.[0]?.url;

    const handleSubmit = () => {
      if (rating === 0) {
        Toast.error("Внимание", "Пожалуйста, поставьте оценку от 1 до 5 звезд");
        return;
      }

      createReview(
        { rental_id: rental.id, rating, comment },
        {
          onSuccess: () => {
            Toast.success("Спасибо!", "Ваш отзыв успешно сохранен");
            setRating(0);
            setComment("");
            onClose();
          },
          onError: (error: any) => {
            Toast.error(
              "Ошибка",
              error.response?.data?.message || "Не удалось отправить отзыв",
            );
          },
        },
      );
    };

    return (
      <AppBottomSheet ref={ref} title="Оценить поездку" snapPoints={["85%"]}>
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Карточка машины (мини) */}
          <View style={[styles.carInfo, { backgroundColor: colors.surface }]}>
            <Image
              source={{ uri: mainImage }}
              style={styles.carImage}
              contentFit="cover"
            />
            <View style={styles.carText}>
              <Text style={[styles.carName, { color: colors.textPrimary }]}>
                {rental.car.brand} {rental.car.model}
              </Text>
              <Text style={[styles.carYear, { color: colors.textSecondary }]}>
                {rental.car.year} • {rental.car.license_plate}
              </Text>
            </View>
          </View>

          {/* Ввод текста */}
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Расскажите о впечатлениях
          </Text>
          <BottomSheetTextInput
            style={[
              styles.input,
              {
                backgroundColor: isFocused ? colors.surface : colors.background,
                color: colors.textPrimary,
                borderColor: isFocused ? colors.accent : colors.border,
                shadowColor: isFocused ? colors.accent : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isFocused ? 0.1 : 0,
                shadowRadius: 8,
                elevation: isFocused ? 2 : 0,
              },
            ]}
            placeholder="Что понравилось или не понравилось?"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
            // 👇 Затыкаем TypeScript с помощью as any, так как это косяк самой либы
            onFocus={(() => setIsFocused(true)) as any}
            onBlur={(() => setIsFocused(false)) as any}
          />

          {/* Выбор звезд */}
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Как всё прошло?
          </Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                activeOpacity={0.7}
                onPress={() => setRating(star)}
                style={styles.starBtn}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={44}
                  color={star <= rating ? colors.warning : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Кнопка отправки */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: rating > 0 ? colors.accent : colors.border },
            ]}
            disabled={rating === 0 || isPending}
            onPress={handleSubmit}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.submitText,
                  { color: rating > 0 ? "#fff" : colors.textSecondary },
                ]}
              >
                Отправить отзыв
              </Text>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </AppBottomSheet>
    );
  },
);

ReviewBottomSheet.displayName = "ReviewBottomSheet";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 60 : 40,
  },

  carInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  carImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  carText: { flex: 1 },
  carName: { fontSize: 16, fontWeight: "bold" },
  carYear: { fontSize: 14, marginTop: 2 },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },

  input: {
    width: "100%", // 👈 МАГИЯ ЗДЕСЬ: Инпут теперь на всю ширину
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    height: 120,
    fontSize: 16,
    marginBottom: 24,
  },

  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  starBtn: { padding: 4 },

  submitBtn: {
    width: "100%", // 👈 На всякий случай тоже растянули кнопку
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: { fontSize: 17, fontWeight: "bold" },
});
