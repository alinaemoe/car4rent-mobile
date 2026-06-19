import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import { Image } from "expo-image";

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface CarCarouselProps {
  images: any[];
}

export const CarCarousel: React.FC<CarCarouselProps> = ({ images }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const displayImages =
    images?.length > 0
      ? images
      : [{ url: "https://via.placeholder.com/800x600?text=No+Image" }];

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={displayImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setCurrentImageIndex(index);
        }}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Image
            source={item.url}
            style={{ width: SCREEN_WIDTH, height: 280 }}
            contentFit="cover"
            placeholder={{ blurhash }}
          />
        )}
      />

      <View style={styles.imageCounter}>
        <Text style={styles.imageCounterText}>
          {currentImageIndex + 1} / {displayImages.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: { position: "relative" },
  imageCounter: {
    position: "absolute",
    bottom: 44, // Висит ровно над наезжающей карточкой
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
});
