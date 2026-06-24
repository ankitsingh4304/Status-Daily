import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';

import { AuthBackButton } from '@/components/auth/auth-back-button';
import { ProfileLanguageModal } from '@/components/profile/profile-language-modal';
import { ProfileReligionModal } from '@/components/profile/profile-religion-modal';
import { ProfileThemeModal } from '@/components/profile/profile-theme-modal';
import { BrandColors } from '@/constants/brand';
import { getLanguageMeta } from '@/locales/languages';
import { isPremiumActive, useSubscriptionStore } from '@/stores/use-subscription-store';
import type { AppTheme, Religion } from '@/types/profile';
import type { LocaleCode } from '@/locales/types';
import { useLocale } from '@/context/locale-context';

const SUPPORT_EMAIL = 'support@statusdaily.app';

type RowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  destructive?: boolean;
  onPress: () => void;
};

function Row({ icon, label, value, destructive, onPress }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, destructive && styles.rowIconDanger]}>
        <MaterialIcons
          name={icon}
          size={20}
          color={destructive ? BrandColors.accent : BrandColors.orange}
        />
      </View>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDanger]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {!destructive ? (
        <MaterialIcons name="chevron-right" size={22} color={BrandColors.textMuted} />
      ) : null}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { locale, theme, religion, updateProfile, setLocale, signOut, t } = useLocale();

  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [religionOpen, setReligionOpen] = useState(false);

  const currentLanguage = getLanguageMeta(locale)?.nativeLabel ?? locale.toUpperCase();
  const currentReligion = t(`religion.${religion}`);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const subPlan = useSubscriptionStore((s) => s.plan);
  const subExpires = useSubscriptionStore((s) => s.expiresAt);
  const activateSub = useSubscriptionStore((s) => s.activate);
  const downgradeSub = useSubscriptionStore((s) => s.downgradeToFree);
  const testPremium = isPremiumActive({ plan: subPlan, expiresAt: subExpires });

  const toggleTestPremium = (on: boolean) => {
    if (on) activateSub('monthly', 'upi');
    else downgradeSub();
  };

  const openDoc = (doc: string) =>
    router.push({ pathname: '/legal', params: { doc } });

  const handleContact = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Status Daily — Support')}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
    else Alert.alert(t('settings.contactUs'), SUPPORT_EMAIL);
  };

  const handleSaveLanguage = async (next: LocaleCode) => {
    await updateProfile({ locale: next });
    await setLocale(next);
    setLanguageOpen(false);
  };

  const handleSaveTheme = async (next: AppTheme) => {
    await updateProfile({ theme: next });
    setThemeOpen(false);
  };

  const handleSaveReligion = async (next: Religion) => {
    await updateProfile({ religion: next });
    setReligionOpen(false);
  };

  const handleSignOut = () => {
    Alert.alert(t('settings.signOut'), t('settings.signOutConfirm'), [
      { text: t('settings.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(t('settings.deleteAccount'), t('settings.deleteConfirm'), [
      { text: t('settings.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteCta'),
        style: 'destructive',
        onPress: async () => {
          // TODO: call backend account-deletion endpoint when the API exists.
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.bg, '#FFFFFF', BrandColors.bgAccent]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <AuthBackButton onPress={() => router.back()} label={t('settings.title')} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        <Section title={t('settings.preferences')}>
          <Row
            icon="language"
            label={t('settings.changeLanguage')}
            value={currentLanguage}
            onPress={() => setLanguageOpen(true)}
          />
          <View style={styles.divider} />
          <Row icon="palette" label={t('settings.theme')} onPress={() => setThemeOpen(true)} />
          <View style={styles.divider} />
          <Row
            icon="auto-awesome"
            label={t('settings.religion')}
            value={currentReligion}
            onPress={() => setReligionOpen(true)}
          />
        </Section>

        <Section title={t('settings.helpSupport')}>
          <Row
            icon="help-outline"
            label={t('settings.helpCenter')}
            onPress={() => router.push('/help')}
          />
          <View style={styles.divider} />
          <Row icon="mail-outline" label={t('settings.contactUs')} onPress={handleContact} />
        </Section>

        <Section title={t('settings.billing')}>
          <Row
            icon="workspace-premium"
            label={t('settings.subscriptionRow')}
            onPress={() => router.push('/paywall')}
          />
          <View style={styles.divider} />
          <Row
            icon="receipt-long"
            label={t('settings.invoicesRow')}
            onPress={() => router.push('/invoices')}
          />
        </Section>

        <Section title={t('settings.legalSection')}>
          <Row icon="privacy-tip" label={t('settings.privacy')} onPress={() => openDoc('privacy')} />
          <View style={styles.divider} />
          <Row icon="description" label={t('settings.terms')} onPress={() => openDoc('terms')} />
          <View style={styles.divider} />
          <Row icon="receipt-long" label={t('settings.refund')} onPress={() => openDoc('refund')} />
          <View style={styles.divider} />
          <Row icon="info-outline" label={t('settings.about')} onPress={() => openDoc('about')} />
        </Section>

        <Section title={t('settings.account')}>
          <Row icon="logout" label={t('settings.signOut')} onPress={handleSignOut} />
          <View style={styles.divider} />
          <Row icon="delete-outline" label={t('settings.deleteAccount')} destructive onPress={handleDeleteAccount} />
        </Section>

        <Section title={t('settings.testing')}>
          <View style={styles.switchRow}>
            <View style={styles.rowIcon}>
              <MaterialIcons name="science" size={20} color={BrandColors.orange} />
            </View>
            <View style={styles.switchTextWrap}>
              <Text style={styles.rowLabel}>{t('settings.testPremium')}</Text>
              <Text style={styles.switchHint}>{t('settings.testPremiumHint')}</Text>
            </View>
            <Switch
              value={testPremium}
              onValueChange={toggleTestPremium}
              trackColor={{ false: 'rgba(0,0,0,0.12)', true: BrandColors.orange }}
              thumbColor="#fff"
            />
          </View>
        </Section>

        <Text style={styles.version}>Status Daily · v{appVersion}</Text>
      </ScrollView>

      <ProfileLanguageModal
        visible={languageOpen}
        locale={locale}
        onClose={() => setLanguageOpen(false)}
        onSave={handleSaveLanguage}
      />
      <ProfileThemeModal
        visible={themeOpen}
        theme={theme}
        onClose={() => setThemeOpen(false)}
        onSave={handleSaveTheme}
      />
      <ProfileReligionModal
        visible={religionOpen}
        religion={religion}
        onClose={() => setReligionOpen(false)}
        onSave={handleSaveReligion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.bg },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.textMuted,
    letterSpacing: 1.2,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
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
  rowIconDanger: { backgroundColor: 'rgba(230,57,70,0.1)' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 14,
  },
  switchTextWrap: { flex: 1 },
  switchHint: {
    fontSize: 11.5,
    lineHeight: 16,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.text,
  },
  rowLabelDanger: { color: BrandColors.accent },
  rowValue: {
    fontSize: 13,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginRight: 2,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.surfaceBorder,
    marginLeft: 66,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginTop: 28,
  },
});
