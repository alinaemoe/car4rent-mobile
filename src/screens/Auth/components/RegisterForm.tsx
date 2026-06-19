import { axiosInstance } from "@/src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  onSuccess: (email: string) => void;
}

// Регулярки
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

export const RegisterForm = ({ onSuccess }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "", // 👈 Поле для подтверждения
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!form.first_name.trim())
      return t("auth.enter_first_name", "Введите ваше имя");
    if (!form.last_name.trim())
      return t("auth.enter_last_name", "Введите вашу фамилию");
    if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim()))
      return t("auth.invalid_phone", "Введите корректный номер телефона");
    if (!EMAIL_REGEX.test(form.email.trim()))
      return t("auth.enter_valid_email", "Введите корректный email");
    if (form.password.length < 6)
      return t(
        "auth.password_min_length",
        "Пароль должен быть не менее 6 символов",
      );
    if (form.password !== form.passwordConfirm)
      return t("auth.passwords_mismatch", "Пароли не совпадают");
    return null; // Ошибок нет
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      return setErrorText(validationError);
    }

    setIsLoading(true);
    setErrorText("");

    try {
      // Отправляем без поля passwordConfirm
      const { passwordConfirm, ...submitData } = form;
      await axiosInstance.post("/auth/register", submitData);
      onSuccess(form.email.trim());
    } catch (error: any) {
      setErrorText(
        error.response?.data?.message ||
          t("auth.register_error", "Ошибка регистрации"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Хелпер для отрисовки инпута со звездочкой
  const renderInput = (
    label: string,
    field: keyof typeof form,
    isRequired = true,
    props: any = {},
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label} {isRequired && <Text style={{ color: colors.error }}>*</Text>}
      </Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholderTextColor={colors.placeholder}
          value={form[field]}
          onChangeText={(text) => setForm({ ...form, [field]: text })}
          {...props}
        />
        {/* Глазик для паролей */}
        {(field === "password" || field === "passwordConfirm") && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t("auth.create_account", "Создать аккаунт")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("auth.join_car4rent", "Присоединяйтесь к Car4Rent")}
        </Text>
      </View>

      {errorText ? (
        <View
          style={[styles.errorBox, { backgroundColor: `${colors.error}15` }]}
        >
          <Text style={{ color: colors.error, fontWeight: "500" }}>
            {errorText}
          </Text>
        </View>
      ) : null}

      {renderInput(t("auth.first_name", "Имя"), "first_name")}
      {renderInput(t("auth.last_name", "Фамилия"), "last_name")}
      {renderInput(t("auth.phone", "Телефон"), "phone", false, {
        keyboardType: "phone-pad",
      })}
      {renderInput(t("auth.email_label", "Email"), "email", true, {
        keyboardType: "email-address",
        autoCapitalize: "none",
      })}
      {renderInput(t("auth.password_label", "Пароль"), "password", true, {
        secureTextEntry: !showPassword,
        autoCapitalize: "none",
      })}
      {renderInput(
        t("auth.repeat_password", "Повторите пароль"),
        "passwordConfirm",
        true,
        {
          secureTextEntry: !showPassword,
          autoCapitalize: "none",
        },
      )}

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.accent }]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>
            {t("auth.continue_button", "Продолжить")}
          </Text>
        )}
      </TouchableOpacity>

      {/* Навигация переехала вниз, аккуратным текстом */}
      <View style={styles.footerLinkContainer}>
        <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
          {t("auth.already_have_account", "Уже есть аккаунт? ")}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text
            style={{ color: colors.accent, fontSize: 15, fontWeight: "bold" }}
          >
            {t("auth.login_link", "Войти")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80, // Отступ сверху вместо хедера
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56, // Высокие, удобные поля
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 8,
    marginRight: -8,
  },
  submitBtn: {
    marginTop: 16,
    height: 56,
    borderRadius: 16, // Округлая современная кнопка
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  footerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
});
