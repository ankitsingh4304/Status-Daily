import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { BrandColors } from '@/constants/brand';
import type { ProfileContentItem } from '@/data/profile-content';
import { formatCount } from '@/data/status-feed';
import { useTranslation } from '@/context/locale-context';

type Props = {
  items: ProfileContentItem[];
  onPressItem?: (item: ProfileContentItem) => void;
  onShareItem?: (item: ProfileContentItem) => void;
  onRemoveItem?: (id: string) => void;
  showRemove?: boolean;
  emptyMessage?: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function ProfileContentGrid({
  items,
  onPressItem,
  onShareItem,
  onRemoveItem,
  showRemove,
  emptyMessage,
}: Props) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="bookmark-border" size={36} color={BrandColors.orange} />
        </View>
        <Text style={styles.emptyTxt}>{emptyMessage ?? t('profile.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Animated.View
          key={item.id}
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(180)}
          layout={Layout.springify().damping(18).stiffness(220)}
          style={styles.cardWrap}
        >
          <View style={styles.card}>
            {/* Media thumbnail */}
            <View style={styles.thumb}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => onPressItem?.(item)} />
              <LinearGradient
                colors={
                  (item.gradient.length >= 2
                    ? item.gradient
                    : ['#1A1033', '#FF7A00']) as [string, string, ...string[]]
                }
                style={StyleSheet.absoluteFill}
              />
              {item.mediaUrl && (item.mediaType === 'image' || item.mediaType === 'video') ? (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                  recyclingKey={item.id}
                />
              ) : null}

              {/* Category tag */}
              <View style={styles.tag} pointerEvents="none">
                <Text style={styles.tagTxt}>{item.categoryLabel}</Text>
              </View>

              {/* Play badge for videos */}
              {item.mediaType === 'video' ? (
                <View style={styles.play} pointerEvents="none">
                  <MaterialIcons name="play-arrow" size={26} color="#fff" />
                </View>
              ) : null}

              {/* Remove */}
              {showRemove && onRemoveItem ? (
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => onRemoveItem(item.id)}
                  hitSlop={10}
                >
                  <MaterialIcons name="close" size={18} color="#fff" />
                </Pressable>
              ) : null}
            </View>

            {/* Info + action */}
            <View style={styles.info}>
              <Pressable onPress={() => onPressItem?.(item)}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.statsRow}>
                  <MaterialIcons name="visibility" size={14} color={BrandColors.textMuted} />
                  <Text style={styles.stat}>{formatCount(item.views)}</Text>
                  <MaterialIcons name="favorite" size={14} color={BrandColors.accent} />
                  <Text style={styles.stat}>{formatCount(item.likes)}</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
              </Pressable>

              {onShareItem ? (
                <Pressable
                  style={({ pressed }) => [styles.shareBtn, pressed && styles.shareBtnPressed]}
                  onPress={() => onShareItem(item)}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.share')}
                >
                  <LinearGradient
                    colors={[...BrandColors.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.shareGrad}
                  >
                    <MaterialIcons name="share" size={17} color="#fff" />
                    <Text style={styles.shareTxt}>{t('common.share')}</Text>
                  </LinearGradient>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const CARD_W = '48%';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: CARD_W,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    shadowColor: BrandColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#111',
  },
  play: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 44,
    height: 44,
    marginTop: -22,
    marginLeft: -22,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tagTxt: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'NotoSans_700Bold',
    textTransform: 'capitalize',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
  },
  title: {
    color: BrandColors.text,
    fontSize: 15,
    lineHeight: 20,
    minHeight: 40,
    fontFamily: 'NotoSans_700Bold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spacer: { flex: 1 },
  stat: {
    color: BrandColors.textSecondary,
    fontSize: 12,
    fontFamily: 'NotoSans_600SemiBold',
    marginRight: 8,
  },
  date: {
    color: BrandColors.textMuted,
    fontSize: 11,
    fontFamily: 'NotoSans_500Medium',
  },
  shareBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  shareBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  shareGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 14,
  },
  shareTxt: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'NotoSans_700Bold',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 14,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BrandColors.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTxt: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
});
