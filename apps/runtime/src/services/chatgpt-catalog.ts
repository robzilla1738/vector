import { AuxError } from "@aux/contracts";
import type { ModelCapability } from "@aux/contracts/model-registry";
import { authJson, CHATGPT_RESOURCE, type ChatgptAccounts } from "./chatgpt-account.js";

export async function chatgptModels(
  accounts: ChatgptAccounts,
  accountId: string,
  networkFetch: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<ModelCapability[]> {
  const value = await authJson(
    await networkFetch(`${CHATGPT_RESOURCE}/models`, {
      redirect: "error",
      signal,
      headers: { Authorization: `Bearer ${await accounts.accessToken(accountId, signal)}` },
    }),
  );
  return parseChatgptModels(value);
}
export function parseChatgptModels(value: unknown): ModelCapability[] {
  if (
    !value ||
    typeof value !== "object" ||
    !("models" in value) ||
    !Array.isArray(value.models) ||
    value.models.length > 500
  )
    throw new AuxError("backend_unavailable", "ChatGPT returned an invalid account model catalog.");
  const result: ModelCapability[] = [],
    seen = new Set<string>();
  for (const item of value.models) {
    if (!item || typeof item !== "object" || !("visibility" in item) || item.visibility !== "list") continue;
    if (
      !("slug" in item) ||
      typeof item.slug !== "string" ||
      !item.slug ||
      item.slug.length > 500 ||
      seen.has(item.slug)
    )
      throw new AuxError("backend_unavailable", "ChatGPT returned an invalid model identity.");
    seen.add(item.slug);
    result.push({
      id: item.slug,
      ...("display_name" in item && typeof item.display_name === "string" ? { name: item.display_name } : {}),
      provider: "OpenAI · ChatGPT plan",
      billingKind: "subscription",
      outputLimitSupported: false,
      streaming: true,
      source: "catalog",
    });
  }
  return result;
}
