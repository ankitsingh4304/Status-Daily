import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BrandColors } from '@/constants/brand';

type Props = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function EditorCollapsible({ title, expanded, onToggle, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.header}
        onPress={() => {
          Haptics.selectionAsync();
          onToggle();
        }}
      >
        <MaterialIcons
          name={expanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
          size={22}
          color={BrandColors.orange}
        />
        <Text style={styles.title}>{title}</Text>
      </Pressable>
      {expanded ? (
        <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(160)} style={styles.body}>
          <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.bodyInner}>{children}</View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.surfaceBorder,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  title: {
    fontSize: 15,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.orange,
  },
  body: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.6)',
  },
  bodyInner: {
    padding: 16,
    paddingTop: 12,
  },
});
