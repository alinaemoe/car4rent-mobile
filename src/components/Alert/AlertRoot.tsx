import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { AlertDialog, AlertOptions, AlertButton } from "./AlertService";

const { width } = Dimensions.get("window");

export const AlertRoot = () => {
  const colors = useAppColors();
  const [alert, setAlert] = useState<AlertOptions | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AlertDialog.setListener(showAlert);

    return () => {
      AlertDialog.setListener(() => {});
    };
  }, []);

  const showAlert = (options: AlertOptions) => {
    setAlert(options);
    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAlert(null);
    });
  };

  const handleButtonPress = (button: AlertButton) => {
    hideAlert();
    button.onPress?.();
  };

  const handleOverlayPress = () => {
    if (alert?.cancelable !== false) {
      const cancelBtn = alert?.buttons?.find((b) => b.style === "cancel");
      if (cancelBtn) {
        handleButtonPress(cancelBtn);
      } else {
        hideAlert();
      }
    }
  };

  if (!alert) return null;

  const buttons = alert.buttons || [];
  // Если кнопок больше двух — выстраиваем их вертикально
  const isVerticalLayout = buttons.length > 2;
  const hasDestructive = buttons.some((b) => b.style === "destructive");

  return (
    <Modal
      transparent
      visible={!!alert}
      animationType="none"
      onRequestClose={() => {
        const cancelBtn = alert.buttons?.find((b) => b.style === "cancel");
        if (cancelBtn) {
          handleButtonPress(cancelBtn);
        } else {
          hideAlert();
        }
      }}
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View
          style={[
            styles.overlay,
            { backgroundColor: colors.overlay || "rgba(0,0,0,0.5)" },
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.dialog,
                {
                  backgroundColor: colors.background,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Премиальная иконка вместо эмодзи при деструктивных действиях */}
              {hasDestructive && (
                <View style={styles.iconContainer}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor:
                          colors.errorBg || "rgba(255, 77, 79, 0.1)",
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="error-outline"
                      size={28}
                      color={colors.error || "#ff4d4f"}
                    />
                  </View>
                </View>
              )}

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {alert.title}
              </Text>

              {alert.message && (
                <Text style={[styles.message, { color: colors.textSecondary }]}>
                  {alert.message}
                </Text>
              )}

              {/* Контейнер кнопок с адаптивной раскладкой */}
              <View
                style={[
                  styles.buttonsContainer,
                  isVerticalLayout
                    ? styles.verticalContainer
                    : styles.horizontalContainer,
                  { borderColor: colors.border || "rgba(128,128,128,0.15)" },
                ]}
              >
                {buttons.map((button, index) => {
                  const isCancel = button.style === "cancel";
                  const isDestructive = button.style === "destructive";

                  let btnTextStyle = styles.defaultBtnText;
                  let btnColor = colors.accent || "#40a9ff";

                  if (isCancel) {
                    btnTextStyle = styles.cancelBtnText;
                    btnColor = colors.textSecondary || "#a1a1aa";
                  }
                  if (isDestructive) {
                    btnTextStyle = styles.destructiveBtnText;
                    btnColor = colors.error || "#ff4d4f";
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.7}
                      style={[
                        styles.button,
                        isVerticalLayout
                          ? styles.verticalButton
                          : styles.horizontalButton,
                        // Мягкое разделение кнопкам без поломки внешних скруглений
                        !isVerticalLayout &&
                          index > 0 && {
                            borderLeftWidth: StyleSheet.hairlineWidth,
                            borderLeftColor:
                              colors.border || "rgba(128,128,128,0.15)",
                          },
                        isVerticalLayout &&
                          index > 0 && {
                            borderTopWidth: StyleSheet.hairlineWidth,
                            borderTopColor:
                              colors.border || "rgba(128,128,128,0.15)",
                          },
                      ]}
                      onPress={() => handleButtonPress(button)}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          btnTextStyle,
                          { color: btnColor },
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: Math.min(width - 48, 340), // Ограничиваем максимальную ширину для планшетов
    borderRadius: 20,
    paddingTop: 28,
    backgroundColor: "#FFFFFF",
    overflow: "hidden", // Идеально скругляет фон кнопок при нажатии (больше ничего не вылезает)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 10,
    lineHeight: 25,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  buttonsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  horizontalContainer: {
    flexDirection: "row",
  },
  verticalContainer: {
    flexDirection: "column",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  horizontalButton: {
    flex: 1,
  },
  verticalButton: {
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  defaultBtnText: {},
  cancelBtnText: {
    fontWeight: "500",
  },
  destructiveBtnText: {
    fontWeight: "700",
  },
});
