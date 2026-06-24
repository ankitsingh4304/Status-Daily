import React, { useState, useRef, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Pressable, SafeAreaView, Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useSavedStore } from '@/stores/use-saved-store';
import type { StatusItem } from '@/data/status-feed';
import type { CategoryId } from '@/constants/status-categories';
import { BrandColors } from '@/constants/brand';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Premium Theme Colors ---
const DARK_BG = '#05050A';
const TEXT_LIGHT = '#F4F4F5';

// --- Mock CMS Data ---
const CMS_DATA = [
  {
    id: '1', title: 'Morning Positivity',
    mediaUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image', moods: ['🔥 Trending', '😊 Happy'], category: 'daily_quote',
  },
  {
    id: '2', title: 'Ocean Devotion',
    mediaUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4',
    mediaType: 'video', moods: ['🙏 Devotion', '🔥 Trending'], category: 'god',
  },
  {
    id: '3', title: 'Patriotic Vibes',
    mediaUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image', moods: ['🇮🇳 Independence Day'], category: 'festival',
  },
  {
    id: '4', title: 'Peaceful Moments',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image', moods: ['😊 Happy', '🙏 Devotion'], category: 'nature',
  },
  {
    id: '5', title: 'Nature Flow',
    mediaUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    mediaType: 'video', moods: ['😊 Happy', '🔥 Trending'], category: 'nature',
  },
  {
    id: '6', title: 'Cosmic Energy',
    mediaUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1080&auto=format&fit=crop',
    mediaType: 'image', moods: ['🙏 Devotion'], category: 'god',
  },
];

const FILTERS = ['All', '🔥 Trending', '🙏 Devotion', '😊 Happy', '🇮🇳 Independence Day'];

type ReelData = (typeof CMS_DATA)[number];
type OpenMode = 'edit' | 'share' | 'download';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Adapt a feed item to a StatusItem for the saved store. */
function reelToStatusItem(item: ReelData): StatusItem {
  return {
    id: item.id,
    title: item.title,
    subtitle: 'Premium Studio Template',
    categories: [item.category as CategoryId],
    gradient: ['#1A1033', '#FF7A00'],
    mediaUrl: item.mediaUrl,
    mediaType: item.mediaType as StatusItem['mediaType'],
    views: 12000,
    likes: 4200,
  };
}

// =====================================================================
// Video Reel Item (uses expo-video)
// =====================================================================
const VideoReelItem = ({ uri, isFocused, style }: { uri: string; isFocused: boolean; style: any }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
  });

  React.useEffect(() => {
    if (isFocused) player.play();
    else player.pause();
  }, [isFocused, player]);

  return <VideoView player={player} style={style} contentFit="cover" nativeControls={false} />;
};

