import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import { AuthLayout } from '@/constants/auth-layout';

const AnimatedView = Animated.createAnimatedComponent(View);
const LENGTH = AuthLayout.otpLength;

type Props = {
  value: string;
  onChange: (code: string) => void;
};

function OtpCell({
  digit,
  focused,
  filled,
}: {
  digit: string;
  focused: boolean;
  filled: boolean;
}) {
  const focus = useSharedValue(focused ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    focus.value = withTiming(focused ? 1 : 0, { duration: 200 });
    if (focused || filled) {
      scale.value = withSpring(1.06, { damping: 14, stiffness: 380 });
      scale.value = withSpring(1, { damping: 12, stiffness: 280 });
    }
  }, [focused, filled, focus, scale]);

  const boxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focus.value,
      [0, 1],
      [
        filled ? 'rgba(255, 122, 0, 0.35)' : 'rgba(255, 255, 255, 0.65)',
        BrandColors.orange,
      ]
    ),
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.05 + focus.value * 0.2,
  }));

  return (
    <AnimatedView style={[styles.cell, boxStyle]}>
      <BlurView intensity={44} tint="light" style={StyleSheet.absoluteFill} />
      <Text style={styles.digit}>{digit}</Text>
    </AnimatedView>
  );
}

export function OtpInputGroup({ value, onChange }: Props) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const digits = value.padEnd(LENGTH, ' ').split('').slice(0, LENGTH);

  useEffect(() => {
    const t = setTimeout(() => inputs.current[0]?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  const updateAt = useCallback(
    (index: number, char: string) => {
      const arr = value.split('');
      while (arr.length < LENGTH) arr.push('');
      arr[index] = char;
      const next = arr.join('').replace(/\s/g, '').slice(0, LENGTH);
      onChange(next);
    },
    [value, onChange]
  );

  const handleChange = (index: number, text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) {
      updateAt(index, '');
      return;
    }

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, LENGTH);
      onChange(pasted);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextIdx = Math.min(pasted.length, LENGTH - 1);
      setActiveIndex(nextIdx);
      if (pasted.length >= LENGTH) {
        inputs.current[LENGTH - 1]?.blur();
      } else {
        inputs.current[nextIdx]?.focus();
      }
      return;
    }

    updateAt(index, cleaned[0]);
    Haptics.selectionAsync();
    if (index < LENGTH - 1) {
      setActiveIndex(index + 1);
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key !== 'Backspace') return;
    if (digits[index]?.trim()) {
      updateAt(index, '');
      return;
    }
    if (index > 0) {
      updateAt(index - 1, '');
      setActiveIndex(index - 1);
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length: LENGTH }).map((_, i) => (
        <View key={i} style={styles.cellWrap}>
          <OtpCell
            digit={digits[i]?.trim() ? digits[i] : ''}
            focused={activeIndex === i}
            filled={!!digits[i]?.trim()}
          />
          <TextInput
            ref={(r) => {
              inputs.current[i] = r;
            }}
            style={styles.hiddenInput}
            value={digits[i]?.trim() ? digits[i] : ''}
            onFocus={() => setActiveIndex(i)}
            onChangeText={(t) => handleChange(i, t)}
            onKeyPress={(e) => handleKeyPress(i, e)}
            keyboardType="number-pad"
            maxLength={LENGTH}
            selectTextOnFocus
            caretHidden
            accessibilityLabel={`OTP digit ${i + 1}`}
          />
        </View>
      ))}
    </View>
  );
}

const cellSize = AuthLayout.otpBoxSize;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: AuthLayout.otpGap,
  },
  cellWrap: {
    width: cellSize,
    height: cellSize,
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: BrandColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  digit: {
    fontSize: 28,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    letterSpacing: 2,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    fontSize: 1,
  },
});
