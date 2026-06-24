import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/auth/gradient-button';
import { BrandColors } from '@/constants/brand';
import { RELIGIONS, type Religion } from '@/types/profile';
import { useTranslation } from '@/context/locale-context';

type Props = {
  visible: boolean;
  religion: Religion;
  onClose: () => void;
  onSave: (religion: Religion) => void;
};

const ICONS: Record<Religion, keyof typeof MaterialIcons.glyphMap> = {
  hindu: 'temple-hindu',
  muslim: 'mosque',
  christian: 'church',
  sikh: 'temple-buddhist',
  buddhist: 'self-improvement',
  jain: 'spa',
  none: 'do-not-disturb-on',
};

export function ProfileReligionModal({ visible, religion, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Religion>(religion);

  useEffect(() => {
    if (visible) setDraft(religion);
  }, [visible, religion]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>{t('religion.title')}</Text>
            <Text style={styles.subtitle}>{t('religion.subtitle')}</Text>

            <View style={styles.list}>
              {RELIGIONS.map((key) => {
                const selected = draft === key;
                return (
                  <Pressable
                    key={key}
                    style={[styles.option, selected && styles.optionOn]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDraft(key);
                    }}
                  >
                    <View style={[styles.optionIcon, selected && styles.optionIconOn]}>
                      <MaterialIcons
                        name={ICONS[key]}
                        size={22}
                        color={selected ? '#fff' : BrandColors.orange}
                      />
                    </View>
                    <Text style={[styles.optionTxt, selected && styles.optionTxtOn]}>
                      {t(`religion.${key}`)}
                    </Text>
                    {selected ? (
                      <MaterialIcons name="check-circle" size={22} color={BrandColors.orange} />
                    ) : (
                      <View style={styles.radio} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <GradientButton label={t('profile.edit.save')} onPress={() => onSave(draft)} />
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
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  scroll: { padding: 24, paddingTop: 20 },
  title: {
    fontSize: 22,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  list: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: BrandColors.surface,
  },
  optionOn: {
    borderColor: BrandColors.orange,
    backgroundColor: BrandColors.bgAccent,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: BrandColors.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconOn: { backgroundColor: BrandColors.orange },
  optionTxt: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.text,
  },
  optionTxtOn: { color: BrandColors.text },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BrandColors.surfaceBorder,
  },
  actions: { marginTop: 24, gap: 12 },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelTxt: {
    fontSize: 15,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textMuted,
  },
});
