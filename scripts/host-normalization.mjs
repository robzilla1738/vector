export const normalizationNodes = [];
const lazyNodes = new Map();

/** Derive output normalization only; validation remains in native/runtime and DEV Zod. */
export function hostNormalization(schema) {
  const def = schema._zod.def;
  if (def.type === "lazy") {
    if (lazyNodes.has(schema)) return { kind: "ref", index: lazyNodes.get(schema) };
    const index = normalizationNodes.length;
    lazyNodes.set(schema, index);
    normalizationNodes.push(null);
    normalizationNodes[index] = hostNormalization(def.getter());
    return { kind: "ref", index };
  }
  if (def.coerce || ["default", "prefault", "catch", "transform", "pipe", "readonly"].includes(def.type)) {
    throw new Error(`Unsupported host normalization: ${def.type}`);
  }
  const overwrites = (def.checks ?? []).filter((check) => check._zod.def.check === "overwrite");
  if (overwrites.length) {
    if (
      def.type !== "string" ||
      overwrites.length !== 1 ||
      String(overwrites[0]._zod.def.tx).replace(/\s/g, "") !== "(input)=>input.trim()"
    ) {
      throw new Error("Unsupported host string normalization");
    }
    return { kind: "trim" };
  }
  if (["optional", "nullable", "nonoptional"].includes(def.type)) return hostNormalization(def.innerType);
  if (def.type === "object") {
    const fields = Object.fromEntries(
      Object.entries(def.shape).map(([key, value]) => [key, hostNormalization(value)]),
    );
    const strip = !def.catchall;
    const rest = def.catchall ? hostNormalization(def.catchall) : null;
    return strip || rest || Object.values(fields).some(Boolean)
      ? { kind: "object", fields, strip, rest }
      : null;
  }
  if (def.type === "array") {
    const item = hostNormalization(def.element);
    return item ? { kind: "array", item } : null;
  }
  if (def.type === "tuple") {
    const items = def.items.map(hostNormalization);
    const rest = def.rest ? hostNormalization(def.rest) : null;
    return rest || items.some(Boolean) ? { kind: "tuple", items, rest } : null;
  }
  if (def.type === "record") {
    const key = hostNormalization(def.keyType),
      item = hostNormalization(def.valueType);
    if (key) throw new Error("Unsupported normalized host record key");
    return item ? { kind: "record", item } : null;
  }
  if (def.type === "union") {
    const items = def.options.map(hostNormalization);
    if (!items.some(Boolean)) return null;
    if (!def.discriminator) {
      const types = def.options.map((option) => option._zod.def.type);
      if (
        !types.every((type) => ["string", "object", "number", "boolean", "null", "array"].includes(type)) ||
        new Set(types).size !== types.length
      )
        throw new Error("Ambiguous host normalization union");
      return {
        kind: "typeUnion",
        branches: Object.fromEntries(types.map((type, index) => [type, items[index]])),
      };
    }
    const branches = Object.fromEntries(
      def.options.flatMap((option, index) => {
        const values = option._zod.def.shape[def.discriminator]._zod.values;
        if (!values) throw new Error("Host union discriminator must have finite values");
        return [...values].map((value) => [value, items[index]]);
      }),
    );
    return { kind: "union", discriminator: def.discriminator, branches };
  }
  if (
    ![
      "string",
      "number",
      "boolean",
      "literal",
      "enum",
      "unknown",
      "any",
      "never",
      "null",
      "undefined",
      "void",
    ].includes(def.type)
  )
    throw new Error(`Unsupported host schema type: ${def.type}`);
  return null;
}
