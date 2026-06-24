import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import type { ProfileCirclePosition } from '@/constants/profile-circle';
import { formatCount, type StatusItem } from '@/data/status-feed';
import { useLocale, useTranslation } from '@/context/locale-context';
import { BrandColors } from '@/constants/brand';
import { NamePlateOverlay, namePlateDims } from '@/components/home/name-plate-overlay';
import { useWalkTarget } from '@/context/walkthrough-context';

function VideoBg({ uri, isFocused }: { uri: string; isFocused: boolean }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  React.useEffect(() => {
    if (isFocused) player.play();
    else player.pause();
  }, [isFocused, player]);

  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

type Props = {
  item: StatusItem;
  feedHeight: number;
  feedWidth: number;
  isFocused: boolean;
  circlePos: ProfileCirclePosition;
  isSaved?: boolean;
  onChangeDesign?: () => void;
};

export const StatusReelCard = memo(function StatusReelCard({
  item,
  feedHeight,
  feedWidth,
  isFocused,
  circlePos,
  isSaved = false,
  onChangeDesign,
}: Props) {
  const { t } = useTranslation();
  const { profilePhotoUri, userName } = useLocale();

  const colors = item.gradient.length >= 2 ? item.gradient : ['#1A1033', '#FF7A00'];
  // Strap height — title block and stats rail sit just above it.
  const strapH = namePlateDims(feedWidth).height;
  // Walkthrough points at the Design button of the focused card only.
  const designRef = useWalkTarget('design', isFocused);

  return (
    <View style={[styles.container, { height: feedHeight }]}>
      <LinearGradient colors={colors as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />

      {item.mediaType === 'video' && item.mediaUrl ? (
        <VideoBg uri={item.mediaUrl} isFocused={isFocused} />
      ) : item.mediaType === 'image' && item.mediaUrl ? (
        <Image
          source={{ uri: item.mediaUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={item.id}
        />
      ) : null}

      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'transparent', 'rgba(5,5,10,0.75)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative particles */}
      <View style={[styles.particle, styles.p1]} />
      <View style={[styles.particle, styles.p2]} />

      {/* Change Design — cycles the photo position (top-rightest of the card) */}
      {onChangeDesign ? (
        <Pressable
          ref={designRef}
          style={styles.designBtn}
          onPress={() => {
            Haptics.selectionAsync();
            onChangeDesign();
          }}
          hitSlop={8}
        >
          <MaterialIcons name="open-with" size={17} color="#fff" />
          <Text style={styles.designTxt}>{t('home.actions.changeDesign')}</Text>
        </Pressable>
      ) : null}

      {/* Right vertical rail — save / likes / views, vertically centered on the rightmost edge */}
      <View style={styles.rail}>
        {isSaved ? (
          <View style={styles.savedBadge}>
            <MaterialIcons name="bookmark" size={16} color="#fff" />
          </View>
        ) : null}
        <View style={styles.railItem}>
          <MaterialIcons name="favorite" size={24} color={BrandColors.pink} />
          <Text style={styles.railCount}>{formatCount(item.likes)}</Text>
        </View>
        <View style={styles.railItem}>
          <MaterialIcons name="visibility" size={24} color="#fff" />
          <Text style={styles.railCount}>{formatCount(item.views)}</Text>
        </View>
      </View>

      {/* Title block — sits just above the name strap */}
      <View style={[styles.footer, { bottom: strapH + 10 }]}>
        <Text style={styles.statusTitle} numberOfLines={2}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.statusSub} numberOfLines={1}>{item.subtitle}</Text>
        ) : null}
      </View>

      <NamePlateOverlay
        position={circlePos}
        photoUri={profilePhotoUri}
        name={userName || 'Your Name'}
        containerWidth={feedWidth}
        animateOnChange
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#05050A',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  p1: { width: 120, height: 120, top: '18%', right: -30 },
  p2: { width: 80, height: 80, bottom: '28%', left: -20 },
  designBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  designTxt: {
    color: '#fff',
    fontSize: 12.5,
    fontFamily: 'NotoSans_700Bold',
  },
  // Right vertical stats rail — vertically centered on the right edge
  rail: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    zIndex: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  railItem: {
    alignItems: 'center',
    gap: 2,
  },
  railCount: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'NotoSans_700Bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  savedBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BrandColors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 64,
    zIndex: 10,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'NotoSans_700Bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 12,
    marginBottom: 4,
  },
  statusSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontFamily: 'NotoSans_500Medium',
  },
});
