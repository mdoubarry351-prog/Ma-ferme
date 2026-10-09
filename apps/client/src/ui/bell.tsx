import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../lib/app-state';
import { useUnreadCount } from '../lib/notifications';
import { color, font } from '../lib/theme';

export function Bell() {
  const { session } = useApp();
  const n = useUnreadCount(!!session);
  if (!session) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={n ? `Notifications, ${n} non lues` : 'Notifications'}
      onPress={() => router.push('/notifications')}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <Path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
      </Svg>
      {n ? (
        <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: color.sun, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: color.shell }}>
          <Text style={{ fontFamily: font.heavy, fontSize: 11, color: color.greenDark }}>{n > 9 ? '9+' : n}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
