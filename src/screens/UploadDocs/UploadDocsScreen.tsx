import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";

import { axiosInstance } from "@/src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { UserDocument, DocType } from "@/src/types";

export default function UploadDocsScreen() {
  const colors = useAppColors();
  const router = useRouter();

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
      fetchMyDocs();
    }, []),
  );

  // Универсальная отправка FormData (работает с Cloudinary на бэке)
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchMyDocs();
    } catch (error: any) {
      Alert.alert(
        "Ошибка загрузки",
        error.response?.data?.message ||
          "Не удалось отправить документ на сервер.",
      );
    } finally {
      setUploadingType(null);
    }
  };

  const openCamera = async (type: DocType) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      return Alert.alert("Ошибка", "Необходим доступ к камере.");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.2, // Жесткое сжатие для экономии трафика и обхода 413 Payload Too Large
    });

    await processImageUpload(type, result);
  };

  const openGallery = async (type: DocType) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return Alert.alert("Ошибка", "Необходим доступ к галерее.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.2,
    });

    await processImageUpload(type, result);
  };

  const handleUploadSelection = (type: DocType) => {
    Alert.alert(
      "Загрузить фото",
      "Выберите источник фотографии",
      [
        { text: "Камера", onPress: () => openCamera(type) },
        { text: "Галерея", onPress: () => openGallery(type) },
        { text: "Отмена", style: "cancel" },
      ],
      { cancelable: true },
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
    let statusText = "Не загружен";
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
        <Text style={styles.actionBtnText}>Загрузить</Text>
      </TouchableOpacity>
    );

    if (doc) {
      switch (doc.status) {
        case "PENDING":
          statusColor = colors.warningText || colors.warning;
          statusText = "На проверке";
          CardIcon = <Ionicons name="time" size={28} color={statusColor} />;
          ActionButton = (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.warningBg },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                Проверяем...
              </Text>
            </View>
          );
          break;
        case "VERIFIED":
          statusColor = colors.success;
          statusText = "Подтвержден";
          CardIcon = (
            <Ionicons name="checkmark-circle" size={28} color={statusColor} />
          );
          ActionButton = (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.successBg },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                Принято
              </Text>
            </View>
          );
          break;
        case "REJECTED":
          statusColor = colors.error;
          statusText = "Отклонен";
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
              <Text style={styles.actionBtnText}>Загрузить заново</Text>
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
              <Text style={{ fontWeight: "bold" }}>Причина: </Text>
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
                Отправка файла...
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
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Верификация
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
            Ваши документы
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Сделайте четкие фотографии оригиналов. Мы гарантируем безопасность
            ваших данных.
          </Text>

          {renderDocCard("Паспорт (разворот)", "PASSPORT", "book-outline")}
          {renderDocCard(
            "Водительские права",
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
              Ваши данные надежно зашифрованы и используются исключительно для
              проверки службой безопасности.
            </Text>
          </View>
        </ScrollView>
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
  backBtn: {
    justifyContent: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    opacity: 0.7,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rejectReasonBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardFooter: {
    alignItems: "flex-start",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  statusBadge: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontWeight: "bold",
    fontSize: 14,
  },
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
});
