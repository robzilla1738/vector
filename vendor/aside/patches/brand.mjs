/** Shared naming rules. Wire identifiers (`Aside.*` CDP methods, `chrome.aside*`, token types) are never touched. */

// A standalone "Aside" that is not part of an identifier, a dotted API name or a domain.
// A literal `\n` in source text also precedes a word, so a preceding "\n" or "\t" escape is allowed.
export const productWord = (excluding = "") =>
  new RegExp(String.raw`(?:(?<![\w.@/-])|(?<=\\[nrt]))Aside(?![\w]|\.[a-zA-Z]|-${excluding})`, "g");
// The daemon auth signing prefixes are a wire contract and keep their shipped spelling.
export const PRODUCT_WORD = productWord("| Daemon (?:Dev )?Auth");

// The lowercase CLI command in help text, hints and the shipped skill.
export const CLI_COMMAND = /(?<=[`'" (])aside (?=<command>|"|repl\b|session\b|guide\b|login\b|host\b|exec\b|update\b|settings\b|mcp\b|account\b|skills\b|memory\b|--|-m\b|https)/g;

export const AUX_SKILL_NAME = "aux-browser";

// The shipped skill tells agents to curl an installer; Aux installs its CLI from the app instead.
export const SKILL_INSTALL_STEP = /run the macOS\/Linux installer \\?`curl -fsSL https:\/\/releases\.aside\.com\/install\.sh \| bash\\?`/g;
export const SKILL_INSTALL_REPLACEMENT = "install it from Aux Settings";
