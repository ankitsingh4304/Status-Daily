import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { NamePlateOverlay } from '@/components/home/name-plate-overlay';
import { BrandColors } from '@/constants/brand';
import type { ProfileCirclePosition } from '@/constants/profile-circle';
import { useLocale } from '@/context/locale-context';
import type { StatusItem } from '@/data/status-feed';
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

export type ExportMode = 'share' | 'download';
export type ExportRequest = {
  item: StatusItem;
  mode: ExportMode;
  /** The name-plate position shown on the feed at export time — preserved so the
   *  saved/shared file matches exactly what the user saw (bottom-left vs bottom-right). */
  circlePos: ProfileCirclePosition;
};

// Must match the capture dimensions hardcoded in services/status-export.ts (2:3,
// which also scales cleanly to the 1080×1620 video output).
const CARD_W = 280;
const CARD_H = 420;

/**
 * Renders the personalized status off-screen and exports it inline — no navigation.
 * Image → capture & save/share on device. Video → overlay PNG to render service → mp4.
 * The off-screen card mirrors the feed card so preview === downloaded/shared result.
 */
export function InlineExporter({
  request,
  onDone,
}: {
  request: ExportRequest | null;
  onDone: (toast?: string) => void;
}) {
  const { profilePhotoUri, userName, t } = useLocale();
  const previewRef = useRef<View>(null);
  const overlayRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!request) return;
    let alive = true;
    (async () => {
      setBusy(true);
      try {
        // Let the off-screen card (and its cached image) settle before capture.
        await new Promise((r) => setTimeout(r, 550));
        if (!alive) return;

        const isVideo = request.item.mediaType === 'video' && !!request.item.mediaUrl;
        if (isVideo) {
          const overlayPngBase64 = await captureOverlayBase64(overlayRef);
          const uri = await renderVideoWithOverlay({
            videoUrl: request.item.mediaUrl!,
            overlayPngBase64,
            outWidth: 1080,
            outHeight: 1620,
          });
          if (request.mode === 'download') await saveVideoToGallery(uri);
          else await shareVideo(uri, 'Share to WhatsApp');
        } else if (request.mode === 'download') {
          await exportAndDownload(previewRef);
        } else {
          await exportAndShare(previewRef, 'whatsapp', `${request.item.title} — Status Daily`);
        }

        if (alive) onDone(request.mode === 'download' ? t('editor.downloadSuccess') : undefined);
      } catch (e) {
        showExportError(e, t);
        if (alive) onDone();
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  if (!request) return null;

  const { item, circlePos } = request;
  const colors = item.gradient.length >= 2 ? item.gradient : ['#1A1033', '#FF7A00'];

  return (
    <>
      {/* Off-screen (laid out + opaque so capture works) */}
      <View style={styles.offscreen} pointerEvents="none">
        <View ref={previewRef} collapsable={false} style={styles.card}>
          <LinearGradient colors={colors as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />

          {item.mediaType === 'image' && item.mediaUrl ? (
            <Image
              source={{ uri: item.mediaUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : null}

          {/* Transparent overlay layer — captured alone for video compositing. */}
          <View ref={overlayRef} collapsable={false} pointerEvents="none" style={StyleSheet.absoluteFill}>
            <NamePlateOverlay
              position={circlePos}
              photoUri={profilePhotoUri}
              name={userName || 'Your Name'}
              containerWidth={CARD_W}
            />
          </View>
        </View>
      </View>

      <Modal transparent visible={busy} animationType="fade" statusBarTranslucent>
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={BrandColors.orange} />
            <Text style={styles.loadingTxt}>
              {request.mode === 'download' ? 'Saving…' : 'Preparing…'}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  offscreen: { position: 'absolute', left: -9999, top: 0 },
  card: {
    width: CARD_W,
    height: CARD_H,
    overflow: 'hidden',
    backgroundColor: '#05050A',
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 36,
    paddingTop: 26,
    paddingBottom: 22,
    borderRadius: 22,
    alignItems: 'center',
    gap: 14,
    minWidth: 160,
  },
  loadingTxt: {
    fontSize: 14,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.text,
  },
});
