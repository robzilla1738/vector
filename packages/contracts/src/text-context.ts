/** Divide a fixed context budget fairly, returning unused shares from short sources. */
export function textContextShares(lengths: number[], budget: number): number[] {
  const shares = lengths.map(() => 0);
  let remaining = Math.max(0, Math.floor(budget));
  let active = lengths.map((length, index) => ({ length: Math.max(0, Math.floor(length)), index })).filter(item => item.length > 0);
  while (remaining > 0 && active.length) {
    const share = Math.max(1, Math.floor(remaining / active.length));
    for (const item of active) {
      const added = Math.min(share, item.length - shares[item.index]!, remaining);
      shares[item.index]! += added;
      remaining -= added;
    }
    active = active.filter(item => shares[item.index]! < item.length);
  }
  return shares;
}
