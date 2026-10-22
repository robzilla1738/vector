/** Count-pinned protocol migration, applied only to a coordinated successor.
 * Persisted cryptographic formats deliberately require their separate migration.
 * This does not activate a new protocol in the current product pipeline.
 */
export const AUX_PROTOCOL_NAMES = Object.freeze({
  AsideDaemonSessionToken: 'AuxDaemonSessionToken',
  AsideSessionToken: 'AuxSessionToken',
  'Aside Daemon Dev Auth v1': 'Aux Daemon Dev Auth v1',
  'Aside Daemon Auth v1': 'Aux Daemon Auth v1',
  'aside.daemon.auth.': 'aux.daemon.auth.',
  'aside-daemon': 'aux-daemon',
  'Aside.': 'Aux.',
});
export function renameAuxProtocolNames(text, expectedCounts) {
  let output = text;
  const anchors = [];
  for (const [find, replace] of Object.entries(AUX_PROTOCOL_NAMES)) {
    const count = output.split(find).length - 1;
    if (!Number.isSafeInteger(expectedCounts?.[find]) || expectedCounts[find] < 0 || count !== expectedCounts[find])
      throw Error(`Aux protocol input drift: ${find}`);
    if (!count) continue;
    if (output.includes(replace)) throw Error(`Mixed Aux protocol generations: ${replace}`);
    output = output.split(find).join(replace);
    anchors.push({ kind: 'integration', name: 'coordinated Aux protocol identity', find, replace, count });
  }
  return { text: output, anchors };
}
