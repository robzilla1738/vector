/** Keyboard dispatch consumes synchronously; form actions await the same acknowledged operation. */
export function commandExecutor<C>(resolve: (id: string, context: C) => (() => unknown) | undefined, report: (error: unknown) => void) {
  const execute = async (id: string, context: C): Promise<unknown> => {
    const action = resolve(id, context);
    if (!action) throw new Error("This command is unavailable in this window.");
    return action();
  };
  const run = (id: string, context: C): boolean => {
    const action = resolve(id, context);
    if (!action) return false;
    try { void Promise.resolve(action()).catch(report); }
    catch (error) { report(error); }
    return true;
  };
  return { execute, run };
}
