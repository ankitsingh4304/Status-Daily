import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View, StyleSheet, ActivityIndicator, Text, TouchableOpacity,
  TextInput, SafeAreaView, Dimensions,
  Alert, Platform, Pressable
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import {
  Canvas, Image as SkiaImage, useImage, useFont, Skia, SkImage,
  Group, rect, rrect, Circle, Rect, RoundedRect, Path,
  LinearGradient, RadialGradient, vec, BlurMask, Text as SkiaText,
  ClipOp, PaintStyle
} from '@shopify/react-native-skia';

// Expo Imports
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useDerivedValue } from 'react-native-reanimated';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';

import { renderVideoWithOverlay, saveVideoToGallery, shareVideo } from '@/services/video-export';

// ─── Constants & Math Scaling ─────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH; 
const LOGICAL_SIZE = 1080;
const SCALE_FACTOR = CANVAS_SIZE / LOGICAL_SIZE;

const GOLD = '#D4AF37';
const DARK_BG = '#05050A';
const SURFACE = 'rgba(22, 22, 34, 0.4)';
const BORDER_COLOR = 'rgba(255,255,255,0.08)';
const MUTED = '#A1A1AA';

// ─── Types & Configuration ────────────────────────────────────────────────────
type FrameShape = 'circle' | 'square' | 'rounded' | 'hexagon' | 'diamond' | 'star';
type FramePosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
type BgTheme = 'midnight' | 'sunrise' | 'ocean' | 'forest' | 'blush' | 'cosmic';
type OverlayEffect = 'none' | 'vignette' | 'bokeh' | 'confetti';

// Fallback image just in case the app loads directly on this tab without a parameter
const FALLBACK_TEMPLATE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop';
// Dummy video for useVideoPlayer when template is an image (player won't be shown)
const DUMMY_VIDEO = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

const FRAME_COLORS = [
  { color: '#C8A96E', label: 'Gold' }, { color: '#FFFFFF', label: 'White' },
  { color: '#E85D8A', label: 'Rose' }, { color: '#5D9AFF', label: 'Blue' },
  { color: '#7AEFC8', label: 'Mint' }, { color: '#111111', label: 'Black' },
];

const BG_THEMES: Record<BgTheme, [string, string, string]> = {
  midnight: ['#0D0D1A', '#1A1033', '#0D0D1A'], sunrise:  ['#1A0A00', '#3D1800', '#1A0A00'],
  ocean:    ['#001A2E', '#002D4D', '#001A2E'], forest:   ['#001A0A', '#00301A', '#001A0A'],
  blush:    ['#1A0010', '#2D0022', '#1A0010'], cosmic:   ['#0D001A', '#1A003D', '#0D001A'],
};

const SHAPES: { key: FrameShape; label: string; pro?: boolean }[] = [
  { key: 'circle', label: 'Circle' }, { key: 'square', label: 'Square' },
  { key: 'rounded', label: 'Rounded' }, { key: 'hexagon', label: 'Hexagon' },
  { key: 'diamond', label: 'Diamond' }, { key: 'star', label: 'Star', pro: true },
];

const POSITIONS: { key: FramePosition; label: string; pro?: boolean }[] = [
  { key: 'topLeft', label: 'Top L' }, { key: 'topRight', label: 'Top R' },
  { key: 'bottomLeft', label: 'Bot L' }, { key: 'bottomRight', label: 'Bot R' },
  { key: 'center', label: 'Center', pro: true },
];

const OVERLAYS: { key: OverlayEffect; label: string }[] = [
  { key: 'none', label: 'None' }, { key: 'vignette', label: 'Vignette' },
  { key: 'bokeh', label: 'Bokeh' }, { key: 'confetti', label: 'Confetti' },
];

