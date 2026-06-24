import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBackButton } from '@/components/auth/auth-back-button';
import { BrandColors } from '@/constants/brand';
import { paramString } from '@/lib/parse-route-params';
import { useLocale } from '@/context/locale-context';

type DocKey = 'privacy' | 'terms' | 'refund' | 'about';

const TITLE_KEY: Record<DocKey, string> = {
  privacy: 'legal.privacyTitle',
  terms: 'legal.termsTitle',
  refund: 'legal.refundTitle',
  about: 'legal.aboutTitle',
};

const BODY_KEY: Record<DocKey, string> = {
  privacy: 'legal.privacyBody',
  terms: 'legal.termsBody',
  refund: 'legal.refundBody',
  about: 'legal.aboutBody',
};

export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const params = useLocalSearchParams<{ doc?: string | string[] }>();
  const key = (paramString(params.doc) as DocKey) || 'about';
  const safeKey: DocKey = TITLE_KEY[key] ? key : 'about';
  const doc = {
    title: t(TITLE_KEY[safeKey]),
    body: t(BODY_KEY[safeKey]),
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.bg, '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <AuthBackButton onPress={() => router.back()} label={doc.title} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        <Text style={styles.title}>{doc.title}</Text>
        <Text style={styles.body}>{doc.body}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  title: {
    fontSize: 26,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textSecondary,
  },
});
