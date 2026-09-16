/**
 * Preload for engine-paint views. Forwards pointer and key events to main
 * so the live Vector Engine document receives the same input as the agent.
 */
import { ipcRenderer } from "electron";

type EngineDom = {
  addEventListener(
    type: string,
    listener: (e: { clientX: number; clientY: number; button: number; key: string }) => void,
    cap?: boolean,
  ): void;
};

const g = globalThis as unknown as EngineDom;
g.addEventListener(
  "mousedown",
  (e) => {
    ipcRenderer.send("engine-input", { type: "pointerdown", x: e.clientX, y: e.clientY, button: e.button });
  },
  true,
);
g.addEventListener(
  "keydown",
  (e) => {
    ipcRenderer.send("engine-input", { type: "key", key: e.key });
  },
  true,
);
