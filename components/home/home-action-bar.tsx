import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { BrandColors } from '@/constants/brand';
import type { StatusItem } from '@/data/status-feed';
import { useSavedStore } from '@/stores/use-saved-store';
import { useLocale, useTranslation } from '@/context/locale-context';
import { useWalkTarget } from '@/context/walkthrough-context';

type Props = {
  item: StatusItem;
  onShare: () => void;
  onDownload: () => void;
  onToast: (message: string) => void;
  disabled?: boolean;
};

export function HomeActionBar({ item, onShare, onDownload, onToast, disabled }: Props) {
  const { t } = useTranslation();
  const { updateProfile } = useLocale();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isSaved = useSavedStore((s) => s.isSaved(item.id));
  const toggleSave = useSavedStore((s) => s.toggleSave);

  // Walkthrough targets
  const saveRef = useWalkTarget('save');
  const shareRef = useWalkTarget('share');
  const downloadRef = useWalkTarget('download');

  const handleSave = () => {
    const added = toggleSave(item);
    Haptics.notificationAsync(
      added ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    );
    onToast(added ? t('saved.added') : t('saved.removed'));
  };

  const handleEdit = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/personalize',
      params: {
        statusId: item.id,
        mediaType: item.mediaType,
        statusTitle: item.title,
        gradient: JSON.stringify(item.gradient),
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
      onToast(t('home.actions.changePhoto'));
    }
  };

  const chips: {
    key: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    active?: boolean;
    onPress: () => void;
  }[] = [
    {
      key: 'changePhoto',
      icon: 'add-a-photo',
      label: t('home.actions.changePhoto'),
      onPress: handleChangePhoto,
    },
    {
      key: 'save',
      icon: isSaved ? 'bookmark' : 'bookmark-border',
      label: isSaved ? t('home.actions.saved') : t('home.actions.save'),
      active: isSaved,
      onPress: handleSave,
    },
    { key: 'edit', icon: 'edit', label: t('home.actions.edit'), onPress: handleEdit },
  ];

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Secondary chip row: Change Photo · Save/Saved · Edit — matches the top category chips */}
      <View style={styles.chipRow}>
        {chips.map((c) => (
          <Pressable
            key={c.key}
            ref={c.key === 'save' ? saveRef : undefined}
            style={[styles.chip, c.key === 'changePhoto' && styles.chipWide, c.active && styles.chipActive]}
            onPress={c.onPress}
            hitSlop={4}
          >
            <MaterialIcons
              name={c.icon}
              size={17}
              color={c.active ? '#fff' : BrandColors.orange}
            />
            <Text
              style={[styles.chipTxt, c.active && styles.chipTxtActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Primary row: big Share + Download */}
      <View style={styles.primaryRow}>
        <Pressable
          ref={shareRef}
          style={[styles.cta, styles.share, disabled && styles.ctaDisabled]}
          onPress={onShare}
          disabled={disabled}
        >
          <MaterialIcons name="chat" size={20} color="#fff" />
          <Text style={styles.ctaTxt} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {t('home.actions.shareStatus')}
          </Text>
        </Pressable>

        <Pressable
          ref={downloadRef}
          style={[styles.ctaFlex, disabled && styles.ctaDisabled]}
          onPress={onDownload}
          disabled={disabled}
        >
          <LinearGradient
            colors={[BrandColors.orange, '#FF9F1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <MaterialIcons name="file-download" size={20} color="#fff" />
            <Text style={styles.ctaTxt} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {t('home.actions.download')}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    backgroundColor: BrandColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    shadowColor: BrandColors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 12,
  },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
  },
  // "Change Photo" is the longest label — give it more room so it fits on one line.
  chipWide: { flex: 1.5 },
  chipActive: { backgroundColor: BrandColors.orange, borderColor: BrandColors.orange },
  chipTxt: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
  },
  chipTxtActive: { color: '#fff' },

  primaryRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  ctaFlex: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  cta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 17,
    paddingHorizontal: 6,
    borderRadius: 16,
  },
  share: { backgroundColor: BrandColors.whatsapp },
  ctaDisabled: { opacity: 0.6 },
  ctaTxt: { color: '#fff', fontSize: 15, fontFamily: 'NotoSans_700Bold' },
});
