import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import { AuthLayout } from '@/constants/auth-layout';

type Props = {
  seconds?: number;
  onResend: () => void;
};

export function ResendTimer({ seconds = AuthLayout.resendSeconds, onResend }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const canResend = remaining <= 0;

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const handleResend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRemaining(seconds);
    onResend();
  };

  if (canResend) {
    return (
      <Animated.View entering={FadeIn.duration(280)} exiting={FadeOut.duration(200)}>
        <Pressable onPress={handleResend} hitSlop={12} style={styles.press}>
          <Text style={styles.active}>Resend code</Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(280)} exiting={FadeOut.duration(200)}>
      <Text style={styles.wait}>Resend OTP in {remaining}s</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wait: {
    fontSize: 14,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  active: {
    fontSize: 14,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.link,
    textAlign: 'center',
  },
  press: {
    alignSelf: 'center',
  },
});
