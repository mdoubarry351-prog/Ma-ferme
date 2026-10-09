import { useCallback, useEffect, useState } from 'react'
import { HashRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { Logo } from './ui'
import { Login, Mfa } from './pages/Auth'
import Today from './pages/Today'
import Orders from './pages/Orders'
import Delivery from './pages/Delivery'
import Settings from './pages/Settings'

export type Staff = { role: string; email: string; isOwner: boolean }

const ROLE_LABEL: Record<string, string> = {
  owner: 'propriétaire', manager: 'gérant', orders: 'commandes', logistics: 'logistique',
  finance: 'finance', catalogue: 'catalogue', support: 'assistance', driver: 'livreur',
}

type Gate = 'loading' | 'login' | 'mfa' | 'denied' | 'ok'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [gate, setGate] = useState<Gate>('loading')
  const [staff, setStaff] = useState<Staff | null>(null)

  const evaluate = useCallback(async (s: Session | null) => {
    setSession(s)
    if (!s) return setGate('login')
    // Le rôle est vérifié avant la double authentification (staff_access n'exige pas aal2).
    const r = await supabase.rpc('staff_access')
    const role = (r.data as { role?: string } | null)?.role
    if (!role || role === 'driver') return setGate('denied')
    const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal.data?.currentLevel !== 'aal2') return setGate('mfa')
    setStaff({ role, email: s.user.email ?? '', isOwner: role === 'owner' })
    setGate('ok')
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => evaluate(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'MFA_CHALLENGE_VERIFIED') evaluate(s)
    })
    return () => data.subscription.unsubscribe()
  }, [evaluate])

  if (gate === 'loading') return <div className="center muted">Chargement…</div>
  if (gate === 'login') return <Login />
  if (gate === 'mfa') return <Mfa onDone={() => supabase.auth.getSession().then(({ data }) => evaluate(data.session))} />
  if (gate === 'denied')
    return (
      <div className="center">
        <div className="auth card">
          <Logo size={40} />
          <h1>Accès réservé à l’équipe</h1>
          <p className="muted">Ce compte ({session?.user.email ?? 'inconnu'}) n’a pas de rôle dans l’équipe Ma Ferme.</p>
          <button className="btn big outline" onClick={() => supabase.auth.signOut()}>Changer de compte</button>
        </div>
      </div>
    )
  return (
    <HashRouter>
      <Layout staff={staff!} />
    </HashRouter>
  )
}

const SECTIONS = [
  { to: '/', label: 'Aujourd’hui', icon: 'M4 11l8-7 8 7v9H4z' },
  { to: '/commandes', label: 'Commandes', icon: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6' },
  { to: '/livraison', label: 'Livraison', icon: 'M3 7h11v10H3zM14 10h4l3 3v4h-7' },
  { to: '/reglages', label: 'Réglages', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split('M').filter(Boolean).map((p, i) => <path key={i} d={'M' + p} />)}
    </svg>
  )
}

function Layout({ staff }: { staff: Staff }) {
  const [pending, setPending] = useState<number | null>(null)
  const loc = useLocation()
  useEffect(() => {
    supabase.rpc('control_orders', { p_filter: { status: 'pending' } }).then(({ data }) => setPending((data as { count?: number } | null)?.count ?? null))
  }, [loc.pathname])

  return (
    <div className="shell">
      <aside className="side" aria-label="Menu d’administration">
        <div className="brand"><Logo size={30} reversed /> ma ferme</div>
        <nav className="nav">
          {SECTIONS.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.to === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>
              <span>{s.label}</span>
              {s.to === '/commandes' && pending ? <span className="count">{pending}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="who">
          <span>{staff.email} · {ROLE_LABEL[staff.role] ?? staff.role}</span>
          <button onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
        </div>
      </aside>
      <div className="main">
        <div className="mhead"><Logo size={26} reversed /> ma ferme <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#B9D8C5' }}>{ROLE_LABEL[staff.role]}</span></div>
        <Routes>
          <Route path="/" element={<Today staff={staff} />} />
          <Route path="/commandes" element={<Orders />} />
          <Route path="/livraison" element={<Delivery />} />
          <Route path="/reglages" element={<Settings staff={staff} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <nav className="bottom" aria-label="Navigation">
        {SECTIONS.map((s) => (
          <NavLink key={s.to} to={s.to} end={s.to === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>
            <Icon d={s.icon} />
            {s.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
