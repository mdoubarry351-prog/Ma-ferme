export const gnf = (n: number | null | undefined) =>
  n == null ? '—' : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_SHORT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

// Conakry = UTC+0 toute l'année : on lit les dates en UTC pour éviter tout décalage du téléphone.
const parts = (iso: string) => {
  const d = new Date(iso);
  return { wd: d.getUTCDay(), day: d.getUTCDate(), m: d.getUTCMonth(), y: d.getUTCFullYear(), d };
};
export const dayLong = (iso: string) => {
  const p = parts(iso);
  return `${DAYS[p.wd]} ${p.day} ${MONTHS[p.m]}`;
};
export const dayShort = (iso: string) => {
  const p = parts(iso);
  return `${DAYS_SHORT[p.wd]} ${p.day} ${MONTHS_SHORT[p.m]}`;
};
export const dateOnly = (isoDate: string) => dayLong(isoDate.length === 10 ? isoDate + 'T12:00:00Z' : isoDate);

// Semaine en cours (lundi → dimanche) en heure de Conakry.
export const weekLabel = (iso: string, now = new Date()) => {
  const monday = (x: Date) => {
    const t = Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
    const wd = (x.getUTCDay() + 6) % 7;
    return t - wd * 86400000;
  };
  return monday(new Date(iso)) === monday(now) ? 'Cette semaine' : 'Semaine prochaine';
};

export const phoneDisplay = (e164?: string | null) => {
  if (!e164) return '';
  const d = e164.replace(/^\+224/, '');
  return '+224 ' + d.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
};
