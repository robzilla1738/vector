import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_BROWSER_COOLDOWN_MS,
  ONBOARDING_DISCLOSURE_VERSION,
  ONBOARDING_POSTCARDS,
  ONBOARDING_STEPS,
  type ConnectorCatalog,
  type OnboardingState,
  type OnboardingUpdate,
  type PageContextRef,
  type PageTarget,
  type Run,
} from "@aux/contracts";
import { bridge, inNativeHost } from "../bridge";
import { call, useStore } from "../store";
import { Badge, Dialog } from "../ui";
import { ImportDataSetting } from "../components/ImportDataSetting";
import { LayoutChoice } from "../components/LayoutChoice";
import { ModelsSettings } from "../settings/sections/Models";
import { RecoveryPackage } from "../settings/sections/RecoveryPackage";
import { SPACE_COLORS, type SpaceColor } from "../workspace";
import "./onboarding.css";
import { PastedMemorySetup } from "./PastedMemorySetup";
import { SetupReview } from "./SetupReview";

const TITLES = {
  welcome: "A browser for what comes next",
  import: "Bring the parts you want",
  model: "Choose how Aux thinks with you",
  appearance: "Make room for your way of working",
  default: "Open your next link here",
  permissions: "You stay in charge",
  postcard: "Start with one useful question",
};
export function availableOnboardingPage(page: PageTarget): boolean {
  try {
    const url = new URL(page.url);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !page.ownedByRuntime &&
      !page.loading &&
      page.controller !== "agent" &&
      page.controller !== "external" &&
      page.windowId === bridge.windowId &&
      !["detached", "crashed"].includes(page.viewStatus)
    );
  } catch {
    return false;
  }
}

