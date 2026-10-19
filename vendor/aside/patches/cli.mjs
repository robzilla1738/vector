/** Anchored edits to the vendored CLI bundle (same rules as daemon.mjs). */
import { AUX_API_ORIGIN, AUX_PORT } from "./daemon.mjs";
import { AUX_SKILL_NAME, CLI_COMMAND, PRODUCT_WORD, SKILL_INSTALL_REPLACEMENT, SKILL_INSTALL_STEP } from "./brand.mjs";

const exact = (name, find, replace, count = 1) => ({ name, find, replace, count });

export const cliPatches = [
  exact("stable daemon url", 'ASIDE_STABLE_DAEMON_BASE_URL = "http://127.0.0.1:21420"', `ASIDE_STABLE_DAEMON_BASE_URL = "http://127.0.0.1:${AUX_PORT}"`),
  exact("canary daemon url", 'ASIDE_DEV_CANARY_DAEMON_BASE_URL = "http://127.0.0.1:21421"', `ASIDE_DEV_CANARY_DAEMON_BASE_URL = "http://127.0.0.1:${AUX_PORT + 1}"`),
  exact("dev daemon url", '"http://127.0.0.1:21421"', `"http://127.0.0.1:${AUX_PORT + 1}"`),
  exact("client daemon url", '"http://localhost:21420"', `"http://localhost:${AUX_PORT}"`),
  exact("install directory", 'path.join(os.homedir(), ".aside", "cli")', 'path.join(os.homedir(), ".aux", "cli")'),
  exact("api origin", 'process.env.ASIDE_API_URL ?? "https://api.aside.com"', `process.env.ASIDE_API_URL ?? "${AUX_API_ORIGIN}"`),
  exact("release origin", 'process.env.ASIDE_RELEASE_BASE_URL ?? "https://releases.aside.com"', `process.env.ASIDE_RELEASE_BASE_URL ?? "${AUX_API_ORIGIN}/releases"`),
  exact(
    "native binding search path",
    '\t\tprocess.env.ASIDE_NATIVE_HELPER_BINDING,\n\t\tmaterializeEmbeddedBinding(),',
    '\t\tprocess.env.ASIDE_NATIVE_HELPER_BINDING,\n\t\tpath.resolve(execDir, "../Resources/native/aux-native.cjs"),\n\t\tmaterializeEmbeddedBinding(),',
  ),
  exact("program name", '.name("aside")', '.name("aux")'),
  exact("usage", "usage(\"[options] [prompt...]\\n       aside [options] <command> [args...]\")", 'usage("[options] [prompt...]\\n       aux [options] <command> [args...]")'),
  exact("skill name", 'ASIDE_BROWSER_SKILL_NAME = "aside-browser"', `ASIDE_BROWSER_SKILL_NAME = "${AUX_SKILL_NAME}"`),
  { name: "skill front matter", find: /name: aside-browser/g, replace: `name: ${AUX_SKILL_NAME}`, min: 1 },
  { name: "install command", find: SKILL_INSTALL_STEP, replace: SKILL_INSTALL_REPLACEMENT, min: 1 },
  { name: "cli command", find: CLI_COMMAND, replace: "aux ", min: 50 },
  { name: "product prose", find: PRODUCT_WORD, replace: "Aux", min: 20 },
];
