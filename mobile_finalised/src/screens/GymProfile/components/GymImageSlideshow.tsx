import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

interface GymImageSlideshowProps {
  images: readonly string[];
  isActive: boolean;
}

export const GymImageSlideshow = React.memo(function GymImageSlideshow({
  images,
  isActive,
}: GymImageSlideshowProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const fade = React.useRef(new Animated.Value(1)).current;
  const isAnimatingRef = React.useRef(false);

  React.useEffect(() => {
    setActiveIndex(0);
    fade.setValue(1);
  }, [fade, images]);

  React.useEffect(() => {
    if (!isActive || images.length <= 1) return;

    const interval = setInterval(() => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      Animated.timing(fade, { toValue: 0, duration: 420, useNativeDriver: true }).start(({ finished }) => {
        if (!finished) {
          isAnimatingRef.current = false;
          return;
        }

        setActiveIndex((prev) => (prev + 1) % images.length);
        Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }).start(() => {
          isAnimatingRef.current = false;
        });
      });
    }, 3400);

    return () => clearInterval(interval);
  }, [fade, images.length, isActive]);

  const currentImage = images[activeIndex] ?? images[0] ?? '';

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.Image source={{ uri: currentImage }} style={[s.image, { opacity: fade }]} resizeMode="cover" />
    </View>
  );
});

const s = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});

