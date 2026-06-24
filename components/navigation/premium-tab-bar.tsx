import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';

type TabKey = 'home' | 'saved' | 'profile';

const TAB_CONFIG: {
  name: string;
  key: TabKey;
  icon: keyof typeof MaterialIcons.glyphMap;
  activeIcon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { name: 'home', key: 'home', icon: 'home', activeIcon: 'home' },
  { name: 'saved', key: 'saved', icon: 'bookmark-border', activeIcon: 'bookmark' },
  { name: 'profile', key: 'profile', icon: 'person-outline', activeIcon: 'person' },
];

const HIDDEN_TABS = new Set(['index', 'reelslive', 'explore', 'upload']);

export function PremiumTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();

  const visibleRoutes = state.routes.filter((r) => !HIDDEN_TABS.has(r.name));

  return (
    <View style={styles.outer}>
      <BlurView intensity={80} tint="light" style={styles.blur}>
        <View style={styles.bar}>
          {visibleRoutes.map((route) => {
            const index = state.routes.findIndex((r) => r.key === route.key);
            const focused = state.index === index;
            const cfg = TAB_CONFIG.find((c) => c.name === route.name);
            if (!cfg) return null;

            const onPress = () => {
              if (focused) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            if (focused) {
              return (
                <Pressable key={route.key} onPress={onPress} style={styles.tabSlot}>
                  <LinearGradient
                    colors={[...BrandColors.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeTab}
                  >
                    <MaterialIcons name={cfg.activeIcon} size={20} color="#fff" />
                    <Text style={styles.activeLabel}>{t(`tabs.${cfg.key}`)}</Text>
                  </LinearGradient>
                </Pressable>
              );
            }

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.tabSlot}>
                <View style={styles.inactiveTab}>
                  <MaterialIcons name={cfg.icon} size={22} color={BrandColors.textMuted} />
                  <Text style={styles.label}>{t(`tabs.${cfg.key}`)}</Text>
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
    left: 20,
    right: 20,
    bottom: 24,
  },
  blur: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.78)',
    gap: 6,
  },
  tabSlot: {
    flex: 1,
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textMuted,
  },
  activeLabel: {
    fontSize: 11,
    fontFamily: 'NotoSans_700Bold',
    color: '#fff',
  },
});
