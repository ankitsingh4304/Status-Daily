import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { BrandColors } from '@/constants/brand';

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  autoFocus?: boolean;
  onBlurCapture?: () => void;
};

export function PremiumTextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoFocus,
  onBlurCapture,
}: Props) {
  const [focused, setFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const onFocus = () => {
    setFocused(true);
    focusProgress.value = withTiming(1, { duration: 220 });
  };

  const onBlur = () => {
    setFocused(false);
    focusProgress.value = withTiming(0, { duration: 220 });
  };

  const rowStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [error ? BrandColors.pink : 'rgba(255, 255, 255, 0.65)', BrandColors.orange]
    ),
    shadowOpacity: 0.06 + focusProgress.value * 0.16,
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <AnimatedView style={[styles.row, rowStyle, error && styles.rowError]}>
        <BlurView intensity={48} tint="light" style={StyleSheet.absoluteFill} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={BrandColors.textMuted}
          onFocus={onFocus}
          onBlur={() => {
            onBlur();
            onBlurCapture?.();
          }}
          autoFocus={autoFocus}
          autoCapitalize="words"
          autoCorrect={false}
          selectionColor={BrandColors.orange}
        />
      </AnimatedView>
      {error ? (
        <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.error}>
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    marginLeft: 4,
  },
  row: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: BrandColors.surface,
    minHeight: 58,
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  rowError: {
    borderColor: BrandColors.pink,
  },
  input: {
    fontSize: 17,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.text,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  error: {
    fontSize: 12,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.pink,
    marginLeft: 4,
  },
});
