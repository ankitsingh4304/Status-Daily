import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  BrandColors,
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
} from '@/constants/brand';

const AnimatedView = Animated.createAnimatedComponent(View);

type Country = (typeof COUNTRY_OPTIONS)[number];

type Props = {
  country: Country;
  onCountryChange: (c: Country) => void;
  value: string;
  onChangeText: (text: string) => void;
};

export function PhoneInputGroup({ country, onCountryChange, value, onChangeText }: Props) {
  const [focused, setFocused] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const focusProgress = useSharedValue(0);

  const onFocus = () => {
    setFocused(true);
    focusProgress.value = withTiming(1, { duration: 220 });
  };

  const onBlur = () => {
    setFocused(false);
    focusProgress.value = withTiming(0, { duration: 220 });
  };

  const rowGlow = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.6)', BrandColors.orange]
    ),
    shadowOpacity: 0.06 + focusProgress.value * 0.18,
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Mobile number</Text>

      <AnimatedView style={[styles.row, rowGlow]}>
        <BlurView intensity={48} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.rowInner}>
          <Pressable
            style={styles.countryChip}
            onPress={() => {
              Keyboard.dismiss();
              setPickerOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Country code ${country.code}`}
          >
            <Text style={styles.flag}>{country.flag}</Text>
            <Text style={styles.countryCode}>{country.code}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={BrandColors.textSecondary} />
          </Pressable>

          <View style={styles.divider} />

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(t) => onChangeText(t.replace(/\D/g, '').slice(0, 10))}
            placeholder="9876543210"
            placeholderTextColor={BrandColors.textMuted}
            keyboardType="phone-pad"
            maxLength={10}
            onFocus={onFocus}
            onBlur={onBlur}
            selectionColor={BrandColors.orange}
            accessibilityLabel="Phone number"
          />
        </View>
      </AnimatedView>

      {focused ? (
        <Text style={styles.hint}>We&apos;ll send a one-time code to verify you</Text>
      ) : null}

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select country</Text>
            <FlatList
              data={COUNTRY_OPTIONS}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.modalRow, item.code === country.code && styles.modalRowActive]}
                  onPress={() => {
                    onCountryChange(item);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalFlag}>{item.flag}</Text>
                  <Text style={styles.modalLabel}>{item.label}</Text>
                  <Text style={styles.modalCode}>{item.code}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  row: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: BrandColors.surface,
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 4,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: 6,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(15, 15, 18, 0.08)',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.text,
    paddingVertical: 14,
    paddingRight: 16,
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'NotoSans_400Regular',
    color: BrandColors.textMuted,
    marginLeft: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 18, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'NotoSans_700Bold',
    color: BrandColors.text,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 12,
  },
  modalRowActive: {
    backgroundColor: BrandColors.bgAccent,
  },
  modalFlag: { fontSize: 22 },
  modalLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NotoSans_500Medium',
    color: BrandColors.text,
  },
  modalCode: {
    fontSize: 15,
    fontFamily: 'NotoSans_600SemiBold',
    color: BrandColors.textSecondary,
  },
});
