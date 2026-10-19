/**
 * Anchored edits to the vendored daemon bundle. Every anchor must match exactly `count`
 * times; a version bump that moves one fails the build instead of silently misapplying.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AUX_SKILL_NAME, CLI_COMMAND, PRODUCT_WORD, SKILL_INSTALL_REPLACEMENT, SKILL_INSTALL_STEP } from "./brand.mjs";

const here = import.meta.dirname;

export const AUX_PORT = 21520;
export const AUX_CDP_PORT = 45203;
export const AUX_API_ORIGIN = "http://aux-api.local";
export const AUX_BUNDLE_ID = "dev.aux.browser";

const exact = (name, find, replace, count = 1) => ({ name, find, replace, count });

export const daemonPatches = [
  // Ports, home and identity
  exact("daemon port", "||21420", `||${AUX_PORT}`),
  exact("daemon url default", "http://localhost:21420", `http://localhost:${AUX_PORT}`),
  exact("cdp host", "??`localhost:45103`", `??\`localhost:${AUX_CDP_PORT}\``),
  exact("home directory", "path.join(os.homedir(),`.aside`)", "path.join(os.homedir(),`.aux`)"),
  exact("keychain prefix", "ASIDE_KEYCHAIN_ID_PREFIX=`aside`", "ASIDE_KEYCHAIN_ID_PREFIX=`aux`"),
  exact("browser app name", "ASIDE_BROWSER_APP_NAME=`Aside`", "ASIDE_BROWSER_APP_NAME=`Aux`"),
  exact(
    "browser user data dir",
    "path.join(os.homedir(),`Library`,`Application Support`,`Aside`)",
    "path.join(os.homedir(),`Library`,`Application Support`,`Aux`)",
  ),
  { name: "browser bundle id", find: /at\.studio\.AsideBrowser/g, replace: AUX_BUNDLE_ID, min: 8 },

  // Local-only operation
  exact(
    "hosted api origin",
    "process.env.ASIDE_API_URL?process.env.ASIDE_API_URL:`https://api.aside.com`",
    `process.env.ASIDE_API_URL?process.env.ASIDE_API_URL:\`${AUX_API_ORIGIN}\``,
  ),
  exact("release origin", "RELEASE_BASE_URL=`https://releases.aside.com`", `RELEASE_BASE_URL=\`${AUX_API_ORIGIN}/releases\``),
  exact("runtime release origin", "RELEASE_BASE_URL$1=`https://releases.aside.com`", `RELEASE_BASE_URL$1=\`${AUX_API_ORIGIN}/releases\``),
  exact("model release origin", "https://releases.aside.com/dev-updater/models", `${AUX_API_ORIGIN}/releases/models`, 2),
  exact(
    "plan gate",
    "return ti?.endsWith(`@aside.com`)||ti?.endsWith(`@at.studio`)?!0:ei.includes(Cn?.subscriptionPlan??`free`)",
    "return!0",
  ),
  { name: "local plan", find: /subscriptionPlan\?\?`free`/g, replace: "subscriptionPlan??`max`", min: 4 },
  exact("analytics opt-in", "get isOptedIn(){return settings(this.accountId).get(`analytics`).enabled}", "get isOptedIn(){return!1}"),
  exact("analytics client", "new PostHog(ASIDE_POSTHOG_PROJECT_API_KEY,{", "new PostHog(ASIDE_POSTHOG_PROJECT_API_KEY,{disabled:!0,"),

  // Visible product name. The signing prefixes are a wire contract with the extensions and stay as shipped.
  exact("daemon process match", "return/aside[- ]?daemon/i.test(Cn)", "return/a(?:side|ux)[- ]?daemon/i.test(Cn)"),
  exact("skill name", "ASIDE_BROWSER_SKILL_NAME=`aside-browser`", `ASIDE_BROWSER_SKILL_NAME=\`${AUX_SKILL_NAME}\``),
  exact("skill front matter", "name: aside-browser\\nversion", `name: ${AUX_SKILL_NAME}\\nversion`),
  { name: "skill install step", find: SKILL_INSTALL_STEP, replace: SKILL_INSTALL_REPLACEMENT, min: 1 },
  { name: "cli command", find: CLI_COMMAND, replace: "aux ", min: 5 },
  {
    name: "product prose",
    find: PRODUCT_WORD,
    replace: "Aux",
    min: 100,
  },

  // Installation keys and secure storage live in the bundled shim (see shims/aux-native.cjs)
  exact(
    "native binding search path",
    "return[process.env.ASIDE_NATIVE_HELPER_BINDING,materializeEmbeddedBinding(),",
    "return[process.env.ASIDE_NATIVE_HELPER_BINDING,path.resolve(ei,`../Resources/native/aux-native.cjs`),materializeEmbeddedBinding(),",
  ),
];

/** Source prepended to the bundle so the hosted API origin is answered locally. */
export const daemonPrelude = () =>
  ["aux-local-api.js", "aux-bridge.js"].map((name) => readFileSync(join(here, "../shims", name), "utf8")).join("\n");

export function applyPatches(source, patches) {
  let result = source;
  for (const patch of patches) {
    const matches = patch.find instanceof RegExp ? result.match(patch.find)?.length ?? 0 : result.split(patch.find).length - 1;
    if (patch.min !== undefined ? matches < patch.min : matches !== patch.count) {
      throw new Error(`Daemon patch "${patch.name}" matched ${matches} times (expected ${patch.min ? `at least ${patch.min}` : patch.count})`);
    }
    result = patch.find instanceof RegExp ? result.replace(patch.find, patch.replace) : result.split(patch.find).join(patch.replace);
  }
  return result;
}
