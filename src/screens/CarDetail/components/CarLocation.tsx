import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { LocationInfo } from "@/src/types";

const MAP_H = 220;

interface Props {
  location?: LocationInfo | null;
}

export const CarLocation: React.FC<Props> = ({ location }) => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const openFullscreen = async () => {
    if (!hasCoords) return;
    if (Platform.OS === "android") {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        setLocationGranted(result === PermissionsAndroid.RESULTS.GRANTED);
      } catch {
        setLocationGranted(false);
      }
    } else {
      setLocationGranted(true);
    }
    setFullscreen(true);
  };

  const lat = location?.latitude ? Number(location.latitude) : null;
  const lng = location?.longitude ? Number(location.longitude) : null;
  const hasCoords = lat !== null && lng !== null;

  const region = {
    latitude: lat ?? 53.9022,
    longitude: lng ?? 27.5619,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  const displayName = location?.name || "";
  const displayAddress =
    location?.address ||
    t("car_detail.location_stub", "Россия, Москва, Район выдачи авто");

  const openInMapsApp = () => {
    if (!lat || !lng) return;
    const label = encodeURIComponent(displayName || "Car4Rent");
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}&q=${label}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });
    if (url) Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.94}
        onPress={openFullscreen}
        style={[
          styles.card,
          {
            backgroundColor: colors.background,
            shadowColor: colors.textPrimary,
          },
        ]}
      >
        {hasCoords ? (
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.mapPreview}
              region={region}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              provider={PROVIDER_GOOGLE}
            >
              <Marker
                coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View
                  style={[
                    styles.markerDot,
                    { backgroundColor: colors.accent, borderColor: "#fff" },
                  ]}
                />
              </Marker>
            </MapView>

            <BlurView
              intensity={Platform.OS === "ios" ? 40 : 60}
              tint="dark"
              style={styles.blurOverlay}
            >
              <View style={styles.overlayBody}>
                <Ionicons
                  name="location-outline"
                  size={34}
                  color="#fff"
                  style={{ marginBottom: 6, opacity: 0.95 }}
                />
                {displayName ? (
                  <Text
                    style={styles.overlayName}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                ) : null}
                <Text
                  style={styles.overlayAddress}
                  numberOfLines={2}
                >
                  {displayAddress}
                </Text>
                <View style={[styles.overlayBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                  <Ionicons
                    name="expand-outline"
                    size={16}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.overlayBtnText}>
                    {t("car_detail.view_on_map", "Открыть карту")}
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="location-outline"
              size={40}
              color="#fff"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.placeholderLabel}>
              {t("car_detail.location_label", "Местоположение автомобиля")}
            </Text>
            <Text style={styles.placeholderAddress}>{displayAddress}</Text>
            <View style={[styles.overlayBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                {t("car_detail.view_on_map", "Смотреть на карте")}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* ─── FULLSCREEN MAP ─── */}
      <Modal
        visible={fullscreen}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={styles.fsContainer}>
          <MapView
            style={styles.fsMap}
            initialRegion={region}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={locationGranted}
            followsUserLocation={false}
          >
            <Marker
              coordinate={{ latitude: region.latitude, longitude: region.longitude }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View
                style={[
                  styles.markerDot,
                  { backgroundColor: colors.accent, borderColor: "#fff" },
                ]}
              />
            </Marker>
          </MapView>

          {/* Close */}
          <TouchableOpacity
            style={[
              styles.fsCloseBtn,
              {
                backgroundColor: colors.surface,
                shadowColor: "#000",
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setFullscreen(false)}
          >
            <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Bottom card */}
          <View
            style={[
              styles.fsBottomCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.fsAddressRow}>
              <View
                style={[
                  styles.fsIconCircle,
                  { backgroundColor: colors.accentBg },
                ]}
              >
                <Ionicons name="location-sharp" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                {displayName ? (
                  <Text
                    style={[styles.fsAddressTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                ) : null}
                <Text
                  style={[styles.fsAddressText, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {displayAddress}
                </Text>
              </View>
            </View>

            <View style={styles.fsDivider} />

            <TouchableOpacity
              style={[styles.fsNavBtn, { backgroundColor: colors.accentBg }]}
              activeOpacity={0.7}
              onPress={openInMapsApp}
            >
              <Ionicons name="navigate-outline" size={18} color={colors.accent} />
              <Text style={[styles.fsNavBtnText, { color: colors.accent }]}>
                {t("car_detail.navigate", "Построить маршрут")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    marginBottom: 12,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  mapWrapper: {
    height: MAP_H,
    position: "relative",
  },
  mapPreview: {
    ...StyleSheet.absoluteFillObject,
  },

  // ─── Blur overlay ───
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayBody: {
    alignItems: "center",
  },
  overlayName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 3,
  },
  overlayAddress: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  overlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  overlayBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // ─── Marker ───
  markerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  // ─── Placeholder (no coords) ───
  placeholder: {
    backgroundColor: "#4a5568",
    height: MAP_H,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 4,
  },
  placeholderAddress: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },

  // ─── Fullscreen ───
  fsContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fsMap: {
    ...StyleSheet.absoluteFillObject,
  },
  fsCloseBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 36,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fsBottomCard: {
    position: "absolute",
    bottom: 36,
    left: 16,
    right: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fsAddressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fsAddressTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  fsAddressText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  fsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(128,128,128,0.25)",
    marginVertical: 12,
  },
  fsNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  fsNavBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
