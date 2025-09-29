export function generateSecurePassword(length = 16): string {
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const DIGIT = "0123456789";
  const SPECIAL = "!@#$%^&*()-_=+[]{};:,.?";
  const ALL = UPPER + LOWER + DIGIT + SPECIAL;

  const rand = (max: number) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  };

  // al menos uno de cada tipo
  const chars = [
    UPPER[rand(UPPER.length)],
    LOWER[rand(LOWER.length)],
    DIGIT[rand(DIGIT.length)],
    SPECIAL[rand(SPECIAL.length)],
  ];

  for (let i = chars.length; i < length; i++) {
    chars.push(ALL[rand(ALL.length)]);
  }

  // mezclar (Fisher–Yates con crypto)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}