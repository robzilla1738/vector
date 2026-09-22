/**
 * Personal-info autofill for page forms. The serialized body runs inside the
 * page frame (main world) on explicit user request only — never on load, never
 * for credentials/payment, which belong to the BR-06 credential work.
 * Everything the page pass needs must live inside `fillBody` — it is
 * serialized with `toString()` and loses module scope.
 */
export interface AutofillProfile {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  street?: string;
  city?: string;
  region?: string;
  postal?: string;
  country?: string;
}

export const hasAutofillData = (profile: AutofillProfile | undefined): profile is AutofillProfile =>
  !!profile && Object.values(profile).some(value => !!value?.trim());

type AutofillKey = "name" | "email" | "phone" | "organization" | "street" | "city" | "region" | "postal" | "country";

/** The in-page pass. Returns how many fields were filled. */
function fillBody(profile: Record<AutofillKey, string | undefined>): number {
  // autocomplete token → profile key. Unmapped tokens (cc-*, username,
  // new-password…) intentionally classify nothing.
  const AUTOCOMPLETE_KEYS: Record<string, AutofillKey> = {
    "name": "name", "email": "email", "tel": "phone", "organization": "organization",
    "street-address": "street", "address-line1": "street", "address-line2": "street",
    "address-level2": "city", "address-level1": "region", "postal-code": "postal",
    "country": "country", "country-name": "country",
    "given-name": "name", "family-name": "name",
  };
  // Never classify a field as personal info when its identity says
  // secret/account/search/card.
  const FORBIDDEN = /pass(word)?|login|sign[ -]?in|user(name)?|cvv|cvc|cc[-_ ]?|card|credit|expir|secur|search|quer|otp|2fa|token|ssn|social/i;
  const HEURISTIC: [RegExp, AutofillKey][] = [
    [/e[-_ ]?mail/i, "email"],
    [/phone|tel(e|ephone)?|mobile|cell/i, "phone"],
    [/organi[sz]ation|company|employer|business/i, "organization"],
    [/street|address/i, "street"],
    [/city|town|locality/i, "city"],
    [/state|province|region|county/i, "region"],
    [/zip|postal|post[ -]?code/i, "postal"],
    [/country|nation/i, "country"],
    [/(^|[_\- .])(first|given)[_\- ]?name|fname/i, "name"],
    [/(^|[_\- .])(last|family|sur)[_\- ]?name|lname|surname/i, "name"],
    [/(^|[_\- .])(full[ _-]?)?name($|[_\- .])|your name|contact name/i, "name"],
  ];

  const labelText = (field: HTMLElement): string => {
    const el = field as HTMLInputElement;
    const parts: string[] = [];
    if (el.labels) for (const label of Array.from(el.labels)) parts.push(label.textContent ?? "");
    const aria = el.getAttribute("aria-label"); if (aria) parts.push(aria);
    const describedBy = el.getAttribute("aria-labelledby");
    if (describedBy) for (const id of describedBy.split(/\s+/)) parts.push(document.getElementById(id)?.textContent ?? "");
    return parts.join(" ");
  };
  const classify = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): AutofillKey | null => {
    if (field instanceof HTMLInputElement) {
      if (!["text", "email", "tel", "url", "search", "number", ""].includes(field.type)) return null;
    }
    const identity = [field.getAttribute("name"), field.id, field.getAttribute("placeholder"), field.getAttribute("autocomplete"), labelText(field)].join(" ");
    if (FORBIDDEN.test(identity)) return null;
    const tokens = (field.getAttribute("autocomplete") ?? "").toLowerCase().split(/\s+/).filter(token => token && !/^(on|off|section-.*|shipping|billing|home|work|fax|pager|webauthn)$/.test(token));
    for (const token of tokens) {
      const key = AUTOCOMPLETE_KEYS[token];
      if (key) return key;
    }
    // Any other autocomplete hint means "not personal info" — do not guess.
    if (tokens.length) return null;
    for (const [pattern, key] of HEURISTIC) if (pattern.test(identity)) return key;
    return null;
  };
  const valueFor = (key: AutofillKey, field: HTMLElement): string => {
    const value = profile[key] ?? "";
    const token = (field.getAttribute("autocomplete") ?? "").toLowerCase();
    if (token.includes("given-name")) return value.split(/\s+/)[0] ?? value;
    if (token.includes("family-name")) { const parts = value.split(/\s+/); return parts.length > 1 ? parts.at(-1)! : value; }
    return value;
  };
  const setValue = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string): boolean => {
    if (field instanceof HTMLSelectElement) {
      const options = Array.from(field.options);
      const option = options.find(item => item.value.toLowerCase() === value.toLowerCase() || item.text.toLowerCase() === value.toLowerCase())
        ?? options.find(item => item.text.toLowerCase().includes(value.toLowerCase()));
      if (!option) return false;
      field.selectedIndex = option.index;
    } else {
      const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
      if (descriptor?.set) descriptor.set.call(field, value); else field.value = value;
    }
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };
  let filled = 0;
  for (const field of Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"))) {
    if (field.disabled || (field instanceof HTMLSelectElement ? false : field.readOnly)) continue;
    const key = classify(field);
    if (!key) continue;
    const value = valueFor(key, field);
    if (!value) continue;
    // Never clobber what the user or site already entered.
    if (field.value.trim() && !(field instanceof HTMLSelectElement)) continue;
    if (setValue(field, value)) filled += 1;
  }
  return filled;
}

/** Serialize the fill pass with the profile baked in — one executeJavaScript call. */
export function autofillScript(profile: AutofillProfile): string {
  const clean = {} as Record<AutofillKey, string | undefined>;
  for (const key of ["name", "email", "phone", "organization", "street", "city", "region", "postal", "country"] as const) {
    const value = profile[key]?.trim();
    if (value) clean[key] = value;
  }
  return `(${fillBody.toString()})(${JSON.stringify(clean)})`;
}
