import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import { API_AUTH_TOKEN, API_BASE_URL, RENDER_VIDEO_PATH } from '@/constants/api';

export type RenderVideoParams = {
  /** URL of the source template video (server fetches it directly). */
  videoUrl: string;
  /** Transparent overlay rendered by Skia, as raw base64 PNG (no data: prefix). */
  overlayPngBase64: string;
  /** Optional cap on output length in seconds. */
  durationSec?: number;
  /** Output dimensions — match the editor's preview aspect (defaults to 1080x1080 square). */
  outWidth?: number;
  outHeight?: number;
};

/**
 * Sends the source video URL + a transparent overlay PNG to the render service,
 * which burns the overlay onto the video with FFmpeg and returns the composited mp4.
 * The mp4 is written to a local cache file and its URI is returned.
 */
export async function renderVideoWithOverlay({
  videoUrl,
  overlayPngBase64,
  durationSec,
  outWidth,
  outHeight,
}: RenderVideoParams): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${API_AUTH_TOKEN}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${RENDER_VIDEO_PATH}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ videoUrl, overlayPng: overlayPngBase64, durationSec, outWidth, outHeight }),
    });
  } catch {
    throw new Error(
      'Could not reach the render service. Is the server running and the URL in constants/api.ts correct?'
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Render failed (${res.status}): ${detail || res.statusText}`);
  }

  const data = (await res.json()) as { mp4Base64?: string };
  if (!data?.mp4Base64) {
    throw new Error('Render service returned no video.');
  }

  const fileUri = `${FileSystem.cacheDirectory}status_${Date.now()}.mp4`;
  await FileSystem.writeAsStringAsync(fileUri, data.mp4Base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

/** Saves a video file to the device gallery (requests permission first). */
export async function saveVideoToGallery(fileUri: string): Promise<void> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Gallery permission denied');
  }
  await MediaLibrary.saveToLibraryAsync(fileUri);
}

/** Opens the native share sheet for a video file (WhatsApp, FB, IG, etc.). */
export async function shareVideo(fileUri: string, dialogTitle = 'Share status'): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'video/mp4',
    dialogTitle,
    UTI: 'public.mpeg-4',
  });
}
