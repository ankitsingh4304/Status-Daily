import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';

type Props = {
  visible: boolean;
  /** Dismiss without upgrading (continue what they were doing). */
  onLater: () => void;
  /** Open the paywall / plans. */
  onViewPlans: () => void;
};

/** Shown the first time a free user taps Share — a one-time, blurred coachmark that
 *  familiarises them with the Free vs Premium model before continuing. */
export function SubscriptionIntroOverlay({ visible, onLater, onViewPlans }: Props) {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onLater}>
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.tint} />
      </Pressable>

      <View pointerEvents="box-none" style={styles.center}>
        <View style={styles.card}>
          <LinearGradient
            colors={[...BrandColors.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBadge}
          >
            <MaterialIcons name="workspace-premium" size={26} color="#fff" />
          </LinearGradient>

          <Text style={styles.title}>{t('subIntro.title')}</Text>
          <Text style={styles.text}>{t('subIntro.text')}</Text>

          <Pressable onPress={onViewPlans} style={styles.planBtnWrap}>
            <LinearGradient
              colors={[...BrandColors.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planBtn}
            >
              <Text style={styles.planTxt}>{t('subIntro.viewPlans')}</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onLater} style={styles.laterBtn} hitSlop={8}>
            <Text style={styles.laterTxt}>{t('subIntro.later')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 120, elevation: 120 },
  tint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,8,14,0.62)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 16,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  planBtnWrap: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  planBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  planTxt: { fontSize: 15.5, fontFamily: 'NotoSans_700Bold', color: '#fff' },
  laterBtn: { paddingVertical: 12, marginTop: 4 },
  laterTxt: { fontSize: 14, fontFamily: 'NotoSans_600SemiBold', color: BrandColors.textMuted },
});
