import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { axiosInstance } from "@/src/api/axios-instance";
import { Toast } from "@/src/components/Toast";
import { AlertDialog } from "@/src/components/Alert";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector } from "@/src/store";
import { selectIsGuest } from "@/src/store/slices/authSlice";
import { UserDocument, DocType } from "@/src/types";

export default function UploadDocsScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();
  const isGuest = useAppSelector(selectIsGuest);

  // Ловим параметр (если from === "registration", показываем футер)
  const { from } = useLocalSearchParams<{ from: string }>();
  const isFromRegistration = from === "registration";

  const [docs, setDocs] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);

  const fetchMyDocs = async () => {
    try {
      const response = await axiosInstance.get("/documents/my");
      setDocs(response.data);
    } catch (error) {
      console.error("Ошибка загрузки документов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isGuest) return;
      fetchMyDocs();
    }, [isGuest]),
  );

  const processImageUpload = async (
    type: DocType,
    result: ImagePicker.ImagePickerResult,
  ) => {
    if (result.canceled || !result.assets[0]) return;

    setUploadingType(type);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", {
        uri: asset.uri,
        name: `doc_${type}.jpg`,
        type: "image/jpeg",
      } as any);

      await axiosInstance.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // скан документа тяжёлый — дефолтных 10с мало для мобильной сети
      });

      await fetchMyDocs();

      Toast.success(
        t("docs.upload_success", "Документ загружен"),
        t("docs.upload_success_msg", "Ожидайте проверки менеджером"),
      );
    } catch (error: any) {
      Toast.error(
        t("common.error", "Ошибка"),
        error.response?.data?.message ||
          t("docs.upload_error", "Не удалось отправить документ на сервер."),
      );
    } finally {
      setUploadingType(null);
    }
  };

  const openCamera = async (type: DocType) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      return AlertDialog.alert(
        t("common.error", "Ошибка"),
        t("docs.camera_permission", "Необходим доступ к камере."),
      );
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.2,
    });
    await processImageUpload(type, result);
  };

  const openGallery = async (type: DocType) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return AlertDialog.alert(
        t("common.error", "Ошибка"),
        t("docs.gallery_permission", "Необходим доступ к галерее."),
      );
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.2,
    });
    await processImageUpload(type, result);
  };

  const handleUploadSelection = (type: DocType) => {
    AlertDialog.alert(
      t("docs.select_source_title", "Загрузить фото"),
      t("docs.select_source_msg", "Выберите источник фотографии"),
      [
        { text: t("docs.camera", "Камера"), onPress: () => openCamera(type) },
        {
          text: t("docs.gallery", "Галерея"),
          onPress: () => openGallery(type),
        },
        { text: t("common.cancel", "Отмена"), style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  // 🔥 ТОТ САМЫЙ ALERT ПЕРЕД ОБНОВЛЕНИЕМ ВЕРИФИЦИРОВАННОГО ДОКУМЕНТА
  const handleUpdateVerifiedDoc = (type: DocType) => {
    AlertDialog.alert(
      t("docs.warning_title", "Внимание!"),
      t(
        "docs.warning_msg",
        "При обновлении документов ваш профиль будет отправлен на повторную проверку. Вы не сможете арендовать авто до подтверждения модератором. Продолжить?",
      ),
      [
        { text: t("common.cancel", "Отмена"), style: "cancel" },
        {
          text: t("common.continue", "Продолжить"),
          style: "destructive",
          onPress: () => handleUploadSelection(type),
        },
      ],
    );
  };

  const renderDocCard = (
    title: string,
    type: DocType,
    iconName: keyof typeof Ionicons.glyphMap,
  ) => {
    const doc = docs.find((d) => d.type === type);
    const isUploading = uploadingType === type;

    let statusColor = colors.textSecondary;
    let statusText = t("docs.status_missing", "Не загружен");
    let CardIcon = (
      <Ionicons name={iconName} size={28} color={colors.textSecondary} />
    );

    let ActionButton = (
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.accent }]}
        onPress={() => handleUploadSelection(type)}
      >
        <Ionicons
          name="cloud-upload-outline"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.actionBtnText}>
          {t("docs.btn_upload", "Загрузить")}
        </Text>
      </TouchableOpacity>
    );

    if (doc) {
      switch (doc.status) {
        case "PENDING":
          statusColor = colors.warningText || colors.warning;
          statusText = t("docs.status_pending", "На проверке");
          CardIcon = <Ionicons name="time" size={28} color={statusColor} />;
          ActionButton = (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.warningBg },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {t("docs.btn_checking", "Проверяем...")}
              </Text>
            </View>
          );
          break;

        case "VERIFIED":
          statusColor = colors.success;
          statusText = t("docs.status_verified", "Подтвержден");
          CardIcon = (
            <Ionicons name="checkmark-circle" size={28} color={statusColor} />
          );
          // 🔥 ТЕПЕРЬ ТУТ КНОПКА "ОБНОВИТЬ", А НЕ ПРОСТО ПЛАШКА
          ActionButton = (
            <TouchableOpacity
              style={[
                styles.actionBtnOutline,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              onPress={() => handleUpdateVerifiedDoc(type)}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={colors.textPrimary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.actionBtnOutlineText,
                  { color: colors.textPrimary },
                ]}
              >
                {t("common.update", "Обновить")}
              </Text>
            </TouchableOpacity>
          );
          break;

        case "REJECTED":
          statusColor = colors.error;
          statusText = t("docs.status_rejected", "Отклонен");
          CardIcon = (
            <Ionicons name="close-circle" size={28} color={statusColor} />
          );
          ActionButton = (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.error }]}
              onPress={() => handleUploadSelection(type)}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.actionBtnText}>
                {t("docs.btn_reupload", "Загрузить заново")}
              </Text>
            </TouchableOpacity>
          );
          break;
      }
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
            {CardIcon}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {title}
            </Text>
            <Text
              style={{ color: statusColor, fontSize: 14, fontWeight: "600" }}
            >
              {statusText}
            </Text>
          </View>
        </View>

        {doc?.status === "REJECTED" && doc.rejection_reason && (
          <View
            style={[
              styles.rejectReasonBox,
              { backgroundColor: colors.errorBg },
            ]}
          >
            <Text
              style={{
                color: colors.error,
                fontSize: 14,
                fontWeight: "500",
                lineHeight: 20,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {t("docs.reason", "Причина:")}{" "}
              </Text>
              {doc.rejection_reason}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator
                color={colors.accent}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                {t("docs.uploading", "Отправка файла...")}
              </Text>
            </View>
          ) : (
            ActionButton
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: colors.surface, zIndex: 10 }}
      >
        <View style={styles.stickyHeader}>
          <TouchableOpacity
            onPress={() =>
              isFromRegistration ? router.replace("/") : router.back()
            }
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFromRegistration ? "close-outline" : "chevron-back"}
              size={28}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          {/* 🔥 ДИНАМИЧЕСКИЙ ЗАГОЛОВОК */}
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {isFromRegistration
              ? t("docs.verification_title", "Верификация")
              : t("profile.my_documents", "Мои документы")}
          </Text>
        </View>
        <View
          style={[styles.headerDivider, { backgroundColor: colors.border }]}
        />
      </SafeAreaView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
            {t("docs.page_title", "Ваши документы")}
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            {t(
              "docs.page_subtitle",
              "Сделайте четкие фотографии оригиналов. Мы гарантируем безопасность ваших данных.",
            )}
          </Text>

          {renderDocCard(
            t("docs.passport", "Паспорт (разворот)"),
            "PASSPORT",
            "book-outline",
          )}
          {renderDocCard(
            t("docs.license", "Водительские права"),
            "DRIVER_LICENSE",
            "card-outline",
          )}

          <View
            style={[styles.infoBox, { backgroundColor: colors.background }]}
          >
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={colors.success}
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                flex: 1,
                color: colors.textSecondary,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {t(
                "docs.security_hint",
                "Ваши данные надежно зашифрованы и используются исключительно для проверки службой безопасности.",
              )}
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ФУТЕР ТОЛЬКО ДЛЯ РЕГИСТРАЦИИ */}
      {isFromRegistration && (
        <SafeAreaView
          edges={["bottom"]}
          style={[
            styles.stickyFooter,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.continueBtnText}>
              {t("docs.go_to_cars", "Перейти к машинам")}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
  },
  backBtn: { justifyContent: "center", marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  headerDivider: { height: StyleSheet.hairlineWidth, opacity: 0.7 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
  },
  pageSubtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },

  card: { padding: 20, marginBottom: 16, borderRadius: 24 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  rejectReasonBox: { padding: 16, borderRadius: 16, marginBottom: 16 },
  cardFooter: { alignItems: "flex-start" },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  actionBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  // 👇 НОВАЯ КНОПКА "ОБНОВИТЬ" (Outline style)
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnOutlineText: { fontWeight: "600", fontSize: 14 },

  statusBadge: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  statusBadgeText: { fontWeight: "bold", fontSize: 14 },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 20,
    borderRadius: 24,
  },

  stickyFooter: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderWidth: 0,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  continueBtn: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  continueBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
