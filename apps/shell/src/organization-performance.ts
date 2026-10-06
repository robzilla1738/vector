type OrganizationWorkName = "aux:autoArchive:cycle" | "aux:liveFolders:refresh";

/** Whole asynchronous work, emitted only after its real successful commit. */
export function beginOrganizationWork(name: OrganizationWorkName) {
  const token = crypto.randomUUID(),
    start = `${name}:start:${token}`,
    end = `${name}:end:${token}`;
  let pending = true;
  performance.mark(start);
  const cancel = () => {
    if (!pending) return;
    pending = false;
    performance.clearMarks(start);
    performance.clearMarks(end);
  };
  return {
    cancel,
    complete(units: number, folderId?: string) {
      if (!pending) return;
      if (!Number.isInteger(units) || units < 1 || units > (name === "aux:autoArchive:cycle" ? 20 : 25)) {
        cancel();
        return;
      }
      if (name === "aux:liveFolders:refresh" && (!folderId || folderId.length > 200)) {
        cancel();
        return;
      }
      try {
        performance.mark(end);
        if (performance.getEntriesByName(name, "measure").length >= 20) performance.clearMeasures(name);
        performance.measure(name, {
          start,
          end,
          detail: JSON.stringify({
            operationId: token,
            units,
            committed: true,
            ...(folderId ? { folderId } : {}),
          }),
        });
      } finally {
        cancel();
      }
    },
  };
}

export async function measureOrganizationWork<T extends { archived: number }>(
  name: "aux:autoArchive:cycle",
  work: () => Promise<T>,
): Promise<T> {
  const measurement = beginOrganizationWork(name);
  try {
    const result = await work();
    measurement.complete(result.archived);
    return result;
  } finally {
    measurement.cancel();
  }
}
