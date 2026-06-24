import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AuthBackButton } from '@/components/auth/auth-back-button';
import { GradientButton } from '@/components/auth/gradient-button';
import { BrandColors } from '@/constants/brand';
import {
  PLANS,
  buildQrImageUrl,
  buildUpiMandateLink,
  formatPrice,
  getPlan,
  type AutopayMethod,
  type PaidPlanId,
} from '@/constants/subscription';
import { useSubscriptionStore } from '@/stores/use-subscription-store';
import { useTranslation } from '@/context/locale-context';
import { paramString } from '@/lib/parse-route-params';

const BENEFITS = ['benefit1', 'benefit2', 'benefit3', 'benefit4'];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ reason?: string | string[] }>();
  const reason = paramString(params.reason);

  const activate = useSubscriptionStore((s) => s.activate);

  const [selected, setSelected] = useState<PaidPlanId>('yearly');
  const [method, setMethod] = useState<AutopayMethod>('upi');

  const plan = getPlan(selected);
  const priceLabel = plan ? formatPrice(plan.amount) : '';

  const headline =
    reason === 'photo'
      ? t('subscription.reasonPhoto')
      : reason === 'limit'
        ? t('subscription.reasonLimit')
        : t('subscription.subtitle');

  const openUpi = async () => {
    if (!plan) return;
    const link = buildUpiMandateLink(plan);
    try {
      const ok = await Linking.canOpenURL(link);
      if (ok) await Linking.openURL(link);
      else Alert.alert(t('subscription.methodUpi'), t('subscription.qrHint'));
    } catch {
      Alert.alert(t('subscription.methodUpi'), t('subscription.qrHint'));
    }
  };

  const handleSubscribe = () => {
    // Dummy activation — replaced by the real UPI AutoPay / billing callback later.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    activate(selected, method);
    Alert.alert(t('subscription.success'), undefined, [
      { text: 'OK', onPress: () => router.back() },
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
        <AuthBackButton onPress={() => router.back()} label={t('subscription.title')} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={[...BrandColors.gradient]} style={styles.crown}>
            <MaterialIcons name="workspace-premium" size={32} color="#fff" />
          </LinearGradient>
          <Text style={styles.heroTitle}>{t('subscription.title')}</Text>
          <Text style={styles.heroSub}>{headline}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b} style={styles.benefitRow}>
              <MaterialIcons name="check-circle" size={20} color={BrandColors.success} />
              <Text style={styles.benefitTxt}>{t(`subscription.${b}`)}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <Text style={styles.sectionTitle}>{t('subscription.choosePlan')}</Text>
        <View style={styles.plans}>
          {PLANS.map((p) => {
            const active = selected === p.id;
            return (
              <Pressable
                key={p.id}
                style={[styles.planCard, active && styles.planCardActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelected(p.id);
                }}
              >
                <View style={styles.planLeft}>
                  <View style={[styles.radio, active && styles.radioOn]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.planInfo}>
                    <View style={styles.planNameRow}>
                      <Text style={styles.planName}>{t(`subscription.plan.${p.id}`)}</Text>
                      {p.badgeKey ? (
                        <View style={styles.planBadge}>
                          <Text style={styles.planBadgeTxt}>{t(p.badgeKey)}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.planTagline}>{t(p.taglineKey)}</Text>
                  </View>
                </View>
                <View style={styles.planPriceWrap}>
                  <Text style={styles.planPrice}>{formatPrice(p.amount)}</Text>
                  <Text style={styles.planPeriod}>{t(p.periodKey)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* AutoPay */}
        <Text style={styles.sectionTitle}>{t('subscription.autopayTitle')}</Text>
        <Text style={styles.autopaySub}>{t('subscription.autopaySubtitle')}</Text>

        <View style={styles.methodRow}>
          <Pressable
            style={[styles.methodTab, method === 'upi' && styles.methodTabOn]}
            onPress={() => setMethod('upi')}
          >
            <MaterialIcons
              name="account-balance"
              size={18}
              color={method === 'upi' ? BrandColors.orange : BrandColors.textMuted}
            />
            <Text style={[styles.methodTxt, method === 'upi' && styles.methodTxtOn]}>
              {t('subscription.methodUpi')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.methodTab, method === 'qr' && styles.methodTabOn]}
            onPress={() => setMethod('qr')}
          >
            <MaterialIcons
              name="qr-code-2"
              size={18}
              color={method === 'qr' ? BrandColors.orange : BrandColors.textMuted}
            />
            <Text style={[styles.methodTxt, method === 'qr' && styles.methodTxtOn]}>
              {t('subscription.methodQr')}
            </Text>
          </Pressable>
        </View>

        {method === 'upi' ? (
          <View style={styles.methodPanel}>
            <Pressable style={styles.upiBtn} onPress={openUpi}>
              <MaterialIcons name="open-in-new" size={18} color={BrandColors.orange} />
              <Text style={styles.upiBtnTxt}>{t('subscription.upiCta')}</Text>
            </Pressable>
            <Text style={styles.methodHint}>{t('subscription.upiHint')}</Text>
          </View>
        ) : (
          <View style={styles.methodPanel}>
            {plan ? (
              <Image
                source={{ uri: buildQrImageUrl(buildUpiMandateLink(plan)) }}
                style={styles.qr}
                contentFit="contain"
                transition={200}
              />
            ) : null}
            <Text style={styles.methodHint}>{t('subscription.qrHint')}</Text>
          </View>
        )}

        {/* CTA */}
        <View style={styles.cta}>
          <GradientButton
            label={t('subscription.startCta', { price: priceLabel })}
            onPress={handleSubscribe}
          />
          <Text style={styles.payNote}>{t('subscription.payNote', { price: priceLabel })}</Text>
          <Text style={styles.testNote}>{t('subscription.testNote')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  hero: { alignItems: 'center', paddingVertical: 8 },
  crown: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  heroTitle: { fontSize: 24, fontFamily: 'NotoSans_700Bold', color: BrandColors.text },
  heroSub: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
  },
  benefits: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    gap: 12,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitTxt: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.text,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 6,
  },
  plans: { gap: 10 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    backgroundColor: BrandColors.surface,
    borderWidth: 1.5,
    borderColor: BrandColors.surfaceBorder,
  },
  planCardActive: {
    borderColor: BrandColors.orange,
    backgroundColor: BrandColors.bgAccent,
  },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BrandColors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: BrandColors.orange },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: BrandColors.orange,
  },
  planInfo: { flex: 1 },
  planNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { fontSize: 16, fontFamily: 'NotoSans_700Bold', color: BrandColors.text },
  planBadge: {
    backgroundColor: BrandColors.orange,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  planBadgeTxt: { fontSize: 10, fontFamily: 'NotoSans_700Bold', color: '#fff' },
  planTagline: {
    fontSize: 12.5,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  planPriceWrap: { alignItems: 'flex-end' },
  planPrice: { fontSize: 18, fontFamily: 'NotoSans_700Bold', color: BrandColors.text },
  planPeriod: {
    fontSize: 11,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
  },
  autopaySub: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    marginTop: -2,
    marginBottom: 12,
    marginLeft: 6,
  },
  methodRow: { flexDirection: 'row', gap: 10 },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: BrandColors.surface,
    borderWidth: 1.5,
    borderColor: BrandColors.surfaceBorder,
  },
  methodTabOn: { borderColor: BrandColors.orange, backgroundColor: BrandColors.bgAccent },
  methodTxt: {
    fontSize: 14,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textMuted,
  },
  methodTxtOn: { color: BrandColors.orange },
  methodPanel: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    alignItems: 'center',
    gap: 12,
  },
  upiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: BrandColors.bgAccent,
    borderWidth: 1.5,
    borderColor: BrandColors.orange,
  },
  upiBtnTxt: { fontSize: 14.5, fontFamily: 'NotoSans_700Bold', color: BrandColors.orange },
  qr: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  methodHint: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  cta: { marginTop: 24, gap: 10 },
  payNote: {
    fontSize: 12,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  testNote: {
    fontSize: 11,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
});
