/** Generated descriptors preserve Zod's value normalization without validating trusted host data. */
export type HostNormalization =
  | null
  | { kind: "trim" }
  | { kind: "ref"; index: number }
  | { kind: "typeUnion"; branches: Record<string, HostNormalization> }
  | { kind: "object"; fields: Record<string, HostNormalization>; strip: boolean; rest: HostNormalization }
  | { kind: "array"; item: HostNormalization }
  | { kind: "record"; item: HostNormalization }
  | { kind: "tuple"; items: HostNormalization[]; rest: HostNormalization }
  | { kind: "union"; discriminator: string; branches: Record<string, HostNormalization> };

export function normalizeHostValue(
  value: unknown,
  node: HostNormalization,
  nodes: HostNormalization[] = [],
): unknown {
  if (!node || value == null) return value;
  if (node.kind === "ref") return normalizeHostValue(value, nodes[node.index] ?? null, nodes);
  if (node.kind === "typeUnion")
    return normalizeHostValue(
      value,
      node.branches[Array.isArray(value) ? "array" : typeof value] ?? null,
      nodes,
    );
  if (node.kind === "trim") return typeof value === "string" ? value.trim() : value;
  if (node.kind === "array" || node.kind === "tuple") {
    if (!Array.isArray(value)) return value;
    return value.map((item, index) =>
      normalizeHostValue(item, node.kind === "array" ? node.item : (node.items[index] ?? node.rest), nodes),
    );
  }
  if (typeof value !== "object" || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  if (node.kind === "union")
    return normalizeHostValue(
      value,
      (Object.hasOwn(node.branches, String(record[node.discriminator]))
        ? node.branches[String(record[node.discriminator])]
        : null) ?? null,
      nodes,
    );
  return Object.fromEntries(
    Object.entries(record)
      .filter(([key]) => node.kind === "record" || !node.strip || Object.hasOwn(node.fields, key))
      .map(([key, item]) => [
        key,
        normalizeHostValue(
          item,
          node.kind === "record"
            ? node.item
            : ((Object.hasOwn(node.fields, key) ? node.fields[key] : node.rest) ?? null),
          nodes,
        ),
      ]),
  );
}
