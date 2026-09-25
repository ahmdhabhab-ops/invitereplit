const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]+$/;

export function isValidContact(value: string | undefined | null) {
  const v = (value || "").trim();
  if (EMAIL_RE.test(v)) return true;
  return PHONE_RE.test(v) && v.replace(/\D/g, "").length >= 7;
}
