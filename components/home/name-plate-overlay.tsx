import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { ProfileCirclePosition } from '@/constants/profile-circle';
import { BrandColors } from '@/constants/brand';

type Props = {
  position: ProfileCirclePosition;
  photoUri: string | null;
  name: string;
  /** Width of the card the badge sits in — every dimension scales off this so the
   *  small export card (280) and the large feed card render the same composition. */
  containerWidth: number;
  /** Animate a subtle bump when the position changes (feed only). */
  animateOnChange?: boolean;
};

/** All badge dimensions derived from container width (keeps feed === export). */
export function namePlateDims(W: number) {
  const circle = Math.round(W * 0.22);
  const inset = Math.round(W * 0.04);
  const ring = Math.max(2, Math.round(circle * 0.045));
  const whiteRing = Math.max(1.5, Math.round(circle * 0.03));
  const circleOuter = circle + (ring + whiteRing) * 2;
  return {
    circle,
    inset,
    ring,
    whiteRing,
    circleOuter,
    // Tag is exactly half the circle tall, so its top edge meets the circle's center.
    pillH: Math.round(circleOuter / 2),
    overlap: Math.round(circle * 0.36),
    fontSize: Math.round(circle * 0.3),
    hpad: Math.round(circle * 0.22),
    // Total vertical space the badge occupies above the card bottom — title/rail sit above it.
    height: circleOuter + inset + 8,
  };
}

/** Standard name badge: a big profile circle with a connected, glassy name-tag that
 *  extends out from it toward the opposite edge. The circle hugs the anchored corner —
 *  bottom-right reads "[name tag] ◯" (tag extends left), bottom-left reads "◯ [name tag]".
 *
 *  Vertical geometry is explicit (not flexbox): the badge is a fixed-height box and BOTH
 *  the photo and the tag are pinned to bottom:0 — so the tag's bottom edge lands exactly
 *  on the circle's lowest point, and (tag height = circle/2) its top edge meets the
 *  circle's center, leaving the upper half of the circle rising above the tag.
 *
 *  Used on the home feed AND the off-screen export card so preview === result. */
export function NamePlateOverlay({
  position,
  photoUri,
  name,
  containerWidth,
  animateOnChange = false,
}: Props) {
  const d = namePlateDims(containerWidth);
  const onRight = position !== 'bottomLeft'; // bottomRight is the default/standard

  const scale = useSharedValue(1);
  useEffect(() => {
    if (!animateOnChange) return;
    scale.value = withSpring(1.05, { damping: 12, stiffness: 220 });
    scale.value = withSpring(1, { damping: 15, stiffness: 280 });
  }, [position, animateOnChange, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.badge,
        { bottom: d.inset, left: d.inset, right: d.inset, height: d.circleOuter },
        animStyle,
      ]}
    >
      {/* TAG — pinned to the bottom, extends to the opposite edge, tucks under the photo. */}
      <LinearGradient
        colors={['rgba(34,34,46,0.72)', 'rgba(10,10,15,0.55)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.pill,
          {
            height: d.pillH,
            borderRadius: d.pillH / 2,
            left: onRight ? 0 : d.circleOuter - d.overlap,
            right: onRight ? d.circleOuter - d.overlap : 0,
            paddingLeft: onRight ? d.hpad : d.overlap + d.hpad,
            paddingRight: onRight ? d.overlap + d.hpad : d.hpad,
          },
        ]}
      >
        {/* Glassy top sheen */}
        <LinearGradient
          colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.sheen}
          pointerEvents="none"
        />
        <Text
          numberOfLines={1}
          style={[styles.name, { fontSize: d.fontSize, textAlign: onRight ? 'right' : 'left' }]}
        >
          {name}
        </Text>
      </LinearGradient>

      {/* PHOTO — pinned to the bottom corner, drawn on top of the tag. */}
      <LinearGradient
        colors={[...BrandColors.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.ring,
          {
            width: d.circleOuter,
            height: d.circleOuter,
            borderRadius: d.circleOuter / 2,
            padding: d.ring,
            left: onRight ? undefined : 0,
            right: onRight ? 0 : undefined,
          },
        ]}
      >
        {/* Crisp white separator ring between the gradient rim and the photo. */}
        <View
          style={[
            styles.whiteRing,
            {
              width: d.circle + d.whiteRing * 2,
              height: d.circle + d.whiteRing * 2,
              borderRadius: (d.circle + d.whiteRing * 2) / 2,
              padding: d.whiteRing,
            },
          ]}
        >
          <View style={[styles.photoInner, { width: d.circle, height: d.circle, borderRadius: d.circle / 2 }]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <MaterialIcons name="person" size={Math.round(d.circle * 0.6)} color="#fff" />
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    zIndex: 8,
  },
  ring: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  whiteRing: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  photoInner: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F12',
  },
  photo: { width: '100%', height: '100%' },
  pill: {
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  name: {
    color: '#FFFFFF',
    fontFamily: 'NotoSans_700Bold',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});
