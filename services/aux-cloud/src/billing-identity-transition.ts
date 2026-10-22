/** Version 1 read transition for pre-Aux billing API identities.
 * Never updates Stripe objects, metadata, price IDs or stored checkout/session IDs.
 * Only new Aux lookup identities are emitted; remove this reader after old client
 * and pending-checkout retention ends, not by deleting customer records.
 */
const legacyLookups = new Map([
  ['aside_pro_month', 'aux_pro_month'], ['aside_pro_year', 'aux_pro_year'],
  ['aside_max_month', 'aux_max_month'], ['aside_max_year', 'aux_max_year'],
]);
export function canonicalBillingLookup(value: unknown): unknown {
  return typeof value === 'string' ? legacyLookups.get(value) ?? value : value;
}
export function canonicalBillingRequestKey(value: string): string {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return value;
    const request = parsed as Record<string, unknown>;
    if (Object.keys(request).length !== 2 || typeof request.lookup !== 'string' || typeof request.target !== 'string') return value;
    const lookup = canonicalBillingLookup(request.lookup);
    return lookup === request.lookup ? value : JSON.stringify({ lookup, target: request.target });
  } catch { return value; }
}
