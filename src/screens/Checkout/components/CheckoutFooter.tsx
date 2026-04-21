import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  isFormValid: boolean;
  onSubmit: () => void;
}

export const CheckoutFooter = ({ isFormValid, onSubmit }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.footer,
        { backgroundColor: colors.background, borderTopColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.submitBtn,
          {
            backgroundColor: isFormValid
              ? colors.accent
              : "rgba(33, 150, 243, 0.4)",
          },
        ]}
        onPress={onSubmit}
        activeOpacity={0.8}
        disabled={!isFormValid}
      >
        <Text style={styles.submitBtnText}>
          {t("checkout.continue", "Продолжить")}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.footerTip, { color: colors.textSecondary }]}>
        {t("checkout.footer_tip", "Укажите период аренды и регион поездки")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  submitBtn: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  footerTip: { textAlign: "center", fontSize: 12, marginTop: 12 },
});
