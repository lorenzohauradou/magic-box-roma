const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!$%&*"

/** Password casuale leggibile (senza caratteri ambigui), 12 caratteri. */
export function generaPassword(lunghezza = 12) {
  const bytes = new Uint32Array(lunghezza)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("")
}
