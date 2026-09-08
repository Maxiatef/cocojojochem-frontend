// Client-side password generation + strength scoring for the admin user
// editor's "Set New Password" control.
//
// Deliberately hand-rolled rather than pulling in zxcvbn: that's ~800KB of
// dictionary data for a control an admin uses occasionally, and the real
// guarantee here is the generator (which produces something far stronger
// than anything a human would type). The score exists to warn an admin who
// overrides the generated value with something weak — it is not a security
// boundary. The actual minimum is enforced server-side.

const LOWER = 'abcdefghijkmnopqrstuvwxyz'; // no 'l' — reads as '1'
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 'I'/'O' — read as '1'/'0'
const DIGITS = '23456789'; // no '0'/'1' — read as 'O'/'l'
const SYMBOLS = '!@#$%^&*()-_=+[]{}?';
const ALPHABET = LOWER + UPPER + DIGITS + SYMBOLS;

// Uses crypto.getRandomValues, not Math.random — this value becomes a real
// account credential, so it must not be predictable from the page's state.
// Rejection sampling avoids the modulo bias a plain `% length` would add.
function randomInt(bound: number): number {
  const max = Math.floor(256 / bound) * bound;
  const buf = new Uint8Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < max) return buf[0] % bound;
  }
}

function randomChar(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)];
}

export function generatePassword(length = 24): string {
  // Seed one character from each class so the result always satisfies a
  // mixed-class policy, then fill the rest from the full alphabet.
  const required = [randomChar(LOWER), randomChar(UPPER), randomChar(DIGITS), randomChar(SYMBOLS)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => randomChar(ALPHABET));
  const chars = [...required, ...rest];

  // Fisher-Yates with crypto randomness, so the seeded characters aren't
  // always sitting in the first four positions.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very weak' | 'Weak' | 'Medium' | 'Strong' | 'Very strong';
};

const LABELS: PasswordStrength['label'][] = ['Very weak', 'Weak', 'Medium', 'Strong', 'Very strong'];

export function scorePassword(password: string): PasswordStrength {
  if (!password) return { score: 0, label: 'Very weak' };

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  if (classes >= 3) points += 1;
  if (classes === 4) points += 1;

  // A single repeated character or an obvious sequence shouldn't score on
  // length alone — "aaaaaaaaaaaaaaaa" is long but trivially guessable.
  if (/^(.)\1+$/.test(password)) points = 0;
  if (/^(?:0123456789|1234567890|abcdefghij|qwertyuiop|password)/i.test(password)) points = 0;

  // Anything under the server's 8-char minimum can never read as acceptable.
  if (password.length < 8) points = Math.min(points, 1);

  const score = Math.min(4, points) as PasswordStrength['score'];
  return { score, label: LABELS[score] };
}

// The admin UI blocks submitting below this without an explicit override.
export const WEAK_PASSWORD_THRESHOLD = 2;
