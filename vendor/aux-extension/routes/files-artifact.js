/* Aux-owned source: a row of a task's file artifacts (assets/files-artifact-DHQjjsEB.js, the module body).
 * Names the rest of the chunk uses keep their chunk names: x a file, j the row (exported).
 * Chunk names used: l JSX runtime, a cn, o a path's file name, c/m whether a file type previews, f its preview. */
var jsxRuntime = l(),
  /** A file and its name. */
  x = props =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex w-18 shrink-0 flex-col items-center gap-0.5 select-none',
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'flex size-[72px] items-center justify-center',
          children: (0, jsxRuntime.jsx)(f, {className: 'size-[60px]', ...props}),
        }),
        (0, jsxRuntime.jsx)('div', {
          className:
            'text-surface-primary-foreground line-clamp-2 w-full text-center text-xs font-normal break-words whitespace-normal',
          children: o(props.path),
        }),
      ],
    }),
  /** The files that can show a preview. */
  j = ({artifacts, className, sessionId}) => {
    const files = artifacts.filter(hasPreview);
    return files.length === 0
      ? null
      : (0, jsxRuntime.jsx)('div', {
          className: a('flex w-full gap-1.5 overflow-hidden', className),
          children: files.map(file =>
            (0, jsxRuntime.jsx)(x, {path: file.path, sessionId}, `${file.source}:${file.path}`),
          ),
        });
  };
/** Whether an artifact is a file that previews. */
function hasPreview(artifact) {
  return artifact.kind === 'draft-block' || !('path' in artifact) || !artifact.path ? false : c(m(artifact.path));
}
