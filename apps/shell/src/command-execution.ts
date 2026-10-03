import { reportCommandCompletionFailure } from "./command-completion";
/** Keyboard dispatch consumes synchronously; form actions await the same acknowledged operation. */
export function commandExecutor<C>(resolve: (id: string, context: C) => (() => unknown) | undefined, report: (error: unknown) => void) {
  const execute = (id: string, context: C): Promise<unknown> => {
    try {
      const action = resolve(id, context);
      if (!action) throw new Error("This command is unavailable in this window.");
      return Promise.resolve(action());
    } catch (reason) { return Promise.reject(reason); }
  };
  const run = (id: string, context: C): boolean => {
    const action = resolve(id, context);
    if (!action) return false;
    try { const completion=Promise.resolve(action());void completion.catch(reason=>reportCommandCompletionFailure(completion,reason,report)); }
    catch (error) { report(error); }
    return true;
  };
  return { execute, run };
}
