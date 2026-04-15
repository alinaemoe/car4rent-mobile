import { Platform } from "react-native";

const tintColorLight = "#2196f3";
const tintColorDark = "#40a9ff";

export const Colors = {
  light: {
    // === Системные цвета Expo ===
    text: "#1a1a1a",
    background: "#ffffff",
    tint: tintColorLight,
    icon: "#4a4a4a",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,

    // === Custom colors ===
    surface: "#f5f5f5",
    border: "#e0e0e0",
    textPrimary: "#1a1a1a",
    textSecondary: "#4a4a4a",
    accent: "#2196f3",
    accentHover: "#1976d2",
    accentBg: "rgba(33, 150, 243, 0.1)",
    surfaceTransparent: "rgba(245, 245, 245, 0.8)",

    // 👇 ДОБАВЛЕНО: Для модалок, шторок и загрузок
    overlay: "rgba(0, 0, 0, 0.5)", // Затемнение фона под модалкой
    skeleton: "#e0e0e0", // Цвет "скелетона" при загрузке (ActivityIndicator)
    skeletonHighlight: "#f5f5f5", // Перелив скелетона

    // Статусы
    error: "#e57373",
    warning: "#ffd54f",
    warningText: "#7a5e00",
    success: "#81c784",
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

    // === Custom colors ===
    surface: "#1c1c1e",
    border: "#2c2c2e",
    textPrimary: "#e5e5e7",
    textSecondary: "#a1a1a1",
    accent: "#40a9ff",
    accentHover: "#1890ff",
    accentBg: "rgba(64, 169, 255, 0.15)",
    surfaceTransparent: "rgba(28, 28, 30, 0.8)",

    // 👇 ДОБАВЛЕНО
    overlay: "rgba(0, 0, 0, 0.7)",
    skeleton: "#2c2c2e",
    skeletonHighlight: "#3a3a3c",

    // Статусы
    error: "#ef5350",
    warning: "#ffca28",
    warningText: "#ffca28",
    success: "#66bb6a",
    successBg: "rgba(102, 187, 106, 0.2)",
    errorBg: "rgba(239, 83, 80, 0.2)",
    warningBg: "rgba(255, 202, 40, 0.2)",
  },
};
