import { View } from "react-native";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export default function MenuDummyScreen() {
  const colors = useAppColors();
  // Этот экран физически никогда не покажется, потому что клик перехватывается в _layout.tsx
  // Но Expo Router требует, чтобы файл возвращал React-компонент.
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
