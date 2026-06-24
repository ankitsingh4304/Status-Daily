import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AuthBackButton } from '@/components/auth/auth-back-button';
import { BrandColors } from '@/constants/brand';
import { formatPrice, getPlan } from '@/constants/subscription';
import { useSubscriptionStore } from '@/stores/use-subscription-store';
import { useTranslation } from '@/context/locale-context';

type Invoice = {
  id: string;
  plan: string;
  amount: string;
  date: string;
  status: 'paid' | 'refunded';
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function InvoicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const plan = useSubscriptionStore((s) => s.plan);
  const startedAt = useSubscriptionStore((s) => s.startedAt);
  const planMeta = getPlan(plan);

  // Build the receipt for the current subscription. Becomes a real list from the
  // billing API later (full history); for now it reflects the active plan.
  const invoices: Invoice[] =
    plan !== 'free' && startedAt && planMeta
      ? [
          {
            id: `SD-${startedAt.slice(0, 10).replace(/-/g, '')}`,
            plan: `${t(`subscription.plan.${plan}`)} · ${t('subscription.activeTitle')}`,
            amount: formatPrice(planMeta.amount),
            date: startedAt,
            status: 'paid',
          },
        ]
      : [];

  const isEmpty = invoices.length === 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.bg, '#FFFFFF', BrandColors.bgAccent]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <AuthBackButton onPress={() => router.back()} label={t('invoices.title')} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        <Text style={styles.subtitle}>{t('invoices.subtitle')}</Text>

        {isEmpty ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="receipt-long" size={38} color={BrandColors.orange} />
            </View>
            <Text style={styles.emptyTitle}>{t('invoices.empty')}</Text>
            <Text style={styles.emptyBody}>{t('invoices.emptyBody')}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {invoices.map((inv) => (
              <View key={inv.id} style={styles.invoice}>
                <View style={styles.invoiceIcon}>
                  <MaterialIcons name="receipt" size={22} color={BrandColors.orange} />
                </View>
                <View style={styles.invoiceMain}>
                  <Text style={styles.invoicePlan}>{inv.plan}</Text>
                  <Text style={styles.invoiceMeta}>
                    {formatDate(inv.date)} · #{inv.id}
                  </Text>
                </View>
                <View style={styles.invoiceRight}>
                  <Text style={styles.invoiceAmount}>{inv.amount}</Text>
                  <View
                    style={[
                      styles.badge,
                      inv.status === 'refunded' ? styles.badgeRefund : styles.badgePaid,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeTxt,
                        inv.status === 'refunded' ? styles.badgeTxtRefund : styles.badgeTxtPaid,
                      ]}
                    >
                      {inv.status === 'refunded'
                        ? t('invoices.statusRefunded')
                        : t('invoices.statusPaid')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <Text style={styles.downloadNote}>{t('invoices.downloadSoon')}</Text>
          </View>
        )}

        {/* Billing help */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTxt}>{t('invoices.help')}</Text>
          <Pressable
            style={({ pressed }) => [styles.helpBtn, pressed && styles.helpBtnPressed]}
            onPress={() => Alert.alert(t('invoices.help'), 'support@statusdaily.app')}
          >
            <MaterialIcons name="support-agent" size={18} color={BrandColors.orange} />
            <Text style={styles.helpBtnTxt}>{t('invoices.helpCta')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  subtitle: {
    fontSize: 14,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    marginBottom: 20,
    marginLeft: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: BrandColors.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  list: { gap: 12 },
  invoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
  },
  invoiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BrandColors.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceMain: { flex: 1 },
  invoicePlan: {
    fontSize: 15,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  invoiceMeta: {
    fontSize: 12,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginTop: 3,
  },
  invoiceRight: { alignItems: 'flex-end', gap: 6 },
  invoiceAmount: {
    fontSize: 15,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgePaid: { backgroundColor: 'rgba(34,197,94,0.12)' },
  badgeRefund: { backgroundColor: 'rgba(245,158,11,0.14)' },
  badgeTxt: { fontSize: 11, fontFamily: 'NotoSans_700Bold' },
  badgeTxtPaid: { color: BrandColors.success },
  badgeTxtRefund: { color: BrandColors.warning },
  downloadNote: {
    fontSize: 12,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  helpCard: {
    marginTop: 28,
    padding: 18,
    borderRadius: 18,
    backgroundColor: BrandColors.bgAccent,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    alignItems: 'center',
    gap: 12,
  },
  helpTxt: {
    fontSize: 14,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.orange,
  },
  helpBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  helpBtnTxt: {
    fontSize: 14,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.orange,
  },
});
