export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function emailsMatch(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  return normalizeEmail(left) === normalizeEmail(right);
}
