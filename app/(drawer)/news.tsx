import { View, Text } from "react-native";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export default function NewsScreen() {
  const colors = useAppColors();

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
        Новости 📰
      </Text>
    </View>
  );
}
