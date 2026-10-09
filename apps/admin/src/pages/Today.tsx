import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays, dayLabel, errText, gnf, supabase, todayIso } from '../supabase'
import { ORDER_STATUS, PAY_STATUS, Pill, SalesBadge, Top } from '../ui'
import type { Staff } from '../App'

type Dash = {
  current: { orders: number; revenue: number }
  today: { new: number; confirm: number; prepare: number; ready: number; deliver: number; delivering: number; payments: number; incidents: number }
  recent: { id: string; order_number: number; customer: string | null; total_gnf: number; status: string; delivery_date: string | null; quantity: number; payment_status: string | null }[]
}
type Day = { delivery_date: string; capacity_orders: number; active: boolean }

export default function Today({ staff }: { staff: Staff }) {
  const [dash, setDash] = useState<Dash | null>(null)
  const [days, setDays] = useState<(Day & { used: number })[]>([])
  const [error, setError] = useState<string | null>(null)
  const today = todayIso()

  useEffect(() => {
    (async () => {
      const d = await supabase.rpc('control_dashboard', { p_start: today, p_end: today })
      if (d.error) return setError(errText(d.error))
      setDash(d.data as Dash)
      const [sched, cal] = await Promise.all([
        supabase.from('delivery_schedule_days').select('delivery_date, capacity_orders, active').gte('delivery_date', today).lte('delivery_date', addDays(today, 13)).eq('active', true).order('delivery_date').limit(6),
        supabase.rpc('control_calendar', { p_start: today, p_end: addDays(today, 13) }),
      ])
      const used = new Map(((cal.data as { day: string; orders: number }[]) ?? []).map((x) => [x.day, x.orders]))
      setDays(((sched.data as Day[]) ?? []).map((x) => ({ ...x, used: used.get(x.delivery_date) ?? 0 })))
    })()
  }, [today])

  const t = dash?.today
  const todo = t
    ? [
        t.confirm ? { n: t.confirm, title: `${t.confirm} commande${t.confirm > 1 ? 's' : ''} à confirmer`, to: '/commandes?status=pending', action: 'Voir', color: '#C2410C' } : null,
        t.payments ? { n: t.payments, title: `${t.payments} paiement${t.payments > 1 ? 's' : ''} en attente`, to: '/commandes?status=pending', action: 'Vérifier', color: '#D97706' } : null,
        t.prepare ? { n: t.prepare, title: `${t.prepare} commande${t.prepare > 1 ? 's' : ''} à préparer aujourd’hui`, to: '/commandes?status=confirmed', action: 'Préparer', color: '#D97706' } : null,
        t.incidents ? { n: t.incidents, title: `${t.incidents} incident${t.incidents > 1 ? 's' : ''} ouvert${t.incidents > 1 ? 's' : ''}`, to: '/commandes', action: 'Voir', color: '#C2410C' } : null,
      ].filter(Boolean) as { title: string; to: string; action: string; color: string }[]
    : []

  return (
    <>
      <Top title="Aujourd’hui" sub={dayLabel(today)}><SalesBadge /></Top>
      <main className="content">
        {error ? <div className="banner bad">{error}</div> : null}
        {!dash && !error ? <div className="muted">Chargement…</div> : null}
        {dash && t ? (
          <>
            <div className="grid">
              <div className="card kpi"><span className="label">Commandes du jour</span><span className="value">{t.new}</span></div>
              <div className="card kpi"><span className="label">À confirmer</span><span className="value" style={{ color: t.confirm ? '#9A3412' : undefined }}>{t.confirm}</span></div>
              <div className="card kpi"><span className="label">Encaissé aujourd’hui</span><span className="value" style={{ fontSize: 24 }}>{gnf(dash.current.revenue)}</span></div>
              <div className="card kpi"><span className="label">À livrer aujourd’hui</span><span className="value">{t.deliver}</span></div>
            </div>
            <div className="cols">
              <section className="card" style={{ flexGrow: 3 }}>
                <h2>À traiter maintenant</h2>
                {todo.length === 0 ? <p className="muted" style={{ margin: 0 }}>Rien d’urgent. Tout est à jour.</p> : (
                  <div className="list">
                    {todo.map((x) => (
                      <div className="item" key={x.title}>
                        <span className="dot" style={{ background: x.color }} />
                        <span style={{ flex: '1 1 200px', fontWeight: 700 }}>{x.title}</span>
                        <Link className="btn" to={x.to} style={{ textDecoration: 'none' }}>{x.action}</Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section className="card" style={{ flexGrow: 2 }}>
                <div className="between"><h2>Prochaines livraisons</h2><Link to="/livraison" className="small" style={{ fontWeight: 700 }}>Régler les jours</Link></div>
                {days.length === 0 ? <p className="muted" style={{ margin: 0 }}>Aucun jour de livraison ouvert dans les 2 semaines.</p> : days.map((d) => (
                  <div key={d.delivery_date} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="between small"><strong>{dayLabel(d.delivery_date)}</strong><span className="muted" style={{ fontWeight: 600 }}>{d.used} / {d.capacity_orders} commandes</span></div>
                    <div className="bar"><div style={{ width: `${Math.min(100, Math.round((d.used / d.capacity_orders) * 100))}%` }} /></div>
                  </div>
                ))}
              </section>
            </div>
            <section className="card">
              <div className="between"><h2>Dernières commandes</h2><Link to="/commandes" className="small" style={{ fontWeight: 700 }}>Tout voir</Link></div>
              {dash.recent.length === 0 ? <p className="muted" style={{ margin: 0 }}>Aucune commande pour le moment{staff.isOwner ? ' — les ventes sont encore fermées.' : '.'}</p> : (
                <div className="list">
                  {dash.recent.map((o) => (
                    <div className="item" key={o.id}>
                      <strong style={{ width: 64 }}>N° {String(o.order_number).padStart(4, '0')}</strong>
                      <span style={{ flex: '1 1 160px' }}>{o.customer ?? '—'} · {o.quantity} alv. · {o.delivery_date ? dayLabel(o.delivery_date) : '—'}</span>
                      <Pill map={ORDER_STATUS} value={o.status} />
                      <Pill map={PAY_STATUS} value={o.payment_status} />
                      <strong>{gnf(o.total_gnf)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </>
  )
}
