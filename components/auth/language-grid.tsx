import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import { SUPPORTED_LANGUAGES } from '@/locales/languages';
import type { LocaleCode } from '@/locales/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const GAP = 12;
const COLS = 2;
const H_PAD = 28;
const CARD_W = (Dimensions.get('window').width - H_PAD * 2 - GAP) / COLS;

type Props = {
  selected: LocaleCode | null;
  onSelect: (code: LocaleCode) => void;
  label: string;
  compact?: boolean;
};

function LanguageCard({
  code,
  nativeLabel,
  englishLabel,
  selected,
  onPress,
  compact,
}: {
  code: LocaleCode;
  nativeLabel: string;
  englishLabel: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const inner = (
    <View style={[styles.cardInner, compact && styles.cardInnerCompact, selected && styles.cardInnerSelected]}>
      <BlurView intensity={selected ? 56 : 40} tint="light" style={StyleSheet.absoluteFill} />
      <Text style={[styles.native, compact && styles.nativeCompact, selected && styles.nativeSelected]}>
        {nativeLabel}
      </Text>
      <Text style={[styles.english, compact && styles.englishCompact]}>{englishLabel}</Text>
    </View>
  );

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 420 });
      }}
      onPressOut={() => {
        scale.value = withSpring(selected ? 1.02 : 1, { damping: 14, stiffness: 300 });
      }}
      style={[styles.cardWrap, animStyle]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      {selected ? (
        <LinearGradient
          colors={[...BrandColors.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View style={styles.plainBorder}>{inner}</View>
      )}
    </AnimatedPressable>
  );
}

export function LanguageGrid({ selected, onSelect, label, compact }: Props) {
  return (
    <View style={compact ? styles.wrapCompact : styles.wrap}>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      <View style={[styles.grid, compact && styles.gridCompact]}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <LanguageCard
            key={lang.code}
            code={lang.code}
            nativeLabel={lang.nativeLabel}
            englishLabel={lang.englishLabel}
            selected={selected === lang.code}
            onPress={() => onSelect(lang.code)}
            compact={compact}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  wrapCompact: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    marginLeft: 4,
  },
  labelCompact: {
    fontSize: 11.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  gridCompact: {
    gap: 8,
  },
  cardWrap: {
    width: CARD_W,
  },
  gradientBorder: {
    borderRadius: 18,
    padding: 2,
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  plainBorder: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: BrandColors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardInner: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 14,
    minHeight: 76,
    justifyContent: 'center',
    backgroundColor: BrandColors.surface,
  },
  cardInnerCompact: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 42,
  },
  cardInnerSelected: {
    backgroundColor: 'rgba(255, 245, 238, 0.95)',
  },
  native: {
    fontSize: 17,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    marginBottom: 4,
  },
  nativeCompact: {
    fontSize: 14,
    marginBottom: 0,
  },
  nativeSelected: {
    color: BrandColors.text,
  },
  english: {
    fontSize: 12,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textMuted,
  },
  englishCompact: {
    fontSize: 10.5,
  },
});
