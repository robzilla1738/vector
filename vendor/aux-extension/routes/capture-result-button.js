/* Aux-owned source, the capture result, pass 2 (assets/capture-result-nUfmrYC9.js, after the preview,
 * from its toolbar button to the end): the preview's buttons and the check for what the page sends
 * it. This block starts inside the chunk's `var` list.
 * Names the rest of the chunk uses keep their chunk names: p PreviewButton, H isResultMessage.
 * Chunk names used: a JSX runtime, O SimpleTooltip, I Button.
 * The buttons sit on the preview's white pill in both modes, so they keep their fixed colors. */
/** A button on the preview's pill, with a tooltip. */
  p = ({'aria-label': ariaLabel, label, onClick, children}) =>
    (0, a.jsx)(O, {
      content: label,
      side: 'top',
      children: (0, a.jsx)(I, {
        'aria-label': ariaLabel,
        className: 'size-8 text-neutral-950! hover:bg-black/5',
        size: 'icon-sm',
        type: 'button',
        shape: 'pill',
        variant: 'ghost',
        onClick,
        children,
      }),
    });
/** Whether a message is one the preview handles. */
function H(message) {
  return typeof message != 'object' || message === null || !('type' in message)
    ? false
    : message.type === 'CAPTURE_RESULT_SYNC' || message.type === 'CAPTURE_RESULT_LANDED';
}
