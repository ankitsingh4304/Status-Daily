import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import { BrandFonts } from '@/constants/typography';
import { UiTokens } from '@/constants/ui-tokens';
import { useTranslation } from '@/context/locale-context';

export type AppTabKey = 'home' | 'saved' | 'profile';

const TABS: {
  key: AppTabKey;
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  activeIcon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { key: 'home', route: '/(tabs)/home', icon: 'home', activeIcon: 'home' },
  { key: 'saved', route: '/(tabs)/saved', icon: 'bookmark-border', activeIcon: 'bookmark' },
  { key: 'profile', route: '/(tabs)/profile', icon: 'person-outline', activeIcon: 'person' },
];

type Props = {
  active: AppTabKey;
};

export function AppTabBar({ active }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.outer, { bottom: Math.max(insets.bottom, 12) + 4 }]}>
      <BlurView intensity={88} tint="light" style={styles.blur}>
        <View style={styles.bar}>
          {TABS.map((tab) => {
            const focused = active === tab.key;

            const onPress = () => {
              if (focused) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(tab.route as never);
            };

            if (focused) {
              return (
                <Pressable key={tab.key} onPress={onPress} style={styles.tabSlot}>
                  <LinearGradient
                    colors={[...BrandColors.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeTab}
                  >
                    <MaterialIcons name={tab.activeIcon} size={22} color="#fff" />
                    <Text style={styles.activeLabel}>{t(`tabs.${tab.key}`)}</Text>
                  </LinearGradient>
                </Pressable>
              );
            }

            return (
              <Pressable key={tab.key} onPress={onPress} style={styles.tabSlot}>
                <View style={styles.inactiveTab}>
                  <MaterialIcons name={tab.icon} size={24} color={BrandColors.textMuted} />
                  <Text style={styles.label}>{t(`tabs.${tab.key}`)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: UiTokens.spacing.lg,
    right: UiTokens.spacing.lg,
    zIndex: 40,
  },
  blur: {
    borderRadius: UiTokens.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: BrandColors.surface,
    ...UiTokens.shadow.bar,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: UiTokens.spacing.sm,
    paddingHorizontal: UiTokens.spacing.sm,
    gap: UiTokens.spacing.sm,
  },
  tabSlot: {
    flex: 1,
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UiTokens.spacing.sm,
    minHeight: UiTokens.touch.minHeight - 4,
    paddingHorizontal: UiTokens.spacing.md,
    borderRadius: UiTokens.radius.lg,
    ...UiTokens.shadow.button,
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UiTokens.touch.minHeight - 4,
    gap: UiTokens.spacing.xs,
  },
  label: {
    fontSize: 12,
    fontFamily: BrandFonts.semibold,
    color: BrandColors.textMuted,
  },
  activeLabel: {
    fontSize: 12,
    fontFamily: BrandFonts.bold,
    color: '#fff',
  },
});
