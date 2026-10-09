import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const EGG = 'M50 6C74 6 88 42 88 62C88 82 71 96 50 96C29 96 12 82 12 62C12 42 26 6 50 6Z'

export function Logo({ size = 32, reversed = false }: { size?: number; reversed?: boolean }) {
  const main = reversed ? '#FBF6EC' : '#2E7148'
  const line = reversed ? '#215636' : '#FBF6EC'
  const id = reversed ? 'eggR' : 'egg'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Logo Ma Ferme">
      <defs><clipPath id={id}><path d={EGG} /></clipPath></defs>
      <path d={EGG} fill={main} />
      <g clipPath={`url(#${id})`}>
        <circle cx="50" cy="60" r="17" fill="#F4A62A" />
        <rect x="0" y="60" width="100" height="40" fill={main} />
        <path d="M4 72Q50 62 96 72" fill="none" stroke={line} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M4 84Q50 74 96 84" fill="none" stroke={line} strokeWidth="4.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function Top({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="top">
      <div><h1>{title}</h1>{sub ? <div className="sub">{sub}</div> : null}</div>
      <div style={{ marginLeft: 'auto' }} className="row">{children}</div>
    </header>
  )
}

export const ORDER_STATUS: Record<string, [string, string]> = {
  pending: ['En attente', 'wait'], confirmed: ['Confirmée', 'ok'], preparing: ['En préparation', 'ok'],
  ready: ['Prête', 'ok'], delivering: ['En livraison', 'ok'], delivered: ['Livrée', 'ok'], cancelled: ['Annulée', 'bad'],
}
export const PAY_STATUS: Record<string, [string, string]> = {
  pending: ['À payer', 'wait'], processing: ['Paiement en cours', 'wait'], paid: ['Payé', 'ok'], failed: ['Échoué', 'bad'], refunded: ['Remboursé', 'neutral'],
}
export const METHOD: Record<string, string> = { orange_money: 'Orange Money', mtn_momo: 'MTN MoMo' }

export function Pill({ map, value }: { map: Record<string, [string, string]>; value?: string | null }) {
  const [label, tone] = map[value ?? ''] ?? [value ?? '—', 'neutral']
  return <span className={`pill ${tone}`}>{label}</span>
}

// Badge « Ventes ouvertes / fermées » visible partout.
export function SalesBadge() {
  const [open, setOpen] = useState<boolean | null>(null)
  useEffect(() => {
    supabase.from('app_settings').select('orders_enabled, maintenance').eq('id', true).maybeSingle().then(({ data }) => setOpen(!!data?.orders_enabled && !data?.maintenance))
  }, [])
  if (open === null) return null
  return open
    ? <span className="pill ok">Ventes ouvertes</span>
    : <a href="#/reglages" className="pill wait" style={{ textDecoration: 'none' }}>Ventes fermées · Réglages</a>
}
