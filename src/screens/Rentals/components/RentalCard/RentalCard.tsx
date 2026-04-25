import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Rental } from "@/src/api/queries/useRentals";

import { RentalCardHeader } from "./RentalCardHeader";
import { RentalCardFooter } from "./RentalCardFooter";
import { RentalCardActions } from "./RentalCardActions";

interface Props {
  rental: Rental;
  onPress: () => void;
  onReviewPress?: () => void;
  onBookAgainPress?: () => void;
  onFindOtherPress?: () => void;
}

export const RentalCard = ({
  rental,
  onPress,
  onReviewPress,
  onBookAgainPress,
  onFindOtherPress,
}: Props) => {
  const colors = useAppColors();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        rental.status === "ACTIVE" && {
          borderColor: colors.accent,
          borderWidth: 1,
        },
      ]}
    >
      <RentalCardHeader rental={rental} />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <RentalCardFooter rental={rental} />

      <RentalCardActions
        rental={rental}
        onReviewPress={onReviewPress}
        onBookAgainPress={onBookAgainPress}
        onFindOtherPress={onFindOtherPress}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 14,
  },
});
