/** What the agent tools share. */
export const text = value => ({type: 'text', text: value});
export const reply = (value, details) => ({content: [text(value)], details});

/** A write under the broker. A rejected callback means unknown custody to the native host, and a
 * failed write has finished, so its error comes back and is thrown once the broker is released. */
export async function brokered(boundary, work) {
  const outcome = await boundary.awaited(async () => {
    try {
      return {value: await work()};
    } catch (error) {
      return {error};
    }
  });
  if ('error' in outcome) throw outcome.error;
  return outcome.value;
}

/** `file`, relative to `root` with forward slashes, when it sits strictly inside `root`. */
export function pathInside(root, file, path) {
  const relative = path.relative(path.resolve(root), file);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return undefined;
  return relative.split(path.sep).join('/');
}
