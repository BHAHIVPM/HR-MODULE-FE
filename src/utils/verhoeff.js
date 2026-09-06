// Verhoeff checksum algorithm - validates 12-digit Login IDs.
// Every login ID ends with a Verhoeff check digit.

const d = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0]
];
const p = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]
];
const inv = [0,4,3,2,1,5,6,7,8,9];

/** Validate that a digit string passes the Verhoeff checksum (last digit = check digit). */
export function isValidVerhoeff(digits) {
  if (typeof digits !== 'string' || !/^\d+$/.test(digits)) return false;
  let c = 0;
  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][parseInt(digits[digits.length - 1 - i], 10)]];
  }
  return c === 0;
}

/** Compute the Verhoeff check digit for digits WITHOUT the check digit. */
export function generateVerhoeffCheckDigit(digits) {
  if (typeof digits !== 'string' || !/^\d+$/.test(digits)) return -1;
  let c = 0;
  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[(i + 1) % 8][parseInt(digits[digits.length - 1 - i], 10)]];
  }
  return inv[c];
}