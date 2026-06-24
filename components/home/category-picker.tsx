import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import {
  ALL_CATEGORIES,
  CATEGORY_ICONS,
  categoryTranslationKey,
  type CategoryId,
} from '@/constants/status-categories';
import { BrandColors } from '@/constants/brand';
import { useTranslation } from '@/context/locale-context';

type Props = {
  visible: boolean;
  active: CategoryId;
  onClose: () => void;
  onSelect: (id: CategoryId) => void;
};

export function CategoryPicker({ visible, active, onClose, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('home.allCategories')}</Text>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
            <MaterialIcons name="close" size={22} color={BrandColors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {ALL_CATEGORIES.map((id) => {
            const isActive = id === active;
            const inner = (
              <View style={styles.tileInner}>
                <Text style={styles.tileIcon}>{CATEGORY_ICONS[id]}</Text>
                <Text style={[styles.tileLabel, isActive && styles.tileLabelActive]} numberOfLines={1}>
                  {t(categoryTranslationKey(id))}
                </Text>
              </View>
            );
            return (
              <Pressable
                key={id}
                style={styles.tile}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelect(id);
                  onClose();
                }}
              >
                {isActive ? (
                  <LinearGradient
                    colors={[...BrandColors.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tileBg}
                  >
                    {inner}
                  </LinearGradient>
                ) : (
                  <View style={[styles.tileBg, styles.tileBgIdle]}>{inner}</View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 10,
    maxHeight: '72%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: { fontSize: 18, fontFamily: 'NotoSans_700Bold', color: BrandColors.text },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BrandColors.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 8 },
  tile: { width: '31%' },
  tileBg: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tileBgIdle: {
    backgroundColor: BrandColors.bgAccent,
    borderColor: BrandColors.surfaceBorder,
  },
  tileInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  tileIcon: { fontSize: 24 },
  tileLabel: {
    fontSize: 12.5,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  tileLabelActive: { color: '#fff', fontFamily: 'NotoSans_700Bold' },
});
