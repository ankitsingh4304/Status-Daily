import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { BrandColors } from '@/constants/brand';
import {
  isPremiumActive,
  remainingDays,
  useSubscriptionStore,
} from '@/stores/use-subscription-store';
import { useTranslation } from '@/context/locale-context';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function ProfileSubscriptionCard() {
  const router = useRouter();
  const { t } = useTranslation();

  const plan = useSubscriptionStore((s) => s.plan);
  const startedAt = useSubscriptionStore((s) => s.startedAt);
  const expiresAt = useSubscriptionStore((s) => s.expiresAt);
  const autoRenew = useSubscriptionStore((s) => s.autoRenew);
  const autopayMethod = useSubscriptionStore((s) => s.autopayMethod);
  const cancelAutoRenew = useSubscriptionStore((s) => s.cancelAutoRenew);

  const premium = isPremiumActive({ plan, expiresAt });

  // --- Free state: upgrade prompt ---
  if (!premium) {
    return (
      <Pressable
        style={styles.freeCard}
        onPress={() => {
          Haptics.selectionAsync();
          router.push('/paywall');
        }}
      >
        <View style={styles.freeIcon}>
          <MaterialIcons name="workspace-premium" size={24} color={BrandColors.orange} />
        </View>
        <View style={styles.freeMain}>
          <Text style={styles.freeTitle}>{t('subscription.freeTitle')}</Text>
          <Text style={styles.freeSub}>{t('subscription.freeSubtitle')}</Text>
        </View>
        <View style={styles.upgradePill}>
          <Text style={styles.upgradePillTxt}>{t('subscription.upgrade')}</Text>
        </View>
      </Pressable>
    );
  }

  const days = remainingDays(expiresAt);

  const handleCancel = () => {
    Alert.alert(t('subscription.cancelAutopay'), t('subscription.cancelConfirm'), [
      { text: t('subscription.keep'), style: 'cancel' },
      {
        text: t('subscription.cancelAutopay'),
        style: 'destructive',
        onPress: () => {
          cancelAutoRenew();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert(t('subscription.cancelDone'));
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[...BrandColors.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerLeft}>
          <MaterialIcons name="workspace-premium" size={22} color="#fff" />
          <Text style={styles.bannerTitle}>{t('subscription.activeTitle')}</Text>
        </View>
        <View style={styles.planChip}>
          <Text style={styles.planChipTxt}>{t(`subscription.plan.${plan}`)}</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('subscription.started')}</Text>
          <Text style={styles.metaValue}>{formatDate(startedAt)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>
            {autoRenew ? t('subscription.renews') : t('subscription.expires')}
          </Text>
          <Text style={styles.metaValue}>{formatDate(expiresAt)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('subscription.daysLeft', { count: days })}</Text>
          {autopayMethod ? (
            <Text style={styles.metaValue}>
              {t('subscription.autopayVia', { method: t(`subscription.method.${autopayMethod}`) })}
            </Text>
          ) : null}
        </View>

        <View style={[styles.renewRow, autoRenew ? styles.renewOn : styles.renewOff]}>
          <MaterialIcons
            name={autoRenew ? 'autorenew' : 'pause-circle-outline'}
            size={16}
            color={autoRenew ? BrandColors.success : BrandColors.warning}
          />
          <Text
            style={[
              styles.renewTxt,
              { color: autoRenew ? BrandColors.success : BrandColors.warning },
            ]}
          >
            {autoRenew ? t('subscription.autoRenewOn') : t('subscription.autoRenewOff')}
          </Text>
        </View>

        {autoRenew ? (
          <Pressable style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelTxt}>{t('subscription.cancelAutopay')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Free
  freeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 14,
    borderRadius: 18,
    backgroundColor: BrandColors.surface,
    borderWidth: 1.5,
    borderColor: BrandColors.orange,
  },
  freeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BrandColors.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeMain: { flex: 1 },
  freeTitle: { fontSize: 15, fontFamily: 'NotoSans_700Bold', color: BrandColors.text },
  freeSub: {
    fontSize: 12.5,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  upgradePill: {
    backgroundColor: BrandColors.orange,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  upgradePillTxt: { fontSize: 12.5, fontFamily: 'NotoSans_700Bold', color: '#fff' },

  // Premium
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerTitle: { fontSize: 15, fontFamily: 'NotoSans_700Bold', color: '#fff' },
  planChip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  planChipTxt: { fontSize: 12, fontFamily: 'NotoSans_700Bold', color: '#fff' },
  body: { padding: 16, gap: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaLabel: {
    fontSize: 13,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
  },
  metaValue: {
    fontSize: 13.5,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  renewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 2,
  },
  renewOn: { backgroundColor: 'rgba(34,197,94,0.1)' },
  renewOff: { backgroundColor: 'rgba(245,158,11,0.12)' },
  renewTxt: { fontSize: 12.5, fontFamily: 'NotoSans_600SemiBold' },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    marginTop: 4,
  },
  cancelTxt: {
    fontSize: 14,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.accent,
  },
});
