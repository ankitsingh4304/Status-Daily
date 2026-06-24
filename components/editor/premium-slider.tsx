import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue?: (v: number) => string;
  onChange: (v: number) => void;
};

export function PremiumSlider({
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange,
}: Props) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : `${value}`;

  const bump = (delta: number) => {
    Haptics.selectionAsync();
    onChange(Math.min(max, Math.max(min, value + delta)));
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.val}>{display}</Text>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => bump(-step)}>
          <Text style={styles.btnTxt}>−</Text>
        </Pressable>
        <View style={styles.track}>
          <LinearGradient
            colors={[...BrandColors.gradient]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.fill, { width: `${pct}%` }]}
          />
        </View>
        <Pressable style={styles.btn} onPress={() => bump(step)}>
          <Text style={styles.btnTxt}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
  },
  val: {
    fontSize: 13,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.orange,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  btnTxt: {
    fontSize: 18,
    color: BrandColors.orange,
    fontFamily: 'NotoSans_700Bold',
    lineHeight: 20,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(15,15,18,0.08)',
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 4 },
});
