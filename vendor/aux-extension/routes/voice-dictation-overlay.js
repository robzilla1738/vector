/* Aux-owned source, voice dictation (assets/voice-dictation-overlay-CtbBZWfm.js, the module body):
 * the dictation hook both composers share and the overlay they show while it listens: a cancel
 * button, the meter's bars and the convert-to-text button.
 * Dictation runs on this Mac through the browser (auxBrowserPreferences.startDictation and
 * stopDictation, macOS Speech), not through the supplied recorder and its hosted transcription
 * route. Native capture hands out no audio, so the bars rest and `stream` is only true while
 * listening. Without the native API (`supported` false) there is no Dictate button.
 * Names the rest of the chunk uses keep their chunk names (both exported): Y useVoiceDictation,
 * ee VoiceDictationOverlay; l JSX runtime and t React stay as named.
 * Chunk names used: N/z React, D JSX runtime, L Spinner, O the cross icon, E Button.
 * Aux change: the overlay's pill takes the muted surface in light mode (it was a fixed neutral-100). */
var l = D(),
  /** The check icon. */
  CheckIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, l.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, l.jsx)('path', {
        d: 'M18.1592 4.45907C18.4579 3.99478 19.0766 3.86069 19.541 4.15927C20.0053 4.458 20.1394 5.07665 19.8408 5.5411L10.8408 19.5411C10.6667 19.8117 10.3732 19.9825 10.0518 19.9991C9.73024 20.0157 9.4199 19.8765 9.21877 19.6251L4.21877 13.3751C3.87376 12.9438 3.94376 12.3138 4.37502 11.9688C4.80628 11.6238 5.43626 11.6938 5.78127 12.1251L9.91115 17.2882L18.1592 4.45907Z',
        fill: 'currentColor',
      }),
    }),
  t = N(z(), 1);
/** useVoiceDictation: listens through the browser and hands the transcript to onTranscript. */
function Y(onTranscript) {
  const api = typeof chrome < 'u' ? chrome.auxBrowserPreferences : void 0,
    [status, setStatus] = (0, t.useState)('idle'),
    [listening, setListening] = (0, t.useState)(false),
    [error, setError] = (0, t.useState)(null),
    phase = (0, t.useRef)('idle'),
    onTranscriptRef = (0, t.useRef)(onTranscript);
  onTranscriptRef.current = onTranscript;
  const move = next => {
      ((phase.current = next), setStatus(next), setListening(false));
    },
    start = (0, t.useCallback)(async () => {
      if (phase.current !== 'idle') return;
      (setError(null), move('recording'));
      try {
        (await api.startDictation(), phase.current === 'recording' && setListening(true));
      } catch (failure) {
        phase.current === 'recording' && (move('idle'), setError(failure?.message || "Dictation couldn't start."));
      }
    }, [api]),
    finish = (0, t.useCallback)(
      async keep => {
        if (phase.current !== 'recording') return;
        move(keep ? 'transcribing' : 'idle');
        try {
          const text = (await api.stopDictation()).trim();
          keep && (text ? onTranscriptRef.current(text) : setError('Nothing was heard. Try again.'));
        } catch (failure) {
          keep && setError(failure?.message || 'Dictation failed.');
        } finally {
          keep && move('idle');
        }
      },
      [api],
    );
  (0, t.useEffect)(
    () => () => {
      phase.current === 'recording' && api.stopDictation().catch(() => {});
    },
    [api],
  );
  return {
    supported: typeof api?.startDictation == 'function',
    status,
    stream: listening || null,
    error,
    start,
    cancel: () => finish(false),
    confirm: () => finish(true),
    warmMic: () => {},
  };
}
/** The meter's bars. */
var BAR_COUNT = 12,
  /** The overlay while dictating: cancel, the resting bars, and convert to text. */
  ee = ({status, stream, onCancel, onConfirm}) => {
    const transcribing = status === 'transcribing';
    return (0, l.jsxs)('div', {
      className: 'flex items-center gap-1.5',
      children: [
        (0, l.jsxs)('div', {
          className: 'dark:bg-secondary flex h-7 items-center rounded-full bg-muted',
          children: [
            (0, l.jsx)(E, {
              'aria-label': transcribing ? 'Transcribing' : 'Cancel dictation',
              className: 'text-muted-foreground size-7',
              disabled: transcribing,
              size: 'icon-sm',
              shape: 'pill',
              type: 'button',
              variant: 'ghost',
              onClick: onCancel,
              children: transcribing ? (0, l.jsx)(L, {className: 'size-3.5'}) : (0, l.jsx)(O, {className: 'size-4'}),
            }),
            (0, l.jsx)('div', {
              className: 'flex h-4 items-center gap-1 pr-2',
              children: Array.from({length: BAR_COUNT}, (_, index) =>
                (0, l.jsx)(
                  'span',
                  {className: 'bg-muted h-0.5 w-0.5 shrink-0 rounded-full transition-[height] duration-75'},
                  index,
                ),
              ),
            }),
          ],
        }),
        (0, l.jsx)(E, {
          'aria-label': 'Convert recording to text',
          disabled: transcribing || !stream,
          size: 'icon-sm',
          shape: 'pill',
          type: 'button',
          onClick: onConfirm,
          children: (0, l.jsx)(CheckIcon, {className: 'size-4'}),
        }),
      ],
    });
  };
