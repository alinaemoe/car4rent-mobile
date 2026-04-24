import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Toast, ToastOptions } from "./ToastService";
import { useColorScheme } from "@/src/hooks/use-color-scheme";

const { width } = Dimensions.get("window");

export const ToastRoot = () => {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();

  const [toast, setToast] = useState<ToastOptions | null>(null);
  const translateY = useRef(new Animated.Value(-150)).current; // Начальная позиция (за экраном)
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = useColorScheme();

  const isDark = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    // 1. Подписываемся на вызовы из любой точки приложения
    Toast.setListener(showToast);

    return () => {
      // Отписываемся при размонтировании (хотя Root монтируется один раз)
      Toast.setListener(() => {});
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showToast = (options: ToastOptions) => {
    setToast(options);

    const isTop = (options.position || "top") === "top";
    const startY = isTop ? -150 : 150;
    const endY = 0;

    // Сброс позиции перед новой анимацией
    translateY.setValue(startY);
    opacity.setValue(0);

    // Очищаем предыдущий таймер, если тосты вызываются подряд
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Пружинная анимация появления (Spring)
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: endY,
        useNativeDriver: true,
        damping: 15,
        stiffness: 100,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Авто-закрытие
    timeoutRef.current = setTimeout(() => {
      hideToast(isTop ? -150 : 150);
    }, options.duration || 4000);
  };

  const hideToast = (targetY: number) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: targetY,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  };

  if (!toast) return null;

  const isTop = (toast.position || "top") === "top";

  // Динамические цвета и иконки в зависимости от типа
  let iconName: keyof typeof Ionicons.glyphMap = "information-circle";
  let accentColor = colors.accent;

  switch (toast.type) {
    case "success":
      iconName = "checkmark-circle";
      accentColor = colors.success;
      break;
    case "error":
      iconName = "alert-circle";
      accentColor = colors.error;
      break;
    case "warning":
      iconName = "warning";
      accentColor = colors.warningText || colors.warning; // Используем темный желтый для читаемости
      break;
    case "info":
      iconName = "information-circle";
      accentColor = colors.accent;
      break;
  }

  // Расчет отступов с учетом челки айфона / шторки андроида
  const dynamicPositionStyle = isTop
    ? { top: insets.top + 10 }
    : { bottom: insets.bottom + 20 };

  const shadowStyle = {
    shadowColor: isDark ? accentColor : "#000",
    shadowOpacity: isDark ? 0.5 : 0.15, // в темной теме свечение должно быть ярче
    shadowRadius: isDark ? 20 : 12,
    elevation: isDark ? 20 : 10,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        dynamicPositionStyle,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none" // Чтобы тост не блокировал клики сквозь себя по краям
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => hideToast(isTop ? -150 : 150)}
        style={[
          styles.toastCard,
          {
            backgroundColor: colors.surface,
            borderLeftColor: accentColor,
            ...shadowStyle,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={28}
          color={accentColor}
          style={styles.icon}
        />

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {toast.title}
          </Text>
          {toast.message && (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {toast.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => hideToast(isTop ? -150 : 150)}
          style={styles.closeBtn}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999, // Поверх вообще всего
    elevation: 9999,
  },
  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    width: width - 32, // Отступы по краям экрана
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 6, // Тот самый красивый цветной индикатор
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeBtn: {
    marginLeft: 12,
  },
});
