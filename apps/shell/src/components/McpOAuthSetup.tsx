import { useEffect, useRef, useState } from "react";
import type { MethodResult } from "@aux/contracts";
import { bridge } from "../bridge";
import { errorMessage } from "../error-message";

/** No client secret is read back into the renderer. A server change retires every pending UI result. */
export function McpOAuthSetup({ serverId }: { serverId: string }) {
  const [requirements, setRequirements] = useState<MethodResult<"mcp.oauth.requirements"> | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("http://127.0.0.1:42817/oauth/mcp");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    setRequirements(null);
    setClientId("");
    setClientSecret("");
    setError("");
    setBusy(false);
    return () => {
      generation.current++;
    };
  }, [serverId]);
  const work = async (action: () => Promise<void>) => {
    const original = generation.current;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (reason) {
      if (generation.current === original) setError(errorMessage(reason));
    } finally {
      if (generation.current === original) setBusy(false);
    }
  };
  const discover = async () => {
    const original = generation.current;
    const result = await bridge.invoke("mcp.oauth.requirements", { serverId });
    if (generation.current !== original) return;
    setRequirements(result);
    if (result.redirectUrl) setRedirectUrl(result.redirectUrl);
  };
  return (
    <fieldset>
      <legend>Provider client registration</legend>
      <p>
        Check the provider's current requirements before signing in. Aux keeps registered client credentials
        in this Profile's Keychain.
      </p>
      <button type="button" disabled={busy} onClick={() => void work(discover)}>
        Check registration requirements
      </button>
      {requirements && (
        <>
          <p>
            Authorization provider: <code>{requirements.issuer}</code>
          </p>
          {requirements.automaticRegistration ? (
            <p>This provider supports automatic Aux client registration during sign-in.</p>
          ) : (
            <p>
              This provider requires an Aux-owned registered client. Register the exact callback below with
              the provider; Vercel also requires client review.
            </p>
          )}
          {requirements.configured && (
            <p>An Aux client registration is saved. Secrets are never displayed here.</p>
          )}
          {!requirements.automaticRegistration && (
            <>
              <label>
                Registered callback URL
                <input
                  value={redirectUrl}
                  onChange={(event) => setRedirectUrl(event.target.value)}
                  disabled={busy}
                  autoComplete="off"
                />
              </label>
              <label>
                Aux client ID
                <input
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  disabled={busy}
                  autoComplete="off"
                />
              </label>
              <label>
                Client secret, if required
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(event) => setClientSecret(event.target.value)}
                  disabled={busy}
                  autoComplete="new-password"
                />
              </label>
              <button
                type="button"
                disabled={busy || !clientId.trim()}
                onClick={() =>
                  void work(async () => {
                    const original = generation.current;
                    await bridge.invoke("mcp.oauth.configure", {
                      serverId,
                      issuer: requirements.issuer,
                      clientId,
                      ...(clientSecret ? { clientSecret } : {}),
                      redirectUrl,
                    });
                    if (generation.current !== original) return;
                    setClientId("");
                    setClientSecret("");
                    await discover();
                  })
                }
              >
                Save Aux client registration
              </button>
            </>
          )}
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </fieldset>
  );
}
