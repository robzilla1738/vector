/**
 * Aux desktop — Electron main process.
 *
 * Owns: windows, native WebContentsViews, the persistent profile session,
 * downloads, context menus, keyboard forwarding, and the forked runtime.
 * The runtime (separate process) is the execution authority; this process
 * exposes native.* methods to it over fork IPC and forwards its event
 * stream to the renderer.
 */
import { app } from "electron";
import { primaryInstance } from "./app/instance.js";

// A losing instance must not evaluate the rest of main: it would restore/swap
// aux-state.sqlite under the running one. Keep top-level await out of the
// module graph below — esbuild's async init deadlocks on its import cycles.
if (primaryInstance) void import("./app/main.js");
else app.exit(0);
