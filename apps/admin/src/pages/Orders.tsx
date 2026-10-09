import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dayLabel, errText, gnf, supabase } from '../supabase'
import { METHOD, ORDER_STATUS, PAY_STATUS, Pill, SalesBadge, Top } from '../ui'

type Row = { id: string; number: number; created_at: string; customer: string | null; phone: string | null; address: string | null; zone: string | null; quantity: number; total: number; payment: string | null; method: string; date: string | null; status: string; driver: string }
type Driver = { id: string; name: string; phone: string | null }

const TABS: [string, string][] = [['', 'Toutes'], ['pending', 'À confirmer'], ['confirmed', 'Confirmées'], ['preparing', 'En préparation'], ['ready', 'Prêtes'], ['delivering', 'En livraison'], ['delivered', 'Livrées'], ['cancelled', 'Annulées']]
const NEXT: Record<string, [string, string][]> = {
  pending: [['confirmed', 'Confirmer'], ['cancelled', 'Annuler']],
  confirmed: [['preparing', 'Passer en préparation'], ['cancelled', 'Annuler']],
  preparing: [['ready', 'Marquer prête']],
  ready: [['delivering', 'Partir en livraison']],
  delivering: [['delivered', 'Marquer livrée']],
}

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ count: number; rows: Row[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<Row | null>(null)

  const load = useCallback(async () => {
    const r = await supabase.rpc('control_orders', { p_filter: { status, q: q.trim(), page } })
    if (r.error) setError(errText(r.error))
    else { setError(null); setData(r.data as { count: number; rows: Row[] }) }
  }, [status, q, page])
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [load])

  return (
    <>
      <Top title="Commandes" sub={data ? `${data.count} commande${data.count > 1 ? 's' : ''}` : undefined}><SalesBadge /></Top>
      <main className="content">
        <div className="tabs" role="tablist">
          {TABS.map(([v, l]) => (
            <button key={v} role="tab" aria-selected={status === v} className={status === v ? 'on' : ''} onClick={() => { setPage(1); setParams(v ? { status: v } : {}) }}>{l}</button>
          ))}
        </div>
        <input className="input" placeholder="Rechercher : n° de commande, nom ou téléphone" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
        {error ? <div className="banner bad">{error}</div> : null}
        {data && data.rows.length === 0 ? <div className="card muted">Aucune commande{status ? ' avec ce statut' : ''}.</div> : null}
        {data && data.rows.length > 0 ? (
          <>
            <div className="card only-desk" style={{ padding: 8 }}>
              <table className="t">
                <thead><tr><th>N°</th><th>Client</th><th>Livraison</th><th>Qté</th><th>Total</th><th>Commande</th><th>Paiement</th></tr></thead>
                <tbody>
                  {data.rows.map((o) => (
                    <tr key={o.id} className="click" onClick={() => setOpen(o)}>
                      <td><strong>{String(o.number).padStart(4, '0')}</strong></td>
                      <td>{o.customer ?? '—'}<div className="small muted">{o.address ?? ''}</div></td>
                      <td>{o.date ? dayLabel(o.date) : '—'}</td>
                      <td>{o.quantity}</td>
                      <td><strong>{gnf(o.total)}</strong></td>
                      <td><Pill map={ORDER_STATUS} value={o.status} /></td>
                      <td><Pill map={PAY_STATUS} value={o.payment} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="only-mobile" style={{ flexDirection: 'column', gap: 10 }}>
              {data.rows.map((o) => (
                <button key={o.id} className="card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setOpen(o)}>
                  <div className="between"><strong>N° {String(o.number).padStart(4, '0')} · {o.customer ?? '—'}</strong><strong>{gnf(o.total)}</strong></div>
                  <div className="small muted">{o.quantity} alvéoles · {o.date ? dayLabel(o.date) : '—'} · {o.address ?? ''}</div>
                  <div className="row"><Pill map={ORDER_STATUS} value={o.status} /><Pill map={PAY_STATUS} value={o.payment} /></div>
                </button>
              ))}
            </div>
            {data.count > 25 ? (
              <div className="row">
                <button className="btn outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédentes</button>
                <span className="muted small">Page {page} / {Math.ceil(data.count / 25)}</span>
                <button className="btn outline" disabled={page * 25 >= data.count} onClick={() => setPage(page + 1)}>Suivantes</button>
              </div>
            ) : null}
          </>
        ) : null}
      </main>
      {open ? <Detail row={open} onClose={() => setOpen(null)} onChanged={() => { setOpen(null); load() }} /> : null}
    </>
  )
}

function Detail({ row, onClose, onChanged }: { row: Row; onClose: () => void; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [driver, setDriver] = useState('')

  useEffect(() => {
    supabase.from('delivery_drivers').select('id, name, phone').eq('active', true).order('name').then(({ data }) => setDrivers((data as Driver[]) ?? []))
  }, [])

  const change = async (to: string, label: string) => {
    if (to === 'cancelled' && !window.confirm(`Annuler la commande n° ${row.number} ?`)) return
    setBusy(to)
    setError(null)
    const r = await supabase.rpc('change_order_status', { p_order_id: row.id, p_status: to })
    setBusy(null)
    if (r.error) setError(errText(r.error))
    else onChanged()
    void label
  }
  const assign = async () => {
    if (!driver) return
    setBusy('assign')
    const r = await supabase.rpc('control_write', { p_kind: 'assign', p_data: { order_id: row.id, driver_id: driver } })
    setBusy(null)
    if (r.error) setError(errText(r.error))
    else onChanged()
  }

  return (
    <div className="drawer-bg" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-label={`Commande ${row.number}`} onClick={(e) => e.stopPropagation()}>
        <div className="between"><h1>N° {String(row.number).padStart(4, '0')}</h1><button className="btn outline" onClick={onClose}>Fermer</button></div>
        <div className="row"><Pill map={ORDER_STATUS} value={row.status} /><Pill map={PAY_STATUS} value={row.payment} /></div>
        <div className="card">
          <div className="between"><span className="muted">Client</span><strong>{row.customer ?? '—'}</strong></div>
          <div className="between"><span className="muted">Téléphone</span>{row.phone ? <a href={`tel:${row.phone}`}><strong>{row.phone}</strong></a> : '—'}</div>
          <div className="between"><span className="muted">Adresse</span><strong style={{ textAlign: 'right' }}>{row.address ?? '—'}</strong></div>
          <div className="between"><span className="muted">Livraison</span><strong>{row.date ? dayLabel(row.date) : '—'}</strong></div>
          <div className="between"><span className="muted">Quantité</span><strong>{row.quantity} alvéoles</strong></div>
          <div className="between"><span className="muted">Total</span><strong>{gnf(row.total)}</strong></div>
          <div className="between"><span className="muted">Paiement</span><strong>{METHOD[row.method] ?? row.method}</strong></div>
          <div className="between"><span className="muted">Livreur</span><strong>{row.driver}</strong></div>
        </div>
        {['pending', 'confirmed', 'preparing', 'ready'].includes(row.status) ? (
          <div className="card">
            <h2>Livreur</h2>
            {drivers.length === 0 ? <p className="muted small" style={{ margin: 0 }}>Aucun livreur enregistré. Ajoute-les dans Livraison.</p> : (
              <div className="row">
                <select className="input" style={{ flex: 1 }} value={driver} onChange={(e) => setDriver(e.target.value)}>
                  <option value="">Choisir un livreur</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button className="btn" disabled={!driver || busy === 'assign'} onClick={assign}>Assigner</button>
              </div>
            )}
          </div>
        ) : null}
        {NEXT[row.status] ? (
          <div className="card">
            <h2>Étape suivante</h2>
            {NEXT[row.status].map(([to, label]) => (
              <button key={to} className={`btn big ${to === 'cancelled' ? 'danger' : ''}`} disabled={!!busy} onClick={() => change(to, label)}>{busy === to ? '…' : label}</button>
            ))}
            {row.status === 'pending' && row.payment !== 'paid' ? <p className="small muted" style={{ margin: 0 }}>La confirmation n’est possible qu’une fois le paiement reçu.</p> : null}
          </div>
        ) : null}
        {error ? <div className="banner bad">{error}</div> : null}
      </aside>
    </div>
  )
}
