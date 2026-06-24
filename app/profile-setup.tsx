import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { GradientButton } from '@/components/auth/gradient-button';
import { LanguageGrid } from '@/components/auth/language-grid';
import { OnboardingProgress } from '@/components/auth/onboarding-progress';
import { PremiumTextField } from '@/components/auth/premium-text-field';
import { ProfileAvatarPicker } from '@/components/auth/profile-avatar-picker';
import { AuthLayout } from '@/constants/auth-layout';
import { BrandColors } from '@/constants/brand';
import { useTranslation, useLocale } from '@/context/locale-context';
import type { LocaleCode } from '@/locales/types';
import { isValidDisplayName } from '@/utils/validation';

const ONBOARDING_STEP = 3;
const ONBOARDING_TOTAL = 3;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, setPreviewLocale } = useTranslation();
  const { completeOnboarding } = useLocale();

  const [name, setName] = useState('');
  const [language, setLanguage] = useState<LocaleCode | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameValid = isValidDisplayName(name);
  const canContinue = nameValid && language !== null;
  const nameError = touched && !nameValid ? t('onboarding.profile.nameError') : null;

  const handleLanguageSelect = (code: LocaleCode) => {
    setLanguage(code);
    setPreviewLocale(code);
  };

  const handleContinue = async () => {
    if (!canContinue || !language) return;
    setTouched(true);
    Keyboard.dismiss();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    await completeOnboarding({
      name: name.trim(),
      photoUri,
      locale: language,
    });
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  return (
    <AuthScreenShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              {
                paddingTop: insets.top + 8,
                paddingBottom: insets.bottom + 10,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.duration(400)}>
              <OnboardingProgress current={ONBOARDING_STEP} total={ONBOARDING_TOTAL} />
              <Text style={styles.step}>
                {t('onboarding.profile.step', {
                  current: ONBOARDING_STEP,
                  total: ONBOARDING_TOTAL,
                })}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(80).duration(480)} style={styles.header}>
              <Text style={styles.title}>{t('onboarding.profile.title')}</Text>
              <Text style={styles.subtitle}>{t('onboarding.profile.subtitle')}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(160).duration(480)} style={styles.avatar}>
              <ProfileAvatarPicker
                uri={photoUri}
                onChange={setPhotoUri}
                hint={t('onboarding.profile.photoHint')}
                size={76}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).duration(480)} style={styles.field}>
              <PremiumTextField
                label={t('onboarding.profile.nameLabel')}
                value={name}
                onChangeText={setName}
                placeholder={t('onboarding.profile.namePlaceholder')}
                error={nameError}
                onBlurCapture={() => setTouched(true)}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(320).duration(480)} style={styles.language}>
              <LanguageGrid
                label={t('onboarding.profile.languageLabel')}
                selected={language}
                onSelect={handleLanguageSelect}
                compact
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(480)} style={styles.cta}>
              <GradientButton
                label={t('common.continue')}
                onPress={handleContinue}
                disabled={!canContinue}
                loading={loading}
              />
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: AuthLayout.horizontalPadding,
  },
  step: {
    fontSize: 12,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginTop: 4,
    marginBottom: 8,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  avatar: {
    alignItems: 'center',
    marginBottom: 8,
  },
  field: {
    marginBottom: 10,
  },
  language: {
    marginBottom: 10,
  },
  cta: {
    marginTop: 4,
  },
});
