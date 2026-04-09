import { Colors } from "../constants/theme";
import { useColorScheme } from "./use-color-scheme";

// 1. Дефолтный хук Expo (отдает один конкретный цвет)
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// 👇 2. НАШ НОВЫЙ СУПЕР-ХУК (отдает сразу всю палитру)
export function useAppColors() {
  const theme = useColorScheme() ?? "light";
  return Colors[theme];
}
