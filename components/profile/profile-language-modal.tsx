import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageGrid } from '@/components/auth/language-grid';
import { GradientButton } from '@/components/auth/gradient-button';
import { BrandColors } from '@/constants/brand';
import type { LocaleCode } from '@/locales/types';
import { useTranslation } from '@/context/locale-context';

type Props = {
  visible: boolean;
  locale: LocaleCode;
  onClose: () => void;
  onSave: (locale: LocaleCode) => void;
};

export function ProfileLanguageModal({ visible, locale, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [draftLocale, setDraftLocale] = useState<LocaleCode>(locale);

  useEffect(() => {
    if (visible) setDraftLocale(locale);
  }, [visible, locale]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>{t('profile.actions.changeLanguage')}</Text>

            <LanguageGrid
              selected={draftLocale}
              onSelect={setDraftLocale}
              label={t('onboarding.profile.languageLabel')}
            />

            <View style={styles.actions}>
              <GradientButton
                label={t('profile.edit.save')}
                onPress={() => onSave(draftLocale)}
              />
              <Pressable onPress={onClose} style={styles.cancel}>
                <Text style={styles.cancelTxt}>{t('profile.edit.cancel')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,15,18,0.45)',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  scroll: { padding: 24, paddingTop: 20 },
  title: {
    fontSize: 22,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  actions: { marginTop: 24, gap: 12 },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelTxt: {
    fontSize: 15,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textMuted,
  },
});
