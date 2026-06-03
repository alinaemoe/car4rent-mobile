import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { axiosInstance } from "@/src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { logout, selectIsLessor } from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";

interface NavItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  route?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "(tabs)", icon: "home-outline", labelKey: "drawer_home" },
  { key: "news", icon: "newspaper-outline", labelKey: "drawer_news" },
  { key: "rentals", icon: "calendar-outline", labelKey: "drawer_rentals", route: "/(tabs)/rentals" },
  { key: "faq", icon: "help-circle-outline", labelKey: "drawer_faq", route: "/settings/faq" },
];

function CustomDrawerContent(props: any) {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isGuest = useAppSelector((state) => state.auth?.isGuest ?? false);
  const isLessor = useAppSelector(selectIsLessor);
  const user = useAppSelector((state) => state.auth.user);

  const { state, navigation } = props;
  const activeRoute = state.routes[state.index]?.name;

  const userName = user ? `${user.first_name} ${user.last_name}`.trim() || user.email : t("guest", "Гость");
  const userRole = isLessor
    ? t("lessor", "Партнёр")
    : t("renter", "Арендатор");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (!isGuest) {
        await axiosInstance.post("/auth/logout");
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.warn("Ошибка при логауте на бэке:", error.message);
      }
    } finally {
      await storage.removeTokens();
      await storage.setGuestMode(false);
      queryClient.clear();
      dispatch(logout());
      setIsLoggingOut(false);
    }
  };

  const renderDrawerItem = (item: NavItem) => {
    const isActive = activeRoute === item.key;
    const handlePress = () => {
      if (item.route) {
        router.push(item.route as any);
      } else {
        navigation.navigate(item.key);
      }
    };
    return (
      <TouchableOpacity
        key={item.key}
        activeOpacity={0.6}
        onPress={handlePress}
        style={[
          styles.drawerItem,
          {
            backgroundColor: isActive ? colors.accentBg : "transparent",
          },
        ]}
      >
        <View style={[styles.drawerItemIcon, { backgroundColor: isActive ? colors.accent : "transparent" }]}>
          <Ionicons
            name={item.icon}
            size={18}
            color={isActive ? "#fff" : colors.textPrimary}
          />
        </View>
        <Text
          style={[
            styles.drawerItemText,
            {
              color: isActive ? colors.accent : colors.textPrimary,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
        >
          {t(item.labelKey)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Шапка с пользователем */}
      <View
        style={[styles.userSection, { borderBottomColor: colors.border }]}
      >
        <View
          style={[styles.avatar, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.avatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text
          style={[styles.userName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {isGuest ? t("guest_title", "Гостевой режим") : userName}
        </Text>
        {!isGuest && (
          <Text
            style={[styles.userRole, { color: colors.textSecondary }]}
          >
            {userRole}
          </Text>
        )}
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 8 }}
      >
        {/* Блок 1 — Навигация */}
        <View style={styles.block}>
          {NAV_ITEMS.map(renderDrawerItem)}
        </View>

        {/* Разделитель */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Блок 2 — Партнёрская зона */}
        <View style={styles.block}>
          {!isLessor && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigation.navigate("partner")}
              style={[
                styles.drawerItem,
                {
                  backgroundColor:
                    activeRoute === "partner" ? colors.accentBg : "transparent",
                },
              ]}
            >
              <View
                style={[
                  styles.drawerItemIcon,
                  {
                    backgroundColor:
                      activeRoute === "partner" ? colors.accent : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name="rocket-outline"
                  size={20}
                  color={activeRoute === "partner" ? "#fff" : colors.textPrimary}
                />
              </View>
              <Text
                style={[
                  styles.drawerItemText,
                  {
                    color:
                      activeRoute === "partner" ? colors.accent : colors.textPrimary,
                    fontWeight: activeRoute === "partner" ? "700" : "500",
                  },
                ]}
              >
                {t("drawer_partner", "Стать партнёром")}
              </Text>
            </TouchableOpacity>
          )}

          {isLessor && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigation.navigate("my-fleet")}
              style={[
                styles.drawerItem,
                {
                  backgroundColor:
                    activeRoute === "my-fleet" ? colors.accentBg : "transparent",
                },
              ]}
            >
              <View
                style={[
                  styles.drawerItemIcon,
                  {
                    backgroundColor:
                      activeRoute === "my-fleet" ? colors.accent : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name="car-outline"
                  size={20}
                  color={activeRoute === "my-fleet" ? "#fff" : colors.textPrimary}
                />
              </View>
              <Text
                style={[
                  styles.drawerItemText,
                  {
                    color:
                      activeRoute === "my-fleet" ? colors.accent : colors.textPrimary,
                    fontWeight: activeRoute === "my-fleet" ? "700" : "500",
                  },
                ]}
              >
                {t("drawer.my_fleet", "Мой автопарк")}
              </Text>
            </TouchableOpacity>
          )}

          {!isGuest && !isLessor && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 8 }]} />
              <TouchableOpacity
                style={styles.drawerBanner}
                onPress={() => router.push("/partner")}
              >
                <LinearGradient
                  colors={[colors.accent, "#4facfe"]}
                  style={styles.drawerGradient}
                >
                  <Ionicons name="rocket-outline" size={20} color="#fff" />
                  <Text style={styles.drawerBannerText}>
                    {t("drawer.become_partner_banner", "Сдать свой автомобиль")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </DrawerContentScrollView>

      {/* Блок 3 — Выход внизу */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={styles.logoutBtn}
        >
          {isLoggingOut ? (
            <ActivityIndicator
              color={colors.error}
              style={{ marginRight: 16 }}
            />
          ) : (
            <View style={[styles.drawerItemIcon, { backgroundColor: "transparent" }]}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.error}
              />
            </View>
          )}
          <Text
            style={{
              color: colors.error,
              fontSize: 16,
              fontWeight: "600",
              marginLeft: 16,
            }}
          >
            {t("drawer_logout", "Выйти")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const colors = useAppColors();
  const { t } = useTranslation();
  const isLessor = useAppSelector(selectIsLessor);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerType: "front",
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 300,
        },
        drawerActiveTintColor: colors.accent,
        drawerInactiveTintColor: colors.textPrimary,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: t("drawer_home", "Главная"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="news"
        options={{ title: t("drawer_news", "Новости") }}
      />
      <Drawer.Screen
        name="faq"
        options={{ title: t("drawer_faq", "Частые вопросы (FAQ)") }}
      />
      <Drawer.Screen
        name="partner"
        options={{
          title: t("drawer_partner", "Стать партнером"),
          drawerItemStyle: isLessor ? { display: "none" } : undefined,
        }}
      />
      <Drawer.Screen
        name="my-fleet"
        options={{
          title: t("drawer.my_fleet", "Мой автопарк"),
          drawerItemStyle: !isLessor ? { display: "none" } : undefined,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  userSection: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
  },
  block: {
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  drawerItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  drawerItemText: {
    fontSize: 14,
  },
  drawerBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  drawerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  drawerBannerText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 13,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: 36,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
});
