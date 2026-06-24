import React, { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type View as ViewType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { AuthBackButton } from '@/components/auth/auth-back-button';
import { GradientButton } from '@/components/auth/gradient-button';
import { EditorCollapsible } from '@/components/editor/editor-collapsible';
import { OptionChipRow } from '@/components/editor/option-chip-row';
import { ColorSwatchRow } from '@/components/editor/color-swatch-row';
import { PremiumSlider } from '@/components/editor/premium-slider';
import { StatusPreviewCard } from '@/components/editor/status-preview-card';
import { ShareActions } from '@/components/editor/share-actions';
import { BrandColors } from '@/constants/brand';
import { NAME_COLORS, PHOTO_SHAPES } from '@/constants/editor-presets';
import { usePersonalizeEditor } from '@/hooks/use-personalize-editor';
import { useLocale, useTranslation } from '@/context/locale-context';
import { STATUS_FEED } from '@/data/status-feed';
import { useSavedStore } from '@/stores/use-saved-store';
import type { FontWeight, NameColor, PhotoShape } from '@/types/personalize-editor';
import { paramString } from '@/lib/parse-route-params';

export default function PersonalizeStatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profilePhotoUri, userName } = useLocale();

  const previewRef = useRef<ViewType>(null);
  const overlayRef = useRef<ViewType>(null);
  const upsertWithEditor = useSavedStore((s) => s.upsertWithEditor);

  const params = useLocalSearchParams<{
    templateUri?: string | string[];
    mediaType?: string | string[];
    statusTitle?: string | string[];
    statusId?: string | string[];
    gradient?: string | string[];
    autoReady?: string | string[];
    shareOnly?: string | string[];
    reelPosition?: string | string[];
    editorSnapshot?: string | string[];
  }>();

  const shareOnly = paramString(params.shareOnly) === '1';

  const { state, patch, markReady, editAgain } = usePersonalizeEditor({
      templateUri: params.templateUri,
      mediaType: params.mediaType,
      statusTitle: params.statusTitle,
      statusId: params.statusId,
      gradient: params.gradient,
      editorSnapshot: params.editorSnapshot,
      shareOnly: params.shareOnly,
      reelPosition: params.reelPosition,
      defaultName: userName,
  });

  useEffect(() => {
    if (shareOnly || paramString(params.autoReady) !== '1') return;
    const readyTimer = setTimeout(() => markReady(), 400);
    return () => clearTimeout(readyTimer);
  }, [params.autoReady, markReady, shareOnly]);

  const shapeOptions = PHOTO_SHAPES.map((key) => ({
    key,
    label: t(`editor.shapes.${key}`),
  }));

  const weightOptions: { key: FontWeight; label: string }[] = [
    { key: 'medium', label: t('editor.weights.medium') },
    { key: 'semibold', label: t('editor.weights.semibold') },
    { key: 'bold', label: t('editor.weights.bold') },
    { key: 'extrabold', label: t('editor.weights.extrabold') },
  ];

  const persistEditorSave = () => {
    const feed = STATUS_FEED.find((f) => f.id === state.sourceStatusId);
    if (feed) {
      upsertWithEditor(feed, state);
    }
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markReady();
  };

  const handleEditAgain = () => {
    if (shareOnly) {
      router.back();
      return;
    }
    editAgain();
  };

  return (
    <AuthScreenShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <AuthBackButton onPress={() => router.back()} label={t('editor.back')} />
          <View style={styles.headerRight}>
            <LinearGradient colors={[...BrandColors.gradient]} style={styles.logoGlow}>
              <MaterialIcons name="auto-awesome" size={18} color="#fff" />
            </LinearGradient>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            shareOnly && styles.scrollShareOnly,
            { paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={shareOnly ? styles.offScreenPreview : styles.previewStage}
            pointerEvents={shareOnly ? 'none' : 'auto'}
          >
            <View style={shareOnly ? undefined : styles.previewBg}>
              <StatusPreviewCard
                ref={previewRef}
                overlayRef={overlayRef}
                state={state}
                profilePhotoUri={profilePhotoUri}
                onPhotoOffsetChange={(x, y) => patch({ photoOffsetX: x, photoOffsetY: y })}
                onNameOffsetChange={(x, y) => patch({ textOffsetX: x, textOffsetY: y })}
              />
            </View>
            {!shareOnly && !state.showReadyPanel ? (
              <Text style={styles.previewHint}>
                {t('editor.dragPhotoHint')} · {t('editor.dragNameHint')}
              </Text>
            ) : null}
          </View>

          <View style={[styles.panel, shareOnly && styles.panelShareOnly]}>
            {shareOnly ? (
              <ShareActions
                previewRef={previewRef}
                overlayRef={overlayRef}
                mediaType={state.mediaType}
                videoUrl={state.templateUri}
                statusTitle={state.statusText}
                onEditAgain={handleEditAgain}
                onExportSuccess={persistEditorSave}
              />
            ) : (
              <>
            <Text style={styles.panelTitle}>{t('editor.title')}</Text>

            <Text style={styles.fieldLabel}>{t('editor.yourName')}</Text>
            <TextInput
              style={styles.input}
              value={state.displayName}
              onChangeText={(displayName) => patch({ displayName })}
              placeholder={t('editor.namePlaceholder')}
              placeholderTextColor={BrandColors.textMuted}
            />

            {!state.showReadyPanel ? (
              <>
                <EditorCollapsible
                  title={t('editor.customizeLook')}
                  expanded={state.customizeExpanded}
                  onToggle={() => patch({ customizeExpanded: !state.customizeExpanded })}
                >
                  <Text style={styles.section}>{t('editor.photoShape')}</Text>
                  <OptionChipRow<PhotoShape>
                    options={shapeOptions}
                    value={state.photoShape}
                    onChange={(photoShape) => patch({ photoShape })}
                  />

                  <PremiumSlider
                    label={t('editor.photoSize')}
                    value={state.photoSize}
                    min={70}
                    max={130}
                    step={2}
                    formatValue={(v) => `${v}%`}
                    onChange={(photoSize) => patch({ photoSize })}
                  />

                  <Text style={styles.section}>{t('editor.nameColor')}</Text>
                  <ColorSwatchRow<NameColor>
                    options={NAME_COLORS}
                    value={state.nameColor}
                    onChange={(nameColor) => patch({ nameColor })}
                    mode="name"
                  />

                  <PremiumSlider
                    label={t('editor.nameSize')}
                    value={state.nameSize}
                    min={80}
                    max={140}
                    step={2}
                    formatValue={(v) => `${v}%`}
                    onChange={(nameSize) => patch({ nameSize })}
                  />

                  <Text style={styles.section}>{t('editor.fontWeight')}</Text>
                  <OptionChipRow<FontWeight>
                    options={weightOptions}
                    value={state.fontWeight}
                    onChange={(fontWeight) => patch({ fontWeight })}
                  />
                </EditorCollapsible>

                <View style={styles.ctaWrap}>
                  <GradientButton label={t('editor.statusReady')} onPress={handleFinish} />
                </View>
              </>
            ) : (
              <ShareActions
                previewRef={previewRef}
                overlayRef={overlayRef}
                mediaType={state.mediaType}
                videoUrl={state.templateUri}
                statusTitle={state.statusText}
                onEditAgain={handleEditAgain}
                onExportSuccess={persistEditorSave}
              />
            )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerRight: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  scroll: { paddingHorizontal: 16 },
  scrollShareOnly: { paddingTop: 8 },
  offScreenPreview: {
    position: 'absolute',
    left: -5000,
    top: 0,
    opacity: 0,
  },
  previewStage: { marginBottom: 8 },
  previewHint: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginTop: 6,
    marginBottom: 4,
  },
  previewBg: {
    backgroundColor: BrandColors.bgAccent,
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    shadowColor: BrandColors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  panel: {
    backgroundColor: BrandColors.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    shadowColor: BrandColors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  panelShareOnly: {
    marginTop: 0,
    flex: 1,
  },
  panelTitle: {
    fontSize: 22,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(15,15,18,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.text,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 12,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.textSecondary,
    letterSpacing: 0.3,
  },
  hint: {
    fontSize: 11,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
    marginBottom: 6,
  },
  ctaWrap: { marginTop: 20 },
});
