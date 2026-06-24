import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BrandColors } from '@/constants/brand';
import { getLanguageMeta } from '@/locales/languages';
import type { LocaleCode } from '@/locales/types';
import { useTranslation } from '@/context/locale-context';

type Props = {
  name: string;
  photoUri: string | null;
  bio: string;
  locale: LocaleCode;
  joinDate: string | null;
  streak: number;
  /** Tap the avatar to change the profile photo (WhatsApp/Insta DP style). */
  onChangePhoto?: () => void;
};

function formatJoinDate(iso: string | null): string {
  if (!iso) return '2026';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return '2026';
  }
}

export function ProfileHeader({ name, photoUri, bio, locale, joinDate, streak, onChangePhoto }: Props) {
  const { t } = useTranslation();
  const lang = getLanguageMeta(locale);

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.wrap}>
      <Pressable
        style={styles.avatarOuter}
        onPress={onChangePhoto}
        disabled={!onChangePhoto}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('home.actions.changePhoto')}
      >
        <View style={styles.glow} />
        <LinearGradient colors={[...BrandColors.gradient]} style={styles.ring}>
          <View style={styles.avatarInner}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.placeholder}>
                <MaterialIcons name="person" size={52} color="#fff" />
              </View>
            )}
          </View>
        </LinearGradient>
        {onChangePhoto ? (
          <View style={styles.cameraBadge}>
            <MaterialIcons name="photo-camera" size={16} color="#fff" />
          </View>
        ) : null}
      </Pressable>

      <Text style={styles.name}>{name}</Text>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <MaterialIcons name="language" size={14} color={BrandColors.orange} />
          <Text style={styles.badgeTxt}>
            {lang?.nativeLabel ?? locale.toUpperCase()}
          </Text>
        </View>
        <View style={styles.badge}>
          <MaterialIcons name="local-fire-department" size={14} color={BrandColors.pink} />
          <Text style={styles.badgeTxt}>
            {t('profile.streakDays', { count: streak })}
          </Text>
        </View>
      </View>

      <Text style={styles.bio}>{bio || t('profile.bioDefault')}</Text>
      <Text style={styles.joined}>{t('profile.joined', { date: formatJoinDate(joinDate) })}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 20 },
  avatarOuter: { marginBottom: 16 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  glow: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    left: -8,
    top: -8,
    backgroundColor: 'rgba(255, 122, 0, 0.2)',
    shadowColor: BrandColors.purple,
    shadowOpacity: 0.45,
    shadowRadius: 24,
  },
  ring: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 53,
    overflow: 'hidden',
    backgroundColor: '#0F0F12',
  },
  photo: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F12',
  },
  name: {
    fontSize: 26,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    letterSpacing: -0.4,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
  },
  badgeTxt: {
    fontSize: 12,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
  },
  bio: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  joined: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.textMuted,
  },
});
