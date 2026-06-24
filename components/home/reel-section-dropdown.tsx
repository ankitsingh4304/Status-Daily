import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { BrandColors } from '@/constants/brand';
import type { ProfileCirclePosition } from '@/constants/profile-circle';
import type { StatusItem } from '@/data/status-feed';
import { useLocale, useTranslation } from '@/context/locale-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SectionKey = 'position' | 'changePhoto' | 'edit' | 'download' | 'shareStatus';

const SECTION_ICON: Record<SectionKey, keyof typeof MaterialIcons.glyphMap> = {
  position: 'open-with',
  changePhoto: 'add-a-photo',
  edit: 'edit',
  download: 'file-download',
  shareStatus: 'share',
};

type Props = {
  item: StatusItem;
  circlePos: ProfileCirclePosition;
  onChangePosition: () => void;
  onEdit: () => void;
  onSaveToast?: (message: string) => void;
};

function SectionTab({
  sectionKey,
  label,
  active,
  highlight,
  onPress,
}: {
  sectionKey: SectionKey;
  label: string;
  active: boolean;
  highlight?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 18, stiffness: 420 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 300 });
      }}
      style={[styles.tab, anim]}
    >
      <View style={[styles.tabIcon, active && styles.tabIconActive, highlight && styles.tabIconHi]}>
        <MaterialIcons name={SECTION_ICON[sectionKey]} size={21} color={highlight ? '#fff' : active ? BrandColors.orange : BrandColors.textSecondary} />
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export function ReelSectionDropdown({
  item,
  circlePos,
  onChangePosition,
  onEdit,
  onSaveToast,
}: Props) {
  const { t } = useTranslation();
  const { updateProfile } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<SectionKey | null>(null);

  const goPersonalize = (shareOnly: boolean) => {
    router.push({
      pathname: '/personalize',
      params: {
        statusId: item.id,
        mediaType: item.mediaType,
        statusTitle: item.title,
        gradient: JSON.stringify(item.gradient),
        reelPosition: circlePos,
        ...(shareOnly ? { shareOnly: '1' } : {}),
        ...(item.mediaUrl ? { templateUri: item.mediaUrl } : {}),
      },
    });
  };

  const handleChangePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      await updateProfile({ photoUri: res.assets[0].uri });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaveToast?.(t('home.actions.changePhoto'));
    }
  };

  const sections: { key: SectionKey; onPress: () => void; highlight?: boolean }[] = [
    { key: 'position', onPress: onChangePosition },
    { key: 'changePhoto', onPress: handleChangePhoto },
    { key: 'edit', onPress: onEdit },
    { key: 'download', onPress: () => goPersonalize(true) },
    { key: 'shareStatus', onPress: () => goPersonalize(true), highlight: true },
  ];

  return (
    <View style={[styles.outer, { bottom: Math.max(insets.bottom, 16) + 8 }]}>
      <BlurView intensity={72} tint="light" style={styles.barBlur}>
        <View style={styles.bar}>
          {sections.map(({ key, onPress, highlight }) => (
            <SectionTab
              key={key}
              sectionKey={key}
              label={t(`home.actions.${key}`)}
              active={active === key}
              highlight={highlight}
              onPress={() => {
                setActive(key);
                onPress();
              }}
            />
          ))}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 30,
  },
  barBlur: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: BrandColors.surface,
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  tabIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.bgAccent,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
  },
  tabIconActive: {
    backgroundColor: '#FFF3E6',
    borderColor: BrandColors.orange,
  },
  tabIconHi: {
    backgroundColor: BrandColors.whatsapp,
    borderColor: BrandColors.whatsapp,
  },
  tabLabel: {
    marginTop: 5,
    fontSize: 10.5,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: BrandColors.orange,
    fontFamily: 'NotoSans_700Bold',
  },
});
