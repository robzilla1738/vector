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
    if (!['Aside.', 'aside-daemon'].includes(find) && output.includes(replace)) throw Error(`Mixed Aux protocol generations: ${replace}`);
    output = output.split(find).join(replace);
    anchors.push({ kind: 'integration', name: 'coordinated Aux protocol identity', find, replace, count });
  }
  return { text: output, anchors };
}

export function resolveProtocolIdentity(profile = 'compatibility') {
  if (!['compatibility', 'aux-v1'].includes(profile)) throw Error('Unsupported Aux protocol identity profile');
  return profile;
}
/** Called after all cloud/platform composition and original product branding.
 * The stage pins input files, replays these anchors and reviews the final Agent
 * fingerprint. Only daemon parsers have fixed auth-prefix offsets.
 */
export function applyAuxProtocolIdentity({ component, text }, profile = 'compatibility', cloudMode = 'local') {
  resolveProtocolIdentity(profile);
  if (profile === 'compatibility') return { text, anchors: [] };
  if (!['daemon', 'cli', 'agent', 'vault'].includes(component)) throw Error('Unsupported protocol component');
  const counts = Object.fromEntries(Object.keys(AUX_PROTOCOL_NAMES).map(name => [name, text.split(name).length - 1]));
  if (component === 'daemon' || component === 'cli') {
    const expected = component === 'daemon'
      ? [4, 1, 1, 2, 2, 10, cloudMode === 'local' ? 78 : 82]
      : [2, 0, 0, 1, 2, 0, 0];
    if (JSON.stringify(Object.values(counts)) !== JSON.stringify(expected))
      throw Error(`Pinned ${component} protocol count drift: ${JSON.stringify(counts)}`);
  }
  const renamed = renameAuxProtocolNames(text, counts);
  text = renamed.text;
  const anchors = [...renamed.anchors];
  if (component === 'daemon') {
    for (const [find, replace, count] of [
      ['ei.slice(24).trim()', 'ei.slice(`AuxDaemonSessionToken `.length).trim()', 2],
      ['let ei=ti.slice(18);return await verifyDaemonSessionToken', 'let ei=ti.slice(WEBSOCKET_PROTOCOL_PREFIX.length);return await verifyDaemonSessionToken', 1],
    ]) {
      if (text.split(find).length - 1 !== count) throw Error('Pinned daemon auth parser changed');
      text = text.split(find).join(replace);
      anchors.push({ name: 'derive Aux auth prefix lengths', kind: 'integration', find, replace, count });
    }
  }
  return { text, anchors };
}
