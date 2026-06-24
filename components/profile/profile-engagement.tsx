import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';

export function ProfileEngagement() {
  const { t } = useTranslation();

  const cards = [
    { icon: 'local-fire-department' as const, title: t('profile.streak'), value: '7 days', accent: BrandColors.orange },
    { icon: 'category' as const, title: t('profile.engagement.topCategory'), value: 'Devotional', accent: BrandColors.purple },
    { icon: 'trending-up' as const, title: t('profile.engagement.trending'), value: 'Shubh Mangalvar', accent: BrandColors.pink },
    { icon: 'star' as const, title: t('profile.engagement.topDesign'), value: 'Morning Gold', accent: '#D4AF37' },
  ];

  return (
    <Animated.View entering={FadeInUp.duration(450)} style={styles.wrap}>
      <Text style={styles.title}>{t('profile.engagement.title')}</Text>
      <View style={styles.grid}>
        {cards.map((c) => (
          <View key={c.title} style={styles.card}>
            <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={[`${c.accent}22`, 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <MaterialIcons name={c.icon} size={22} color={c.accent} />
            <Text style={styles.cardTitle}>{c.title}</Text>
            <Text style={styles.cardValue} numberOfLines={1}>
              {c.value}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginBottom: 20 },
  title: {
    fontSize: 16,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: 'rgba(255,255,255,0.8)',
    gap: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textMuted,
    marginTop: 4,
  },
  cardValue: {
    fontSize: 14,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
});
