import React, { useState } from 'react';

import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { LinearGradient } from 'expo-linear-gradient';

import { useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Animated, { FadeIn } from 'react-native-reanimated';



import { FloatingOrbs } from '@/components/auth/floating-orbs';

import { AppTabBar } from '@/components/navigation/app-tab-bar';

import { ProfileActions } from '@/components/profile/profile-actions';

import { ProfileEditModal } from '@/components/profile/profile-edit-modal';

import { ProfileHeader } from '@/components/profile/profile-header';

import { ProfileLanguageModal } from '@/components/profile/profile-language-modal';

import { ProfileSubscriptionCard } from '@/components/profile/profile-subscription-card';

import { ProfileThemeModal } from '@/components/profile/profile-theme-modal';

import { getProfileScreenColors } from '@/constants/profile-themes';

import { BrandColors } from '@/constants/brand';

import type { AppTheme } from '@/types/profile';

import type { LocaleCode } from '@/locales/types';

import { useLocale, useTranslation } from '@/context/locale-context';

import * as Haptics from 'expo-haptics';

import { pickSquarePhoto } from '@/utils/pick-photo';



export default function ProfileTabScreen() {

  const router = useRouter();

  const insets = useSafeAreaInsets();

  const { t } = useTranslation();

  const {

    userName,

    profilePhotoUri,

    locale,

    bio,

    theme,

    joinDate,

    stats,

    updateProfile,

    setLocale,

    signOut,

  } = useLocale();



  const [editOpen, setEditOpen] = useState(false);

  const [languageOpen, setLanguageOpen] = useState(false);

  const [themeOpen, setThemeOpen] = useState(false);



  const screenColors = getProfileScreenColors(theme);



  const handleSaveProfile = async (data: { name: string; bio: string; photoUri: string | null }) => {

    await updateProfile({

      name: data.name,

      bio: data.bio,

      photoUri: data.photoUri,

    });

    setEditOpen(false);

  };

  const handleChangePhoto = async () => {

    const uri = await pickSquarePhoto();

    if (uri) {

      await updateProfile({ photoUri: uri });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    }

  };



  const handleSaveLanguage = async (nextLocale: LocaleCode) => {

    await updateProfile({ locale: nextLocale });

    await setLocale(nextLocale);

    setLanguageOpen(false);

  };



  const handleSaveTheme = async (nextTheme: AppTheme) => {

    await updateProfile({ theme: nextTheme });

    setThemeOpen(false);

  };



  const handleShareProfile = async () => {
    const name = userName?.trim();
    const intro = name ? `${name} is on Status Daily.` : 'I\'m on Status Daily.';
    try {
      await Share.share({
        message: `${intro} Create and share personalized WhatsApp statuses in seconds — download Status Daily: https://statusdaily.app`,
      });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  const handleLogout = () => {

    Alert.alert(t('profile.logoutTitle'), t('profile.logoutConfirm'), [

      { text: t('profile.edit.cancel'), style: 'cancel' },

      {

        text: t('profile.actions.logout'),

        style: 'destructive',

        onPress: async () => {

          await signOut();

          router.replace('/');

        },

      },

    ]);

  };



  return (

    <View style={styles.root}>

      <LinearGradient colors={screenColors.gradient} style={StyleSheet.absoluteFill} />

      {theme === 'light' || theme === 'gradient' ? <FloatingOrbs /> : null}

      <Pressable
        style={[styles.settingsBtn, { top: insets.top + 8 }]}
        onPress={() => router.push('/settings')}
        hitSlop={10}
      >
        <MaterialIcons
          name="settings"
          size={24}
          color={screenColors.isDark ? '#fff' : BrandColors.text}
        />
      </Pressable>



      <ScrollView

        showsVerticalScrollIndicator={false}

        contentContainerStyle={[

          styles.scroll,

          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120 },

        ]}

      >

        <Animated.View entering={FadeIn.duration(400)}>

          <Text style={[styles.screenTitle, screenColors.isDark && styles.screenTitleDark]}>

            {t('profile.title')}

          </Text>

        </Animated.View>



        <ProfileHeader

          name={userName ?? t('tabs.profile')}

          photoUri={profilePhotoUri}

          bio={bio}

          locale={locale}

          joinDate={joinDate}

          streak={stats.streak}

          onChangePhoto={handleChangePhoto}

        />



        <ProfileActions

          onEditProfile={() => setEditOpen(true)}

          onChangeLanguage={() => setLanguageOpen(true)}

          onCustomizeTheme={() => setThemeOpen(true)}

          onPrivacy={() => router.push('/settings')}

          onShareProfile={handleShareProfile}

          onLogout={handleLogout}

          beforeLogout={<ProfileSubscriptionCard />}

        />

      </ScrollView>



      <AppTabBar active="profile" />



      <ProfileEditModal

        visible={editOpen}

        name={userName ?? ''}

        bio={bio}

        photoUri={profilePhotoUri}

        onClose={() => setEditOpen(false)}

        onSave={handleSaveProfile}

      />



      <ProfileLanguageModal

        visible={languageOpen}

        locale={locale}

        onClose={() => setLanguageOpen(false)}

        onSave={handleSaveLanguage}

      />



      <ProfileThemeModal

        visible={themeOpen}

        theme={theme}

        onClose={() => setThemeOpen(false)}

        onSave={handleSaveTheme}

      />

    </View>

  );

}



const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: BrandColors.bg },

  settingsBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flexGrow: 1 },

  screenTitle: {

    fontSize: 18,

    fontFamily: 'NotoSans_700Bold',

    color: BrandColors.textSecondary,

    textAlign: 'center',

    marginBottom: 4,

  },

  screenTitleDark: { color: 'rgba(255,255,255,0.65)' },

});


