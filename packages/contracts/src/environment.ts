export type AuxEnvironment = Record<string, string | undefined>;

/** Normalize each configuration source before merging it with lower-priority sources. */
export function normalizeAuxEnvironment(source: AuxEnvironment): AuxEnvironment {
  const env = { ...source };
  for (const name of Object.keys(source)) {
    if (!name.startsWith("AUX_") && !name.startsWith("VECTOR_")) continue;
    const suffix = name.replace(/^(AUX|VECTOR)_/, "");
    const value = source[`AUX_${suffix}`] || source[`VECTOR_${suffix}`];
    env[`AUX_${suffix}`] = value;
    // Legacy readers remain supported while adapters are migrated subsystem by subsystem.
    env[`VECTOR_${suffix}`] = value;
  }
  return env;
}
