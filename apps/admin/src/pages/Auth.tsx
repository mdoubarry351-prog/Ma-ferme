import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Logo } from '../ui'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (err) setError(/invalid/i.test(err.message) ? 'E-mail ou mot de passe incorrect.' : 'Connexion impossible. Réessaie.')
  }
  return (
    <div className="center">
      <form className="auth card" onSubmit={submit}>
        <div className="row"><Logo size={40} /><strong style={{ fontSize: 22, letterSpacing: '-0.03em' }}>ma ferme</strong></div>
        <h1>Administration</h1>
        <label className="field">E-mail<input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="field">Mot de passe<input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error ? <div className="banner bad">{error}</div> : null}
        <button className="btn big" disabled={busy || !email || !password}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </div>
  )
}

// Double authentification obligatoire pour l'équipe (le serveur exige aal2).
export function Mfa({ onDone }: { onDone: () => void }) {
  const [factorId, setFactorId] = useState<string | null>(null)
  const [enroll, setEnroll] = useState<{ qr: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const f = await supabase.auth.mfa.listFactors()
      const verified = f.data?.totp?.find((x) => x.status === 'verified')
      if (verified) return setFactorId(verified.id)
      const r = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Ma Ferme ' + new Date().toISOString().slice(0, 10) })
      if (r.error || !r.data) return setError('Impossible de préparer la double authentification.')
      setFactorId(r.data.id)
      setEnroll({ qr: r.data.totp.qr_code, secret: r.data.totp.secret })
    })()
  }, [])

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId) return
    setBusy(true)
    setError(null)
    const r = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
    setBusy(false)
    if (r.error) return setError('Code incorrect ou expiré. Utilise le code affiché maintenant.')
    onDone()
  }

  return (
    <div className="center">
      <form className="auth card" onSubmit={verify}>
        <Logo size={40} />
        <h1>Code de sécurité</h1>
        {enroll ? (
          <>
            <p className="muted" style={{ margin: 0 }}>Première connexion : scanne ce code avec Google Authenticator (ou une app similaire), puis saisis le code à 6 chiffres.</p>
            <img src={enroll.qr} alt="QR code de double authentification" width={180} height={180} style={{ alignSelf: 'center', background: '#fff', borderRadius: 12 }} />
            <p className="small muted" style={{ margin: 0, wordBreak: 'break-all' }}>Clé manuelle : {enroll.secret}</p>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>Ouvre ton application d’authentification et saisis le code Ma Ferme à 6 chiffres.</p>
        )}
        <input className="input" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ fontSize: 22, letterSpacing: 6, textAlign: 'center' }} />
        {error ? <div className="banner bad">{error}</div> : null}
        <button className="btn big" disabled={busy || code.length !== 6 || !factorId}>{busy ? 'Vérification…' : 'Valider'}</button>
        <button type="button" className="btn outline" onClick={() => supabase.auth.signOut()}>Changer de compte</button>
      </form>
    </div>
  )
}
