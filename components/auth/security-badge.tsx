import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BrandColors } from '@/constants/brand';

export function SecurityBadge() {
  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <LinearGradient
        colors={['#FFE8D6', '#FFD0E0', '#E8DEFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ring}
      >
        <LinearGradient
          colors={[...BrandColors.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <MaterialIcons name="verified-user" size={32} color="#fff" />
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  glow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(123, 97, 255, 0.18)',
    shadowColor: BrandColors.purple,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  ring: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
