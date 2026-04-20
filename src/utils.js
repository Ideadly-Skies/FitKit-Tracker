export function normalise(h) {
  return String(h).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function ageFromDob(dob) {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d)) return "";
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a >= 0 && a < 130 ? a : "";
}

export function isValidSgMobile(v) {
  if (v == null) return false;
  const s = String(v).trim();
  return /^[689]\d{7}$/.test(s);
}

export function today() {
  return new Date().toISOString().split("T")[0];
}
