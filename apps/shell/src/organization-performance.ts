/** Bounded User Timing entries consumed by the canonical native trace observer. */
export async function measureOrganizationWork<T>(name: "aux:autoArchive:cycle" | "aux:liveFolders:refresh", work: () => Promise<T>): Promise<T> {
  const token = crypto.randomUUID();
  const start = `${name}:start:${token}`; const end = `${name}:end:${token}`;
  performance.mark(start);
  try { return await work(); }
  finally {
    performance.mark(end); performance.measure(name, start, end);
    performance.clearMarks(start); performance.clearMarks(end);
    if (performance.getEntriesByName(name, "measure").length > 20) performance.clearMeasures(name);
  }
}
