// Opt-in local signing qualification. Never publishes a release.
const feed = new URL(process.env.AUX_UPDATE_BASE_URL || 'https://invalid.example/');
if (feed.protocol !== 'https:' || feed.username || feed.password || feed.search || feed.hash || feed.hostname === 'invalid.example') {
  throw new Error('AUX_UPDATE_BASE_URL must be an HTTPS update directory without credentials, query or fragment.');
}
if (!process.env.CSC_NAME?.startsWith('Developer ID Application: ')) {
  throw new Error('CSC_NAME must name an Aux Developer ID Application identity.');
}
module.exports = {
  extends: './electron-builder.yml',
  mac: {
    identity: process.env.CSC_NAME,
    hardenedRuntime: true,
    notarize: true,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.inherit.plist',
    target: ['dmg', 'zip'],
  },
  publish: [{ provider: 'generic', url: feed.href }],
};
