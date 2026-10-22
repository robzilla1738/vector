/** Evaluate before creating state or starting any process. Does not grant runtime acceptance. */
export function assertAuxLaunchIdentity(bundle) {
  if (bundle?.version !== 1 || bundle.implementation !== 'supplied') throw Error('A packaged supplied Aux implementation is required.');
  const profile = bundle.identityProfile ?? 'compatibility';
  const version = bundle.stateIdentityVersion ?? 1;
  if (!['compatibility', 'aux-v1'].includes(profile) || ![1, 2].includes(version) || (version === 2 && profile !== 'aux-v1')) throw Error('Unsupported Aux launch identity generation.');
  // Version two changes persisted preferences/providers. A source-level match
  // must never silently open unmigrated state, including a disposable old home.
  if (version === 2) throw Error('Aux state identity v2 is an unaccepted migration candidate. Transactional state migration and native authority acceptance are required before launch.');
  return {identityProfile: profile, stateIdentityVersion: version, service: profile === 'aux-v1' ? 'aux-daemon' : 'aside-daemon'};
}
