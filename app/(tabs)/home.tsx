import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';

import { CategoryChipRows } from '@/components/home/category-chip-rows';
import { HomeHeader } from '@/components/home/home-header';
import { HomeActionBar } from '@/components/home/home-action-bar';
import { StatusReelCard } from '@/components/home/status-reel-card';
import { InlineExporter, type ExportRequest } from '@/components/home/inline-exporter';
import { WalkthroughOverlay } from '@/components/walkthrough/walkthrough-overlay';
import { SubscriptionIntroOverlay } from '@/components/walkthrough/subscription-intro-overlay';
import { WalkTarget } from '@/components/walkthrough/walk-target';
import {
  WalkthroughProvider,
  useWalkthrough,
  type WalkStep,
} from '@/context/walkthrough-context';
import type { CategoryId } from '@/constants/status-categories';
import { nextProfilePosition, type ProfileCirclePosition } from '@/constants/profile-circle';
import { BrandColors } from '@/constants/brand';
import { STATUS_FEED, filterByCategory } from '@/data/status-feed';
import { useSavedStore } from '@/stores/use-saved-store';
import { useExportGate } from '@/hooks/use-export-gate';
import { isPremiumActive, useSubscriptionStore } from '@/stores/use-subscription-store';
import {
  isSubscriptionIntroSeen,
  isWalkthroughSeen,
  markSubscriptionIntroSeen,
  markWalkthroughSeen,
} from '@/services/user-profile-storage';
import { useTranslation } from '@/context/locale-context';

export default function HomeScreen() {
  return (
    <WalkthroughProvider onFinish={markWalkthroughSeen}>
      <HomeContent />
    </WalkthroughProvider>
  );
}

