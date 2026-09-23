export type AuxEnvironment = Record<string, string | undefined>;

/** Copy a layered configuration source so callers can merge it without mutating inputs. */
export function normalizeAuxEnvironment(source: AuxEnvironment): AuxEnvironment {
  return { ...source };
}
