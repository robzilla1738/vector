/** Called only by the original child-process close listener. This pure
 * classification does not discover, signal or prove a caller-supplied PID. */
export function originalInputHelperClose({ helperPid, code, signal, cleanupRequested, primary,
  pendingCount, stderr }) {
  const originalChild = Number.isInteger(helperPid) && helperPid > 0;
  const clean = originalChild && cleanupRequested === true && code === 0 && signal === null &&
    !primary && pendingCount === 0;
  const failure = primary ?? (clean ? undefined : new Error(`AX helper exited (${code ?? signal}): ${stderr.trim()}`));
  return Object.freeze({ producer: 'aux-native-input-helper-close', version: 1,
    helperPid: originalChild ? helperPid : null, code, signal,
    cleanupRequested: cleanupRequested === true, pendingCount, reaped: originalChild, clean,
    primary: failure, stderr });
}
