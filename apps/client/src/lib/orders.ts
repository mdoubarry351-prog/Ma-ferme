import { supabase } from './supabase';

export type OrderRow = {
  id: string;
  order_number: number;
  status: string;
  total_gnf: number;
  payment_method: string;
  delivery_date: string | null;
  created_at: string;
  payment_due_at: string | null;
  address_snapshot: { commune?: string; quartier?: string; address_line?: string } | null;
  delivery_snapshot: { starts_at?: string } | null;
  order_items: { quantity: number }[];
  payments: { status: string; provider: string; amount_gnf: number }[];
};

export const ORDER_STATUS: Record<string, { label: string; tone: 'ok' | 'wait' | 'bad' | 'neutral' }> = {
  pending: { label: 'En attente', tone: 'wait' },
  confirmed: { label: 'Confirmée', tone: 'ok' },
  preparing: { label: 'En préparation', tone: 'ok' },
  ready: { label: 'Prête', tone: 'ok' },
  delivering: { label: 'En livraison', tone: 'ok' },
  delivered: { label: 'Livrée', tone: 'ok' },
  cancelled: { label: 'Annulée', tone: 'bad' },
};
export const PAYMENT_STATUS: Record<string, { label: string; tone: 'ok' | 'wait' | 'bad' | 'neutral' }> = {
  pending: { label: 'À payer', tone: 'wait' },
  processing: { label: 'En cours', tone: 'wait' },
  paid: { label: 'Payé', tone: 'ok' },
  failed: { label: 'Échoué', tone: 'bad' },
  refunded: { label: 'Remboursé', tone: 'neutral' },
};
export const METHOD_LABEL: Record<string, string> = { orange_money: 'Orange Money', mtn_momo: 'MTN MoMo' };

export const ORDER_SELECT =
  'id, order_number, status, total_gnf, payment_method, delivery_date, created_at, payment_due_at, address_snapshot, delivery_snapshot, order_items(quantity), payments(status, provider, amount_gnf)';

export async function fetchOrders() {
  return supabase.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false }).limit(50);
}
export async function fetchOrder(id: string) {
  return supabase.from('orders').select(ORDER_SELECT).eq('id', id).maybeSingle();
}
export const units = (o: OrderRow) => o.order_items.reduce((n, i) => n + i.quantity, 0);
export const payStatus = (o: OrderRow) => o.payments[0]?.status ?? 'pending';
export const orderNo = (o: OrderRow) => String(o.order_number).padStart(4, '0');
