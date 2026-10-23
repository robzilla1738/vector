/** Repair supplied command discovery after product marker renaming.
 * Only parser offsets change; shell commands and discovery behavior are retained. */
export function applyAuxCommandPathParsers(source) {
  const anchors = [];
  for (const [name, begin, end, before, after, count] of [
    ['mcp-login-path-marker-width', 'async function resolveShellPath()', 'var PATH_START,', 'ii+24', 'ii+PATH_START.length', 2],
    ['claude-command-marker-width', 'function parseClaudeCommandPath(Cn)', 'function parseClaudeCodeAuthStatus', 'ei+27', 'ei+CLAUDE_COMMAND_PATH_START.length', 1],
    ['provider-command-marker-width', 'async function resolveShellCommandPath(Cn)', 'async function readLastUsedAt', 'ii+28', 'ii+COMMAND_LOOKUP_START$1.length', 2],
    ['aux-cli-command-marker-width', 'async function resolveAuxCommandPath(Cn,ei=fs.existsSync)', 'async function getWindowsCliInstallation', 'oi+32', 'oi+COMMAND_LOOKUP_START.length', 2],
  ]) {
    if (source.split(begin).length !== 2) throw Error(`Command parser anchor changed: ${name}`);
    const start = source.indexOf(begin), finish = source.indexOf(end, start + begin.length);
    if (finish < 0) throw Error(`Command parser boundary changed: ${name}`);
    const body = source.slice(start, finish);
    if (body.split(before).length !== count + 1) throw Error(`Command parser offset count changed: ${name}`);
    source = source.slice(0, start) + body.split(before).join(after) + source.slice(finish);
    anchors.push({name, count});
  }
  return {code: source, anchors};
}
