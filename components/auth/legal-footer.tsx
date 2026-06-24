import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandColors, BrandCopy } from '@/constants/brand';

const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

export function LegalFooter() {
  const open = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.base}>{BrandCopy.legal}</Text>
      <Pressable onPress={() => open(TERMS_URL)} hitSlop={8}>
        <Text style={styles.link}>{BrandCopy.termsLabel}</Text>
      </Pressable>
      <Text style={styles.base}> & </Text>
      <Pressable onPress={() => open(PRIVACY_URL)} hitSlop={8}>
        <Text style={styles.link}>{BrandCopy.privacyLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  base: {
    fontSize: 12,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textMuted,
    lineHeight: 18,
  },
  link: {
    fontSize: 12,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.link,
    lineHeight: 18,
  },
});
