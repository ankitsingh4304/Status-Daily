import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AuthBackButton } from '@/components/auth/auth-back-button';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { DevOtpBanner } from '@/components/auth/dev-otp-banner';
import { GradientButton } from '@/components/auth/gradient-button';
import { OtpInputGroup } from '@/components/auth/otp-input-group';
import { ResendTimer } from '@/components/auth/resend-timer';
import { SecurityBadge } from '@/components/auth/security-badge';
import { AuthLayout } from '@/constants/auth-layout';
import { BrandColors } from '@/constants/brand';
import { maskPhone } from '@/utils/auth';

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string; countryCode?: string }>();

  const phone = (params.phone ?? '').replace(/\D/g, '');
  const countryCode = params.countryCode ?? '+91';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const isComplete = otp.length === AuthLayout.otpLength;
  const masked = maskPhone(countryCode, phone);

  useEffect(() => {
    if (!phone || phone.length < 10) {
      router.replace('/');
    }
  }, [phone, router]);

  const handleVerify = async () => {
    if (!isComplete) return;
    Keyboard.dismiss();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 520));

    const valid = __DEV__ ? otp === AuthLayout.devOtp : otp.length === AuthLayout.otpLength;

    setLoading(false);

    if (!valid) {
      Alert.alert('Invalid code', 'Please check the code and try again.');
      setOtp('');
      return;
    }

    router.replace('/profile-setup');
  };

  const handleResend = () => {
    setOtp('');
    // Dummy OTP in v1 — backend SMS send (MSG91) is wired in at the API layer.
    Alert.alert('Code sent', `We sent a new verification code to ${masked}.`);
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
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 24,
              },
            ]}
          >
            <Animated.View entering={FadeIn.duration(400)}>
              <AuthBackButton onPress={() => router.back()} />
            </Animated.View>

            <View style={styles.main}>
              <Animated.View entering={FadeInDown.delay(80).duration(480)} style={styles.hero}>
                <SecurityBadge />
                <Text style={styles.title}>Verify your number</Text>
                <Text style={styles.subtitle}>
                  We sent a verification code to{'\n'}
                  <Text style={styles.phoneHighlight}>{masked}</Text>
                </Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(180).duration(480)}>
                <DevOtpBanner />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(260).duration(480)} style={styles.otpWrap}>
                <OtpInputGroup value={otp} onChange={setOtp} />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(340).duration(480)} style={styles.resend}>
                <ResendTimer onResend={handleResend} />
              </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(420).duration(480)} style={styles.bottom}>
              <GradientButton
                label="Verify & Continue"
                onPress={handleVerify}
                disabled={!isComplete}
                loading={loading}
              />

              <Pressable
                onPress={() => router.back()}
                style={styles.wrongNumber}
                hitSlop={12}
              >
                <Text style={styles.wrongNumberText}>Wrong number?</Text>
              </Pressable>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: AuthLayout.horizontalPadding,
    justifyContent: 'space-between',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: AuthLayout.headingSize,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    letterSpacing: -0.4,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: AuthLayout.subtitleSize,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: AuthLayout.subtitleLineHeight,
    maxWidth: 300,
  },
  phoneHighlight: {
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.text,
  },
  otpWrap: {
    marginBottom: 24,
  },
  resend: {
    marginTop: 8,
  },
  bottom: {
    gap: 16,
    paddingBottom: 8,
  },
  wrongNumber: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  wrongNumberText: {
    fontSize: 14,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.link,
  },
});
