import React, { useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AuthBackButton } from '@/components/auth/auth-back-button';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';

const SUPPORT_EMAIL = 'support@statusdaily.app';
// Team fills these in at launch — actions degrade gracefully if unavailable.
const SUPPORT_WHATSAPP = '919999999999';
const STORE_URL = 'https://statusdaily.app';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

async function openUrl(url: string, fallback: () => void) {
  try {
    const ok = await Linking.canOpenURL(url);
    if (ok) {
      await Linking.openURL(url);
      return;
    }
  } catch {
    /* fall through */
  }
  fallback();
}

type ContactRow = {
  key: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | null>('q1');

  const toggle = (key: string) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((cur) => (cur === key ? null : key));
  };

  const emailUs = () =>
    openUrl(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Status Daily — Support')}`,
      () => Alert.alert(t('help.email'), SUPPORT_EMAIL)
    );

  const contactRows: ContactRow[] = [
    { key: 'email', icon: 'mail-outline', label: t('help.email'), onPress: emailUs },
    {
      key: 'whatsapp',
      icon: 'chat',
      label: t('help.whatsapp'),
      onPress: () =>
        openUrl(
          `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Hi, I need help with Status Daily')}`,
          () => Alert.alert(t('help.whatsapp'), SUPPORT_EMAIL)
        ),
    },
    {
      key: 'report',
      icon: 'bug-report',
      label: t('help.report'),
      onPress: () =>
        openUrl(
          `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Status Daily — Report a problem')}`,
          () => Alert.alert(t('help.report'), SUPPORT_EMAIL)
        ),
    },
    {
      key: 'rate',
      icon: 'star-rate',
      label: t('help.rate'),
      onPress: () => openUrl(STORE_URL, () => Alert.alert(t('help.rate'), STORE_URL)),
    },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.bg, '#FFFFFF', BrandColors.bgAccent]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <AuthBackButton onPress={() => router.back()} label={t('help.title')} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="support-agent" size={30} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{t('help.title')}</Text>
          <Text style={styles.heroSub}>{t('help.subtitle')}</Text>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>{t('help.faqTitle')}</Text>
        <View style={styles.card}>
          {FAQ_KEYS.map((key, i) => {
            const expanded = open === key;
            return (
              <View key={key}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <Pressable
                  style={({ pressed }) => [styles.faqRow, pressed && styles.rowPressed]}
                  onPress={() => toggle(key)}
                >
                  <Text style={styles.faqQ}>{t(`help.faq.${key}`)}</Text>
                  <MaterialIcons
                    name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color={BrandColors.orange}
                  />
                </Pressable>
                {expanded ? (
                  <Text style={styles.faqA}>{t(`help.faq.${key.replace('q', 'a')}`)}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>{t('help.contactTitle')}</Text>
        <View style={styles.card}>
          {contactRows.map((row, i) => (
            <View key={row.key}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={row.onPress}
              >
                <View style={styles.rowIcon}>
                  <MaterialIcons name={row.icon} size={20} color={BrandColors.orange} />
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <MaterialIcons name="chevron-right" size={22} color={BrandColors.textMuted} />
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={styles.note}>{t('help.responseNote')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  hero: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: BrandColors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: BrandColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 6,
  },
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    overflow: 'hidden',
    shadowColor: BrandColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  faqQ: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  faqA: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowPressed: { backgroundColor: BrandColors.bgAccent },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BrandColors.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.text,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.surfaceBorder,
    marginLeft: 16,
  },
  note: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginTop: 20,
    paddingHorizontal: 16,
  },
});
