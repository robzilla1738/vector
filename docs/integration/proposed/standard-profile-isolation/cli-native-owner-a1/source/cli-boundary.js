// Consumer of the retained native owner. This function creates no authority.
function auxCreateCliBoundary(binding, environment, paths) {
  const names = ['captureStorageRoots','assertBrokerOwner','withBrokerSync','withBrokerAwaited'];
  const functions = Object.fromEntries(names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(binding, name);
    if (!descriptor || !Object.hasOwn(descriptor, 'value') ||
        typeof descriptor.value !== 'function' || descriptor.writable || descriptor.configurable)
      throw Error('AUX_CLI_NATIVE_OWNER_UNAVAILABLE');
    return [name, descriptor.value.bind(binding)];
  }));
  const roots = functions.captureStorageRoots();
  const keys = ['format','layoutVersion','ownerGeneration','transportGeneration','controlHome','taskHome'];
  const decimal = value => typeof value === 'string' && /^[1-9][0-9]*$/.test(value);
  if (!roots || !Object.isFrozen(roots) || Object.keys(roots).sort().join('\0') !== [...keys].sort().join('\0') ||
      roots.format !== 'aux.native.storage-roots.v1' || roots.layoutVersion !== 1 ||
      !decimal(roots.ownerGeneration) || !decimal(roots.transportGeneration) ||
      ![roots.controlHome, roots.taskHome].every(value => typeof value === 'string' && paths.isAbsolute(value) && paths.resolve(value) === value) ||
      roots.controlHome === roots.taskHome || roots.controlHome.startsWith(roots.taskHome + '/') || roots.taskHome.startsWith(roots.controlHome + '/'))
    throw Error('AUX_CLI_NATIVE_ROOTS_UNAVAILABLE');
  const data = paths.join(roots.controlHome, 'cli'), auth = paths.join(data, 'auth.json');
  for (const [name, expected] of [['AUX_CLI_INSTALL_DIR',data],['AUX_CLI_AUTH_PATH',auth]])
    if (environment[name] && (!paths.isAbsolute(environment[name]) || paths.resolve(environment[name]) !== expected))
      throw Error('AUX_CLI_ROOT_OVERRIDE_REFUSED');
  function assertCurrent() {
    functions.assertBrokerOwner();
    const current = functions.captureStorageRoots();
    if (!current || !Object.isFrozen(current) || keys.some(key => current[key] !== roots[key]))
      throw Error('AUX_CLI_NATIVE_OWNER_CHANGED');
  }
  assertCurrent();
  return Object.freeze({
    data, auth,
    assertCurrent,
    sync(callback) {
      assertCurrent();
      return functions.withBrokerSync(() => {
        const result = callback(); assertCurrent(); return result;
      });
    },
    awaited(callback) {
      assertCurrent();
      return functions.withBrokerAwaited(async () => {
        const result = await callback(); assertCurrent(); return result;
      });
    }
  });
}