// ─── Skia Math Helpers ────────────────────────────────────────────────────────
function buildClipPath(shape: FrameShape, cx: number, cy: number, r: number) {
  const path = Skia.Path.Make();
  switch (shape) {
    case 'circle': path.addCircle(cx, cy, r); break;
    case 'square': path.addRect(Skia.XYWHRect(cx - r, cy - r, r * 2, r * 2)); break;
    case 'rounded': path.addRRect(rrect(rect(cx - r, cy - r, r * 2, r * 2), r * 0.2, r * 0.2)); break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
        if (i === 0) {
          path.moveTo(px, py);
        } else {
          path.lineTo(px, py);
        }
      }
      path.close(); break;
    case 'diamond':
      path.moveTo(cx, cy - r); path.lineTo(cx + r, cy); path.lineTo(cx, cy + r); path.lineTo(cx - r, cy); path.close(); break;
    case 'star':
      const outer = r, inner = r * 0.45;
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? outer : inner;
        const px = cx + rad * Math.cos(a), py = cy + rad * Math.sin(a);
        if (i === 0) {
          path.moveTo(px, py);
        } else {
          path.lineTo(px, py);
        }
      }
      path.close(); break;
  }
  return path;
}

function getFrameCoords(pos: FramePosition, frameSize: number) {
  const pad = 80; const r = frameSize / 2;
  switch (pos) {
    case 'topLeft':     return { cx: pad + r, cy: pad + r };
    case 'topRight':    return { cx: LOGICAL_SIZE - pad - r, cy: pad + r };
    case 'bottomLeft':  return { cx: pad + r, cy: LOGICAL_SIZE - pad - r };
    case 'bottomRight': return { cx: LOGICAL_SIZE - pad - r, cy: LOGICAL_SIZE - pad - r };
    case 'center':      return { cx: LOGICAL_SIZE / 2, cy: LOGICAL_SIZE / 2 };
    default:            return { cx: pad + r, cy: pad + r };
  }
}

function getCoverRect(img: SkImage, cx: number, cy: number, diam: number) {
  const ar = img.width() / img.height();
  let dw, dh;
  if (ar > 1) { dh = diam; dw = diam * ar; } else { dw = diam; dh = diam / ar; }
  return { x: cx - (dw / 2), y: cy - (dh / 2), w: dw, h: dh };
}

// ─── UI Sub-Components ────────────────────────────────────────────────────────
const Chip = ({ label, active, onPress, pro }: any) => (
  <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}{pro ? <Text style={{fontSize:9, color:GOLD}}> PRO</Text> : null}
    </Text>
  </TouchableOpacity>
);

const SliderRow = ({ label, value, min, max, displayValue, onDec, onInc }: any) => (
  <View style={styles.sliderRow}>
    <Text style={styles.sliderLabel}>{label}</Text>
    <TouchableOpacity style={styles.sliderBtn} onPress={onDec} disabled={value<=min}><Text style={styles.sliderBtnTxt}>−</Text></TouchableOpacity>
    <View style={styles.sliderTrack}><View style={[styles.sliderFill, { width: `${((value - min) / (max - min)) * 100}%` }]} /></View>
    <TouchableOpacity style={styles.sliderBtn} onPress={onInc} disabled={value>=max}><Text style={styles.sliderBtnTxt}>+</Text></TouchableOpacity>
    <Text style={styles.sliderVal}>{displayValue}</Text>
  </View>
);

