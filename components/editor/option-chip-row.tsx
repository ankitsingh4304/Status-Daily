import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Option<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function OptionChipRow<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((opt) => (
        <Chip key={opt.key} label={opt.label} active={value === opt.key} onPress={() => onChange(opt.key)} />
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const inner = (
    <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
  );

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.94, { damping: 18, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[styles.chip, anim]}
    >
      {active ? (
        <LinearGradient colors={[...BrandColors.gradient]} style={styles.chipGrad}>
          {inner}
        </LinearGradient>
      ) : (
        <View style={styles.chipIdle}>{inner}</View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: { borderRadius: 16 },
  chipGrad: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  chipIdle: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    minHeight: 44,
  },
  label: {
    fontSize: 14,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
  },
  labelActive: { color: '#fff' },
});
