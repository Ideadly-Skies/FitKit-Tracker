export function normalise(h: unknown): string {
  return String(h).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function ageFromDob(dob: string): number | '' {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a >= 0 && a < 130 ? a : '';
}

export function isValidSgMobile(v: unknown): boolean {
  if (v == null) return false;
  const s = String(v).trim();
  return /^[689]\d{7}$/.test(s);
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function nowIso(): string {
  return new Date().toISOString();
}

// Converts stored YYYY-MM-DD → DD/MM/YYYY for display. Returns "—" for empty values.
export function fmtDisplayDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!d) return iso;
  return `${d}/${m}/${y}`;
}
