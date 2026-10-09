import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { messageFor } from '../lib/errors';
import { supabase } from '../lib/supabase';
import { color } from '../lib/theme';
import { Banner, Pill, Row, T } from './kit';

export type AddressRow = { id: string; label: string | null; commune: string | null; quartier: string | null; landmark: string | null; is_primary: boolean; shop_photo_path: string | null };

export function useAddresses(enabled: boolean) {
  const [list, setList] = useState<AddressRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    if (!enabled) return;
    const r = await supabase.from('addresses').select('id, label, commune, quartier, landmark, is_primary, shop_photo_path').order('is_primary', { ascending: false }).order('created_at');
    if (r.error) setError(messageFor(r.error));
    else { setError(null); setList(r.data as AddressRow[]); }
  }, [enabled]);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));
  return { list, error, reload };
}

export function AddressList({
  list, onPick, pickedId, reload,
}: { list: AddressRow[]; onPick?: (id: string) => void; pickedId?: string | null; reload: () => void }) {
  const [err, setErr] = useState<string | null>(null);
  const makePrimary = async (id: string) => {
    const r = await supabase.rpc('manage_my_address', { p_id: id, p_action: 'primary' });
    if (r.error) setErr(messageFor(r.error));
    else reload();
  };
  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: color.border, overflow: 'hidden' }}>
      {list.map((a) => {
        const picked = pickedId === a.id;
        return (
          <Pressable
            key={a.id}
            disabled={!onPick}
            onPress={() => onPick?.(a.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#EFECE3', backgroundColor: picked ? color.tint : '#FFFFFF' }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Row style={{ gap: 6 }}>
                <T v="bodyBold">{a.label || 'Ma boutique'}</T>
                {a.is_primary ? <Pill label="Principale" /> : null}
              </Row>
              <T v="small">
                {[a.quartier, a.commune].filter(Boolean).join(', ') || 'Quartier à préciser'}
                {a.shop_photo_path ? ' · photo ajoutée' : ''}
              </T>
            </View>
            {onPick ? null : (
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Pressable onPress={() => router.push({ pathname: '/adresse', params: { id: a.id } })} hitSlop={8}>
                  <T v="smallBold" style={{ color: color.green, textDecorationLine: 'underline' }}>Modifier</T>
                </Pressable>
                {!a.is_primary ? (
                  <Pressable onPress={() => makePrimary(a.id)} hitSlop={8}>
                    <T v="smallBold" style={{ color: color.green, textDecorationLine: 'underline' }}>Rendre principale</T>
                  </Pressable>
                ) : null}
              </View>
            )}
          </Pressable>
        );
      })}
      <Pressable onPress={() => router.push({ pathname: '/adresse', params: onPick ? { pick: '1' } : {} })} style={{ minHeight: 52, paddingHorizontal: 16, justifyContent: 'center' }}>
        <T v="bodyBold" style={{ color: color.green }}>+ Ajouter une adresse</T>
      </Pressable>
      {err ? <View style={{ padding: 12 }}><Banner tone="bad" title={err} /></View> : null}
    </View>
  );
}
