/** Descriptive text -> Paltrack code translation tables. */

export const CODE_TABLES: Record<string, Record<string, string>> = {
  country: {
    "south africa": "ZA",
    "united kingdom": "GB",
    netherlands: "NL",
    germany: "DE",
    "united arab emirates": "AE",
    "saudi arabia": "SA",
    "united states": "US",
    canada: "CA",
    china: "CN",
    russia: "RU",
  },
  channel: { export: "E", local: "L", industrial: "I" },
  unitType: { pallet: "P", bin: "B", carton: "C" },
  yesNo: { yes: "Y", no: "N", true: "Y", false: "N" },
  mixed: { generic: "G", mixed: "Y", single: "N" },
};

export interface CodeLookupResult {
  value: string;
  unknown: boolean;
}

/**
 * Translate a descriptive Excel value into a code.
 * Values already short enough for the field are passed through untouched.
 */
export function lookupCode(
  table: keyof typeof CODE_TABLES | string,
  raw: unknown,
  maxLength: number,
): CodeLookupResult {
  const text = raw === null || raw === undefined ? "" : String(raw).trim();
  if (!text) return { value: "", unknown: false };

  const map = CODE_TABLES[table] ?? {};
  const hit = map[text.toLowerCase()];
  if (hit) return { value: hit, unknown: false };

  if (text.length <= maxLength) return { value: text.toUpperCase(), unknown: false };

  // Descriptive text that does not fit and has no mapping.
  return { value: "", unknown: true };
}
