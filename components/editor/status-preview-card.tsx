import React, { forwardRef, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BrandColors } from '@/constants/brand';
import {
  FONT_WEIGHT_MAP,
  getPreset,
  resolveNameColor,
} from '@/constants/editor-presets';
import {
  anchorOffsetX,
  clampNameOffset,
  clampPhotoOffset,
  defaultNameLeft,
  defaultNameTop,
  defaultPhotoLeft,
  defaultPhotoTop,
} from '@/lib/editor-position';
import type { PersonalizeEditorState } from '@/types/personalize-editor';

export const PREVIEW_W = 280;
export const PREVIEW_H = 420;
const CIRCLE_BASE = 88;

type Props = {
  state: PersonalizeEditorState;
  profilePhotoUri: string | null;
  onPhotoOffsetChange: (x: number, y: number) => void;
  onNameOffsetChange: (x: number, y: number) => void;
  /** Ref to the transparent overlay-only layer (photo + name, no background/video).
   *  Captured for video export so it can be composited onto the video server-side. */
  overlayRef?: React.RefObject<View | null>;
};

function PreviewVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    player.replace(uri);
    player.play();
  }, [uri, player]);

  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

export const StatusPreviewCard = forwardRef<View, Props>(function StatusPreviewCard(
  { state, profilePhotoUri, onPhotoOffsetChange, onNameOffsetChange, overlayRef },
  ref
) {
  const preset = getPreset(state.preset);
  const nameColor = resolveNameColor(state.nameColor, preset);
  const nameSize = 18 * (state.nameSize / 100);

  const bgColors =
    state.backgroundGradient.length >= 2
      ? state.backgroundGradient
      : (['#1A1033', '#FF7A00'] as [string, string]);

  const photoDragX = useSharedValue(state.photoOffsetX);
  const photoDragY = useSharedValue(state.photoOffsetY);
  const photoStartX = useSharedValue(state.photoOffsetX);
  const photoStartY = useSharedValue(state.photoOffsetY);

  const nameDragX = useSharedValue(state.textOffsetX);
  const nameDragY = useSharedValue(state.textOffsetY);
  const nameStartX = useSharedValue(state.textOffsetX);
  const nameStartY = useSharedValue(state.textOffsetY);

  useEffect(() => {
    photoDragX.value = withSpring(state.photoOffsetX);
    photoDragY.value = withSpring(state.photoOffsetY);
  }, [state.photoOffsetX, state.photoOffsetY, photoDragX, photoDragY]);

  useEffect(() => {
    nameDragX.value = withSpring(state.textOffsetX);
    nameDragY.value = withSpring(state.textOffsetY);
  }, [state.textOffsetX, state.textOffsetY, nameDragX, nameDragY]);

  const photoPan = Gesture.Pan()
    .onStart(() => {
      photoStartX.value = photoDragX.value;
      photoStartY.value = photoDragY.value;
    })
    .onUpdate((e) => {
      const next = clampPhotoOffset(
        photoStartX.value + e.translationX,
        photoStartY.value + e.translationY,
        state.photoSize
      );
      photoDragX.value = next.x;
      photoDragY.value = next.y;
    })
    .onEnd(() => {
      runOnJS(onPhotoOffsetChange)(photoDragX.value, photoDragY.value);
    });

  const namePan = Gesture.Pan()
    .onStart(() => {
      nameStartX.value = nameDragX.value;
      nameStartY.value = nameDragY.value;
    })
    .onUpdate((e) => {
      const next = clampNameOffset(
        nameStartX.value + e.translationX,
        nameStartY.value + e.translationY
      );
      nameDragX.value = next.x;
      nameDragY.value = next.y;
    })
    .onEnd(() => {
      runOnJS(onNameOffsetChange)(nameDragX.value, nameDragY.value);
    });

  const photoBaseLeft = defaultPhotoLeft(state.photoSize) + anchorOffsetX(state.photoAnchor);
  const photoBaseTop = defaultPhotoTop();
  const nameBaseLeft = defaultNameLeft() + anchorOffsetX(state.textAnchor, 8);
  const nameBaseTop = defaultNameTop();

  const photoAnim = useAnimatedStyle(() => ({
    left: photoBaseLeft + photoDragX.value,
    top: photoBaseTop + photoDragY.value,
    transform: [{ scale: state.photoSize / 100 }],
  }));

  const nameAnim = useAnimatedStyle(() => ({
    left: nameBaseLeft + nameDragX.value,
    top: nameBaseTop + nameDragY.value,
  }));

  const size = CIRCLE_BASE * (state.photoSize / 100);
  const radius =
    state.photoShape === 'circle' ? size / 2 : state.photoShape === 'rounded' ? 18 : 8;

  const borderWidth = state.photoBorder === 'none' ? 0 : 3;
  const borderColor =
    state.photoBorder === 'gradient'
      ? undefined
      : state.photoBorder === 'white'
        ? '#fff'
        : state.photoBorder === 'black'
          ? '#0F0F12'
          : '#D4AF37';

  const photoContent = state.photoBorder === 'gradient' ? (
    <LinearGradient
      colors={[...BrandColors.gradient]}
      style={[styles.ring, { width: size + 8, height: size + 8, borderRadius: radius + 4 }]}
    >
      <View style={[styles.photoInner, { width: size, height: size, borderRadius: radius }]}>
        {profilePhotoUri ? (
          <Image source={{ uri: profilePhotoUri }} style={styles.photo} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="person" size={36} color="#fff" />
          </View>
        )}
      </View>
    </LinearGradient>
  ) : (
    <View
      style={[
        styles.photoInner,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth,
          borderColor,
        },
        state.photoGlow && styles.photoGlow,
      ]}
    >
      {profilePhotoUri ? (
        <Image source={{ uri: profilePhotoUri }} style={styles.photo} />
      ) : (
        <View style={styles.placeholder}>
          <MaterialIcons name="person" size={36} color="#fff" />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.stage}>
      <View ref={ref} collapsable={false} style={styles.card}>
        <LinearGradient
          colors={bgColors as [string, string, ...string[]]}
          style={StyleSheet.absoluteFill}
        />

        {state.mediaType === 'video' && state.templateUri ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <PreviewVideo key={state.templateUri} uri={state.templateUri} />
          </View>
        ) : state.mediaType === 'image' && state.templateUri ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Image
              key={state.templateUri}
              source={{ uri: state.templateUri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>
        ) : null}

        {/* Transparent overlay-only layer — captured for video export (no video/bg inside) */}
        <View ref={overlayRef} collapsable={false} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <GestureDetector gesture={photoPan}>
            <Animated.View style={[styles.photoWrap, photoAnim]}>{photoContent}</Animated.View>
          </GestureDetector>

          <GestureDetector gesture={namePan}>
            <Animated.View style={[styles.nameWrap, nameAnim]}>
              <BlurView intensity={24} tint="dark" style={styles.nameBadge}>
                <Text
                  style={{
                    color: nameColor,
                    fontSize: nameSize,
                    fontFamily: FONT_WEIGHT_MAP[state.fontWeight],
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {state.displayName}
                </Text>
              </BlurView>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  card: {
    width: PREVIEW_W,
    height: PREVIEW_H,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#05050A',
    shadowColor: BrandColors.purple,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
  },
  photoWrap: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 7,
  },
  nameWrap: {
    position: 'absolute',
    zIndex: 8,
    minWidth: 100,
    maxWidth: PREVIEW_W - 40,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInner: {
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  photoGlow: {
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },
  photo: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    backgroundColor: '#0F0F12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,80,40,0.75)',
    minWidth: 100,
  },
});
