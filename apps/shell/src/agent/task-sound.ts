export const taskSounds = { soft: "Soft", bell: "Bell", bright: "Bright" } as const;
export type TaskSound = keyof typeof taskSounds;

/** Short local tones; no remote audio, task text or Profile data is loaded. */
export async function playTaskSound(sound: TaskSound): Promise<void> {
  const context = new AudioContext();
  try {
    await context.resume();
    const notes = sound === "bell" ? [660, 990] : sound === "bright" ? [784, 1046] : [440, 554];
    const start = context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const at = start + index * 0.13;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.1, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.32);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.34);
    });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
  } finally {
    await context.close();
  }
}
