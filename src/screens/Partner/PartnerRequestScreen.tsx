import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CreatePartnershipDto,
  useCreatePartnershipRequest,
} from "@/src/api/queries/usePartnership";
import { Toast } from "@/src/components/Toast";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector } from "@/src/store";

// Включаем LayoutAnimation для Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TOTAL_STEPS = 3;

export default function PartnerRequestScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);

  const { mutate: submitRequest, isPending } = useCreatePartnershipRequest();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreatePartnershipDto>({
    car_brand: "",
    car_model: "",
    car_year: new Date().getFullYear(),
    owner_name: user?.first_name || "",
    owner_phone: user?.phone || "",
    photos: [],
  });

  const handleNext = () => {
    // Валидация текущего шага
    if (step === 1) {
      if (
        !formData.car_brand.trim() ||
        !formData.car_model.trim() ||
        !formData.car_year
      ) {
        return Toast.error(
          t("common.attention", "Внимание"),
          t(
            "request.err_fill_car",
            "Пожалуйста, заполните все поля об автомобиле",
          ),
        );
      }
    } else if (step === 2) {
      if (!formData.photos || formData.photos.length === 0) {
        return Toast.error(
          t("request.photos_title", "Фотографии"),
          t("request.err_add_photo", "Загрузите хотя бы одно фото вашего авто"),
        );
      }
    }

    // Плавная анимация переключения шага
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (!formData.owner_name.trim() || !formData.owner_phone.trim()) {
      return Toast.error(
        t("request.contacts_title", "Контакты"),
        t("request.err_fill_contacts", "Пожалуйста, укажите имя и телефон"),
      );
    }

    submitRequest(formData, {
      onSuccess: () => {
        Toast.success(
          t("request.success_title", "Заявка принята!"),
          t("request.success_desc", "Наш менеджер скоро свяжется с вами."),
        );
        router.replace("/(drawer)/(tabs)/profile"); // Возвращаем в профиль
      },
      onError: (err: any) => {
        Toast.error(
          t("common.error", "Ошибка"),
          err.response?.data?.message ||
            t("request.err_submit", "Не удалось отправить заявку"),
        );
      },
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setFormData({
        ...formData,
        photos: [...(formData.photos || []), ...newUris].slice(0, 5),
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData({
      ...formData,
      photos: formData.photos?.filter((_, index) => index !== indexToRemove),
    });
  };

  // === РЕНДЕР ШАГОВ ===
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        {t("request.step1_title", "Об автомобиле")}
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        {t("request.step1_desc", "Какую машину вы хотите сдавать в аренду?")}
      </Text>

      <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
          {t("request.brand_label", "Марка")}
        </Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={t("request.brand_placeholder", "Например, BMW")}
          placeholderTextColor={colors.placeholder}
          value={formData.car_brand}
          onChangeText={(text) => setFormData({ ...formData, car_brand: text })}
        />
      </View>

      <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
          {t("request.model_label", "Модель")}
        </Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={t("request.model_placeholder", "Например, X5")}
          placeholderTextColor={colors.placeholder}
          value={formData.car_model}
          onChangeText={(text) => setFormData({ ...formData, car_model: text })}
        />
      </View>

      <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
          {t("request.year_label", "Год выпуска")}
        </Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={t("request.year_placeholder", "Например, 2022")}
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          maxLength={4}
          value={formData.car_year ? formData.car_year.toString() : ""}
          onChangeText={(text) =>
            setFormData({ ...formData, car_year: Number(text) })
          }
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        {t("request.step2_title", "Внешний вид")}
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        {t(
          "request.step2_desc",
          "Добавьте до 5 фотографий (снаружи и внутри), чтобы мы оценили состояние.",
        )}
      </Text>

      <View style={styles.photoGrid}>
        {formData.photos?.map((uri, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image
              source={{ uri }}
              style={styles.photoThumbnail}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.removePhotoBtn}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {(formData.photos?.length || 0) < 5 && (
          <TouchableOpacity
            style={[
              styles.addPhotoBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={pickImage}
          >
            <Ionicons name="camera-outline" size={32} color={colors.accent} />
            <Text
              style={{
                color: colors.accent,
                marginTop: 8,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {t("common.add", "Добавить")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        {t("request.step3_title", "Контакты")}
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        {t("request.step3_desc", "Как к вам обращаться?")}
      </Text>

      <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
          {t("request.name_label", "Ваше имя")}
        </Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={t("request.name_placeholder", "Введите ваше имя")}
          placeholderTextColor={colors.placeholder}
          value={formData.owner_name}
          onChangeText={(text) =>
            setFormData({ ...formData, owner_name: text })
          }
        />
      </View>

      <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
          {t("request.phone_label", "Телефон для связи")}
        </Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={t("request.phone_placeholder", "+7 (***) ***-**-**")}
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
          value={formData.owner_phone}
          onChangeText={(text) =>
            setFormData({ ...formData, owner_phone: text })
          }
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. ХЕДЕР И ПРОГРЕСС-БАР */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.surface }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (step === 1 ? router.back() : handlePrev())}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t("request.step_counter", {
              step,
              total: TOTAL_STEPS,
              defaultValue: "Шаг {{step}} из {{total}}",
            })}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Индикатор прогресса */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressSegment,
                { backgroundColor: s <= step ? colors.accent : colors.border },
              ]}
            />
          ))}
        </View>
      </SafeAreaView>

      {/* 2. СКРОЛЛ С ФОРМОЙ (KEYBOARD AVOIDING ДЛЯ ИНПУТОВ) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 3. НИЖНЯЯ КНОПКА */}
      <SafeAreaView
        edges={["bottom"]}
        style={[styles.footer, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          style={[styles.mainBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
          onPress={step === TOTAL_STEPS ? handleSubmit : handleNext}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.mainBtnText}>
              {step === TOTAL_STEPS
                ? t("request.submit_btn", "Отправить заявку")
                : t("common.continue", "Продолжить")}
            </Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    padding: 24,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },

  /* Стили инпутов */
  inputBox: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  input: {
    fontSize: 18,
    fontWeight: "500",
    padding: 0,
    height: 24, // Фикс для выравнивания на iOS/Android
  },

  /* Стили сетки фото */
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoWrapper: {
    width: "47%", // 2 в ряд
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
  },
  removePhotoBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 12,
  },
  addPhotoBtn: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Футер с кнопкой */
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24, // Дополнительный отступ снизу
  },
  mainBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
