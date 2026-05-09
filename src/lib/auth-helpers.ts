// Convert IGN to a synthetic internal email so users only ever see their IGN.
export function ignToEmail(ign: string) {
  return `${ign.toLowerCase().trim()}@quotegang.local`;
}

export function isValidIgn(ign: string) {
  // Minecraft IGN rules: 3-16 chars, letters, digits, underscore
  return /^[A-Za-z0-9_]{3,16}$/.test(ign);
}

export function isValidPasscode(p: string) {
  return typeof p === "string" && p.length >= 8 && p.length <= 128;
}
