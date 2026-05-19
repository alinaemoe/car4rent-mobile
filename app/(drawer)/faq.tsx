import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function FaqScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: 20 }}>
        {t("drawer_faq", "Частые вопросы (FAQ)")} ❓
      </Text>
    </View>
  );
}
