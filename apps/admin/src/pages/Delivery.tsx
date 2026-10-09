import { useCallback, useEffect, useState } from 'react'
import { addDays, dayLabel, errText, gnf, supabase, todayIso } from '../supabase'
import { SalesBadge, Top } from '../ui'

type Day = { delivery_date: string; capacity_orders: number; active: boolean; show_hours: boolean }
type Commune = { id: string; zone_id: string; name: string; fee_gnf: number; active: boolean }
type Driver = { id: string; name: string; phone: string | null; active: boolean }

export default function Delivery() {
  const today = todayIso()
  const [cityId, setCityId] = useState<string | null>(null)
  const [days, setDays] = useState<(Day & { used: number })[] | null>(null)
  const [communes, setCommunes] = useState<Commune[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    const c = await supabase.from('cities').select('id').eq('active', true).limit(1).maybeSingle()
    const city = c.data?.id ?? null
    setCityId(city)
    const [s, cal, co, dr] = await Promise.all([
      supabase.from('delivery_schedule_days').select('delivery_date, capacity_orders, active, show_hours').gte('delivery_date', today).lte('delivery_date', addDays(today, 13)).order('delivery_date'),
      supabase.rpc('control_calendar', { p_start: today, p_end: addDays(today, 13) }),
      supabase.from('delivery_communes').select('id, zone_id, name, fee_gnf, active').order('name'),
      supabase.from('delivery_drivers').select('id, name, phone, active').order('name'),
    ])
    if (s.error) return setError(errText(s.error))
    const used = new Map(((cal.data as { day: string; orders: number }[]) ?? []).map((x) => [x.day, x.orders]))
    setDays(((s.data as Day[]) ?? []).map((x) => ({ ...x, used: used.get(x.delivery_date) ?? 0 })))
    setCommunes((co.data as Commune[]) ?? [])
    setDrivers((dr.data as Driver[]) ?? [])
  }, [today])
  useEffect(() => { load() }, [load])

  const saveDay = async (d: Day, patch: Partial<Day>) => {
    if (!cityId) return
    const n = { ...d, ...patch }
    const r = await supabase.rpc('manage_delivery_day', { p_city_id: cityId, p_date: d.delivery_date, p_capacity: n.capacity_orders, p_active: n.active, p_show_hours: n.show_hours })
    if (r.error) setError(errText(r.error))
    else { setError(null); setMsg(`${dayLabel(d.delivery_date)} enregistré.`); load() }
  }
  const saveFee = async (c: Commune, fee: number) => {
    const r = await supabase.rpc('manage_locality', { p_kind: 'commune', p_id: c.id, p_parent: c.zone_id, p_name: c.name, p_fee: fee, p_active: c.active })
    if (r.error) setError(errText(r.error))
    else { setError(null); setMsg(`Frais de ${c.name} : ${gnf(fee)}.`); load() }
  }
  const addDriver = async (name: string, phone: string) => {
    const r = await supabase.rpc('control_write', { p_kind: 'driver', p_data: { name, phone } })
    if (r.error) setError(errText(r.error))
    else { setError(null); setMsg(`Livreur ${name} ajouté.`); load() }
  }

  return (
    <>
      <Top title="Livraison" sub="Jours, capacités, frais et livreurs"><SalesBadge /></Top>
      <main className="content">
        {error ? <div className="banner bad">{error}</div> : null}
        {msg ? <div className="banner ok">{msg}</div> : null}
        <section className="card">
          <h2>Jours de livraison · 2 semaines</h2>
          <p className="small muted" style={{ margin: 0 }}>Les clients ne voient que la semaine en cours et la suivante. Les jours sont créés automatiquement chaque nuit (lundi, jeudi, samedi).</p>
          {days === null ? <span className="muted">Chargement…</span> : days.length === 0 ? <span className="muted">Aucun jour programmé.</span> : (
            <div className="list">
              {days.map((d) => <DayRow key={d.delivery_date} d={d} onSave={saveDay} />)}
            </div>
          )}
        </section>
        <div className="cols">
          <section className="card">
            <h2>Frais de livraison par commune</h2>
            <p className="small muted" style={{ margin: 0 }}>Un frais défini sur un quartier remplace celui de sa commune.</p>
            <div className="list">{communes.map((c) => <FeeRow key={c.id} c={c} onSave={saveFee} />)}</div>
          </section>
          <section className="card">
            <h2>Livreurs</h2>
            <div className="list">
              {drivers.length === 0 ? <span className="muted small">Aucun livreur pour le moment.</span> : drivers.map((d) => (
                <div className="item" key={d.id}><strong style={{ flex: 1 }}>{d.name}</strong><span className="muted small">{d.phone ?? ''}</span>{!d.active ? <span className="pill neutral">Inactif</span> : null}</div>
              ))}
            </div>
            <AddDriver onAdd={addDriver} />
          </section>
        </div>
      </main>
    </>
  )
}

function DayRow({ d, onSave }: { d: Day & { used: number }; onSave: (d: Day, p: Partial<Day>) => void }) {
  const [cap, setCap] = useState(String(d.capacity_orders))
  const changed = Number(cap) !== d.capacity_orders
  return (
    <div className="item">
      <div style={{ flex: '1 1 180px' }}>
        <strong>{dayLabel(d.delivery_date)}</strong>
        <div className="small muted">{d.used} commande{d.used > 1 ? 's' : ''} prise{d.used > 1 ? 's' : ''}</div>
      </div>
      <label className="row small" style={{ gap: 6 }}>Capacité
        <input className="input" style={{ width: 80, height: 40 }} inputMode="numeric" value={cap} onChange={(e) => setCap(e.target.value.replace(/\D/g, '').slice(0, 4))} />
      </label>
      {changed ? <button className="btn" disabled={!Number(cap)} onClick={() => onSave(d, { capacity_orders: Number(cap) })}>Enregistrer</button> : null}
      <label className="row small" style={{ gap: 8 }}>
        <button className={`switch ${d.active ? 'on' : ''}`} role="switch" aria-checked={d.active} aria-label="Jour ouvert" onClick={() => onSave(d, { active: !d.active })} />
        {d.active ? 'Ouvert' : 'Fermé'}
      </label>
    </div>
  )
}

function FeeRow({ c, onSave }: { c: Commune; onSave: (c: Commune, fee: number) => void }) {
  const [fee, setFee] = useState(String(c.fee_gnf))
  const changed = Number(fee) !== Number(c.fee_gnf)
  return (
    <div className="item">
      <strong style={{ flex: '1 1 120px' }}>{c.name}{!c.active ? <span className="pill neutral" style={{ marginLeft: 8 }}>Inactive</span> : null}</strong>
      <input className="input" style={{ width: 120, height: 40 }} inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, '').slice(0, 7))} aria-label={`Frais ${c.name}`} />
      <span className="small muted">GNF</span>
      {changed ? <button className="btn" onClick={() => onSave(c, Number(fee))}>Enregistrer</button> : null}
    </div>
  )
}

function AddDriver({ onAdd }: { onAdd: (name: string, phone: string) => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  return (
    <div className="row">
      <input className="input" style={{ flex: '1 1 140px' }} placeholder="Nom du livreur" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="input" style={{ flex: '1 1 140px' }} placeholder="+224 6…" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button className="btn" disabled={name.trim().length < 2} onClick={() => { onAdd(name.trim(), phone.trim()); setName(''); setPhone('') }}>Ajouter</button>
    </div>
  )
}
