import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppLogo } from '@/components/auth/app-logo';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { GradientButton } from '@/components/auth/gradient-button';
import { LegalFooter } from '@/components/auth/legal-footer';
import { PhoneInputGroup } from '@/components/auth/phone-input-group';
import { AuthLayout } from '@/constants/auth-layout';
import { BrandColors, BrandCopy, DEFAULT_COUNTRY } from '@/constants/brand';
import { useLocale } from '@/context/locale-context';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isReady, onboardingComplete } = useLocale();

  useEffect(() => {
    if (isReady && onboardingComplete) {
      router.replace('/(tabs)/home');
    }
  }, [isReady, onboardingComplete, router]);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = phone.length >= 10;

  const handleContinue = async () => {
    if (!isValid) return;
    Keyboard.dismiss();
    setLoading(true);
    // Placeholder for OTP API — navigate into main app for now
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    router.push({
      pathname: '/otp',
      params: { phone, countryCode: country.code },
    });
  };

  return (
    <AuthScreenShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={[
              styles.content,
              {
                paddingTop: insets.top + AuthLayout.contentTopExtra,
                paddingBottom: insets.bottom + AuthLayout.contentBottomExtra,
              },
            ]}
          >
            <Animated.View entering={FadeIn.duration(600)} style={styles.hero}>
              <AppLogo />
              <Animated.Text entering={FadeInDown.delay(120).duration(500)} style={styles.title}>
                {BrandCopy.appName}
              </Animated.Text>
              <Animated.Text entering={FadeInDown.delay(220).duration(500)} style={styles.tagline}>
                {BrandCopy.tagline}
              </Animated.Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.form}>
              <PhoneInputGroup
                country={country}
                onCountryChange={setCountry}
                value={phone}
                onChangeText={setPhone}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.cta}>
              <GradientButton
                label={BrandCopy.cta}
                onPress={handleContinue}
                disabled={!isValid}
                loading={loading}
              />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(520).duration(500)} style={styles.footer}>
              <LegalFooter />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: AuthLayout.horizontalPadding,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 16,
  },
  title: {
    fontSize: 34,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    letterSpacing: -0.3,
    marginTop: 20,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
    maxWidth: 300,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 200,
  },
  cta: {
    marginBottom: 8,
  },
  footer: {
    paddingBottom: 4,
  },
});
