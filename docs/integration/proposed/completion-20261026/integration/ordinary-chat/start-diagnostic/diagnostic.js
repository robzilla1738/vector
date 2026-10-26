// Payload-free construction diagnostics. Never stringify the original error.
function auxAgentStartDiagnostic(error) {
  const own = (value, key) => {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) return undefined;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
  };
  const names = new Set(['Error', 'TypeError', 'ReferenceError', 'RangeError', 'SyntaxError', 'AggregateError', 'TRPCError', 'AbortError']);
  const codes = new Set(['AUX_SUPERVISED_TASKS_DISABLED', 'AUX_AGENT_ADMISSION_CLOSED', 'ENOENT', 'EACCES', 'EPERM', 'EBUSY', 'EINVAL', 'ERR_INVALID_ARG_TYPE', 'ERR_INVALID_STATE', 'ERR_MODULE_NOT_FOUND', 'PRECONDITION_FAILED', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'BAD_REQUEST', 'INTERNAL_SERVER_ERROR']);
  const functions = new Set(['createCoreToolset', 'createAgentToolset', 'createDesktopRepl', 'createReplTool', 'createBashTool', 'createTerminalTool', 'createTerminalInteractTool', 'auxCreateLazyDesktopRepl', 'auxRegisterBrowserReplTool', 'startRun', 'AgentSessionServer.#h', 'AgentSessionServer.#i']);
  const nativeStackGetter = Object.getOwnPropertyDescriptor(new Error(), 'stack')?.get;
  const summarize = value => {
    let name = own(value, 'name');
    if (!names.has(name)) name = value instanceof TypeError ? 'TypeError' : value instanceof ReferenceError ? 'ReferenceError' : value instanceof RangeError ? 'RangeError' : value instanceof SyntaxError ? 'SyntaxError' : value instanceof AggregateError ? 'AggregateError' : value instanceof Error ? 'Error' : 'unknown';
    const code = own(value, 'code'), frames = [];
    const stackDescriptor = value && typeof value === 'object' ? Object.getOwnPropertyDescriptor(value, 'stack') : undefined;
    // V8 versions expose Error.stack as either data or a shared native accessor.
    const stack = stackDescriptor && Object.hasOwn(stackDescriptor, 'value') ? stackDescriptor.value
      : nativeStackGetter && stackDescriptor?.get === nativeStackGetter ? nativeStackGetter.call(value) : undefined;
    // Ignore the first line (the message) and any unrecognized source location.
    if (typeof stack === 'string') for (const line of stack.slice(0, 16384).split('\n').slice(1, 25)) {
      const match = /^\s+at (?:(?:async )?([^()]+) \()?file:\/\/[^\s()]*\/(aux-native-entry|index)\.mjs:(\d{1,7}):(\d{1,7})\)?$/.exec(line);
      if (!match) continue;
      frames.push({ function: functions.has(match[1]) ? match[1] : 'frame', source: match[2] === 'index' ? 'index.mjs' : 'aux-native-entry.mjs', line: Number(match[3]), column: Number(match[4]) });
      if (frames.length === 8) break;
    }
    return { name, code: codes.has(code) ? code : 'unclassified', frames };
  };
  try {
    const report = { format: 'aux.agent-start.diagnostic.v1', error: summarize(error) };
    const cause = own(error, 'cause');
    if (cause) report.cause = summarize(cause);
    const errors = own(error, 'errors');
    if (Array.isArray(errors)) report.aggregate = [own(errors, '0'), own(errors, '1')].filter(value => value !== undefined).map(summarize);
    console.error('[AuxAgentStartDiagnostic] ' + JSON.stringify(report));
  } catch {
    // Diagnostic failure never replaces the original startup/status handling.
  }
}