function HomeContent() {
  const [category, setCategory] = useState<CategoryId>('all');
  const [feedHeight, setFeedHeight] = useState(0);
  const [feedWidth, setFeedWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [circlePos, setCirclePos] = useState<ProfileCirclePosition>('bottomLeft');
  const [toast, setToast] = useState<string | null>(null);
  const [exportReq, setExportReq] = useState<ExportRequest | null>(null);

  const savedIds = useSavedStore((s) => s.items.map((i) => i.id).join(','));
  const isSavedFn = useSavedStore((s) => s.isSaved);
  const { attempt } = useExportGate();
  const { t } = useTranslation();
  const walk = useWalkthrough();

  const router = useRouter();
  const plan = useSubscriptionStore((s) => s.plan);
  const expiresAt = useSubscriptionStore((s) => s.expiresAt);
  const premium = isPremiumActive({ plan, expiresAt });

  const [showSubIntro, setShowSubIntro] = useState(false);
  const pendingShare = useRef(false);

  // First-run coachmark tour — runs once, only after the feed is laid out.
  useEffect(() => {
    if (!walk || feedHeight === 0) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      if (await isWalkthroughSeen()) return;
      timer = setTimeout(() => {
        if (cancelled) return;
        const steps: WalkStep[] = [
          { id: 'categories', title: t('walkthrough.categories.title'), text: t('walkthrough.categories.text') },
          { id: 'design', title: t('walkthrough.design.title'), text: t('walkthrough.design.text') },
          { id: 'save', title: t('walkthrough.save.title'), text: t('walkthrough.save.text') },
          { id: 'share', title: t('walkthrough.share.title'), text: t('walkthrough.share.text') },
          { id: 'download', title: t('walkthrough.download.title'), text: t('walkthrough.download.text') },
        ];
        walk.start(steps);
      }, 900);
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Run once when the feed first has a size.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedHeight > 0]);

  const filtered = useMemo(() => filterByCategory(STATUS_FEED, category), [category]);
  const currentItem = filtered[currentIndex] ?? filtered[0];

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 65 }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const onCategoryChange = useCallback((id: CategoryId) => {
    setCategory(id);
    setCurrentIndex(0);
  }, []);

  const cycleDesign = useCallback(() => {
    setCirclePos((p) => nextProfilePosition(p));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const doExport = useCallback(
    (mode: 'share' | 'download') => {
      if (!currentItem) return;
      // Free/premium gate: own-photo or over-limit routes to the paywall instead.
      if (!attempt(mode)) return;
      setExportReq({ item: currentItem, mode, circlePos });
    },
    [currentItem, attempt, circlePos]
  );

  const requestExport = useCallback(
    (mode: 'share' | 'download') => {
      if (!currentItem || exportReq) return;
      // First time a free user shares → familiarise them with the subscription model.
      if (mode === 'share' && !premium) {
        (async () => {
          if (await isSubscriptionIntroSeen()) {
            doExport('share');
          } else {
            pendingShare.current = true;
            setShowSubIntro(true);
          }
        })();
        return;
      }
      doExport(mode);
    },
    [currentItem, exportReq, premium, doExport]
  );

  const closeSubIntro = useCallback(
    (continueShare: boolean) => {
      markSubscriptionIntroSeen();
      setShowSubIntro(false);
      const proceed = continueShare && pendingShare.current;
      pendingShare.current = false;
      if (proceed) doExport('share');
    },
    [doExport]
  );

  const onExportDone = useCallback(
    (msg?: string) => {
      setExportReq(null);
      if (msg) showToast(msg);
    },
    [showToast]
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.bg, '#FFFFFF', BrandColors.bgAccent]}
        locations={[0, 0.5, 1]}
        style={styles.topGradient}
      />

      {toast ? (
        <Animated.View entering={FadeInUp} exiting={FadeOut} style={styles.toast}>
          <Text style={styles.toastTxt}>{toast}</Text>
        </Animated.View>
      ) : null}

      <HomeHeader />

      <WalkTarget id="categories">
        <CategoryChipRows active={category} onSelect={onCategoryChange} />
      </WalkTarget>

      {/* Media area — contained between categories and the action bar (no overlap) */}
      <View
        style={styles.feedArea}
        onLayout={(e) => {
          setFeedHeight(e.nativeEvent.layout.height);
          setFeedWidth(e.nativeEvent.layout.width);
        }}
      >
        {feedHeight > 0 && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.feedInner}>
            <FlatList
              data={filtered}
              keyExtractor={(item) => `${category}-${item.id}`}
              extraData={`${category}-${savedIds}`}
              renderItem={({ item, index }) => (
                <StatusReelCard
                  item={item}
                  feedHeight={feedHeight}
                  feedWidth={feedWidth}
                  isFocused={currentIndex === index}
                  circlePos={circlePos}
                  isSaved={isSavedFn(item.id)}
                  onChangeDesign={cycleDesign}
                />
              )}
              pagingEnabled
              snapToInterval={feedHeight}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum
              showsVerticalScrollIndicator={false}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={onViewableItemsChanged}
              windowSize={3}
              initialNumToRender={1}
              maxToRenderPerBatch={1}
              removeClippedSubviews
            />
          </Animated.View>
        )}
      </View>

      {currentItem ? (
        <HomeActionBar
          item={currentItem}
          onShare={() => requestExport('share')}
          onDownload={() => requestExport('download')}
          onToast={showToast}
          disabled={!!exportReq}
        />
      ) : null}

      <InlineExporter request={exportReq} onDone={onExportDone} />

      <WalkthroughOverlay
        skipLabel={t('walkthrough.skip')}
        nextLabel={t('walkthrough.next')}
        doneLabel={t('walkthrough.done')}
      />

      <SubscriptionIntroOverlay
        visible={showSubIntro}
        onLater={() => closeSubIntro(true)}
        onViewPlans={() => {
          closeSubIntro(false);
          router.push('/paywall');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.bg },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, zIndex: 0 },
  toast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 50,
    backgroundColor: BrandColors.text,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toastTxt: { color: '#fff', fontSize: 14, fontFamily: 'NotoSans_600SemiBold' },
  feedArea: { flex: 1, zIndex: 1, marginHorizontal: 14, marginBottom: 8, borderRadius: 24, overflow: 'hidden' },
  feedInner: { flex: 1 },
});
