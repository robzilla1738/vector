import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { z } from "zod";

export const CopilotRegistrationSchema = z
  .object({
    clientId: z.string().regex(/^[A-Za-z0-9_]{8,100}$/),
    revision: z.string().uuid(),
  })
  .strict();
/** Obtained only from Aux's reviewed OAuth App configuration, never the model or ambient CLI. */
export type CopilotRegistration = z.infer<typeof CopilotRegistrationSchema>;
const access = z.string().regex(/^gho_[A-Za-z0-9_]{16,500}$/);
const refresh = z.string().regex(/^ghr_[A-Za-z0-9_]{16,500}$/);
const duration = z
  .number()
  .int()
  .positive()
  .max(200 * 86400);
const TokenSchema = z
  .object({
    token_type: z.literal("bearer"),
    access_token: access,
    scope: z.string().max(8192),
    expires_in: duration.optional(),
    refresh_token: refresh.optional(),
    refresh_token_expires_in: duration.optional(),
  })
  .refine(
    (t) =>
      t.refresh_token === undefined ||
      (t.expires_in !== undefined && t.refresh_token_expires_in !== undefined),
  );
export type CopilotGrant = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  refreshExpiresAt?: number;
  scopes: string[];
};
export function copilotGrant(value: unknown, now = Date.now()): CopilotGrant {
  const parsed = TokenSchema.safeParse(value);
  if (!parsed.success)
    throw new AuxError(
      "backend_unavailable",
      "GitHub returned invalid account credentials.",
    );
  const t = parsed.data,
    scopes = [...new Set(t.scope.split(/[\s,]+/).filter(Boolean))];
  if (
    scopes.length > 32 ||
    scopes.some((s) => !/^[a-zA-Z0-9:_-]{1,200}$/.test(s))
  )
    throw new AuxError(
      "backend_unavailable",
      "GitHub returned invalid account scopes.",
    );
  return {
    accessToken: t.access_token,
    scopes,
    ...(t.refresh_token ? { refreshToken: t.refresh_token } : {}),
    ...(t.expires_in ? { expiresAt: now + t.expires_in * 1000 } : {}),
    ...(t.refresh_token_expires_in
      ? { refreshExpiresAt: now + t.refresh_token_expires_in * 1000 }
      : {}),
  };
}
export function copilotAccountId(
  hostId: string,
  clientId: string,
  userId: string,
) {
  return createHash("sha256")
    .update(JSON.stringify(["github.com", hostId, clientId, userId]))
    .digest("hex");
}
/** Bounded body reads retain the request signal until JSON is fully consumed. */
export async function copilotJson(
  response: Response,
  signal: AbortSignal,
): Promise<unknown> {
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new AuxError(
      "backend_unavailable",
      "GitHub refused the account request.",
    );
  }
  const reader = response.body.getReader(),
    chunks: Uint8Array[] = [];
  let bytes = 0;
  const abort = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    for (;;) {
      signal.throwIfAborted();
      const part = await reader.read();
      signal.throwIfAborted();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 32768)
        throw new AuxError(
          "backend_unavailable",
          "GitHub account response exceeds its limit.",
        );
      chunks.push(part.value);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new AuxError(
        "backend_unavailable",
        "GitHub returned invalid account data.",
      );
    }
  } finally {
    signal.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
  }
}
export async function copilotPost(
  network: typeof fetch,
  path: "/login/device/code" | "/login/oauth/access_token",
  body: Record<string, string>,
  original: AbortSignal,
): Promise<unknown> {
  const signal = AbortSignal.any([original, AbortSignal.timeout(15000)]);
  const response = await network(`https://github.com${path}`, {
    method: "POST",
    redirect: "error",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
  return copilotJson(response, signal);
}
export async function copilotUser(
  network: typeof fetch,
  token: string,
  original: AbortSignal,
) {
  const signal = AbortSignal.any([original, AbortSignal.timeout(15000)]);
  const value = await copilotJson(
    await network("https://api.github.com/user", {
      redirect: "error",
      signal,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Aux",
      },
    }),
    signal,
  );
  const parsed = z
    .object({
      id: z.number().int().positive().safe(),
      login: z.string().min(1).max(100),
    })
    .safeParse(value);
  if (!parsed.success)
    throw new AuxError(
      "backend_unavailable",
      "GitHub returned an invalid account identity.",
    );
  return { userId: String(parsed.data.id), login: parsed.data.login };
}
