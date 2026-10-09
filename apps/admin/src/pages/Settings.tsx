import { useCallback, useEffect, useState } from 'react'
import { errText, gnf, supabase } from '../supabase'
import { SalesBadge, Top } from '../ui'
import type { Staff } from '../App'

type AppSettings = { orders_enabled: boolean; maintenance: boolean; minimum_order_units: number }
type Company = { name: string; support_email: string | null; support_phone: string | null; address: string | null }
type Offer = { id: string; price_gnf: number; name: string }
type Rule = { free_from_quantity: number | null }

export default function Settings({ staff }: { staff: Staff }) {
  const [cfg, setCfg] = useState<AppSettings | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [offer, setOffer] = useState<Offer | null>(null)
  const [rule, setRule] = useState<Rule | null>(null)
  const [methods, setMethods] = useState<{ code: string; label: string; enabled: boolean }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [a, c, o, r, m] = await Promise.all([
      supabase.from('app_settings').select('orders_enabled, maintenance, minimum_order_units').eq('id', true).maybeSingle(),
      supabase.from('company_settings').select('name, support_email, support_phone, address').limit(1).maybeSingle(),
      supabase.from('city_offers').select('id, price_gnf, product_variants!inner(products!inner(name))').eq('active', true).limit(1).maybeSingle(),
      supabase.from('city_delivery_rules').select('free_from_quantity').limit(1).maybeSingle(),
      supabase.from('payment_methods').select('code, label, enabled').order('code'),
    ])
    setCfg(a.data as AppSettings)
    setCompany(c.data as Company)
    const od = o.data as { id: string; price_gnf: number; product_variants: { products: { name: string } } } | null
    setOffer(od ? { id: od.id, price_gnf: Number(od.price_gnf), name: od.product_variants.products.name } : null)
    setRule(r.data as Rule)
    setMethods((m.data as typeof methods) ?? [])
  }, [])
  useEffect(() => { load() }, [load])

  const paymentReady = methods.some((m) => m.enabled)

  const toggleSales = async () => {
    if (!cfg) return
    const next = !cfg.orders_enabled
    const text = next
      ? 'Ouvrir les ventes ? Les clients pourront commander et payer immédiatement.'
      : 'Fermer les ventes ? Les clients verront « Ouverture prochaine » et ne pourront plus commander.'
    if (!window.confirm(text)) return
    const r = await supabase.from('app_settings').update({ orders_enabled: next }).eq('id', true).select('orders_enabled')
    if (r.error || !r.data?.length) return setError(r.error ? errText(r.error) : 'Seul le propriétaire peut changer ce réglage.')
    setMsg(next ? 'Ventes ouvertes.' : 'Ventes fermées.')
    load()
  }

  return (
    <>
      <Top title="Réglages" sub="Ventes, prix et contact"><SalesBadge /></Top>
      <main className="content">
        {error ? <div className="banner bad">{error}</div> : null}
        {msg ? <div className="banner ok">{msg}</div> : null}
        {cfg ? (
          <section className="card">
            <div className="between">
              <div>
                <h2>Ouverture des ventes</h2>
                <p className="small muted" style={{ margin: '4px 0 0' }}>
                  {cfg.orders_enabled ? 'Les clients peuvent commander.' : 'Fermé : les clients voient « Ouverture prochaine ». Le serveur refuse toute commande.'}
                </p>
              </div>
              <button className={`switch ${cfg.orders_enabled ? 'on' : ''}`} role="switch" aria-checked={cfg.orders_enabled} aria-label="Ventes ouvertes" disabled={!staff.isOwner} onClick={toggleSales} />
            </div>
            {!staff.isOwner ? <div className="banner wait">Seul le propriétaire peut ouvrir ou fermer les ventes.</div> : null}
            {!cfg.orders_enabled && !paymentReady ? <div className="banner wait">Paiement mobile pas encore activé (comptes marchands MTN / Orange en attente) : même ouvertes, les commandes ne pourront pas être payées.</div> : null}
          </section>
        ) : null}
        <div className="cols">
          {offer ? <PriceCard offer={offer} onSaved={(p) => { setMsg(`Nouveau prix : ${gnf(p)} l’alvéole.`); load() }} onError={setError} /> : null}
          <section className="card">
            <h2>Règles de commande</h2>
            <div className="between"><span className="muted">Minimum par commande</span><strong>{cfg?.minimum_order_units ?? '—'} alvéoles</strong></div>
            <div className="between"><span className="muted">Livraison gratuite</span><strong>{rule?.free_from_quantity ? `dès ${rule.free_from_quantity} alvéoles` : 'désactivée'}</strong></div>
            <div className="between"><span className="muted">Paiement</span><strong>{methods.map((m) => `${m.label} ${m.enabled ? '✓' : '(bientôt)'}`).join(' · ') || '—'}</strong></div>
          </section>
        </div>
        {company ? <ContactCard company={company} maintenance={!!cfg?.maintenance} onSaved={() => { setMsg('Contact enregistré.'); load() }} onError={setError} /> : null}
      </main>
    </>
  )
}

function PriceCard({ offer, onSaved, onError }: { offer: Offer; onSaved: (p: number) => void; onError: (e: string) => void }) {
  const [price, setPrice] = useState(String(offer.price_gnf))
  const [reason, setReason] = useState('')
  const changed = Number(price) !== offer.price_gnf
  const save = async () => {
    const r = await supabase.rpc('update_offer_price', { p_offer_id: offer.id, p_expected_price: offer.price_gnf, p_price: Number(price), p_reason: reason.trim() })
    if (r.error) onError(errText(r.error))
    else { setReason(''); onSaved(Number(price)) }
  }
  return (
    <section className="card">
      <h2>Prix de l’alvéole</h2>
      <span className="small muted">{offer.name} · prix actuel {gnf(offer.price_gnf)}</span>
      <label className="field">Nouveau prix (GNF)<input className="input" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, '').slice(0, 9))} /></label>
      {changed ? (
        <>
          <label className="field">Motif du changement<input className="input" placeholder="Ex. : hausse du prix fournisseur" value={reason} onChange={(e) => setReason(e.target.value)} /></label>
          <button className="btn" disabled={reason.trim().length < 5 || !Number(price)} onClick={save}>Enregistrer le prix</button>
        </>
      ) : null}
    </section>
  )
}

function ContactCard({ company, maintenance, onSaved, onError }: { company: Company; maintenance: boolean; onSaved: () => void; onError: (e: string) => void }) {
  const [phone, setPhone] = useState(company.support_phone ?? '')
  const changed = phone.trim() !== (company.support_phone ?? '')
  const save = async () => {
    const r = await supabase.rpc('company_settings_save', { p_name: company.name, p_email: company.support_email ?? '', p_phone: phone.trim(), p_address: company.address ?? '', p_maintenance: maintenance })
    if (r.error) onError(errText(r.error))
    else onSaved()
  }
  return (
    <section className="card">
      <h2>WhatsApp de l’équipe</h2>
      <span className="small muted">Numéro ouvert par le bouton « Écrire à l’équipe » de l’app client.</span>
      <div className="row">
        <input className="input" style={{ flex: 1 }} placeholder="+224 6XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="btn" disabled={!changed} onClick={save}>Enregistrer</button>
      </div>
    </section>
  )
}
