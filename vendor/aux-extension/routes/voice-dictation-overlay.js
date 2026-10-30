/* Aux-owned source, voice dictation (assets/voice-dictation-overlay-CtbBZWfm.js, the module body):
 * the dictation hook (warm the microphone, record up to 90 seconds, send the recording for
 * transcription, cancel) and the overlay the composer shows while it records: a cancel button, a
 * live level meter and the convert-to-text button.
 * Names the rest of the chunk uses keep their chunk names (both exported): Y useVoiceDictation,
 * ee VoiceDictationOverlay; l JSX runtime and t React stay as named.
 * Chunk names used: N/z React, D JSX runtime, U useApp, B the authenticated fetch, V the daemon URL,
 * L Spinner, O the cross icon, E Button.
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
  t = N(z(), 1),
  /** A ref that always holds the latest value. */
  useLatestRef = value => {
    const ref = (0, t.useRef)(value);
    return ((ref.current = value), ref);
  },
  /** A recording stops by itself after 90 seconds. */
  MAX_RECORDING_MS = 9e4,
  /** A warmed microphone is released after 5 seconds unused. */
  WARM_MIC_MS = 5e3;
/** Stops every track of a stream. */
function stopTracks(stream) {
  stream.getTracks().forEach(track => track.stop());
}
/** useVoiceDictation: records from the microphone and hands the transcript to onTranscript. */
function Y(onTranscript) {
  const {accountId} = U(),
    onTranscriptRef = useLatestRef(onTranscript),
    [status, setStatus] = (0, t.useState)('idle'),
    [stream, setStream] = (0, t.useState)(null),
    [error, setError] = (0, t.useState)(null),
    recordingRef = (0, t.useRef)(null),
    warmMicRef = (0, t.useRef)(null),
    statusRef = (0, t.useRef)(status);
  statusRef.current = status;
  const releaseWarmMic = (0, t.useCallback)(() => {
      const pending = warmMicRef.current;
      ((warmMicRef.current = null), pending && pending.then(stopTracks).catch(() => {}));
    }, []),
    reset = (0, t.useCallback)(() => {
      ((statusRef.current = 'idle'), releaseWarmMic());
      const recording = recordingRef.current;
      ((recordingRef.current = null),
        recording &&
          (window.clearTimeout(recording.timeoutId),
          recording.recorder.state !== 'inactive' && recording.recorder.stop(),
          stopTracks(recording.stream)),
        setStream(null),
        setStatus('idle'));
    }, [releaseWarmMic]),
    confirm = (0, t.useCallback)(async () => {
      if (statusRef.current !== 'recording') return;
      statusRef.current = 'transcribing';
      const recording = recordingRef.current;
      if (!recording) {
        reset();
        return;
      }
      (window.clearTimeout(recording.timeoutId), setStatus('transcribing'), setStream(null));
      const audio = await new Promise(resolve => {
        const collect = () => new Blob(recording.chunks, {type: recording.recorder.mimeType});
        (recording.recorder.addEventListener('stop', () => resolve(collect()), {once: true}),
          recording.recorder.state === 'inactive' ? resolve(collect()) : recording.recorder.stop());
      });
      if ((stopTracks(recording.stream), (recordingRef.current = null), audio.size === 0)) {
        (setError('No audio captured. Try again.'), reset());
        return;
      }
      try {
        const form = new FormData(),
          extension = audio.type.includes('mp4') || audio.type.includes('m4a') ? 'm4a' : 'webm';
        form.set('file', audio, `dictation.${extension}`);
        const language = (typeof chrome !== 'undefined' ? chrome.i18n?.getUILanguage() : void 0) || navigator.language;
        language && form.set('language', language);
        const response = await B(V('/stt/transcribe', accountId), {method: 'POST', body: form});
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? 'Transcription failed.');
        }
        const result = await response.json(),
          text = typeof result.text == 'string' ? result.text.trim() : '';
        text && onTranscriptRef.current(text);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Transcription failed.');
      } finally {
        ((statusRef.current = 'idle'), setStatus('idle'));
      }
    }, [accountId, onTranscriptRef, reset]),
    cancel = (0, t.useCallback)(() => {
      statusRef.current !== 'idle' && reset();
    }, [reset]),
    warmMic = (0, t.useCallback)(() => {
      if (warmMicRef.current || statusRef.current !== 'idle') return;
      const pending = navigator.mediaDevices.getUserMedia({audio: true});
      ((warmMicRef.current = pending),
        window.setTimeout(() => {
          warmMicRef.current !== pending || statusRef.current !== 'idle' || releaseWarmMic();
        }, WARM_MIC_MS));
    }, [releaseWarmMic]),
    start = (0, t.useCallback)(async () => {
      if (statusRef.current !== 'idle') return;
      ((statusRef.current = 'recording'), setError(null), setStatus('recording'));
      let micStream;
      try {
        const request = warmMicRef.current ?? navigator.mediaDevices.getUserMedia({audio: true});
        ((warmMicRef.current = null), (micStream = await request));
      } catch {
        ((statusRef.current = 'idle'), setStatus('idle'), setError('Microphone permission denied.'));
        return;
      }
      if (statusRef.current !== 'recording') {
        stopTracks(micStream);
        return;
      }
      let recorder;
      try {
        recorder = new MediaRecorder(micStream);
      } catch {
        (stopTracks(micStream),
          (statusRef.current = 'idle'),
          setStatus('idle'),
          setError('Recording is not supported in this browser.'));
        return;
      }
      const chunks = [];
      ((recorder.ondataavailable = event => {
        event.data.size > 0 && chunks.push(event.data);
      }),
        recorder.start(),
        (recordingRef.current = {
          recorder,
          stream: micStream,
          chunks,
          timeoutId: window.setTimeout(() => {
            confirm();
          }, MAX_RECORDING_MS),
        }),
        setStream(micStream));
    }, [confirm]);
  return ((0, t.useEffect)(() => () => reset(), [reset]), {status, stream, error, start, cancel, confirm, warmMic});
}
/** The meter's bars. */
var BAR_COUNT = 12,
  /** A silent bar's height. */
  SILENT_BAR_PX = 2,
  /** How often the meter redraws (about 15 times a second). */
  METER_INTERVAL_MS = 67,
  /** The overlay while dictating: cancel, the level meter, and convert to text. */
  ee = ({status, stream, onCancel, onConfirm}) => {
    const barsRef = (0, t.useRef)(null),
      transcribing = status === 'transcribing';
    return (
      (0, t.useEffect)(() => {
        if (!stream || !barsRef.current) return;
        let closed = false,
          interval = 0,
          audioContext;
        const heights = Array.from({length: BAR_COUNT}, () => -1),
          bars = barsRef.current.children;
        return (
          (async () => {
            try {
              if (
                ((audioContext = new AudioContext()),
                audioContext.state === 'suspended' && (await audioContext.resume()),
                closed)
              )
                return;
              const analyser = audioContext.createAnalyser();
              ((analyser.fftSize = 256), (analyser.smoothingTimeConstant = 0.6));
              const source = audioContext.createMediaStreamSource(stream),
                gain = audioContext.createGain();
              ((gain.gain.value = 2.5), source.connect(gain), gain.connect(analyser));
              const samples = new Uint8Array(analyser.fftSize),
                samplesPerBar = Math.floor(samples.length / BAR_COUNT),
                draw = () => {
                  analyser.getByteTimeDomainData(samples);
                  for (let index = 0; index < bars.length; index += 1) {
                    let peak = 0;
                    const from = index * samplesPerBar,
                      to = from + samplesPerBar;
                    for (let sample = from; sample < to; sample += 1) {
                      const level = Math.abs((samples[sample] ?? 128) - 128);
                      level > peak && (peak = level);
                    }
                    const loudness = Math.min(1, (peak / 128) * 2),
                      height = Math.round(SILENT_BAR_PX + loudness * 14);
                    if (heights[index] === height) continue;
                    heights[index] = height;
                    const bar = bars[index];
                    ((bar.style.height = `${height}px`),
                      bar.classList.toggle('bg-muted', height <= SILENT_BAR_PX),
                      bar.classList.toggle('bg-muted-foreground', height > SILENT_BAR_PX));
                  }
                };
              (draw(), (interval = window.setInterval(draw, METER_INTERVAL_MS)));
            } catch {}
          })(),
          () => {
            ((closed = true), window.clearInterval(interval), audioContext?.close());
          }
        );
      }, [stream]),
      (0, l.jsxs)('div', {
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
                ref: barsRef,
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
      })
    );
  };
