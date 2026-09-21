import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/opsz.css";
import "./tokens.css";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);
let booting = false;

async function boot() {
  if (booting) return;
  booting = true;
  root.render(<div className="boot-status" role="status">Opening Aux…</div>);
  try {
    // Keep the scripted preview bridge out of the native production bundle.
    if (import.meta.env.MODE === "mock" || import.meta.env.VITE_VECTOR_MOCK === "1") {
      const { installMockBridge } = await import("./mock/bridge");
      installMockBridge(new URLSearchParams(location.search));
    }
    const { App } = await import("./App");
    root.render(<App />);
  } catch (error) {
    root.render(<div className="boot-status"><div role="alert"><h1>Aux couldn’t open</h1><p>The browser interface didn’t finish loading.</p><button className="btn primary" onClick={() => void boot()}>Try again</button><details><summary>Details</summary><p>{error instanceof Error ? error.message : String(error)}</p></details></div></div>);
  } finally { booting = false; }
}

void boot();
