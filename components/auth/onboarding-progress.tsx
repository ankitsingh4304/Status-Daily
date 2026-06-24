import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors } from '@/constants/brand';

type Props = {
  current: number;
  total: number;
};

export function OnboardingProgress({ current, total }: Props) {
  const progress = current / total;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <LinearGradient
          colors={[...BrandColors.gradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { width: `${progress * 100}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 8,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(15, 15, 18, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
