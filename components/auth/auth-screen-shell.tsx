import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors } from '@/constants/brand';
import { FloatingOrbs } from '@/components/auth/floating-orbs';

type Props = {
  children: ReactNode;
};

/** Shared premium background used by Login + OTP */
export function AuthScreenShell({ children }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.bg, '#FFFFFF', BrandColors.bgAccent]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <FloatingOrbs />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.bg,
  },
});
