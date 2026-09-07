/* -------------------------------------------------------------------------- */
/*  Pure validation helpers.                                                   */
/* -------------------------------------------------------------------------- */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Password must be at least 8 characters. */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/** Strong password: 8+ chars, 1 letter, 1 number. */
export function isStrongPassword(password: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  return { score: Math.min(score, 4) as 0 | 1 | 2 | 3 | 4, label: labels[Math.min(score, 4)] };
}

/** A loose wallet address check — non-empty, reasonable length. */
export function isValidWalletAddress(address: string): boolean {
  const trimmed = address.trim();
  if (trimmed.length < 20) return false;
  // Accept alphanumeric with 0x prefix for EVM chains.
  return /^[a-zA-Z0-9]+$/.test(trimmed.replace(/^0x/, ""));
}

export function isPositiveAmount(amount: number | string): boolean {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return !Number.isNaN(n) && n > 0;
}

export function hasSufficientBalance(amount: number, balance: number): boolean {
  return amount > 0 && amount <= balance;
}

/** Basic account number check — 6–12 digits. */
export function isValidAccountNumber(value: string): boolean {
  return /^\d{6,12}$/.test(value.replace(/\s/g, ""));
}

/** Basic phone number check — 7–15 digits, optional leading +. */
export function isValidPhone(value: string): boolean {
  return /^\+?\d{7,15}$/.test(value.replace(/[\s-]/g, ""));
}
