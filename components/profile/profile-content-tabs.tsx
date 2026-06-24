import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import type { ProfileContentTab } from '@/types/profile';
import { useTranslation } from '@/context/locale-context';

const TAB_KEYS: ProfileContentTab[] = ['statuses', 'saved', 'downloads', 'favorites'];

type Props = {
  active: ProfileContentTab;
  onChange: (tab: ProfileContentTab) => void;
};

export function ProfileContentTabs({ active, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {TAB_KEYS.map((key) => {
        const on = active === key;
        const inner = (
          <Text style={[styles.label, on && styles.labelOn]}>{t(`profile.tabs.${key}`)}</Text>
        );
        return (
          <Pressable
            key={key}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(key);
            }}
            style={styles.chip}
          >
            {on ? (
              <LinearGradient colors={[...BrandColors.gradient]} style={styles.chipGrad}>
                {inner}
              </LinearGradient>
            ) : (
              <View style={styles.chipIdle}>
                <Text style={styles.label}>{t(`profile.tabs.${key}`)}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  chip: { borderRadius: 18 },
  chipGrad: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 18 },
  chipIdle: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  label: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
  },
  labelOn: { color: '#fff' },
});
