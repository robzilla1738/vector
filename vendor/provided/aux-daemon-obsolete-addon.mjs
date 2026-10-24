/** The state-v2 native daemon uses its fixed linked owner, never this addon. */
export const obsoleteDaemonAddon = Object.freeze({
  sourcePath: 'Contents/Resources/native/aside-native.node',
  stagedPath: 'Contents/Resources/native/provided-native.node',
  reason: 'State-v2 daemon uses the fixed linked Aux owner; original common addon is excluded',
});

export function excludeObsoleteDaemonAddon({component, path, stateIdentityVersion}) {
  return component === 'daemon' && stateIdentityVersion === 2 && path === obsoleteDaemonAddon.sourcePath;
}

export function assertObsoleteDaemonAddonDisposition({component, stateIdentityVersion, files, removed}) {
  const excluded = excludeObsoleteDaemonAddon({component, path:obsoleteDaemonAddon.sourcePath, stateIdentityVersion});
  const omissions = removed.filter(file => file.path === obsoleteDaemonAddon.sourcePath);
  const retained = files.filter(file => file.path === obsoleteDaemonAddon.stagedPath);
  if (excluded) {
    if (retained.length || omissions.length !== 1 || omissions[0].reason !== obsoleteDaemonAddon.reason)
      throw Error('Exact state-v2 daemon addon exclusion is required');
  } else if (omissions.length || retained.length !== 1) {
    throw Error('CLI and compatibility addon preservation is required');
  }
}
