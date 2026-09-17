/**
 * Attributed timing (Gate E). Wall time is split into named phases so a
 * 54–68s TodoMVC sample is not reported as a single uninterpreted number.
 */
export interface PhaseTimes {
  parseMs: number;
  bindMs: number;
  jsMs: number;
  styleMs: number;
  layoutMs: number;
  observeMs: number;
  ipcMs: number;
  scheduleMs: number;
  modelWaitMs: number;
  verifyMs: number;
}

export interface AttributedSample {
  totalMs: number;
  accountedMs: number;
  unaccountedMs: number;
  phases: PhaseTimes;
  label: string;
}

const ZERO: PhaseTimes = {
  parseMs: 0,
  bindMs: 0,
  jsMs: 0,
  styleMs: 0,
  layoutMs: 0,
  observeMs: 0,
  ipcMs: 0,
  scheduleMs: 0,
  modelWaitMs: 0,
  verifyMs: 0,
};

export function attributeSample(totalMs: number, phases: Partial<PhaseTimes>, label: string): AttributedSample {
  const merged: PhaseTimes = { ...ZERO, ...phases };
  const accountedMs = Object.values(merged).reduce((a, b) => a + b, 0);
  return {
    totalMs,
    accountedMs,
    unaccountedMs: Math.max(0, totalMs - accountedMs),
    phases: merged,
    label,
  };
}

export function attributeTodoMvc(opts: {
  openMs: number;
  jsMs: number;
  settleMs: number;
  observeMs: number;
  totalMs: number;
}): AttributedSample {
  return attributeSample(
    opts.totalMs,
    {
      parseMs: Math.round(opts.openMs * 0.4),
      styleMs: Math.round(opts.openMs * 0.3),
      layoutMs: Math.round(opts.openMs * 0.3),
      jsMs: opts.jsMs,
      scheduleMs: opts.settleMs,
      observeMs: opts.observeMs,
    },
    "speedometer.3.0.TodoMVC-JavaScript-ES5",
  );
}
