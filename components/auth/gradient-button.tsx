import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import { BrandFonts } from '@/constants/typography';
import { UiTokens } from '@/constants/ui-tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function GradientButton({ label, onPress, disabled, loading }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) scale.value = withSpring(0.97, { damping: 18, stiffness: 420 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 320 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, (disabled || loading) && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={[...BrandColors.gradient]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    minHeight: UiTokens.touch.minHeight,
    borderRadius: UiTokens.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: UiTokens.spacing.xl,
    ...UiTokens.shadow.button,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: BrandFonts.bold,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
