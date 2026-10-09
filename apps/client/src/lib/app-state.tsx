import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Offer = {
  offerId: string;
  name: string;
  unitLabel: string;
  packQuantity: number;
  minimum: number;
  step: number;
  priceGnf: number;
};

export type Settings = {
  ordersEnabled: boolean;
  maintenance: boolean;
  minimumUnits: number;
};

type AppState = {
  session: Session | null;
  authReady: boolean;
  settings: Settings | null;
  cityId: string | null;
  offer: Offer | null;
  catalogError: string | null;
  reloadCatalog: () => Promise<void>;
  qty: number;
  setQty: (n: number) => void;
  // Adresse choisie pour la prochaine commande (ex. « Refaire cette commande »).
  preferredAddressId: string | null;
  setPreferredAddressId: (id: string | null) => void;
  supportPhone: string | null;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [qty, setQtyRaw] = useState(5);
  const [preferredAddressId, setPreferredAddressId] = useState<string | null>(null);
  const [supportPhone, setSupportPhone] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const reloadCatalog = useCallback(async () => {
    setCatalogError(null);
    const [cfg, cities, company] = await Promise.all([
      supabase.from('app_settings').select('orders_enabled, maintenance, minimum_order_units').eq('id', true).maybeSingle(),
      supabase.from('cities').select('id, name').eq('active', true).order('name'),
      supabase.from('company_settings').select('support_phone').limit(1).maybeSingle(),
    ]);
    if (cfg.error || cities.error) {
      setCatalogError('Impossible de charger les informations. Vérifie ta connexion.');
      return;
    }
    setSupportPhone(company.data?.support_phone ?? null);
    setSettings({
      ordersEnabled: !!cfg.data?.orders_enabled,
      maintenance: !!cfg.data?.maintenance,
      minimumUnits: cfg.data?.minimum_order_units ?? 5,
    });
    const city = cities.data?.[0];
    if (!city) return;
    setCityId(city.id);
    const offers = await supabase
      .from('city_offers')
      .select('id, price_gnf, product_variants!inner(unit, pack_quantity, minimum_quantity, quantity_step, active, products!inner(name, active))')
      .eq('city_id', city.id)
      .eq('active', true)
      .limit(1);
    if (offers.error) {
      setCatalogError('Impossible de charger le prix. Vérifie ta connexion.');
      return;
    }
    const o = offers.data?.[0] as any;
    if (o) {
      const v = o.product_variants;
      setOffer({
        offerId: o.id,
        name: v.products.name,
        unitLabel: v.unit,
        packQuantity: Number(v.pack_quantity ?? 30),
        minimum: v.minimum_quantity ?? 5,
        step: v.quantity_step ?? 1,
        priceGnf: Number(o.price_gnf),
      });
    }
  }, []);

  useEffect(() => {
    reloadCatalog();
  }, [reloadCatalog]);

  const minimum = Math.max(offer?.minimum ?? 5, settings?.minimumUnits ?? 5);
  const setQty = useCallback((n: number) => setQtyRaw(Math.max(minimum, Math.min(10000, Math.round(n)))), [minimum]);
  useEffect(() => {
    if (qty < minimum) setQtyRaw(minimum);
  }, [minimum, qty]);

  const value = useMemo(
    () => ({
      session, authReady, settings, cityId, offer, catalogError, reloadCatalog,
      qty, setQty, preferredAddressId, setPreferredAddressId, supportPhone,
    }),
    [session, authReady, settings, cityId, offer, catalogError, reloadCatalog, qty, setQty, preferredAddressId, supportPhone],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('AppStateProvider manquant');
  return v;
};

export const salesOpen = (s: Settings | null) => !!s && s.ordersEnabled && !s.maintenance;
