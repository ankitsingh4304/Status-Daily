import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';

export default function ExploreScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.bg, '#FFFFFF', BrandColors.bgAccent]}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.title}>{t('tabs.explore')}</Text>
      <Text style={styles.sub}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 24,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  sub: {
    fontSize: 14,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textMuted,
    marginTop: 8,
  },
});
