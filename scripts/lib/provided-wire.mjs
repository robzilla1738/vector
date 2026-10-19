/** Restore supplied public wire names after product-name branding, with replayable anchors. */
export function restoreProvidedWireNames(original, branded) {
  const counts = new Map();
  const tokens = /AsideDaemonSessionToken|AsideSessionToken|Aside Daemon(?: Dev)? Auth v1|(?<=["'`])Aside\.[A-Za-z_$][\w$]*|(["'`])Aside\.\1/g;
  for (const match of original.matchAll(tokens)) counts.set(match[0], (counts.get(match[0]) ?? 0) + 1);
  const anchors = [];
  // Restore longer command names first so a shorter command cannot capture its prefix.
  for (const [wire, count] of [...counts].sort(([a], [b]) => b.length - a.length)) {
    const find = wire.replace('Aside', 'Aux');
    if (branded.split(find).length - 1 !== count) throw new Error(`Supplied wire-name branding drift: ${wire}`);
    branded = branded.split(find).join(wire);
    anchors.push({ kind: 'integration', find, replace: wire, count });
  }
  return { text: branded, anchors };
}