// =====================================================================
// 1. MEMOIZED REEL ITEM
// =====================================================================
const ReelItem = memo(
  function ReelItem({
    item,
    isFocused,
    feedHeight,
    onOpen,
  }: {
    item: ReelData;
    isFocused: boolean;
    feedHeight: number;
    onOpen: (item: ReelData, mode: OpenMode) => void;
  }) {
    const isSaved = useSavedStore((s) => s.isSaved(item.id));
    const toggleSave = useSavedStore((s) => s.toggleSave);
    const [liked, setLiked] = useState(false);

    const likeScale = useSharedValue(1);
    const saveScale = useSharedValue(1);
    const likeAnim = useAnimatedStyle(() => ({ transform: [{ scale: likeScale.value }] }));
    const saveAnim = useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }));

    const bump = (v: typeof likeScale) => {
      v.value = withSequence(withSpring(1.3, { damping: 6 }), withSpring(1));
    };

    const onLike = () => {
      setLiked((p) => !p);
      bump(likeScale);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const onSave = () => {
      toggleSave(reelToStatusItem(item));
      bump(saveScale);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    return (
      <View style={[styles.reelContainer, { height: feedHeight }]}>
        {item.mediaType === 'video' ? (
          <VideoReelItem uri={item.mediaUrl} isFocused={isFocused} style={styles.media} />
        ) : (
          <Image
            source={{ uri: item.mediaUrl }}
            style={styles.media}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={item.id}
          />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(5,5,10,0.55)', 'rgba(5,5,10,0.96)']}
          locations={[0.45, 0.78, 1]}
          style={styles.scrimOverlay}
        />

        {/* Right action rail */}
        <View style={styles.rail}>
          <AnimatedPressable style={[styles.railBtn, likeAnim]} onPress={onLike} hitSlop={6}>
            <View style={styles.railIcon}>
              <MaterialIcons
                name={liked ? 'favorite' : 'favorite-border'}
                size={28}
                color={liked ? BrandColors.accent : '#fff'}
              />
            </View>
            <Text style={styles.railLabel}>12k</Text>
          </AnimatedPressable>

          <AnimatedPressable style={[styles.railBtn, saveAnim]} onPress={onSave} hitSlop={6}>
            <View style={[styles.railIcon, isSaved && styles.railIconActive]}>
              <MaterialIcons name={isSaved ? 'bookmark' : 'bookmark-border'} size={28} color="#fff" />
            </View>
            <Text style={styles.railLabel}>{isSaved ? 'Saved' : 'Save'}</Text>
          </AnimatedPressable>

          <Pressable style={styles.railBtn} onPress={() => onOpen(item, 'edit')} hitSlop={6}>
            <View style={styles.railIcon}>
              <MaterialIcons name="auto-fix-high" size={26} color="#fff" />
            </View>
            <Text style={styles.railLabel}>Customize</Text>
          </Pressable>
        </View>

        {/* Bottom content + primary CTAs */}
        <View style={styles.bottom}>
          <View style={styles.tagsContainer}>
            {item.moods.map((mood, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>{mood}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>Premium Studio Template</Text>

          <View style={styles.ctaRow}>
            <Pressable style={[styles.cta, styles.ctaShare]} onPress={() => onOpen(item, 'share')}>
              <MaterialIcons name="chat" size={20} color="#fff" />
              <Text style={styles.ctaTxt}>Share</Text>
            </Pressable>
            <Pressable style={styles.ctaFlex} onPress={() => onOpen(item, 'download')}>
              <LinearGradient
                colors={[BrandColors.orange, '#FF9F1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cta}
              >
                <MaterialIcons name="file-download" size={20} color="#fff" />
                <Text style={styles.ctaTxt}>Download</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    );
  },
  (prev, next) => prev.isFocused === next.isFocused && prev.feedHeight === next.feedHeight
);

// =====================================================================
// 2. MAIN FEED COMPONENT
// =====================================================================
export default function TemplateReelsFeed() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState('All');
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [feedHeight, setFeedHeight] = useState(0);

  const filteredData = CMS_DATA.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.moods.includes(activeFilter);
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentViewIndex(viewableItems[0].index);
  }).current;

  // Share/Download → personalize share grid; Customize → full editor. Both apply
  // the user's global name/photo and reuse the working export (image + video) pipeline.
  const openTemplate = useCallback(
    (item: ReelData, mode: OpenMode) => {
      const params: Record<string, string> = {
        statusId: item.id,
        statusTitle: item.title,
        mediaType: item.mediaType,
        templateUri: item.mediaUrl,
        gradient: JSON.stringify(['#1A1033', '#FF7A00']),
      };
      if (mode === 'share' || mode === 'download') params.shareOnly = '1';
      router.push({ pathname: '/personalize', params });
    },
    [router]
  );

  return (
    <View style={styles.container} onLayout={(e) => setFeedHeight(e.nativeEvent.layout.height)}>
      {/* Category Pills Header */}
      <SafeAreaView style={styles.floatingHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScrollContainer}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              activeOpacity={0.7}
              style={[styles.pill, activeFilter === filter && styles.pillActive]}
              onPress={() => {
                setActiveFilter(filter);
                setCurrentViewIndex(0);
              }}
            >
              <Text style={[styles.pillText, activeFilter === filter && styles.pillTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* The Reels FlatList */}
      {feedHeight > 0 && (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ReelItem
              item={item}
              isFocused={currentViewIndex === index}
              feedHeight={feedHeight}
              onOpen={openTemplate}
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
          contentContainerStyle={{ paddingBottom: 0 }}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
        />
      )}
    </View>
  );
}

// =====================================================================
// 3. STYLES
// =====================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 0,
    width: '100%',
    zIndex: 10,
  },
  pillsScrollContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: {
    backgroundColor: 'rgba(20,20,30,0.55)',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pillActive: { backgroundColor: BrandColors.orange, borderColor: BrandColors.orange },
  pillText: { color: '#e5e5e5', fontSize: 14, fontFamily: 'NotoSans_600SemiBold', letterSpacing: 0.3 },
  pillTextActive: { color: '#fff' },

  reelContainer: { width: SCREEN_WIDTH, justifyContent: 'flex-end', backgroundColor: DARK_BG },
  media: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  scrimOverlay: { ...StyleSheet.absoluteFillObject },

  // Right action rail
  rail: {
    position: 'absolute',
    right: 12,
    bottom: Platform.OS === 'ios' ? 230 : 210,
    alignItems: 'center',
    gap: 18,
    zIndex: 6,
  },
  railBtn: { alignItems: 'center', gap: 5 },
  railIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(20,20,30,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  railIconActive: { backgroundColor: BrandColors.orange, borderColor: BrandColors.orange },
  railLabel: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'NotoSans_600SemiBold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },

  // Bottom content + CTAs
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 104 : 84,
    zIndex: 5,
  },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'NotoSans_700Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: TEXT_LIGHT,
    fontSize: 30,
    fontFamily: 'NotoSans_700Bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 15,
  },
  subtitle: { color: '#ddd', fontSize: 14, marginBottom: 18, fontFamily: 'NotoSans_500Medium' },

  ctaRow: { flexDirection: 'row', gap: 12 },
  ctaFlex: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  cta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  ctaShare: { backgroundColor: BrandColors.whatsapp },
  ctaTxt: { color: '#fff', fontSize: 15, fontFamily: 'NotoSans_700Bold' },
});
