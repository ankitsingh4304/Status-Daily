import React, { useCallback, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';

import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { ProfileContentGrid } from '@/components/profile/profile-content-grid';
import { InlineExporter, type ExportRequest } from '@/components/home/inline-exporter';
import { BrandColors } from '@/constants/brand';
import { savedToFeedItem } from '@/lib/saved-to-feed';
import type { ProfileContentItem } from '@/data/profile-content';
import { sortSavedItems, useSavedStore } from '@/stores/use-saved-store';
import { useExportGate } from '@/hooks/use-export-gate';
import type { SavedSort } from '@/types/saved-status';
import { useTranslation } from '@/context/locale-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [sort, setSort] = useState<SavedSort>('recent');
  const [exportReq, setExportReq] = useState<ExportRequest | null>(null);
  const { attempt } = useExportGate();

  const savedItems = useSavedStore(useShallow((s) => s.items));
  const removeSaved = useSavedStore((s) => s.removeSaved);

  const sorted = useMemo(() => sortSavedItems(savedItems, sort), [savedItems, sort]);

  const gridItems: ProfileContentItem[] = useMemo(
    () =>
      sorted.map((s) => {
        const feed = savedToFeedItem(s);
        return {
          ...feed,
          createdAt: s.savedAt,
          categoryLabel: feed.categories[0] ?? 'all',
        };
      }),
    [sorted]
  );

  const handleRemove = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      removeSaved(id);
    },
    [removeSaved]
  );

  // Open a saved item in the editor for editing.
  const openSaved = useCallback(
    (item: ProfileContentItem) => {
      const saved = sorted.find((x) => x.id === item.id);
      router.push({
        pathname: '/personalize',
        params: {
          statusId: item.id,
          mediaType: item.mediaType,
          statusTitle: item.title,
          gradient: JSON.stringify(item.gradient),
          ...(item.mediaUrl ? { templateUri: item.mediaUrl } : {}),
          ...(saved?.editorState ? { editorSnapshot: JSON.stringify(saved.editorState) } : {}),
        },
      });
    },
    [router, sorted]
  );

  // Share a saved item inline with the standard bottom-left name-plate (same export
  // pipeline as the home feed), so the shared image carries our name-plate pattern.
  const shareSaved = useCallback(
    (item: ProfileContentItem) => {
      if (exportReq) return;
      const saved = sorted.find((x) => x.id === item.id);
      if (!saved) return;
      if (!attempt('share')) return;
      setExportReq({ item: savedToFeedItem(saved), mode: 'share', circlePos: 'bottomLeft' });
    },
    [exportReq, sorted, attempt]
  );

  const sorts: { key: SavedSort; label: string }[] = [
    { key: 'recent', label: t('saved.sortRecent') },
    { key: 'title', label: t('saved.sortTitle') },
    { key: 'likes', label: t('saved.sortLikes') },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.bg, '#FFFFFF', BrandColors.bgAccent]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 },
        ]}
      >
        <Animated.View entering={FadeIn}>
          <Text style={styles.title}>{t('tabs.saved')}</Text>
          <Text style={styles.sub}>{t('saved.subtitle', { count: savedItems.length })}</Text>
        </Animated.View>

        <View style={styles.sortRow}>
          {sorts.map((s) => (
            <Pressable
              key={s.key}
              style={[styles.sortChip, sort === s.key && styles.sortChipOn]}
              onPress={() => setSort(s.key)}
            >
              <Text style={[styles.sortTxt, sort === s.key && styles.sortTxtOn]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <ProfileContentGrid
          items={gridItems}
          emptyMessage={t('saved.empty')}
          onPressItem={(item) => openSaved(item)}
          onShareItem={(item) => shareSaved(item)}
          onRemoveItem={handleRemove}
          showRemove
        />
      </ScrollView>

      <InlineExporter request={exportReq} onDone={() => setExportReq(null)} />

      <AppTabBar active="saved" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.bg },
  scroll: { paddingHorizontal: 16 },
  title: {
    fontSize: 28,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  sub: {
    fontSize: 14,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  sortRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  sortChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
  },
  sortChipOn: {
    backgroundColor: BrandColors.bgAccent,
    borderColor: BrandColors.orange,
  },
  sortTxt: {
    fontSize: 12,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
  },
  sortTxtOn: { color: BrandColors.orange },
});
