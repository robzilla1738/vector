import { CopilotSignIn } from "./CopilotSignIn";
import { useEffect, useRef, useState } from "react";
import { call } from "../../store";
import { bridge } from "../../bridge";
import { errorMessage } from "../../error-message";
import { PreferenceAction } from "./preference-command";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";

export type SignInProvider = "openrouter" | "chatgpt" | "vercel";

export function ProviderSignIn({
  onConnected,
  only,
}: {
  onConnected(): Promise<unknown>;
  only?: SignInProvider;
}) {
  const [provider, setProvider] = useState<"openrouter" | "chatgpt" | "vercel">("openrouter");
  const [accounts, setAccounts] = useState<
    Array<{
      provider: "chatgpt" | "vercel";
      accountId: string;
      email?: string;
      selected: boolean;
      connected: boolean;
    }>
  >([]);
  const [notice, setNotice] = useState("");
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const receipt = useRef<string | null>(null);
  const starting = useRef<object | null>(null);
  const original = useRef<object | null>(null);
  const refresh = useRef(onConnected);
  useEffect(() => {
    refresh.current = onConnected;
  }, [onConnected]);
  useEffect(() => {
    const owner = {};
    original.current = owner;
    let polling = false;
    const poll = async () => {
      const id = receipt.current;
      if (!id || original.current !== owner || polling) return;
      polling = true;
      try {
        const status = await call("models.auth.status", { attemptId: id });
        if (original.current !== owner || receipt.current !== id) return;
        setPhase(status.phase);
        if (status.phase === "connected") {
          receipt.current = null;
          await refresh.current();
          if (original.current === owner) {
            const saved = await call("models.auth.accounts", {});
            if (original.current === owner) setAccounts(saved);
          }
        } else if (status.phase !== "pending" && status.phase !== "authenticating") {
          receipt.current = null;
          setError(
            status.phase === "expired" ? "Sign-in expired. Try again." : "Sign-in did not finish. Try again.",
          );
        }
      } catch (reason) {
        if (original.current === owner && receipt.current === id) {
          receipt.current = null;
          void call("models.auth.cancel", { attemptId: id }).catch(() => {});
          setError(errorMessage(reason));
          setPhase("failed");
        }
      } finally {
        polling = false;
      }
    };
    const interval = setInterval(() => void poll(), 750);
    return () => {
      original.current = null;
      clearInterval(interval);
      const id = receipt.current;
      receipt.current = null;
      if (id) void call("models.auth.cancel", { attemptId: id }).catch(() => {});
    };
  }, []);
  const start = async (
    nextProvider: "openrouter" | "chatgpt" | "vercel" = "openrouter",
    accountId?: string,
  ) => {
    const owner = original.current;
    if (!owner || receipt.current || starting.current) return;
    starting.current = owner;
    setError("");
    setPhase("starting");
    setProvider(nextProvider);
    let issued: string | undefined;
    try {
      const attempt = await call("models.auth.start", {
        provider: nextProvider,
        ...(accountId ? { accountId } : {}),
      });
      issued = attempt.attemptId;
      if (original.current !== owner) {
        await call("models.auth.cancel", { attemptId: attempt.attemptId });
        return;
      }
      receipt.current = attempt.attemptId;
      setPhase(attempt.phase);
      await bridge.openExternal(attempt.authorizationUrl);
    } catch (reason) {
      if (issued && receipt.current === issued) receipt.current = null;
      if (issued) await call("models.auth.cancel", { attemptId: issued }).catch(() => {});
      if (original.current === owner) {
        setError(errorMessage(reason));
        setPhase("failed");
      }
    } finally {
      if (starting.current === owner) starting.current = null;
    }
  };
  const cancel = async () => {
    const owner = original.current;
    const id = receipt.current;
    if (!id) return;
    const result = await call("models.auth.cancel", { attemptId: id });
    if (original.current === owner && receipt.current === id) {
      receipt.current = null;
      setPhase(result.phase);
      if (result.phase === "connected") await refresh.current();
      const saved = await call("models.auth.accounts", {});
      if (original.current === owner) setAccounts(saved);
    }
  };
  const pending = ["starting", "pending", "authenticating"].includes(phase);
  return (
    <div>
      {(!only || only === "openrouter") && (
        <>
          <p>
            Connect your OpenRouter account. OpenRouter creates an API key you can revoke in your account.
          </p>
          <PreferenceAction
            command="connect-openrouter-account"
            scopeId="models-openrouter-sign-in"
            invoke={() => start("openrouter")}
            disabled={pending}
            {...smallButtonProps}
          >
            {pending && provider === "openrouter" ? "Waiting for OpenRouter…" : "Sign in to OpenRouter"}
          </PreferenceAction>
        </>
      )}
      {pending && (
        <PreferenceAction
          command="cancel-openrouter-sign-in"
          scopeId="models-openrouter-sign-in"
          invoke={cancel}
          disabled={phase === "starting"}
          {...smallGhostButtonProps}
        >
          Cancel
        </PreferenceAction>
      )}
      {(!only || only === "vercel") && (
        <>
          <p>
            Use AI Gateway through your Vercel team. Gateway credits and usage charges apply. Aux needs its
            own Sign in with Vercel registration and AI Gateway Use permission (currently private beta).
          </p>
          <PreferenceAction
            command="connect-vercel-account"
            scopeId="models-vercel-sign-in"
            invoke={() => start("vercel")}
            disabled={pending}
            {...smallButtonProps}
          >
            {pending && provider === "vercel" ? "Waiting for Vercel…" : "Sign in with Vercel"}
          </PreferenceAction>
        </>
      )}
      {(!only || only === "chatgpt") && (
        <>
          <p>
            Use eligible models from your ChatGPT plan. Aux receives no ChatGPT conversations. Plan limits and
            optional credits apply; image generation stays on its separate configured provider.
          </p>
          <PreferenceAction
            command="connect-chatgpt-account"
            scopeId="models-chatgpt-sign-in"
            invoke={() => start("chatgpt")}
            disabled={pending}
            {...smallButtonProps}
          >
            {pending && provider === "chatgpt" ? "Waiting for ChatGPT…" : "Continue with ChatGPT"}
          </PreferenceAction>
        </>
      )}
      {(!only || only === "chatgpt" || only === "vercel") && (
        <PreferenceAction
          command="show-chatgpt-accounts"
          scopeId="models-chatgpt-accounts"
          invoke={async () => {
            const owner = original.current;
            if (!owner) return;
            try {
              const saved = await call("models.auth.accounts", {});
              if (original.current === owner) setAccounts(saved);
            } catch (reason) {
              if (original.current === owner) setError(errorMessage(reason));
            }
          }}
          disabled={pending}
          {...smallGhostButtonProps}
        >
          Saved provider accounts
        </PreferenceAction>
      )}
      {accounts
        .filter((account) => !only || account.provider === only)
        .map((account) => (
          <div key={account.accountId}>
            <span>
              {account.email ?? (account.provider === "vercel" ? "Vercel account" : "ChatGPT account")}
              {account.selected && account.connected ? " · selected" : ""}
            </span>
            <PreferenceAction
              command={`use-chatgpt-${account.accountId}`}
              scopeId="models-chatgpt-accounts"
              invoke={() => start(account.provider, account.accountId)}
              disabled={pending}
              {...smallGhostButtonProps}
            >
              {account.connected ? "Use account" : "Sign in again"}
            </PreferenceAction>
            {account.connected && (
              <PreferenceAction
                command={`disconnect-chatgpt-${account.accountId}`}
                scopeId="models-chatgpt-accounts"
                invoke={async () => {
                  const owner = original.current;
                  if (!owner) return;
                  try {
                    const result = await call("models.auth.disconnect", { accountId: account.accountId });
                    if (original.current !== owner) return;
                    setNotice(
                      result.revocationConfirmed
                        ? `Signed out of ${account.provider === "vercel" ? "Vercel" : "ChatGPT"}.`
                        : `Signed out locally. Remote revocation was not confirmed; disconnect Aux in ${account.provider === "vercel" ? "Vercel" : "ChatGPT"} Settings.`,
                    );
                    const saved = await call("models.auth.accounts", {});
                    if (original.current !== owner) return;
                    setAccounts(saved);
                    await refresh.current();
                  } catch (reason) {
                    if (original.current === owner) setError(errorMessage(reason));
                  }
                }}
                disabled={pending}
                {...smallGhostButtonProps}
              >
                Sign out
              </PreferenceAction>
            )}
          </div>
        ))}
      {phase === "connected" && (
        <output>
          {{ chatgpt: "ChatGPT", vercel: "Vercel", openrouter: "OpenRouter" }[provider]} connected.
        </output>
      )}
      {!only && <CopilotSignIn />}
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
