/** One shutdown owns retirement and cleanup; refused retirement never becomes an ACK. */
export function runtimeShutdown(deps: {
  quiesce(): void;
  retireAuthority(): Promise<void>;
  closeEgress(): void;
  disconnectAuthority(): void;
  stopMessages(): Promise<void>;
  markInterrupted(): Promise<void>;
  stopFeatures(): Promise<void>;
  cleanup: readonly { stage: string; run(): void | Promise<void> }[];
  reportFailure(stage: string, error: unknown): void;
}): () => Promise<void> {
  let shutdown: Promise<void> | undefined;
  return () => {
    if (shutdown) return shutdown;
    // Publish ownership before callbacks can re-enter shutdown.
    let resolve!: () => void, reject!: (error: unknown) => void;
    shutdown = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
    void (async () => {
      const failures: unknown[] = [];
      const attempt = async (stage: string, action: () => void | Promise<void>) => {
        try { await action(); return true; }
        catch (error) {
          failures.push(error);
          try { deps.reportFailure(stage, error); } catch (auditError) { failures.push(auditError); }
          return false;
        }
      };
      await attempt("quiesce", deps.quiesce);
      const retired = await attempt("native-authority-retirement", deps.retireAuthority);
      if (!retired) await attempt("owner-disconnect", deps.disconnectAuthority);
      await attempt("egress-close", deps.closeEgress);
      await attempt("message-stop", deps.stopMessages);
      if (retired) await attempt("run-interruption", deps.markInterrupted);
      await attempt("feature-stop", deps.stopFeatures);
      for (const cleanup of deps.cleanup) await attempt(cleanup.stage, cleanup.run);
      if (failures.length) reject(new AggregateError(failures, "Runtime shutdown did not complete every authority boundary."));
      else resolve();
    })();
    return shutdown;
  };
}
