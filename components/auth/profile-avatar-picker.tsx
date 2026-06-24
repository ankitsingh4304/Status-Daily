import React from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  uri: string | null;
  onChange: (uri: string | null) => void;
  hint: string;
  size?: number;
};

export function ProfileAvatarPicker({ uri, onChange, hint, size = 128 }: Props) {
  const scale = useSharedValue(1);
  const dyn = sizeStyles(size);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pickImage = async (source: 'camera' | 'library') => {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow access to continue.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });

    if (!result.canceled && result.assets[0]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onChange(result.assets[0].uri);
    }
  };

  const openPicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take Photo', 'Choose from Gallery', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) pickImage('camera');
          if (index === 1) pickImage('library');
        }
      );
      return;
    }

    Alert.alert('Profile photo', 'Choose a source', [
      { text: 'Camera', onPress: () => pickImage('camera') },
      { text: 'Gallery', onPress: () => pickImage('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <AnimatedPressable
        onPress={openPicker}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 16, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        }}
        style={[styles.press, animatedStyle]}
        accessibilityRole="button"
        accessibilityLabel={hint}
      >
        <View style={dyn.glow} />
        <LinearGradient
          colors={['#E8DEFF', '#FFD0E0', '#FFE8D6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dyn.ring}
        >
          <LinearGradient
            colors={[...BrandColors.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={dyn.innerRing}
          >
            <View style={dyn.avatar}>
              {uri ? (
                <Animated.Image entering={FadeIn.duration(300)} source={{ uri }} style={dyn.image} />
              ) : (
                <View style={styles.placeholder}>
                  <View style={styles.placeholderHead} />
                  <View style={styles.placeholderBody} />
                </View>
              )}
            </View>
          </LinearGradient>
        </LinearGradient>

        <View style={styles.badge}>
          <MaterialIcons name={uri ? 'edit' : 'photo-camera'} size={18} color="#fff" />
        </View>
      </AnimatedPressable>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const sizeStyles = (size: number) =>
  StyleSheet.create({
    glow: {
      position: 'absolute',
      width: size + 24,
      height: size + 24,
      borderRadius: (size + 24) / 2,
      backgroundColor: 'rgba(255, 122, 0, 0.15)',
      shadowColor: BrandColors.purple,
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 10,
    },
    ring: {
      width: size + 8,
      height: size + 8,
      borderRadius: (size + 8) / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    innerRing: {
      width: size + 4,
      height: size + 4,
      borderRadius: (size + 4) / 2,
      padding: 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: 'hidden',
      backgroundColor: '#F3F0FF',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    image: {
      width: size,
      height: size,
    },
  });

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  press: { alignItems: 'center', justifyContent: 'center' },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
    paddingBottom: 8,
  },
  placeholderHead: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 180, 140, 0.55)',
    marginBottom: 6,
  },
  placeholderBody: {
    width: 72,
    height: 36,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: 'rgba(255, 160, 120, 0.45)',
  },
  badge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  hint: {
    fontSize: 13,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
});