// ─── Main Application ─────────────────────────────────────────────────────────
export default function PremiumStudio() {
  const canvasRef = useRef<any>(null);
  // Transparent Skia canvas used in video mode — its snapshot is the overlay PNG we send to the render service.
  const overlayCanvasRef = useRef<any>(null);

  // 1. GRAB INCOMING URL PARAMS FROM EXPO ROUTER (From Reels Feed)
  const params = useLocalSearchParams();
  const templateUri = params.templateUri as string | undefined;
  const mediaType = params.mediaType as string | undefined;

  // Bottom Sheet & Animations
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '45%', '85%'], []);
  const buttonScale = useSharedValue(1);

  const handleExportPressIn = () => { buttonScale.value = withSpring(0.95); };
  const handleExportPressOut = () => { buttonScale.value = withSpring(1); };
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  // Gesture Shared Values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const imageScale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const imageRotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      imageScale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = imageScale.value;
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((e) => {
      imageRotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = imageRotation.value;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

  // 2. State for the background template
  const [selectedTemplateUri, setSelectedTemplateUri] = useState(templateUri || FALLBACK_TEMPLATE);
  const [isVideoTemplate, setIsVideoTemplate] = useState(mediaType === 'video');
  
  // Video player for video templates
  const bgVideoPlayer = useVideoPlayer(isVideoTemplate ? selectedTemplateUri : DUMMY_VIDEO, (p) => {
    p.loop = true;
    p.muted = false;
  });

  // 3. LISTEN FOR CHANGES: Instantly update when clicking "Use this Template" from Reels
  useEffect(() => {
    if (templateUri) {
      setSelectedTemplateUri(templateUri);
      const isVideo = mediaType === 'video';
      setIsVideoTemplate(isVideo);
      if (isVideo) {
        bgVideoPlayer.replace(templateUri);
        bgVideoPlayer.play();
      } else {
        bgVideoPlayer.pause();
      }
    }
  }, [templateUri, mediaType, bgVideoPlayer]);

  // Only load as Skia image if it's NOT a video
  const feedImage = useImage(isVideoTemplate ? FALLBACK_TEMPLATE : selectedTemplateUri);
  const [overlayPhoto, setOverlayPhoto] = useState<SkImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Controls State
  const [shape, setShape] = useState<FrameShape>('circle');
  const [position, setPosition] = useState<FramePosition>('topLeft');
  const [frameColor, setFrameColor] = useState(GOLD);
  const [borderThick, setBorderThick] = useState(10);
  const [glow, setGlow] = useState(false);
  const [opacity, setOpacity] = useState(88);
  const [frameSize, setFrameSize] = useState(38); 
  const [bgTheme, setBgTheme] = useState<BgTheme>('midnight');
  const [overlay, setOverlay] = useState<OverlayEffect>('none');
  const [userName, setUserName] = useState('Soumya');
  const [tagline, setTagline] = useState('@soumya');
  const [textSize, setTextSize] = useState(52);
  const [badge, setBadge] = useState('');
  const [premiumGold, setPremiumGold] = useState(false);

  // Fonts
  const font = useFont('https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Bold.ttf', textSize);
  const smallFont = useFont('https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Bold.ttf', textSize * 0.6);
  const badgeFont = useFont('https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Bold.ttf', 30);

  // Derived Math
  const framePx = (LOGICAL_SIZE * frameSize) / 100;
  const { cx, cy } = getFrameCoords(position, framePx);
  const r = framePx / 2;
  const clipPathObj = overlayPhoto ? buildClipPath(shape, cx, cy, r) : null;

  const animatedTransform = useDerivedValue(() => {
    return [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { translateX: cx },
      { translateY: cy },
      { scale: imageScale.value },
      { rotate: imageRotation.value },
      { translateX: -cx },
      { translateY: -cy },
    ];
  }, [cx, cy]);

  // Actions: User picks their overlay photo from device gallery
  const handleSystemPicker = async () => {
    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ['images'], 
        allowsEditing: true, 
        aspect: [1, 1], 
        quality: 0.8 
      });
      
      if (!result.canceled && result.assets[0].uri) {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
        const skData = Skia.Data.fromBase64(base64);
        setOverlayPhoto(Skia.Image.MakeImageFromEncoded(skData!));
      }
    } catch {
      Alert.alert('Error', 'Failed to load photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render the overlay (framed photo + name + badge) to a transparent offscreen
  // surface and return a base64 PNG. Unlike snapshotting the on-screen canvas (which
  // comes back opaque/black on Android), an offscreen surface preserves alpha — so
  // FFmpeg can composite it over the video instead of hiding it.
  const captureOverlayPng = (): string | null => {
    const surface = Skia.Surface.MakeOffscreen(LOGICAL_SIZE, LOGICAL_SIZE);
    if (!surface) return null;
    const canvas = surface.getCanvas();

    // User's framed photo (with the same drag/scale/rotate transform as the preview)
    if (overlayPhoto) {
      canvas.save();
      canvas.translate(translateX.value, translateY.value);
      canvas.translate(cx, cy);
      canvas.scale(imageScale.value, imageScale.value);
      canvas.rotate((imageRotation.value * 180) / Math.PI, 0, 0);
      canvas.translate(-cx, -cy);

      canvas.save();
      canvas.clipPath(buildClipPath(shape, cx, cy, r), ClipOp.Intersect, true);
      const { x, y, w, h } = getCoverRect(overlayPhoto, cx, cy, framePx);
      const imgPaint = Skia.Paint();
      imgPaint.setAntiAlias(true);
      imgPaint.setAlphaf(Math.max(0, Math.min(1, opacity / 100)));
      canvas.drawImageRect(
        overlayPhoto,
        Skia.XYWHRect(0, 0, overlayPhoto.width(), overlayPhoto.height()),
        Skia.XYWHRect(x, y, w, h),
        imgPaint
      );
      canvas.restore();

      if (borderThick > 0) {
        const borderPaint = Skia.Paint();
        borderPaint.setAntiAlias(true);
        borderPaint.setStyle(PaintStyle.Stroke);
        borderPaint.setStrokeWidth(borderThick);
        borderPaint.setColor(Skia.Color(frameColor));
        canvas.drawPath(buildClipPath(shape, cx, cy, r + borderThick / 2), borderPaint);
      }
      canvas.restore();
    }

    // Name + tagline
    const baseY = position === 'bottomLeft' || position === 'bottomRight' ? 180 : LOGICAL_SIZE - 160;
    if (font) {
      const namePaint = Skia.Paint();
      namePaint.setAntiAlias(true);
      namePaint.setColor(Skia.Color(premiumGold ? GOLD : '#ffffff'));
      canvas.drawText(userName, 60, baseY, namePaint, font);
    }
    if (smallFont) {
      const tagPaint = Skia.Paint();
      tagPaint.setAntiAlias(true);
      tagPaint.setColor(Skia.Color(GOLD));
      canvas.drawText(tagline, 60, baseY + textSize + 16, tagPaint, smallFont);
    }

    // Badge tag
    if (badge.length > 0 && badgeFont) {
      const box = Skia.RRectXY(Skia.XYWHRect(LOGICAL_SIZE - 320, 36, 280, 60), 10, 10);
      const fill = Skia.Paint();
      fill.setAntiAlias(true);
      fill.setColor(Skia.Color('rgba(0,0,0,0.5)'));
      canvas.drawRRect(box, fill);
      const stroke = Skia.Paint();
      stroke.setAntiAlias(true);
      stroke.setStyle(PaintStyle.Stroke);
      stroke.setStrokeWidth(2);
      stroke.setColor(Skia.Color(GOLD));
      canvas.drawRRect(box, stroke);
      const badgePaint = Skia.Paint();
      badgePaint.setAntiAlias(true);
      badgePaint.setColor(Skia.Color(GOLD));
      canvas.drawText(badge, LOGICAL_SIZE - 300, 80, badgePaint, badgeFont);
    }

    return surface.makeImageSnapshot().encodeToBase64(); // PNG with transparency
  };

  const handleExport = async () => {
    // VIDEO: render a transparent overlay PNG → render service burns it onto the
    // video with FFmpeg → save the mp4 to gallery + open the share sheet.
    if (isVideoTemplate) {
      setIsProcessing(true);
      try {
        const overlayPngBase64 = captureOverlayPng();
        if (!overlayPngBase64) throw new Error('Could not render the overlay.');
        const rawDuration = Number(bgVideoPlayer?.duration) || 0;
        const durationSec = rawDuration > 0 ? Math.min(Math.round(rawDuration), 60) : undefined;

        const fileUri = await renderVideoWithOverlay({
          videoUrl: selectedTemplateUri,
          overlayPngBase64,
          durationSec,
        });

        // Save to gallery, but don't block sharing if the user denies the permission.
        try {
          await saveVideoToGallery(fileUri);
        } catch (permErr) {
          console.warn('Save to gallery skipped:', permErr);
        }
        await shareVideo(fileUri, 'Share your video status');
      } catch (e: any) {
        Alert.alert('Video export failed', e?.message ?? 'Something went wrong while rendering the video.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // IMAGE: fully on-device Skia snapshot.
    if (!canvasRef.current) return;
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const snapshot = canvasRef.current?.makeImageSnapshot();
      const b64 = snapshot.encodeToBase64();
      const path = `${FileSystem.cacheDirectory}premium_card.png`;
      await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(path, { mimeType: 'image/png' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Overlay artwork (framed photo + name + badge), drawn in logical 1080 coordinates.
  // Shared by the image-mode canvas and the video-mode transparent overlay canvas so
  // the live preview matches the exported result exactly (WYSIWYG).
  const renderOverlayContent = () => (
    <>
      {overlayPhoto && clipPathObj && (
        <Group transform={animatedTransform}>
          <Group clip={clipPathObj} opacity={opacity / 100}>
            {(() => {
              const { x, y, w, h } = getCoverRect(overlayPhoto, cx, cy, framePx);
              return <SkiaImage image={overlayPhoto} x={x} y={y} width={w} height={h} fit="fill" />;
            })()}
          </Group>
          {borderThick > 0 && (
            <Path path={buildClipPath(shape, cx, cy, r + borderThick / 2)} style="stroke" strokeWidth={borderThick} color={frameColor}>
              {glow && <BlurMask blur={18} style="outer" />}
            </Path>
          )}
        </Group>
      )}

      <SkiaText x={60} y={position === 'bottomLeft' || position === 'bottomRight' ? 180 : LOGICAL_SIZE - 160} text={userName} font={font} color={premiumGold ? GOLD : '#fff'} />
      <SkiaText x={60} y={(position === 'bottomLeft' || position === 'bottomRight' ? 180 : LOGICAL_SIZE - 160) + textSize + 16} text={tagline} font={smallFont} color={GOLD} />

      {badge.length > 0 && badgeFont && (
        <Group>
          <RoundedRect x={LOGICAL_SIZE - 320} y={36} width={280} height={60} r={10} color="rgba(0,0,0,0.5)" />
          <RoundedRect x={LOGICAL_SIZE - 320} y={36} width={280} height={60} r={10} style="stroke" strokeWidth={2} color={GOLD} />
          <SkiaText x={LOGICAL_SIZE - 300} y={80} text={badge} font={badgeFont} color={GOLD} />
        </Group>
      )}
    </>
  );

  if (!font || !smallFont) return <View style={styles.center}><ActivityIndicator size="large" color={GOLD} /></View>;

  return (
    <View style={styles.container}>

      {/* THE LIVE PREVIEW CANVAS */}
      <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
        <GestureDetector gesture={composedGesture}>
          <View style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, overflow: 'hidden', borderRadius: 20, marginTop: Platform.OS === 'android' ? 40 : 10, backgroundColor: DARK_BG }}>
            
            {isVideoTemplate ? (
              <>
                {/* VIDEO MODE: VideoView background + transparent Skia overlay on top.
                    The overlay canvas uses the same drawing as the image canvas and is
                    what we snapshot for the FFmpeg render, so preview === export. */}
                <VideoView
                  player={bgVideoPlayer}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  nativeControls={false}
                />
                <Canvas style={StyleSheet.absoluteFill} ref={overlayCanvasRef}>
                  <Group transform={[{ scale: SCALE_FACTOR }]}>
                    {renderOverlayContent()}
                  </Group>
                </Canvas>
              </>
            ) : (
              <>
                {/* IMAGE MODE: Full Skia Canvas */}
                <Canvas style={StyleSheet.absoluteFill} ref={canvasRef}>
                  <Group transform={[{ scale: SCALE_FACTOR }]}>
                    
                    <Rect x={0} y={0} width={LOGICAL_SIZE} height={LOGICAL_SIZE}>
                      <LinearGradient start={vec(0, 0)} end={vec(LOGICAL_SIZE, LOGICAL_SIZE)} colors={BG_THEMES[bgTheme]} />
                    </Rect>
                    {feedImage && (
                      <Group opacity={0.22}>
                        <SkiaImage image={feedImage} fit="cover" x={0} y={0} width={LOGICAL_SIZE} height={LOGICAL_SIZE} />
                      </Group>
                    )}

                    {overlay === 'vignette' && (
                      <Rect x={0} y={0} width={LOGICAL_SIZE} height={LOGICAL_SIZE}>
                        <RadialGradient c={vec(LOGICAL_SIZE/2, LOGICAL_SIZE/2)} r={LOGICAL_SIZE * 0.75} colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']} />
                      </Rect>
                    )}
                    {overlay === 'bokeh' && [ { cx: 140, cy: 120, r: 70 }, { cx: 900, cy: 230, r: 100 }, { cx: 220, cy: 880, r: 80 }].map((b, i) => (
                      <Circle key={i} cx={b.cx} cy={b.cy} r={b.r} opacity={0.1}>
                        <RadialGradient c={vec(b.cx, b.cy)} r={b.r} colors={[GOLD, 'transparent']} />
                      </Circle>
                    ))}

                    {/* Render the user's overlay photo + name (shared with video export) */}
                    {renderOverlayContent()}
                  </Group>
                </Canvas>
              </>
            )}

            {isProcessing && <View style={styles.canvasSpinner}><ActivityIndicator size="large" color={GOLD} /></View>}
            {!overlayPhoto && !isProcessing && (
              <TouchableOpacity style={styles.uploadHint} onPress={handleSystemPicker}>
                <Text style={{fontSize: 40, color: GOLD}}>+</Text>
                <Text style={{color: '#aaa', marginTop: 10}}>Tap to select from device</Text>
              </TouchableOpacity>
            )}
          </View>
        </GestureDetector>

        {/* ACTION BAR */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleSystemPicker}>
            <Text style={styles.btnSecTxt}>📂 Pick Photo</Text>
          </TouchableOpacity>
          
          <Animated.View style={[styles.premiumButtonWrapper, animatedButtonStyle, !overlayPhoto && {opacity:0.4}]}>
            <Pressable 
              style={styles.premiumButton} 
              disabled={!overlayPhoto} 
              onPressIn={handleExportPressIn}
              onPressOut={handleExportPressOut}
              onPress={handleExport}
            >
              <ExpoLinearGradient colors={['#D4AF37', '#AA8222']} start={{x:0, y:0}} end={{x:1, y:1}} style={StyleSheet.absoluteFill} />
              <Text style={styles.btnPriTxt}>✨ Export HD</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* CONTROLS OVERLAY */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBg}
        handleIndicatorStyle={{ backgroundColor: '#D4AF37' }}
      >
        <BottomSheetScrollView contentContainerStyle={{padding: 20, paddingBottom: 100}}>
          
          <Text style={styles.sectionLabel}>TEXT LABELS</Text>
          <TextInput style={styles.textInput} value={userName} onChangeText={setUserName} placeholder="Name" placeholderTextColor="#555" />
          <TextInput style={[styles.textInput, {marginTop: 8}]} value={tagline} onChangeText={setTagline} placeholder="Tagline" placeholderTextColor="#555" />

          <Text style={styles.sectionLabel}>FRAME SHAPE</Text>
          <View style={styles.chipRow}>{SHAPES.map(s => <Chip key={s.key} label={s.label} pro={s.pro} active={shape===s.key} onPress={()=>setShape(s.key)} />)}</View>

          <Text style={styles.sectionLabel}>POSITION</Text>
          <View style={styles.chipRow}>{POSITIONS.map(p => <Chip key={p.key} label={p.label} pro={p.pro} active={position===p.key} onPress={()=>setPosition(p.key)} />)}</View>

          <Text style={styles.sectionLabel}>FRAME STYLE</Text>
          <View style={{flexDirection:'row', gap:10, marginBottom:10}}>{FRAME_COLORS.map(c => <TouchableOpacity key={c.color} style={[styles.swatch, {backgroundColor: c.color}, frameColor===c.color && {borderColor:'#fff', borderWidth:2}]} onPress={()=>setFrameColor(c.color)} />)}</View>
          <SliderRow label="Thickness" value={borderThick} min={0} max={30} displayValue={`${borderThick}px`} onDec={()=>setBorderThick((v: number)=>Math.max(0, v-2))} onInc={()=>setBorderThick((v: number)=>Math.min(30, v+2))} />
          <TouchableOpacity style={[styles.toggleBtn, glow && styles.toggleBtnActive]} onPress={() => setGlow((value) => !value)}>
            <Text style={[styles.toggleBtnText, glow && styles.toggleBtnTextActive]}>{glow ? 'Glow ON' : 'Glow OFF'}</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>PHOTO SETTINGS</Text>
          <SliderRow label="Opacity" value={opacity} min={20} max={100} displayValue={`${opacity}%`} onDec={()=>setOpacity((v: number)=>Math.max(20, v-5))} onInc={()=>setOpacity((v: number)=>Math.min(100, v+5))} />
          <SliderRow label="Frame Size" value={frameSize} min={20} max={65} displayValue={`${frameSize}%`} onDec={()=>setFrameSize((v: number)=>Math.max(20, v-2))} onInc={()=>setFrameSize((v: number)=>Math.min(65, v+2))} />
          <SliderRow label="Text Size" value={textSize} min={30} max={90} displayValue={`${textSize}`} onDec={()=>setTextSize((v: number)=>Math.max(30, v-4))} onInc={()=>setTextSize((v: number)=>Math.min(90, v+4))} />

          <Text style={styles.sectionLabel}>STUDIO EFFECTS</Text>
          <View style={styles.chipRow}>{(Object.keys(BG_THEMES) as BgTheme[]).map(b => <Chip key={b} label={b} active={bgTheme===b} onPress={()=>setBgTheme(b)} />)}</View>
          <View style={styles.chipRow}>{OVERLAYS.map(o => <Chip key={o.key} label={o.label} active={overlay===o.key} onPress={()=>setOverlay(o.key)} />)}</View>

          <Text style={styles.sectionLabel}>BADGE TAG</Text>
          <TextInput style={styles.textInput} value={badge} onChangeText={setBadge} placeholder="Event / brand label…" placeholderTextColor="#555" />

          <TouchableOpacity style={[styles.premiumBtn, premiumGold && {borderColor: GOLD, backgroundColor: 'rgba(212,175,55,0.15)'}]} onPress={() => setPremiumGold(!premiumGold)}>
            <Text style={{color: GOLD, fontWeight: 'bold'}}>{premiumGold ? '⭐ Premium Gold Mode ON' : '☆ Premium Gold Mode OFF'}</Text>
          </TouchableOpacity>
          
          <View style={{height: 40}} />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  center: { flex: 1, backgroundColor: DARK_BG, justifyContent: 'center', alignItems: 'center' },
  
  canvasSpinner: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  uploadHint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,15,0.85)', justifyContent: 'center', alignItems: 'center' },

  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 20, width: '100%' },
  btnSecondary: { flex: 1, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER_COLOR, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnSecTxt: { color: '#F4F4F5', fontFamily: 'NotoSans_600SemiBold' },
  
  premiumButtonWrapper: { flex: 2, borderRadius: 16, overflow: 'hidden', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  premiumButton: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  btnPriTxt: { color: '#05050A', fontFamily: 'NotoSans_700Bold', fontSize: 16 },

  bottomSheetBg: { backgroundColor: 'rgba(22, 22, 34, 0.85)' },

  sectionLabel: { color: MUTED, fontSize: 10, fontFamily: 'NotoSans_700Bold', marginTop: 20, marginBottom: 10, letterSpacing: 1.2 },
  textInput: { backgroundColor: 'rgba(5,5,10,0.5)', borderWidth: 1, borderColor: BORDER_COLOR, color: '#F4F4F5', padding: 14, borderRadius: 12, fontFamily: 'NotoSans_500Medium' },
  
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: 'rgba(5,5,10,0.5)', borderWidth: 1, borderColor: BORDER_COLOR, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  chipActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: GOLD },
  chipText: { color: '#A1A1AA', fontSize: 12, fontFamily: 'NotoSans_600SemiBold' },
  chipTextActive: { color: GOLD },

  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  toggleBtn: { alignSelf: 'flex-start', marginTop: 12, backgroundColor: 'rgba(5,5,10,0.5)', borderWidth: 1, borderColor: BORDER_COLOR, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12 },
  toggleBtnActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: GOLD },
  toggleBtnText: { color: '#A1A1AA', fontSize: 12, fontFamily: 'NotoSans_600SemiBold' },
  toggleBtnTextActive: { color: GOLD },

  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  sliderLabel: { color: '#A1A1AA', fontSize: 12, width: 75, fontFamily: 'NotoSans_500Medium' },
  sliderBtn: { width: 28, height: 28, backgroundColor: 'rgba(5,5,10,0.5)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER_COLOR },
  sliderBtnTxt: { color: GOLD, fontSize: 18, lineHeight: 20 },
  sliderTrack: { flex: 1, height: 6, backgroundColor: 'rgba(5,5,10,0.8)', borderRadius: 3, overflow: 'hidden' },
  sliderFill: { height: 6, backgroundColor: GOLD, borderRadius: 3 },
  sliderVal: { color: GOLD, fontSize: 12, width: 40, textAlign: 'right', fontFamily: 'NotoSans_600SemiBold' },

  premiumBtn: { marginTop: 30, backgroundColor: 'rgba(5,5,10,0.8)', borderWidth: 1, borderColor: BORDER_COLOR, padding: 16, borderRadius: 12, alignItems: 'center' },
});
