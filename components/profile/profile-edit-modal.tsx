import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/auth/gradient-button';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';
import { pickSquarePhoto } from '@/utils/pick-photo';

type Props = {
  visible: boolean;
  name: string;
  bio: string;
  photoUri: string | null;
  onClose: () => void;
  onSave: (data: { name: string; bio: string; photoUri: string | null }) => void;
};

export function ProfileEditModal({ visible, name, bio, photoUri, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);
  const [draftPhoto, setDraftPhoto] = useState<string | null>(photoUri);

  useEffect(() => {
    if (visible) {
      setDraftName(name);
      setDraftBio(bio);
      setDraftPhoto(photoUri);
    }
  }, [visible, name, bio, photoUri]);

  const handlePickPhoto = async () => {
    const uri = await pickSquarePhoto();
    if (uri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDraftPhoto(uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>{t('profile.edit.title')}</Text>

            <Pressable style={styles.avatarWrap} onPress={handlePickPhoto} hitSlop={8}>
              <LinearGradient colors={[...BrandColors.gradient]} style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  {draftPhoto ? (
                    <Image source={{ uri: draftPhoto }} style={styles.avatarPhoto} />
                  ) : (
                    <MaterialIcons name="person" size={40} color="#fff" />
                  )}
                </View>
              </LinearGradient>
              <View style={styles.cameraBadge}>
                <MaterialIcons name="photo-camera" size={15} color="#fff" />
              </View>
            </Pressable>
            <Pressable onPress={handlePickPhoto}>
              <Text style={styles.changePhotoTxt}>{t('home.actions.changePhoto')}</Text>
            </Pressable>

            <Text style={styles.label}>{t('onboarding.profile.nameLabel')}</Text>
            <TextInput
              style={styles.input}
              value={draftName}
              onChangeText={setDraftName}
              placeholder={t('onboarding.profile.namePlaceholder')}
              placeholderTextColor={BrandColors.textMuted}
            />

            <Text style={styles.label}>{t('profile.edit.bioLabel')}</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={draftBio}
              onChangeText={setDraftBio}
              placeholder={t('profile.edit.bioPlaceholder')}
              placeholderTextColor={BrandColors.textMuted}
              multiline
            />

            <View style={styles.actions}>
              <GradientButton
                label={t('profile.edit.save')}
                onPress={() =>
                  onSave({
                    name: draftName.trim() || name,
                    bio: draftBio,
                    photoUri: draftPhoto,
                  })
                }
                disabled={draftName.trim().length < 2}
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
    maxHeight: '75%',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarWrap: { alignSelf: 'center', marginBottom: 6 },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
    overflow: 'hidden',
    backgroundColor: '#0F0F12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPhoto: { width: '100%', height: '100%' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BrandColors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoTxt: {
    alignSelf: 'center',
    fontSize: 13.5,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.orange,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
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
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  actions: { marginTop: 24, gap: 12 },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelTxt: {
    fontSize: 15,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textMuted,
  },
});
