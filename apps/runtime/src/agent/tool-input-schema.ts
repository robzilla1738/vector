import { zodSchema } from "@ai-sdk/provider-utils";
import type { JSONSchema7, Schema } from "ai";
import { AuxError } from "@aux/contracts";
import { z } from "zod";

export type ToolSchemaMode = "inline" | "references";
const prepared = new WeakMap<z.ZodType, Map<ToolSchemaMode, Schema>>();

function objectOnly(value: unknown, root: JSONSchema7, visited = new Set<unknown>()): boolean {
  if (value === false) return true;
  if (!value || typeof value !== "object" || Array.isArray(value) || visited.has(value)) return false;
  const schema = value as JSONSchema7;
  if (schema.type !== undefined)
    return (
      schema.type === "object" ||
      (Array.isArray(schema.type) &&
        schema.type.length > 0 &&
        schema.type.every((type: unknown) => type === "object"))
    );
  const seen = new Set(visited).add(value);
  if (schema.$ref !== undefined) {
    if (!schema.$ref.startsWith("#/")) return false;
    let target: unknown = root;
    for (const part of schema.$ref.slice(2).split("/")) {
      if (!target || typeof target !== "object") return false;
      target = (target as Record<string, unknown>)[part.replaceAll("~1", "/").replaceAll("~0", "~")];
    }
    return objectOnly(target, root, seen);
  }
  if (schema.oneOf?.length) return schema.oneOf.every((branch: unknown) => objectOnly(branch, root, seen));
  if (schema.anyOf?.length) return schema.anyOf.every((branch: unknown) => objectOnly(branch, root, seen));
  return schema.allOf?.some((branch: unknown) => objectOnly(branch, root, seen)) ?? false;
}

function synchronousSchema(value: JSONSchema7 | PromiseLike<JSONSchema7>): value is JSONSchema7 {
  return !("then" in value && typeof value.then === "function");
}

/** SDK conversion and original Zod validation are shared by request publication and context accounting. */
export function prepareToolInputSchema(input: z.ZodType, mode: ToolSchemaMode = "inline"): Schema {
  let modes = prepared.get(input);
  if (!modes) prepared.set(input, (modes = new Map()));
  const cached = modes.get(mode);
  if (cached) return cached;
  const original = zodSchema(input, { useReferences: mode === "references" });
  const converted = original.jsonSchema;
  if (!synchronousSchema(converted))
    throw new AuxError(
      "capability_unsupported",
      "Tool schema preparation must finish before model admission.",
    );
  if (!objectOnly(converted, converted))
    throw new AuxError("capability_unsupported", "Model tool input schemas must accept only root objects.");
  // Anthropic rejects root composition even with type:object. Keep the
  // original branches under a strict SDK-generated wire object; the SDK's
  // original Zod transform returns the same flat validated execution input.
  const result =
    converted.anyOf || converted.oneOf || converted.allOf
      ? zodSchema(
          z.strictObject({ input }).transform((value) => value.input),
          {
            useReferences: mode === "references",
          },
        )
      : {
          ...original,
          jsonSchema: converted.type === "object" ? converted : { ...converted, type: "object" as const },
        };
  modes.set(mode, result);
  return result;
}