export function OnboardingFlow({
  initialState,
  onClose,
}: {
  initialState: OnboardingState;
  onClose(): void;
}) {
  const [state, setState] = useState(initialState);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const busyRef = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const connected = useStore((s) => s.connected);
  const settings = useStore((s) => s.settings),
    pages = useStore((s) => s.pages),
    layout = useStore((s) => s.layout);
  const activeSpace = layout.spaces.find((space) => space.id === layout.activeSpaceId);
  const [recovery, setRecovery] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<"checking" | "ready" | "pending" | "unavailable">(
    "checking",
  );
  const restorePending = restoreStatus === "pending";
  const restoreGeneration = useRef(0);
  const [isDefault, setIsDefault] = useState<boolean | null>(null);
  const [catalogResult, setCatalogResult] = useState<{ workspaceId: string; value: ConnectorCatalog } | null>(
    null,
  );
  const catalog = catalogResult?.workspaceId === activeSpace?.workspaceId ? catalogResult?.value : null;
  const [openedAt] = useState(Date.now);
  const [pageId, setPageId] = useState("");
  const [reviewedPage, setReviewedPage] = useState<PageContextRef | null>(null);
  const [pageUrl, setPageUrl] = useState("");
  const [showMemoryImport, setShowMemoryImport] = useState(false);
  const step = state.step,
    index = ONBOARDING_STEPS.indexOf(step);
  const page = pages.find((item) => item.pageId === pageId);
  const pageReviewed =
    !!page &&
    !!reviewedPage &&
    page.pageId === reviewedPage.pageId &&
    page.documentEpoch === reviewedPage.documentEpoch &&
    page.url === reviewedPage.url &&
    page.sessionId === reviewedPage.sessionId &&
    availableOnboardingPage(page);
  const selectedPostcard = state.firstTask?.postcardId;
  const ready =
    settings.modelConfigured === true && state.disclosureVersion === ONBOARDING_DISCLOSURE_VERSION;
  const cooldown =
    state.defaultBrowserPromptedAt !== undefined &&
    openedAt - state.defaultBrowserPromptedAt < DEFAULT_BROWSER_COOLDOWN_MS;

  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const checkRecovery = useCallback(async () => {
    const attempt = ++restoreGeneration.current;
    if (!inNativeHost || !connected) {
      setRestoreStatus("unavailable");
      return false;
    }
    setRestoreStatus("checking");
    try {
      const value = await call("installation.restoreStatus", {});
      if (restoreGeneration.current !== attempt) return false;
      setRestoreStatus(value.pending ? "pending" : "ready");
      return !value.pending;
    } catch {
      if (restoreGeneration.current === attempt) setRestoreStatus("unavailable");
      return false;
    }
  }, [connected]);
  const invalidateRecovery = useCallback(() => {
    restoreGeneration.current++;
  }, []);
  useEffect(() => {
    let live = true;
    void Promise.resolve().then(() => {
      if (live) return checkRecovery();
    });
    const refresh = () => {
      void checkRecovery();
    };
    window.addEventListener("focus", refresh);
    return () => {
      live = false;
      invalidateRecovery();
      window.removeEventListener("focus", refresh);
    };
  }, [checkRecovery, invalidateRecovery]);
  useEffect(() => {
    if (step !== "default" || !inNativeHost) return;
    let live = true;
    const read = () =>
      void bridge
        .defaultBrowser()
        .then((value) => {
          if (live) setIsDefault(value.isDefault);
        })
        .catch(() => {
          if (live) setIsDefault(null);
        });
    read();
    window.addEventListener("focus", read);
    return () => {
      live = false;
      window.removeEventListener("focus", read);
    };
  }, [step]);
  useEffect(() => {
    if (step !== "postcard" || !activeSpace?.workspaceId) return;
    let live = true;
    const workspaceId = activeSpace.workspaceId;
    void call("connectors.catalog", { workspaceId: activeSpace.workspaceId })
      .then((value) => {
        if (live) setCatalogResult({ workspaceId, value });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [step, activeSpace?.workspaceId]);
  async function work(action: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Setup could not be saved. Check progress before trying again.",
      );
      try {
        setState(await call("onboarding.get"));
      } catch {
        /* Keep visible progress while disconnected. */
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function update(action: OnboardingUpdate["action"], next?: OnboardingUpdate["step"]) {
    const value = await call("onboarding.update", {
      revision: state.revision,
      action,
      ...(next ? { step: next } : {}),
    });
    setState(value);
    return value;
  }
  const later = () => {
    if (!connected) {
      onClose();
      return;
    }
    void work(async () => {
      await update("later");
      onClose();
    });
  };
  async function saveSettings(patch: Record<string, unknown>) {
    try {
      await call("settings.set", patch);
      const next = await call("settings.get");
      useStore.setState({ settings: next });
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this setting.");
      return false;
    }
  }
  function reveal(run: Run) {
    useStore.setState((current) => ({
      runs: current.runs.some((item) => item.runId === run.runId) ? current.runs : [run, ...current.runs],
    }));
    useStore.getState().openConversation(run.runId);
    onClose();
  }
  const first = state.firstTask;
  return (
    <Dialog
      label="Set up Aux"
      onClose={later}
      className="aux-dialog-surface onboarding-dialog"
      initialFocusRef={heading}
    >
      <div
        role="presentation"
        className="onboarding-flow"
        onKeyDown={(event) => {
          if (
            step === "welcome" &&
            event.metaKey &&
            event.key === "Enter" &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            event.stopPropagation();
            later();
          }
        }}
      >
        <header>
          <span className="eyebrow">
            AUX · SETUP {index + 1} OF {ONBOARDING_STEPS.length}
          </span>
          <button className="btn sm ghost" disabled={busy} onClick={later}>
            Finish later
          </button>
        </header>
        <nav aria-label="Setup steps">
          {ONBOARDING_STEPS.map((item, position) => (
            <button
              key={item}
              className="btn sm ghost"
              disabled={busy || !connected}
              aria-current={step === item ? "step" : undefined}
              aria-label={`${position + 1}. ${item}${state.skipped.includes(item) ? ", skipped" : ""}`}
              onClick={() =>
                void work(async () => {
                  await update("visit", item);
                })
              }
            >
              {position + 1}
            </button>
          ))}
        </nav>
        <h1 ref={heading} tabIndex={-1}>
          {TITLES[step]}
        </h1>
        {!connected && (
          <output>
            Aux is disconnected. Saved setup progress is safe; reconnect to continue, or finish later to
            browse.
          </output>
        )}
        <fieldset className="onboarding-content" disabled={!connected} aria-label="Setup choices">
          {step === "welcome" && (
            <>
              <p>
                Bring your browsing with you, choose a model, and turn a question into a useful first chat.
              </p>
              <p>
                Every step is optional. Your progress stays with this Profile. Replay setup in Settings →
                General at any time. Press ⌘↩ to finish later.
              </p>
              <button className="btn ghost" aria-expanded={recovery} onClick={() => setRecovery(!recovery)}>
                Recover an existing Aux Profile
              </button>
              {recovery && (
                <fieldset disabled={restoreStatus !== "ready"}>
                  <RecoveryPackage pending={restorePending} onStaged={() => setRestoreStatus("pending")} />
                </fieldset>
              )}
            </>
          )}
          {step === "import" && (
            <>
              <p>
                Review Chrome, Arc, Safari or Firefox, then choose the Profiles and categories to bring over.
                Nothing imports until you confirm your selection.
              </p>
              <p>
                The browser import does not copy passwords, cookies or account access. macOS may separately
                ask for Keychain access when Aux stores or unlocks its own encrypted Profile data or model
                keys. Read that system prompt before allowing it.
              </p>
              <ImportDataSetting />
              <p className="hint">
                Leaving this step does not cancel an import you started. Return here to inspect its durable
                progress; interrupted imports require a fresh review before retry.
              </p>
            </>
          )}
          {step === "model" && (
            <>
              <p>
                Model requests send your prompt, selected page context and attached material to the provider
                you choose. Gateway routes requests to that provider; BYOK uses your chosen provider account.
                Usage may cost money. Credentials are saved through the OS credential store.
              </p>
              <p>
                <strong>Muse Spark 1.3 Contributor:</strong> this tier lets Meta use prompts and completions
                sent to it to improve its models. Select a provider and model whose data use fits your work.
              </p>
              {state.disclosureVersion !== ONBOARDING_DISCLOSURE_VERSION ? (
                <button
                  className="btn"
                  disabled={busy}
                  onClick={() =>
                    void work(async () => {
                      await update("disclosure");
                    })
                  }
                >
                  I’ve reviewed model data use
                </button>
              ) : (
                <>
                  <p className="hint">
                    A connection test sends a model request only when you choose Test. Setup itself makes no
                    model call.
                  </p>
                  <ModelsSettings active settings={settings} onSave={saveSettings} />
                </>
              )}
            </>
          )}
          {step === "appearance" && (
            <>
              <p>
                Changes apply immediately to this Profile. Try both tab layouts and choose a color for the
                current Space.
              </p>
              <fieldset disabled={busy}>
                <legend>Theme</legend>
                {(["system", "dark", "light"] as const).map((theme) => (
                  <label key={theme}>
                    <input
                      type="radio"
                      name="onboarding-theme"
                      checked={(settings.theme ?? "dark") === theme}
                      onChange={() =>
                        void work(async () => {
                          await saveSettings({ theme });
                        })
                      }
                    />
                    {theme}
                  </label>
                ))}
              </fieldset>
              <LayoutChoice
                value={String(settings.tabLayout ?? "horizontal")}
                onChange={(tabLayout) =>
                  void work(async () => {
                    await saveSettings({ tabLayout });
                  })
                }
              />
              {activeSpace && (
                <label>
                  Space color
                  <select
                    value={activeSpace.color}
                    disabled={busy}
                    onChange={(event) => {
                      const color = event.target.value as SpaceColor;
                      void work(async () => {
                        await useStore
                          .getState()
                          .editSpace(activeSpace.id, activeSpace.name, color, activeSpace.grain, null);
                      });
                    }}
                  >
                    {SPACE_COLORS.map((color) => (
                      <option key={color}>{color}</option>
                    ))}
                  </select>
                </label>
              )}
              <p className="hint">Your system’s reduced motion and contrast preferences still apply.</p>
            </>
          )}
          {step === "default" && (
            <>
              <p>
                Make Aux the place links open from other apps. This is optional and does not change what you
                can use.
              </p>
              {isDefault === true ? (
                <p>Aux is your default browser.</p>
              ) : (
                <button
                  className="btn"
                  disabled={busy || !inNativeHost || cooldown || isDefault === null}
                  onClick={() =>
                    void work(async () => {
                      await update("default-prompt");
                      const value = await bridge.setDefaultBrowser();
                      setIsDefault(value.isDefault);
                      if (!value.isDefault)
                        setError(
                          "The system has not confirmed a change. You can check System Settings or continue setup.",
                        );
                    })
                  }
                >
                  Make Aux the default browser
                </button>
              )}
              {cooldown && (
                <p>
                  Setup will wait seven days before offering another system prompt. You can change this in
                  Settings at any time.
                </p>
              )}
              {!inNativeHost && <p>This choice is available in the native Aux app.</p>}
            </>
          )}
          {step === "permissions" && (
            <>
              <p>
                Starting a chat gives Aux the question and sources you select. It does not connect accounts or
                grant access to folders.
              </p>
              <ul>
                <li>
                  Review the source, recipient and action when Aux asks for approval. Never approve a request
                  you do not recognize.
                </li>
                <li>
                  Connected services need their own reviewed grants. A connected account is not permission to
                  send, change or delete anything.
                </li>
                <li>
                  Browser tasks use a separate, temporary browsing session. It starts without your cookies or
                  saved passwords; sign in separately if needed.
                </li>
                <li>
                  You can stop a task, take control of a page, or change permissions in Settings. Stopping
                  cannot undo an action that already completed.
                </li>
                <li>
                  Memory is optional. Review remembered information and pasted assistant notes through the
                  existing Memory controls before using them.
                </li>
              </ul>
              <p>
                Setup does not enable Memory, broaden grants, connect services or import credentials
                automatically.
              </p>
              <button
                className="btn ghost"
                aria-expanded={showMemoryImport}
                onClick={() => setShowMemoryImport(!showMemoryImport)}
              >
                Import notes from another assistant
              </button>
              {showMemoryImport && <PastedMemorySetup />}
            </>
          )}
          {step === "postcard" && (
            <>
              <p>
                Choose a page you want to understand. Aux will use a separate browsing session; the page’s
                address is copied, without its cookies or saved passwords.
              </p>
              <SetupReview
                connected={connected}
                settings={settings}
                state={state}
                recovery={restoreStatus}
                source={pageReviewed ? reviewedPage : null}
                onCheckRecovery={() => void checkRecovery()}
                onVisit={(next) => {
                  void work(async () => {
                    await update("visit", next);
                  });
                }}
              />
              {first?.status === "started" ? (
                <button
                  className="btn"
                  disabled={busy}
                  onClick={() =>
                    void work(async () => {
                      const result = await call("runs.get", { runId: first.runId });
                      reveal(result.run);
                    })
                  }
                >
                  Open your first chat
                </button>
              ) : first?.status === "unavailable" ? (
                <p>
                  Your first setup chat is unavailable. Replay will not recreate it. Check Chats before
                  starting anything again. Start a new chat from Aux whenever you’re ready.
                </p>
              ) : (
                <>
                  {!ready && (
                    <p>
                      Review model data use and configure a connection in step 3 before starting. You can skip
                      this step and browse normally.
                    </p>
                  )}
                  <label>
                    Page to explore
                    <input
                      type="url"
                      value={pageUrl}
                      placeholder="https://example.com"
                      disabled={busy}
                      onChange={(event) => setPageUrl(event.target.value)}
                    />
                  </label>
                  <button
                    className="btn sm"
                    disabled={busy || !pageUrl.trim() || !activeSpace}
                    onClick={() =>
                      void work(async () => {
                        const url = new URL(pageUrl.trim());
                        if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
                          throw new Error("Enter an HTTP or HTTPS page without embedded credentials.");
                        const opened = await useStore
                          .getState()
                          .openBackgroundTab(url.href, activeSpace!.id, false);
                        setPageId(opened.pageId);
                        setReviewedPage(null);
                      })
                    }
                  >
                    Open page in background
                  </button>
                  <label>
                    Reviewed source
                    <select
                      value={pageId}
                      disabled={busy}
                      onChange={(event) => {
                        setPageId(event.target.value);
                        setReviewedPage(null);
                      }}
                    >
                      <option value="">Choose an available page</option>
                      {pages.filter(availableOnboardingPage).map((item) => (
                        <option key={item.pageId} value={item.pageId}>
                          {item.title || item.url} — {item.url}
                        </option>
                      ))}
                    </select>
                  </label>
                  {page && availableOnboardingPage(page) && (
                    <button
                      className="btn sm ghost"
                      disabled={busy}
                      onClick={() =>
                        void work(async () => {
                          await update("later");
                          await useStore.getState().activate(page.pageId);
                          onClose();
                        })
                      }
                    >
                      View selected page; finish setup later
                    </button>
                  )}
                  {page && availableOnboardingPage(page) && (
                    <label>
                      <input
                        type="checkbox"
                        checked={pageReviewed}
                        disabled={busy}
                        onChange={(event) =>
                          setReviewedPage(
                            event.target.checked
                              ? {
                                  pageId: page.pageId,
                                  url: page.url,
                                  documentEpoch: page.documentEpoch,
                                  sessionId: page.sessionId,
                                }
                              : null,
                          )
                        }
                      />
                      I’ve reviewed this page and want to send its context to the selected model.
                    </label>
                  )}
                  {first && (
                    <output>
                      {first.status === "pending"
                        ? "Starting your first chat. Check progress if the connection was interrupted."
                        : "The first chat did not finish starting. Review the page and retry; Aux reuses the same delivery identity."}
                    </output>
                  )}
                  <div className="onboarding-postcards">
                    {ONBOARDING_POSTCARDS.filter(
                      (card) => !selectedPostcard || card.id === selectedPostcard,
                    ).map((card) => (
                      <article key={card.id}>
                        <h2>{card.question}</h2>
                        <p>{card.prompt}</p>
                        <div className="row" aria-label="Tools for this question">
                          {card.tools.map((tool) => (
                            <Badge key={tool} label={tool} />
                          ))}
                        </div>
                        {card.id === "plan" &&
                          catalog?.entries.some(
                            (entry) => entry.kind === "calendar" && entry.state === "active",
                          ) && <p className="hint">Calendar connected · task approval still required</p>}
                        {catalog?.entries.some(
                          (entry) => entry.kind === "mcp" && entry.state === "approved",
                        ) && <p className="hint">MCP connected · tool approval still required</p>}
                        <button
                          className="btn"
                          disabled={
                            busy ||
                            !connected ||
                            restoreStatus !== "ready" ||
                            !ready ||
                            !pageReviewed ||
                            first?.status === "pending"
                          }
                          onClick={() =>
                            void work(async () => {
                              if (!(await checkRecovery()))
                                throw new Error(
                                  "Recovery readiness changed. Resolve it before starting a chat.",
                                );
                              const livePage = useStore
                                .getState()
                                .pages.find((item) => item.pageId === reviewedPage?.pageId);
                              if (
                                !livePage ||
                                !availableOnboardingPage(livePage) ||
                                livePage.url !== reviewedPage?.url ||
                                livePage.documentEpoch !== reviewedPage?.documentEpoch ||
                                livePage.sessionId !== reviewedPage?.sessionId
                              )
                                throw new Error(
                                  "The selected page changed during review. Review its current document before starting.",
                                );
                              const result = await call("onboarding.start", {
                                revision: state.revision,
                                postcardId: card.id,
                                page: reviewedPage!,
                              });
                              setState(result.state);
                              if (result.run) reveal(result.run);
                            })
                          }
                        >
                          {first ? "Retry this first chat" : "Start this chat"}
                        </button>
                      </article>
                    ))}
                  </div>
                </>
              )}
              {first?.status === "pending" && (
                <button
                  className="btn sm"
                  disabled={busy}
                  onClick={() =>
                    void work(async () => {
                      setState(await call("onboarding.get"));
                    })
                  }
                >
                  Check chat progress
                </button>
              )}
            </>
          )}
        </fieldset>
        {error && (
          <div role="alert">
            <p>{error}</p>
            <button
              className="btn sm"
              disabled={busy}
              onClick={() =>
                void work(async () => {
                  setState(await call("onboarding.get"));
                })
              }
            >
              Reload setup progress
            </button>
          </div>
        )}
        {restoreStatus === "unavailable" && (
          <p role="alert">
            Recovery readiness is unavailable. New chat starts are blocked until it can be checked.{" "}
            <button
              className="btn sm ghost"
              disabled={busy || !connected}
              onClick={() => void checkRecovery()}
            >
              Retry recovery check
            </button>
          </p>
        )}
        {restorePending && (
          <output>
            Recovery is staged. Quit Aux normally and reopen to apply it before starting new work.
          </output>
        )}
        <footer>
          <button
            className="btn ghost"
            disabled={busy || !connected}
            onClick={() =>
              void work(async () => {
                const next = await update("skip");
                if (next.status === "complete") onClose();
              })
            }
          >
            {step === "postcard" ? "Finish without a chat" : "Skip this step"}
          </button>
          {index > 0 && (
            <button
              className="btn ghost"
              disabled={busy || !connected}
              onClick={() =>
                void work(async () => {
                  await update("visit", ONBOARDING_STEPS[index - 1]);
                })
              }
            >
              Back
            </button>
          )}
          <button
            className="btn"
            disabled={busy || !connected || restorePending}
            onClick={() =>
              void work(async () => {
                if (index === ONBOARDING_STEPS.length - 1) {
                  await update("finish");
                  onClose();
                } else await update("visit", ONBOARDING_STEPS[index + 1]);
              })
            }
          >
            {index === ONBOARDING_STEPS.length - 1 ? "Finish setup" : "Continue"}
          </button>
        </footer>
      </div>
    </Dialog>
  );
}
