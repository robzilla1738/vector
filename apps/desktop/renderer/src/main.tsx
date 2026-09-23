import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./tokens.css";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);
let booting = false;

function BootFailure({ error, retry }: { error: unknown; retry: () => void }) {
  return <div className="boot-status"><div role="alert"><h1>Aux couldn’t open</h1><p>The browser interface didn’t finish loading.</p><button className="btn primary" onClick={retry}>Try again</button><details><summary>Details</summary><p>{error instanceof Error ? error.message : String(error)}</p></details></div></div>;
}

/** A render failure anywhere in the shell leaves a recoverable screen, not a dead window. */
class RootBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  override render() {
    if (this.state.error) return <BootFailure error={this.state.error} retry={() => location.reload()} />;
    return this.props.children;
  }
}

async function boot() {
  if (booting) return;
  booting = true;
  root.render(<div className="boot-status" role="status">Opening Aux…</div>);
  try {
    // Keep the scripted preview bridge out of the native production bundle.
    if (import.meta.env.MODE === "mock" || import.meta.env.VITE_AUX_MOCK === "1") {
      const { installMockBridge } = await import("./mock/bridge");
      installMockBridge(new URLSearchParams(location.search));
    }
    const { App } = await import("./App");
    root.render(<RootBoundary><App /></RootBoundary>);
  } catch (error) {
    root.render(<BootFailure error={error} retry={() => void boot()} />);
  } finally { booting = false; }
}

void boot();
