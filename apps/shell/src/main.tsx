import { errorMessage } from "./error-message";
import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import { captureFirstFrame } from "./first-frame";
import "./fonts.css";
import "./tokens.css";
import "./styles.css";
import { staticPrimaryButtonProps as auxClassPrimaryButtonProps } from "./ui/class-props";
import { nativeAlertRoleProps } from "./ui/native-attribute-props";

const root = createRoot(document.getElementById("root")!);
let booting = false;

function BootFailure({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="boot-status">
      <div {...nativeAlertRoleProps}>
        <h1>Aux couldn’t open</h1>
        <p>The browser interface didn’t finish loading.</p>
        <button {...auxClassPrimaryButtonProps} onClick={retry}>
          Try again
        </button>
        <details>
          <summary>Details</summary>
          <p>{errorMessage(error)}</p>
        </details>
      </div>
    </div>
  );
}

/** A render failure anywhere in the shell leaves a recoverable screen, not a dead window. */
class RootBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    if (this.state.error) return <BootFailure error={this.state.error} retry={() => location.reload()} />;
    return this.props.children;
  }
}

async function boot() {
  if (booting) return;
  booting = true;
  try {
    const chromiumShell = location.protocol === "chrome:" && location.hostname === "aux";
    if (chromiumShell) {
      const ready = (window as Window & { auxChromiumHostReady?: Promise<void> }).auxChromiumHostReady;
      if (!ready) throw new Error("Aux's Chromium host bootstrap is unavailable.");
      await ready;
      const { installChromiumBridge } = await import("./chromium-bridge");
      const validation = import.meta.env.DEV
        ? (await import("./host/validation.generated")).hostValidation
        : undefined;
      if (!installChromiumBridge(undefined, validation))
        throw new Error("Aux's Chromium host bridge is unavailable.");
    }
    // Keep the scripted preview bridge out of the native production bundle.
    if (!chromiumShell && import.meta.env.MODE === "mock") {
      const { installMockBridge } = await import("./mock/bridge");
      installMockBridge(new URLSearchParams(location.search));
    }
    const { App } = await import("./App");
    const { useStore } = await import("./store");
    const { bindFirstFrameActivation } = await import("./first-frame-owner");
    const firstFrame = captureFirstFrame();
    if (firstFrame?.activation) bindFirstFrameActivation(firstFrame.activation);
    if (
      firstFrame &&
      (firstFrame.mode === "ask" || (firstFrame.activation && firstFrame.text !== firstFrame.activation.text))
    )
      useStore.getState().setAgentDraft(firstFrame.text);
    root.render(
      <RootBoundary>
        <App />
      </RootBoundary>,
    );
  } catch (error) {
    root.render(<BootFailure error={error} retry={() => void boot()} />);
  } finally {
    booting = false;
  }
}

void boot();
