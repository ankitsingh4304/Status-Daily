import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProfileCirclePosition } from '@/constants/profile-circle';
import { parseGradientParam, paramString } from '@/lib/parse-route-params';
import { reelPositionToEditorPhoto } from '@/lib/reel-position-to-editor';
import { bottomLeftNameOffset, bottomLeftPhotoOffset } from '@/lib/editor-position';
import type { PersonalizeEditorState } from '@/types/personalize-editor';

type Params = {
  templateUri?: string | string[];
  mediaType?: string | string[];
  statusTitle?: string | string[];
  statusId?: string | string[];
  gradient?: string | string[];
  defaultName?: string | null;
  /** Restore saved editor state JSON */
  editorSnapshot?: string | string[];
  /** Open straight to share panel (from reels Status button) */
  shareOnly?: string | string[];
  /** Profile circle position from reels feed */
  reelPosition?: string | string[];
};

function buildInitialState(params: Params): PersonalizeEditorState {
  const snapshotRaw = paramString(params.editorSnapshot);
  if (snapshotRaw) {
    try {
      const parsed = JSON.parse(snapshotRaw) as PersonalizeEditorState;
      return { ...parsed, showReadyPanel: false, customizeExpanded: true };
    } catch {
      /* fall through */
    }
  }

  const mediaTypeRaw = paramString(params.mediaType);
  const initialMedia =
    mediaTypeRaw === 'video' ? 'video' : mediaTypeRaw === 'image' ? 'image' : 'gradient';

  const backgroundGradient = parseGradientParam(params.gradient);
  const shareOnly = paramString(params.shareOnly) === '1';
  const reelPosRaw = paramString(params.reelPosition) as ProfileCirclePosition | undefined;
  const reelPhoto =
    reelPosRaw != null ? reelPositionToEditorPhoto(reelPosRaw) : null;

  // Photo + name both start at the bottom-left corner (still individually draggable).
  const brPhoto = bottomLeftPhotoOffset();
  const brName = bottomLeftNameOffset();

  return {
    displayName: params.defaultName ?? 'Gullu',
    statusText: paramString(params.statusTitle) ?? 'Good Morning',
    photoShape: 'circle',
    photoBorder: 'gradient',
    photoGlow: true,
    photoSize: 100,
    photoOffsetX: reelPhoto?.photoOffsetX ?? brPhoto.x,
    photoOffsetY: reelPhoto?.photoOffsetY ?? brPhoto.y,
    photoAnchor: reelPhoto?.photoAnchor ?? 'center',
    textOffsetX: brName.x,
    textOffsetY: brName.y,
    textAnchor: 'center',
    nameColor: 'white',
    nameSize: 100,
    fontWeight: 'bold',
    statusTextSize: 100,
    statusTextColor: 'white',
    textAlign: 'center',
    textShadow: 40,
    textGlow: false,
    preset: 'devotional',
    backgroundGradient: [...backgroundGradient],
    templateUri: paramString(params.templateUri) ?? null,
    mediaType: initialMedia,
    sourceStatusId: paramString(params.statusId) ?? null,
    showReadyPanel: shareOnly,
    customizeExpanded: !shareOnly,
  };
}

export function usePersonalizeEditor(params: Params) {
  const [state, setState] = useState<PersonalizeEditorState>(() =>
    buildInitialState({ ...params, defaultName: params.defaultName ?? undefined })
  );

  useEffect(() => {
    const uri = paramString(params.templateUri);
    const title = paramString(params.statusTitle);
    const gradient = parseGradientParam(params.gradient);
    const mediaTypeRaw = paramString(params.mediaType);
    const mediaType =
      mediaTypeRaw === 'video' ? 'video' : mediaTypeRaw === 'image' ? 'image' : 'gradient';
    const sourceStatusId = paramString(params.statusId);
    const reelPosRaw = paramString(params.reelPosition) as ProfileCirclePosition | undefined;
    const reelPhoto =
      reelPosRaw != null ? reelPositionToEditorPhoto(reelPosRaw) : null;

    setState((s) => ({
      ...s,
      templateUri: uri ?? null,
      mediaType,
      statusText: title ?? s.statusText,
      backgroundGradient: [...gradient],
      sourceStatusId: sourceStatusId ?? s.sourceStatusId,
      ...(reelPhoto
        ? {
            photoAnchor: reelPhoto.photoAnchor,
            photoOffsetX: reelPhoto.photoOffsetX,
            photoOffsetY: reelPhoto.photoOffsetY,
          }
        : {}),
    }));
  }, [
    params.templateUri,
    params.mediaType,
    params.statusTitle,
    params.gradient,
    params.statusId,
    params.reelPosition,
  ]);

  const patch = useCallback((partial: Partial<PersonalizeEditorState>) => {
    setState((s) => ({ ...s, ...partial }));
  }, []);

  const markReady = useCallback(() => {
    setState((s) => ({ ...s, showReadyPanel: true, customizeExpanded: false }));
  }, []);

  const editAgain = useCallback(() => {
    setState((s) => ({ ...s, showReadyPanel: false, customizeExpanded: true }));
  }, []);

  return useMemo(
    () => ({
      state,
      patch,
      markReady,
      editAgain,
    }),
    [state, patch, markReady, editAgain]
  );
}
