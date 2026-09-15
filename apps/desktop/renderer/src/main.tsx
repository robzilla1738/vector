import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/opsz.css";
import "./tokens.css";
import "./styles.css";

async function boot() {
  // `vite --mode mock` runs the shell in a plain browser against a scripted
  // runtime — the dynamic import keeps the mock out of the production bundle.
  if (import.meta.env.MODE === "mock" || import.meta.env.VITE_VECTOR_MOCK === "1") {
    const { installMockBridge } = await import("./mock/bridge");
    installMockBridge(new URLSearchParams(location.search));
  }
  const { App } = await import("./App");
  createRoot(document.getElementById("root")!).render(<App />);
}

void boot();
