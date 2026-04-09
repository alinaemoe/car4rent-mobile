import { Platform } from "react-native";

// Акцентные цвета Expo (заменяем на твой синий из UI Kit)
const tintColorLight = "#2196f3";
const tintColorDark = "#40a9ff";

export const Colors = {
  light: {
    // === Системные цвета Expo (нужны для базовых табов и компонентов) ===
    text: "#1a1a1a", // text-primary
    background: "#ffffff",
    tint: tintColorLight,
    icon: "#4a4a4a", // text-secondary
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,

    // === Custom colors from the UI Kit ===
    surface: "#f5f5f5",
    border: "#e0e0e0",
    textPrimary: "#1a1a1a",
    textSecondary: "#4a4a4a",
    accent: "#2196f3",
    accentHover: "#1976d2",
    error: "#e57373",
    warning: "#ffd54f",
    warningText: "#7a5e00",
    success: "#81c784",
    // Transparent backgrounds for status badges (like in CSS)
    successBg: "rgba(129, 199, 132, 0.2)",
    errorBg: "rgba(229, 115, 115, 0.2)",
    warningBg: "rgba(255, 213, 79, 0.3)",
  },
  dark: {
    // === Expo Brand Colors ===
    text: "#e5e5e7",
    background: "#121212",
    tint: tintColorDark,
    icon: "#a1a1a1",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,

    // === Custom colors from the UI Kit ===
    surface: "#1c1c1e",
    border: "#2c2c2e",
    textPrimary: "#e5e5e7",
    textSecondary: "#a1a1a1",
    accent: "#40a9ff",
    accentHover: "#1890ff",
    error: "#ef5350",
    warning: "#ffca28",
    warningText: "#ffca28",
    success: "#66bb6a",
    successBg: "rgba(102, 187, 106, 0.2)",
    errorBg: "rgba(239, 83, 80, 0.2)",
    warningBg: "rgba(255, 202, 40, 0.2)",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
