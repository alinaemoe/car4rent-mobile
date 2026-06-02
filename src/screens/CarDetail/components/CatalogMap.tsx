import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { CarCard } from "@/src/components/CarCard";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Car } from "@/src/types";

interface Props {
  cars: Car[];
}

export const CatalogMap = ({ cars }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<Car[] | null>(null);

  const mapCars = useMemo(
    () =>
      cars.filter((car) => car.location?.latitude && car.location?.longitude),
    [cars],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Car[]>();
    for (const car of mapCars) {
      const lat = Number(car.location!.latitude);
      const lng = Number(car.location!.longitude);
      const key = `${lat}_${lng}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(car);
    }
    return Array.from(map.values());
  }, [mapCars]);

  const initialRegion = useMemo(() => {
    if (mapCars.length > 0) {
      const first = mapCars[0].location!;
      return {
        latitude: Number(first.latitude),
        longitude: Number(first.longitude),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return {
      latitude: 53.9022,
      longitude: 27.5619,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [mapCars]);

  const handleMarkerPress = useCallback((group: Car[], car?: Car) => {
    if (group.length === 1) {
      setSelectedCar(car ?? group[0]);
      setSelectedCluster(null);
    } else {
      setSelectedCar(null);
      setSelectedCluster(group);
    }
  }, []);

  const handleMapPress = useCallback(() => {
    setSelectedCar(null);
    setSelectedCluster(null);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        provider={PROVIDER_GOOGLE}
      >
        {groups.map((group) => {
          const lat = Number(group[0].location!.latitude);
          const lng = Number(group[0].location!.longitude);

          if (group.length === 1) {
            const car = group[0];
            const isSelected = selectedCar?.id === car.id;

            return (
              <Marker
                key={`car-${car.id}`}
                coordinate={{ latitude: lat, longitude: lng }}
                anchor={{ x: 0.5, y: 1 }}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMarkerPress(group, car);
                }}
                zIndex={isSelected ? 99 : 1}
              >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: isSelected
                          ? colors.accent
                          : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleBrand,
                        {
                          color: isSelected
                            ? "rgba(255,255,255,0.9)"
                            : colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {car.brand} {car.model}
                    </Text>
                    <Text
                      style={[
                        styles.bubblePrice,
                        {
                          color: isSelected ? "#fff" : colors.textPrimary,
                        },
                      ]}
                    >
                      {Math.round(car.price_per_day)}{" "}
                      {t("common.currency_br", "Br")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.arrow,
                      {
                        borderTopColor: isSelected
                          ? colors.accent
                          : colors.surface,
                      },
                    ]}
                  />
                </View>
              </Marker>
            );
          }

          const isSelectedCluster = selectedCluster === group;

          return (
            <Marker
              key={`cluster-${lat}-${lng}`}
              coordinate={{ latitude: lat, longitude: lng }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={(e) => {
                e.stopPropagation();
                handleMarkerPress(group);
              }}
              zIndex={isSelectedCluster ? 99 : 10}
            >
              <View
                style={[
                  styles.cluster,
                  {
                    backgroundColor: isSelectedCluster
                      ? colors.accentHover
                      : colors.accent,
                    borderColor: isSelectedCluster ? "#fff" : "rgba(255,255,255,0.6)",
                  },
                ]}
              >
                <Text style={styles.clusterCount}>{group.length}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {selectedCar && (
        <View style={styles.overlay}>
          <CarCard
            car={selectedCar}
            onPress={() =>
              router.push({
                pathname: "/car/[id]",
                params: { id: selectedCar.id },
              })
            }
          />
        </View>
      )}

      {selectedCluster && selectedCluster.length > 0 && (
        <View
          style={[
            styles.clusterPanel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.clusterPanelHeader}>
            <Text style={[styles.clusterPanelTitle, { color: colors.textPrimary }]}>
              {selectedCluster.length}{" "}
              {t("catalog.cars_nearby", {
                defaultValue: "машин рядом",
              })}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedCluster(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedCluster}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.clusterItem, { borderBottomColor: colors.border }]}
                activeOpacity={0.6}
                onPress={() => {
                  setSelectedCluster(null);
                  router.push({
                    pathname: "/car/[id]",
                    params: { id: item.id },
                  });
                }}
              >
                <Text
                  style={[styles.clusterItemName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.brand} {item.model}
                </Text>
                <View style={styles.clusterItemRight}>
                  <Text style={[styles.clusterItemPrice, { color: colors.accent }]}>
                    {Math.round(item.price_per_day)} Br
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => (
              <View
                style={[styles.clusterSeparator, { backgroundColor: colors.border }]}
              />
            )}
            scrollEnabled={selectedCluster.length > 4}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  bubbleBrand: {
    fontSize: 11,
    fontWeight: "600",
    maxWidth: 120,
  },
  bubblePrice: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 1,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },

  cluster: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  clusterCount: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  overlay: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
  },

  clusterPanel: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    paddingBottom: 8,
    maxHeight: 320,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  clusterPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  clusterPanelTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  clusterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  clusterItemName: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
  },
  clusterItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clusterItemPrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  clusterSeparator: {
    height: StyleSheet.hairlineWidth,
  },
});
