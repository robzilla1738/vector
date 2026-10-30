/** What the agent tools share. */
export const text = value => ({type: 'text', text: value});
export const reply = (value, details) => ({content: [text(value)], details});

/** `file`, relative to `root` with forward slashes, when it sits strictly inside `root`. */
export function pathInside(root, file, path) {
  const relative = path.relative(path.resolve(root), file);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return undefined;
  return relative.split(path.sep).join('/');
}
