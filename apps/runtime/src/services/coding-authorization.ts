import { EffectRequestSchema, type EffectRequest } from "@aux/contracts";

type CodingCategory = "read" | "file_write" | "file_delete" | "bash";

/** Command policy is `bash`; the shared effect vocabulary classifies it as an external tool. */
export function codingEffectRequest(
  request: Omit<EffectRequest, "category"> & { category: CodingCategory },
): EffectRequest {
  return EffectRequestSchema.parse({
    ...request,
    category: request.category === "bash" ? "external_tool" : request.category,
  });
}
