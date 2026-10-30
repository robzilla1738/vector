/* Aux-owned source: the Mini popup shortcut row (assets/mini-popup-shortcut-field-zmtLA1sg.js, the module body):
 * the capture field and a reset button. A captured shortcut only saves when it changed.
 * Names the rest of the chunk uses keep their chunk names: D the row (exported).
 * Chunk names used: d JSX runtime, R useShortcutCapture, S/F/y row, text and end, f Input, w the shortcut's label,
 * b/j/C tooltip, g Button, x the reset icon. */
var jsxRuntime = d(),
  /** The shortcut row. */
  D = ({value, isMacOS, disabled, onValueChange, onReset}) => {
    const handleCapture = shortcut => {
        shortcut !== value && onValueChange(shortcut);
      },
      {inputRef, isCapturing, placeholder, handleFocus, handleBlur, handleKeyDown} = R({
        isMacOS,
        onValueChange: handleCapture,
      });
    return (0, jsxRuntime.jsxs)(S, {
      children: [
        (0, jsxRuntime.jsx)(F, {title: 'Keyboard shortcut'}),
        (0, jsxRuntime.jsxs)(y, {
          className: 'max-w-none items-center gap-1',
          children: [
            (0, jsxRuntime.jsx)(f, {
              ref: inputRef,
              readOnly: true,
              spellCheck: false,
              autoComplete: 'off',
              'aria-label': 'Mini popup shortcut',
              placeholder,
              value: isCapturing || !value ? '' : w(value, isMacOS),
              className: 'bg-muted h-7 w-24 border-none px-2 text-center text-xs tabular-nums',
              disabled,
              onBlur: handleBlur,
              onFocus: handleFocus,
              onKeyDown: handleKeyDown,
            }),
            onReset &&
              (0, jsxRuntime.jsxs)(b, {
                children: [
                  (0, jsxRuntime.jsx)(j, {
                    render: (0, jsxRuntime.jsx)(g, {
                      variant: 'ghost',
                      size: 'icon',
                      'aria-label': 'Reset Mini popup shortcut',
                      disabled,
                      onClick: onReset,
                    }),
                    children: (0, jsxRuntime.jsx)(x, {}),
                  }),
                  (0, jsxRuntime.jsx)(C, {children: 'Reset to default'}),
                ],
              }),
          ],
        }),
      ],
    });
  };
