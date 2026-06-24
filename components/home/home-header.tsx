import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '@/constants/brand';
import { useLocale, useTranslation } from '@/context/locale-context';

export function HomeHeader() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profilePhotoUri } = useLocale();
  const router = useRouter();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.left}>
        <LinearGradient
          colors={[...BrandColors.gradient]}
          style={styles.logoBadge}
        >
          <MaterialIcons name="auto-awesome" size={18} color="#fff" />
        </LinearGradient>
        <Text style={styles.title}>{t('common.appName')}</Text>
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        style={styles.avatarPress}
        accessibilityRole="button"
        accessibilityLabel={t('tabs.profile')}
      >
        <View style={styles.avatarRing}>
          {profilePhotoUri ? (
            <Image source={{ uri: profilePhotoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={22} color="#fff" />
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    letterSpacing: -0.2,
  },
  avatarPress: {
    padding: 2,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: BrandColors.purple,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#1A1A22',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
