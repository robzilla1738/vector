/** Shared native development defaults; explicit checkout choices remain authoritative. */
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import defaults from "./dev-defaults.json" with { type: "json" };

export const nativeSource = resolve(process.env.AUX_CHROMIUM_SRC ?? join(homedir(), defaults.source));
export const nativeFlavor = defaults.flavor;
export const nativeOutput = { dev: "AuxDev", fast: "AuxFast", release: "AuxRelease" };
