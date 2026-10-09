import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { color, font } from '../../src/lib/theme';

const icons: Record<string, (c: string) => React.ReactNode> = {
  index: (c) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 9h14l-1.2 11a1 1 0 0 1-1 1H7.2a1 1 0 0 1-1-1z" /><Path d="M9 9V7a3 3 0 0 1 6 0v2" />
    </Svg>
  ),
  commandes: (c) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><Path d="M9 8h6M9 12h6" />
    </Svg>
  ),
  profil: (c) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8} r={4} /><Path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </Svg>
  ),
};
const labels: Record<string, string> = { index: 'Commander', commandes: 'Commandes', profil: 'Profil' };

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.shell } }}
      tabBar={({ state, navigation }) => (
        <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 12), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: color.border }}>
          {state.routes.map((r, i) => {
            const on = state.index === i;
            const c = on ? color.greenDark : color.muted;
            return (
              <Pressable
                key={r.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => navigation.navigate(r.name as never)}
                style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 8, borderRadius: 14, backgroundColor: on ? color.tint : 'transparent' }}
              >
                {icons[r.name]?.(c)}
                <Text style={{ fontFamily: on ? font.heavy : font.bold, fontSize: 12, color: c }}>{labels[r.name] ?? r.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="commandes" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
