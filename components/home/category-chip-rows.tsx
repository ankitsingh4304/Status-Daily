import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  CATEGORY_ICONS,
  PRIMARY_CATEGORIES,
  categoryTranslationKey,
  type CategoryId,
} from '@/constants/status-categories';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';
import { CategoryPicker } from '@/components/home/category-picker';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  active: CategoryId;
  onSelect: (id: CategoryId) => void;
};

function Chip({
  id,
  label,
  active,
  onPress,
}: {
  id: CategoryId;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 18, stiffness: 420 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 300 });
      }}
      style={anim}
    >
      {active ? (
        <LinearGradient
          colors={[...BrandColors.gradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.chip, styles.chipActive]}
        >
          <Text style={styles.icon}>{CATEGORY_ICONS[id]}</Text>
          <Text style={[styles.label, styles.labelActive]} numberOfLines={1}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View style={styles.chip}>
          <Text style={styles.icon}>{CATEGORY_ICONS[id]}</Text>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

export function CategoryChipRows({ active, onSelect }: Props) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Always show the active category; fill the rest from the primary set. No scroll.
  const visible = PRIMARY_CATEGORIES.includes(active)
    ? PRIMARY_CATEGORIES
    : [active, ...PRIMARY_CATEGORIES.filter((c) => c !== active)].slice(0, PRIMARY_CATEGORIES.length);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {visible.map((id) => (
          <Chip
            key={id}
            id={id}
            label={t(categoryTranslationKey(id))}
            active={active === id}
            onPress={() => onSelect(id)}
          />
        ))}

        <Pressable style={styles.moreChip} onPress={() => setPickerOpen(true)}>
          <Text style={styles.moreLabel}>{t('home.more')}</Text>
          <MaterialIcons name="expand-more" size={18} color={BrandColors.orange} />
        </Pressable>
      </View>

      <CategoryPicker
        visible={pickerOpen}
        active={active}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    zIndex: 15,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
    columnGap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
  },
  chipActive: {
    borderColor: 'transparent',
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: { fontSize: 13 },
  label: {
    fontSize: 12.5,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    maxWidth: 120,
  },
  labelActive: { color: '#fff', fontFamily: 'NotoSans_700Bold' },
  moreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: BrandColors.bgAccent,
    borderWidth: 1,
    borderColor: BrandColors.orange,
  },
  moreLabel: {
    fontSize: 12.5,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.orange,
  },
});
