import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BrandColors } from '@/constants/brand';
import { useWalkthrough, type WalkRect } from '@/context/walkthrough-context';

const { width: SW, height: SH } = Dimensions.get('window');
const PAD = 10;

type Props = { skipLabel: string; nextLabel: string; doneLabel: string };

/** First-run coachmark tour: blurs everything except the active target, points a
 *  bouncing finger at it, and shows a tooltip with Skip / Next at every step.
 *  Reads the active step + measures its registered target from the walkthrough context. */
export function WalkthroughOverlay({ skipLabel, nextLabel, doneLabel }: Props) {
  const ctx = useWalkthrough();
  const [rect, setRect] = useState<WalkRect | null>(null);

  const stepId = ctx?.step?.id ?? null;
  const active = ctx?.active ?? false;

  // Measure the active target lazily, retrying so late layout / recycled views resolve.
  useEffect(() => {
    if (!ctx || !active || !stepId) return;
    let alive = true;
    setRect(null);
    (async () => {
      for (let i = 0; i < 4; i++) {
        const r = await ctx.measure(stepId);
        if (!alive) return;
        if (r) {
          setRect(r);
          return;
        }
        await new Promise((res) => setTimeout(res, 140));
      }
    })();
    return () => {
      alive = false;
    };
  }, [ctx, active, stepId]);

  const bounce = useSharedValue(0);
  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [bounce]);

  const fingerAnim = useAnimatedStyle(() => ({ transform: [{ translateY: bounce.value * 9 }] }));

  if (!ctx || !active || !ctx.step) return null;

  const isLast = ctx.isLast;
  const next = () => ctx.next();
  const close = () => ctx.close();

  const hasRect = !!rect;
  const hx = rect ? Math.max(0, rect.x - PAD) : 0;
  const hy = rect ? Math.max(0, rect.y - PAD) : 0;
  const hw = rect ? Math.min(SW - hx, rect.width + PAD * 2) : 0;
  const hh = rect ? Math.min(SH - hy, rect.height + PAD * 2) : 0;

  // With a target: tooltip below if it's in the top half, else above. Without one
  // (e.g. the premium step): a centred card over a full blur.
  const tooltipBelow = hasRect ? hy + hh < SH * 0.5 : true;

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]}>
      {/* Uniform blur + dim over the whole screen (no spotlight box). Tap to advance. */}
      <DimRect style={StyleSheet.absoluteFillObject} onPress={next} />

      {/* Bouncing "tap here" finger placed on the target feature */}
      {hasRect ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.finger,
            { left: Math.min(SW - 52, Math.max(12, hx + hw / 2 - 20)), top: Math.min(SH - 60, hy + hh - 28) },
            fingerAnim,
          ]}
        >
          <MaterialIcons name="touch-app" size={40} color="#fff" />
        </Animated.View>
      ) : null}

      {/* Tooltip */}
      <View
        pointerEvents="box-none"
        style={[
          styles.tooltipWrap,
          hasRect
            ? tooltipBelow
              ? { top: hy + hh + 56 }
              : { bottom: SH - hy + 56 }
            : styles.tooltipCentered,
        ]}
      >
        <View style={styles.tooltip}>
          <Text style={styles.title}>{ctx.step.title}</Text>
          <Text style={styles.text}>{ctx.step.text}</Text>

          <View style={styles.dots}>
            {Array.from({ length: ctx.total }).map((_, i) => (
              <View key={i} style={[styles.dot, i === ctx.index && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.btnRow}>
            <Pressable onPress={close} hitSlop={8} style={styles.skipBtn}>
              <Text style={styles.skip}>{skipLabel}</Text>
            </Pressable>
            <Pressable onPress={next}>
              <LinearGradient
                colors={[...BrandColors.gradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextBtn}
              >
                <Text style={styles.nextTxt}>{isLast ? doneLabel : nextLabel}</Text>
                {!isLast ? <MaterialIcons name="arrow-forward" size={16} color="#fff" /> : null}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function DimRect({ style, onPress }: { style: object; onPress: () => void }) {
  return (
    <Pressable style={[styles.dim, style]} onPress={onPress}>
      <BlurView intensity={16} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.dimTint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 100, elevation: 100 },
  dim: { position: 'absolute', overflow: 'hidden' },
  dimTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,8,14,0.62)' },
  finger: { position: 'absolute' },
  tooltipWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  tooltipCentered: { top: SH / 2 - 90 },
  tooltip: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  title: { fontSize: 17, fontFamily: 'NotoSans_700Bold', color: BrandColors.text, marginBottom: 4 },
  text: {
    fontSize: 14,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    lineHeight: 20,
  },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14, marginBottom: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(15,15,18,0.15)' },
  dotActive: { backgroundColor: BrandColors.orange, width: 18 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 8 },
  skip: { fontSize: 14, fontFamily: 'NotoSans_600SemiBold', color: BrandColors.textMuted },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  nextTxt: { fontSize: 14.5, fontFamily: 'NotoSans_700Bold', color: '#fff' },
});
