import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';

type Action = {
  key: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  gradient?: boolean;
  danger?: boolean;
  onPress: () => void;
};

type Props = {
  onEditProfile: () => void;
  onChangeLanguage: () => void;
  onCustomizeTheme: () => void;
  onPrivacy: () => void;
  onShareProfile: () => void;
  onLogout: () => void;
  /** Rendered between the "Share profile" row and the "Logout" row. */
  beforeLogout?: React.ReactNode;
};

export function ProfileActions({
  onEditProfile,
  onChangeLanguage,
  onCustomizeTheme,
  onPrivacy,
  onShareProfile,
  onLogout,
  beforeLogout,
}: Props) {
  const { t } = useTranslation();

  const actions: Action[] = [
    { key: 'edit', icon: 'edit', label: t('profile.actions.editProfile'), gradient: true, onPress: onEditProfile },
    { key: 'lang', icon: 'language', label: t('profile.actions.changeLanguage'), onPress: onChangeLanguage },
    { key: 'theme', icon: 'palette', label: t('profile.actions.customizeTheme'), onPress: onCustomizeTheme },
    { key: 'privacy', icon: 'lock-outline', label: t('profile.actions.privacy'), onPress: onPrivacy },
    { key: 'share', icon: 'share', label: t('profile.actions.shareProfile'), onPress: onShareProfile },
    { key: 'logout', icon: 'logout', label: t('profile.actions.logout'), danger: true, onPress: onLogout },
  ];

  const renderRow = (a: Action) => (
    <Pressable
      key={a.key}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        a.onPress();
      }}
    >
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      {a.gradient ? (
        <LinearGradient colors={[...BrandColors.gradient]} style={styles.iconGrad}>
          <MaterialIcons name={a.icon} size={20} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={[styles.icon, a.danger && styles.iconDanger]}>
          <MaterialIcons name={a.icon} size={20} color={a.danger ? '#EF4444' : BrandColors.text} />
        </View>
      )}
      <Text style={[styles.label, a.danger && styles.labelDanger]}>{a.label}</Text>
      <MaterialIcons name="chevron-right" size={20} color={BrandColors.textMuted} />
    </Pressable>
  );

  const logout = actions[actions.length - 1];
  const rest = actions.slice(0, -1);

  return (
    <View style={styles.wrap}>
      {rest.map(renderRow)}
      {beforeLogout}
      {renderRow(logout)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 8, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  rowPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  iconGrad: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15,15,18,0.06)',
  },
  iconDanger: { backgroundColor: 'rgba(239,68,68,0.08)' },
  label: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.text,
  },
  labelDanger: { color: '#EF4444' },
});
