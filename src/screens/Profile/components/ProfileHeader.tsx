import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { User } from "@/src/types";

interface Props {
  user: User | null;
  isGuest: boolean;
}

export const ProfileHeader = ({ user, isGuest }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  // Достаем первые буквы имени и фамилии для аватара
  const initials =
    !isGuest && user
      ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
      : "?";

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
        {isGuest ? (
          <Ionicons name="person" size={40} color={colors.textSecondary} />
        ) : (
          <Text style={[styles.avatarText, { color: colors.accent }]}>
            {initials}
          </Text>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {isGuest
            ? t("profile.guest", "Гость")
            : `${user?.first_name} ${user?.last_name}`}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isGuest
            ? t("profile.guest_hint", "Войдите, чтобы бронировать авто")
            : user?.phone || user?.email}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
});
