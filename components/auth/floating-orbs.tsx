import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BrandColors } from '@/constants/brand';

function Orb({
  color,
  size,
  top,
  left,
  delay = 0,
}: {
  color: string;
  size: number;
  top: number;
  left: number;
  delay?: number;
}) {
  const drift = useSharedValue(0);

  useEffect(() => {
    const id = setTimeout(() => {
      drift.value = withRepeat(
        withTiming(1, { duration: 5200 + delay * 400, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(id);
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: (drift.value - 0.5) * 14 },
      { translateX: (drift.value - 0.5) * 8 },
      { scale: 0.94 + drift.value * 0.08 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          backgroundColor: color,
        },
      ]}
    />
  );
}

export function FloatingOrbs() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Orb color="rgba(255, 122, 0, 0.16)" size={200} top={-30} left={-50} delay={0} />
      <Orb color="rgba(255, 159, 28, 0.14)" size={160} top={140} left={220} delay={200} />
      <Orb color="rgba(255, 200, 87, 0.12)" size={220} top={460} left={-70} delay={400} />
      <Orb color="rgba(255, 122, 0, 0.08)" size={120} top={600} left={180} delay={600} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    opacity: 0.95,
  },
});
