import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AuthLayout } from '@/constants/auth-layout';

export function DevOtpBanner() {
  if (!__DEV__) return null;

  return (
    <View style={styles.banner}>
      <MaterialIcons name="build" size={16} color="#B45309" />
      <Text style={styles.text}>Dev mode: OTP is {AuthLayout.devOtp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 237, 180, 0.85)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.35)',
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: '#B45309',
  },
});
