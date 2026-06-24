import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { RefObject } from 'react';
import { BrandColors } from '@/constants/brand';
import {
  captureOverlayBase64,
  exportAndDownload,
  exportAndShare,
  showExportError,
} from '@/services/status-export';
import {
  renderVideoWithOverlay,
  saveVideoToGallery,
  shareVideo,
} from '@/services/video-export';
import { useTranslation } from '@/context/locale-context';
import { useExportGate } from '@/hooks/use-export-gate';

type ShareKey = 'whatsapp' | 'instagram' | 'facebook' | 'more' | 'download';

const SHARE_META: Record<
  ShareKey,
  { icon: keyof typeof MaterialIcons.glyphMap; tint?: string }
> = {
  whatsapp: { icon: 'chat', tint: '#25D366' },
  instagram: { icon: 'photo-camera', tint: BrandColors.pink },
  facebook: { icon: 'facebook', tint: '#1877F2' },
  more: { icon: 'send', tint: BrandColors.purple },
  download: { icon: 'download', tint: BrandColors.orange },
};

type Props = {
  previewRef: RefObject<View | null>;
  statusTitle: string;
  onEditAgain: () => void;
  onExportSuccess?: () => void;
  /** Transparent overlay layer ref — used for video export. */
  overlayRef?: RefObject<View | null>;
  /** 'video' routes export through the render service; otherwise on-device image capture. */
  mediaType?: string;
  /** Source template video URL (required when mediaType === 'video'). */
  videoUrl?: string | null;
};

// Output aspect for the personalize card (280x420 = 2:3) scaled up for export.
const VIDEO_OUT_W = 1080;
const VIDEO_OUT_H = 1620;

export function ShareActions({
  previewRef,
  statusTitle,
  onEditAgain,
  onExportSuccess,
  overlayRef,
  mediaType,
  videoUrl,
}: Props) {
  const { t } = useTranslation();
  const { attempt } = useExportGate();
  const [busy, setBusy] = useState<ShareKey | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const isVideo = mediaType === 'video' && !!videoUrl && !!overlayRef;

  // Render the video once (overlay PNG → render service → local mp4 uri).
  const renderVideoFile = async (): Promise<string> => {
    const overlayPngBase64 = await captureOverlayBase64(overlayRef!);
    return renderVideoWithOverlay({
      videoUrl: videoUrl!,
      overlayPngBase64,
      outWidth: VIDEO_OUT_W,
      outHeight: VIDEO_OUT_H,
    });
  };

  const runExport = async (key: ShareKey, fn: () => Promise<void>) => {
    if (busy) return;
    // Free/premium gate: own-photo or over-limit routes to the paywall instead.
    if (!attempt(key === 'download' ? 'download' : 'share')) return;
    setBusy(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await fn();
      onExportSuccess?.();
      if (key === 'download') {
        setSavedMsg(t('editor.downloadSuccess'));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      showExportError(e, t);
    } finally {
      setBusy(null);
    }
  };

  // Share to a channel: video → render then open share sheet; image → existing path.
  const shareTo = async (channel: 'whatsapp' | 'general') => {
    if (isVideo) {
      const uri = await renderVideoFile();
      await shareVideo(uri, channel === 'whatsapp' ? 'Share to WhatsApp' : 'Share status');
    } else {
      await exportAndShare(
        previewRef,
        channel,
        channel === 'whatsapp' ? `${statusTitle} — Status Daily` : undefined
      );
    }
  };

  // Download: video → render then save mp4 to gallery; image → existing path.
  const download = async () => {
    if (isVideo) {
      const uri = await renderVideoFile();
      await saveVideoToGallery(uri);
    } else {
      await exportAndDownload(previewRef);
    }
  };

  const items: { key: ShareKey; label: string; onPress: () => void; highlight?: boolean }[] = [
    {
      key: 'whatsapp',
      label: t('editor.shareWhatsapp'),
      onPress: () => runExport('whatsapp', () => shareTo('whatsapp')),
    },
    {
      key: 'instagram',
      label: t('editor.shareInstagram'),
      onPress: () => runExport('instagram', () => shareTo('general')),
    },
    {
      key: 'facebook',
      label: t('editor.shareFacebook'),
      onPress: () => runExport('facebook', () => shareTo('general')),
    },
    {
      key: 'more',
      label: t('editor.shareMore'),
      onPress: () => runExport('more', () => shareTo('general')),
    },
    {
      key: 'download',
      label: t('editor.download'),
      highlight: true,
      onPress: () => runExport('download', download),
    },
  ];

  return (
    <Animated.View entering={FadeInUp.duration(320)} style={styles.wrap}>
      <View style={styles.readyRow}>
        <MaterialIcons name="check-circle" size={22} color="#22C55E" />
        <Text style={styles.readyText}>{t('editor.statusReady')}</Text>
      </View>

      {savedMsg ? (
        <Text style={styles.successMsg}>{savedMsg}</Text>
      ) : null}

      <View style={styles.grid}>
        {items.map(({ key, label, onPress, highlight }) => (
          <Pressable
            key={key}
            style={styles.cell}
            onPress={onPress}
            disabled={!!busy}
          >
            {highlight ? (
              <LinearGradient colors={[...BrandColors.gradient]} style={styles.iconBox}>
                {busy === key ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <MaterialIcons name={SHARE_META[key].icon} size={24} color="#fff" />
                )}
              </LinearGradient>
            ) : (
              <View style={[styles.iconBox, key === 'whatsapp' && styles.waBox]}>
                {busy === key ? (
                  <ActivityIndicator color={BrandColors.orange} size="small" />
                ) : (
                  <MaterialIcons
                    name={SHARE_META[key].icon}
                    size={24}
                    color={SHARE_META[key].tint ?? BrandColors.text}
                  />
                )}
              </View>
            )}
            <Text style={styles.cellLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.editAgain} onPress={onEditAgain}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <MaterialIcons name="arrow-back" size={18} color={BrandColors.text} />
        <Text style={styles.editAgainTxt}>{t('editor.editAgain')}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, gap: 14 },
  readyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  readyText: {
    fontSize: 17,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.success,
  },
  successMsg: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.orange,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  cell: {
    width: '18%',
    minWidth: 62,
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    shadowColor: BrandColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  waBox: {
    borderColor: 'rgba(37,211,102,0.4)',
    backgroundColor: 'rgba(37,211,102,0.1)',
  },
  cellLabel: {
    fontSize: 11,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  editAgain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: BrandColors.surface,
    marginTop: 8,
    shadowColor: BrandColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  editAgainTxt: {
    fontSize: 15,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.text,
  },
});
