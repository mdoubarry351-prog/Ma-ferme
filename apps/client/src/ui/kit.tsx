import React from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, TextProps, View, ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { color, font, radius } from '../lib/theme';

const EGG = 'M50 6C74 6 88 42 88 62C88 82 71 96 50 96C29 96 12 82 12 62C12 42 26 6 50 6Z';

export function LogoMark({ size = 32, reversed = false }: { size?: number; reversed?: boolean }) {
  const main = reversed ? color.shell : color.green;
  const line = reversed ? color.green : color.shell;
  const id = reversed ? 'eggR' : 'egg';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Logo Ma Ferme">
      <Defs>
        <ClipPath id={id}><Path d={EGG} /></ClipPath>
      </Defs>
      <Path d={EGG} fill={main} />
      <G clipPath={`url(#${id})`}>
        <Circle cx={50} cy={60} r={17} fill={color.sun} />
        <Rect x={0} y={60} width={100} height={40} fill={main} />
        <Path d="M4 72Q50 62 96 72" fill="none" stroke={line} strokeWidth={4.5} strokeLinecap="round" />
        <Path d="M4 84Q50 74 96 84" fill="none" stroke={line} strokeWidth={4.5} strokeLinecap="round" />
      </G>
    </Svg>
  );
}

export function Wordmark({ size = 23, light = false }: { size?: number; light?: boolean }) {
  return (
    <Text style={{ fontFamily: font.bold, fontSize: size, letterSpacing: -0.03 * size, color: light ? color.shell : color.ink }}>
      ma ferme
    </Text>
  );
}

type V = 'title' | 'h2' | 'body' | 'bodyBold' | 'small' | 'smallBold' | 'tiny' | 'big';
const variants: Record<V, object> = {
  big: { fontFamily: font.heavy, fontSize: 30, letterSpacing: -0.6, lineHeight: 34 },
  title: { fontFamily: font.heavy, fontSize: 26, letterSpacing: -0.5, lineHeight: 31 },
  h2: { fontFamily: font.heavy, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: font.medium, fontSize: 15, lineHeight: 21 },
  bodyBold: { fontFamily: font.heavy, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: font.medium, fontSize: 14, lineHeight: 19, color: color.muted },
  smallBold: { fontFamily: font.bold, fontSize: 14, lineHeight: 19 },
  tiny: { fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: color.muted },
};
export function T({ v = 'body', style, ...p }: TextProps & { v?: V }) {
  return <Text {...p} style={[{ color: color.ink }, variants[v], style]} />;
}

export function Screen({
  children, footer, scroll = true, padTop = true,
}: { children: React.ReactNode; footer?: React.ReactNode; scroll?: boolean; padTop?: boolean }) {
  const insets = useSafeAreaInsets();
  const body = (
    <View style={{ paddingHorizontal: 20, paddingTop: padTop ? insets.top + 16 : 0, paddingBottom: 24, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>{body}</ScrollView> : <View style={{ flex: 1 }}>{body}</View>}
      {footer ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: color.border, backgroundColor: color.shell }}>
          <View style={{ maxWidth: 560, width: '100%', alignSelf: 'center', gap: 8 }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

export function Button({
  label, onPress, disabled, loading, kind = 'primary', style,
}: { label: string; onPress?: () => void; disabled?: boolean; loading?: boolean; kind?: 'primary' | 'outline' | 'ghost'; style?: ViewStyle }) {
  const off = disabled || loading;
  const base: ViewStyle = { height: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16 };
  const look: ViewStyle =
    kind === 'primary'
      ? { backgroundColor: off ? color.disabled : color.green }
      : kind === 'outline'
        ? { borderWidth: 1.5, borderColor: off ? color.disabled : color.green, height: 48 }
        : { height: 48 };
  const txt = kind === 'primary' ? (off ? color.disabledText : '#FFFFFF') : off ? color.disabledText : color.greenDark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off }}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [base, look, pressed && !off ? { opacity: 0.85 } : null, style]}
    >
      {loading ? <ActivityIndicator color={kind === 'primary' ? '#FFFFFF' : color.green} /> : null}
      <Text style={{ fontFamily: font.heavy, fontSize: kind === 'primary' ? 17 : 15, color: txt }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style, selected }: { children: React.ReactNode; style?: ViewStyle; selected?: boolean }) {
  return (
    <View style={[{ backgroundColor: color.card, borderRadius: radius.card, borderWidth: selected ? 2 : 1, borderColor: selected ? color.green : color.border, padding: 16, gap: 10 }, style]}>
      {children}
    </View>
  );
}

export function Pill({ label, tone = 'ok' }: { label: string; tone?: 'ok' | 'wait' | 'bad' | 'neutral' }) {
  const t = {
    ok: [color.tint, color.greenDark],
    wait: [color.waitBg, color.waitText],
    bad: [color.dangerBg, color.danger],
    neutral: ['#EFECE3', color.muted],
  }[tone];
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: t[0], borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontFamily: font.heavy, fontSize: 12, color: t[1] }}>{label}</Text>
    </View>
  );
}

export function Banner({ title, body, tone = 'wait' }: { title: string; body?: string; tone?: 'wait' | 'bad' }) {
  return (
    <View style={{ backgroundColor: tone === 'wait' ? color.waitBg : color.dangerBg, borderRadius: 16, padding: 14, gap: 2 }}>
      <T v="bodyBold" style={{ color: tone === 'wait' ? color.waitText : color.danger }}>{title}</T>
      {body ? <T v="small" style={{ color: tone === 'wait' ? color.waitText : color.danger }}>{body}</T> : null}
    </View>
  );
}

export function BackHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: insets.top + 12, paddingBottom: 8, backgroundColor: color.shell }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color.card, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M15 5l-7 7 7 7" stroke={color.ink} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
      </Pressable>
      <View style={{ flex: 1 }}>
        {title ? <T v="h2" style={{ fontSize: 20 }}>{title}</T> : null}
        {subtitle ? <T v="small">{subtitle}</T> : null}
      </View>
    </View>
  );
}

export function Field({ label, hint, error, prefix, ...p }: TextInputProps & { label: string; hint?: string; error?: string | null; prefix?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <T v="smallBold">{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'stretch', borderWidth: 1.5, borderColor: error ? color.danger : color.border, borderRadius: 14, backgroundColor: color.card, overflow: 'hidden' }}>
        {prefix ? (
          <View style={{ paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#F2EFE6', borderRightWidth: 1, borderRightColor: color.border }}>
            <T v="bodyBold">{prefix}</T>
          </View>
        ) : null}
        <TextInput
          placeholderTextColor="#9A968C"
          {...p}
          style={[{ flex: 1, minHeight: 52, paddingHorizontal: 14, fontFamily: font.semibold, fontSize: 17, color: color.ink }, p.style]}
        />
      </View>
      {error ? <T v="small" style={{ color: color.danger }}>{error}</T> : hint ? <T v="tiny">{hint}</T> : null}
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.shell, padding: 40 }}>
      <ActivityIndicator color={color.green} size="large" />
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>;
}

export const s = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
});
