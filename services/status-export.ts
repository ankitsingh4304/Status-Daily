import type { RefObject } from 'react';
import { Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import type { View } from 'react-native';

export async function capturePreviewRef(
  ref: RefObject<View | null>,
  scale = 3
): Promise<string> {
  if (!ref.current) {
    throw new Error('Preview not ready');
  }
  const uri = await captureRef(ref, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    width: 280 * scale,
    height: 420 * scale,
  });
  return uri;
}

/** Captures a transparent PNG of the overlay layer (photo + name) as raw base64. */
export async function captureOverlayBase64(ref: RefObject<View | null>): Promise<string> {
  if (!ref.current) {
    throw new Error('Overlay not ready');
  }
  return captureRef(ref, {
    format: 'png',
    quality: 1,
    result: 'base64',
  });
}

export async function requestMediaPermission(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function saveImageToGallery(fileUri: string): Promise<void> {
  const ok = await requestMediaPermission();
  if (!ok) {
    throw new Error('Gallery permission denied');
  }
  await MediaLibrary.saveToLibraryAsync(fileUri);
}

export async function shareImage(fileUri: string, dialogTitle?: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'image/png',
    dialogTitle: dialogTitle ?? 'Share status',
    UTI: 'public.png',
  });
}

/** Opens WhatsApp share sheet with image (native share) or wa.me fallback for text */
export async function shareToWhatsApp(fileUri: string, message?: string): Promise<void> {
  try {
    await shareImage(fileUri, 'Share to WhatsApp');
    return;
  } catch {
    /* fall through */
  }

  if (message) {
    const encoded = encodeURIComponent(message);
    const url = `whatsapp://send?text=${encoded}`;
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
      return;
    }
  }

  throw new Error('Could not open WhatsApp');
}

export async function exportAndDownload(
  ref: RefObject<View | null>,
  onSuccess?: () => void
): Promise<string> {
  const uri = await capturePreviewRef(ref);
  await saveImageToGallery(uri);
  onSuccess?.();
  return uri;
}

export async function exportAndShare(
  ref: RefObject<View | null>,
  channel: 'whatsapp' | 'general',
  message?: string
): Promise<void> {
  const uri = await capturePreviewRef(ref);
  if (channel === 'whatsapp') {
    await shareToWhatsApp(uri, message);
  } else {
    await shareImage(uri);
  }
}

export function showExportError(error: unknown, t?: (k: string) => string) {
  const msg = error instanceof Error ? error.message : 'Export failed';
  Alert.alert(t?.('editor.exportError') ?? 'Export failed', msg);
}
