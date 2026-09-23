import { RpcChannel } from "@aux/contracts";
import { profileSession } from "../../native-views.js";

export function registerCookieMethods(ch: RpcChannel) {
  ch.onMethod("native.setCookies", async (p) => {
    // cookie values flow through but are never logged or persisted to disk
    // beyond Chromium's own encrypted profile store
    const { cookies } = p as {
      cookies: {
        name: string;
        value: string;
        domain: string;
        path: string;
        secure: boolean;
        httpOnly: boolean;
        sameSite?: "Strict" | "Lax" | "None";
        expires?: number;
      }[];
    };
    const ses = profileSession();
    let count = 0;
    for (const c of cookies) {
      const bare = c.domain.replace(/^\./, "");
      try {
        await ses.cookies.set({
          url: `${c.secure ? "https" : "http"}://${bare}${c.path || "/"}`,
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path || "/",
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite:
            c.sameSite === "None" ? "no_restriction" : c.sameSite === "Strict" ? "strict" : c.sameSite === "Lax" ? "lax" : "unspecified",
          ...(c.expires ? { expirationDate: c.expires } : {}),
        });
        count++;
      } catch {
        // a cookie that fails validation (bad domain for url etc.) is skipped,
        // not fatal to the batch
      }
    }
    return { ok: true, count };
  });
}
