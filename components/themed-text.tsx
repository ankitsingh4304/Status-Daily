import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 21,
  },
  defaultSemiBold: {
    fontFamily: Fonts.subheading,
    fontSize: 15,
    lineHeight: 21,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.subheading,
    fontSize: 20,
    letterSpacing: 0.2,
  },
  link: {
    fontFamily: Fonts.medium,
    lineHeight: 30,
    fontSize: 15,
    color: '#0a7ea4',
  },
});
