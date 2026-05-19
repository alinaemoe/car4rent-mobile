import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type DocStatus =
  | "GUEST"
  | "UNVERIFIED"
  | "PENDING"
  | "REJECTED"
  | "VERIFIED";

interface Props {
  status: DocStatus;
  onPress: () => void;
}

export const VerificationBanner = ({ status, onPress }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  if (status === "GUEST") return null;

  let bg = colors.surface;
  let icon = "shield-checkmark-outline";
  let iconColor = colors.success;
  let title = "";
  let desc = "";
  let btnText = "";
  let showBtn = false;

  switch (status) {
    case "UNVERIFIED":
      bg = colors.errorBg;
      icon = "shield-alert-outline";
      iconColor = colors.error;
      title = t("verification.unverified_title", "Требуется верификация");
      desc = t(
        "verification.unverified_desc",
        "Загрузите документы (Паспорт и Права), чтобы получить доступ к бронированию.",
      );
      btnText = t("verification.verify_btn", "Пройти проверку");
      showBtn = true;
      break;
    case "PENDING":
      bg = colors.warningBg;
      icon = "time-outline";
      iconColor = colors.warningText || colors.warning;
      title = t("verification.pending_title", "Документы проверяются");
      desc = t(
        "verification.pending_desc",
        "Обычно проверка занимает до 15 минут. Мы пришлем вам уведомление.",
      );
      break;
    case "REJECTED":
      bg = colors.errorBg;
      icon = "close-circle-outline";
      iconColor = colors.error;
      title = t("verification.rejected_title", "Документы отклонены");
      desc = t(
        "verification.rejected_desc",
        "Фотографии размыты или данные не читаются. Пожалуйста, сделайте новые фото.",
      );
      btnText = t("verification.reupload_btn", "Загрузить заново");
      showBtn = true;
      break;
    case "VERIFIED":
      bg = colors.successBg;
      icon = "checkmark-circle-outline";
      iconColor = colors.success;
      title = t("verification.verified_title", "Личность подтверждена");
      desc = t(
        "verification.verified_desc",
        "Вы можете бронировать любые автомобили без ограничений.",
      );
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <Text style={[styles.title, { color: iconColor }]}>{title}</Text>
      </View>
      <Text style={[styles.desc, { color: colors.textPrimary }]}>{desc}</Text>

      {showBtn && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.background }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { color: iconColor }]}>{btnText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  btnText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
