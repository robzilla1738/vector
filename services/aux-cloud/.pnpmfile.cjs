// typescript-eslint (used by eslint-config-next) refuses TypeScript 7, which the service
// type-checks with. Give the lint packages their own TypeScript 6 instead of the root peer.
const lintPackages = /^(typescript-eslint|@typescript-eslint\/.+)$/;
module.exports = { hooks: { readPackage(pkg) {
  if (lintPackages.test(pkg.name) && pkg.peerDependencies?.typescript) {
    delete pkg.peerDependencies.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: '6.0.3' };
  }
  return pkg;
} } };
