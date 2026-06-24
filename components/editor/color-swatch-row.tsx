import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import type { PhotoBorder } from '@/types/personalize-editor';
import { BORDER_COLORS } from '@/constants/editor-presets';

type Props<T extends string> = {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  mode: 'border' | 'name';
};

export function ColorSwatchRow<T extends string>({ options, value, onChange, mode }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((key) => {
        const active = value === key;
        const isGradient = mode === 'border' && key === 'gradient';
        const isNone = mode === 'border' && key === 'none';

        return (
          <Pressable
            key={key}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(key);
            }}
            style={[styles.swatch, active && styles.swatchActive]}
          >
            {isGradient ? (
              <LinearGradient colors={[...BrandColors.gradient]} style={styles.fill} />
            ) : isNone ? (
              <View style={[styles.fill, styles.dashed]}>
                <MaterialIcons name="block" size={18} color={BrandColors.textMuted} />
              </View>
            ) : (
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor:
                      mode === 'border'
                        ? (BORDER_COLORS[key as PhotoBorder] as string)
                        : key === 'white'
                          ? '#fff'
                          : key === 'black'
                            ? '#0F0F12'
                            : key === 'gold'
                              ? '#D4AF37'
                              : key === 'orangeGradient'
                                ? BrandColors.orange
                                : key === 'pinkGradient'
                                  ? BrandColors.pink
                                  : BrandColors.purple,
                  },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: BrandColors.orange,
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  fill: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  dashed: {
    backgroundColor: '#fff',
    borderStyle: 'dashed',
    borderColor: BrandColors.textMuted,
  },
});
