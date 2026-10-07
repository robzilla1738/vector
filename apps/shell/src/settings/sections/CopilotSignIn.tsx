import { useEffect, useRef, useState } from "react";
import type { MethodResult } from "@aux/contracts";
import { call } from "../../store";
import { bridge } from "../../bridge";
import { errorMessage } from "../../error-message";
import { PreferenceAction } from "./preference-command";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";

/** Optional account/catalog setup; deliberately absent from inference-provider selection. */
export function CopilotSignIn() {
  const [setup, setSetup] = useState<MethodResult<"models.copilot.setup"> | null>(null);
  const [accounts, setAccounts] = useState<MethodResult<"models.copilot.accounts">>([]);
  const [models, setModels] = useState<MethodResult<"models.copilot.catalog">["models"]>([]);
  const [phase, setPhase] = useState("idle");
  const [userCode, setUserCode] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const owner = useRef<object | null>(null);
  const attempt = useRef<string | null>(null);
  const current = (original: object) => owner.current === original;
  const refresh = async (original: object) => {
    const [state, saved] = await Promise.all([
      call("models.copilot.setup", {}),
      call("models.copilot.accounts", {}),
    ]);
    if (current(original)) {
      setSetup(state);
      setAccounts(saved);
    }
  };
  useEffect(() => {
    const original = {};
    owner.current = original;
    void refresh(original).catch((reason) => {
      if (current(original)) setError(errorMessage(reason));
    });
    let polling = false;
    const timer = setInterval(() => {
      const id = attempt.current;
      if (!id || !current(original) || polling) return;
      polling = true;
      void call("models.copilot.status", { attemptId: id })
        .then(async (status) => {
          if (!current(original) || attempt.current !== id) return;
          setPhase(status.phase);
          if (status.phase === "connected") {
            attempt.current = null;
            setUserCode("");
            setModels([]);
            setNotice(
              "GitHub account verified. Inspect its catalog and explicitly choose a model for Aux.",
            );
            await refresh(original);
          } else if (!["pending", "authenticating"].includes(status.phase)) {
            attempt.current = null;
            setUserCode("");
            setError(
              status.phase === "expired"
                ? "The device code expired. Sign in again."
                : "Copilot sign-in did not finish.",
            );
          }
        })
        .catch((reason) => {
          if (!current(original) || attempt.current !== id) return;
          attempt.current = null;
          setUserCode("");
          setPhase("failed");
          setError(errorMessage(reason));
          void call("models.copilot.cancel", { attemptId: id }).catch(() => {});
        })
        .finally(() => {
          polling = false;
        });
    }, 750);
    return () => {
      owner.current = null;
      clearInterval(timer);
      const id = attempt.current;
      attempt.current = null;
      if (id) void call("models.copilot.cancel", { attemptId: id }).catch(() => {});
    };
  }, []);
  const run = async (nextPhase: string, work: (original: object) => Promise<void>) => {
    const original = owner.current;
    if (!original || busy) return;
    setError("");
    setNotice("");
    setPhase(nextPhase);
    try {
      await work(original);
    } catch (reason) {
      if (current(original)) {
        setError(errorMessage(reason));
        setPhase("failed");
      }
    }
  };
  const start = () =>
    run("starting", async (original) => {
      const challenge = await call("models.copilot.start", {});
      if (!current(original)) {
        await call("models.copilot.cancel", { attemptId: challenge.attemptId });
        return;
      }
      attempt.current = challenge.attemptId;
      setUserCode(challenge.userCode);
      setPhase(challenge.phase);
      try {
        await bridge.openExternal(challenge.authorizationUrl);
      } catch (reason) {
        await call("models.copilot.cancel", { attemptId: challenge.attemptId });
        if (current(original) && attempt.current === challenge.attemptId) attempt.current = null;
        throw reason;
      }
    });
  const cancel = async () => {
    const original = owner.current,
      id = attempt.current;
    if (!original || !id) return;
    try {
      const result = await call("models.copilot.cancel", { attemptId: id });
      if (current(original) && attempt.current === id) {
        attempt.current = null;
        setUserCode("");
        setPhase(result.phase);
        await refresh(original);
      }
    } catch (reason) {
      if (current(original)) setError(errorMessage(reason));
    }
  };
  const pending = ["starting", "pending", "authenticating"].includes(phase);
  const busy = pending || ["installing", "catalog", "disconnecting", "selecting"].includes(phase);
  const ready = !!setup?.registrationConfigured && setup.runtimeInstalled && setup.runtimeSupported;
  return (
    <section aria-label="Copilot account setup">
      <h3>GitHub Copilot</h3>
      <p>Choose an account-advertised model for Aux’s own tool loop. Copilot premium/quota charges have unresolved USD cost; finite money or unsupported output envelopes refuse before inference.</p>
      {!setup && !error && <p role="status">Checking Copilot setup…</p>}
      {setup && !setup.registrationConfigured && (
        <p role="status">
          Copilot sign-in requires Aux’s registered GitHub application. This build is not configured yet.
        </p>
      )}
      {setup && !setup.runtimeSupported && (
        <p role="status">This native host does not support owned Copilot sessions.</p>
      )}
      {setup && !setup.runtimeInstalled && (
        <>
          <p>
            The optional official Copilot runtime is downloaded separately. Installing it does not sign in or
            execute it.
          </p>
          <PreferenceAction
            command="install-copilot-runtime"
            scopeId="models-copilot-setup"
            disabled={busy}
            invoke={() =>
              run("installing", async (original) => {
                await call("models.copilot.install", {});
                if (!current(original)) return;
                await refresh(original);
                if (current(original)) setPhase("idle");
              })
            }
            {...smallButtonProps}
          >
            {phase === "installing" ? "Installing optional runtime…" : "Install Copilot runtime"}
          </PreferenceAction>
        </>
      )}
      <PreferenceAction
        command="connect-copilot-account"
        scopeId="models-copilot-setup"
        invoke={start}
        disabled={!ready || busy}
        {...smallButtonProps}
      >
        {pending ? "Waiting for GitHub…" : "Sign in with GitHub"}
      </PreferenceAction>
      {userCode && pending && (
        <p>
          Enter this code at GitHub: <strong>{userCode}</strong>
        </p>
      )}
      {attempt.current && pending && (
        <PreferenceAction
          command="cancel-copilot-sign-in"
          scopeId="models-copilot-setup"
          invoke={cancel}
          {...smallGhostButtonProps}
        >
          Cancel
        </PreferenceAction>
      )}
      {accounts.map((account) => (
        <div key={account.accountId}>
          <span>
            {account.login}
            {account.selected ? " · selected account" : " · saved"}
            {!account.connected || account.needsReauthentication ? " · sign in again" : ""}
          </span>
          <PreferenceAction
            command={`catalog-copilot-${account.accountId}`}
            scopeId="models-copilot-accounts"
            disabled={busy || !ready || !account.selected || !account.connected}
            invoke={() =>
              run("catalog", async (original) => {
                const result = await call("models.copilot.catalog", {
                  accountId: account.accountId,
                });
                if (current(original)) {
                  setModels(result.models);
                  setPhase("idle");
                }
              })
            }
            {...smallGhostButtonProps}
          >
            Inspect catalog
          </PreferenceAction>
          <PreferenceAction
            command={`disconnect-copilot-${account.accountId}`}
            scopeId="models-copilot-accounts"
            disabled={busy}
            invoke={() =>
              run("disconnecting", async (original) => {
                await call("models.copilot.disconnect", {
                  accountId: account.accountId,
                });
                if (!current(original)) return;
                setModels([]);
                setNotice("Signed out locally. Remote GitHub authorization was not revoked.");
                await refresh(original);
                if (current(original)) setPhase("idle");
              })
            }
            {...smallGhostButtonProps}
          >
            Sign out locally
          </PreferenceAction>
        </div>
      ))}
      {models.length > 0 && (
        <ul aria-label="Copilot account catalog">
          {models.map((model) => (
            <li key={model.id}>
              {model.name}
              {model.policy ? ` · ${model.policy}` : ""}
              <PreferenceAction
                command={`use-copilot-${model.id}`}
                scopeId="models-copilot-accounts"
                disabled={busy || !ready || model.policy === "disabled"}
                invoke={() =>
                  run("selecting", async (original) => {
                    await call("settings.set", { copilotModelId: model.id });
                    if (current(original)) {
                      setNotice(
                        `Using ${model.name} through this Copilot account. Premium/quota usage is accounted separately; USD cost is unresolved.`,
                      );
                      setPhase("idle");
                    }
                  })
                }
                {...smallGhostButtonProps}
              >
                Use model
              </PreferenceAction>
            </li>
          ))}
        </ul>
      )}
      <PreferenceAction
        command="use-configured-api-model"
        scopeId="models-copilot-accounts"
        disabled={busy || !ready}
        invoke={() =>
          run("selecting", async (original) => {
            await call("settings.set", { copilotModelId: null });
            if (current(original)) {
              setNotice("Using the configured API model connection.");
              setPhase("idle");
            }
          })
        }
        {...smallGhostButtonProps}
      >
        Use configured API connection
      </PreferenceAction>
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
