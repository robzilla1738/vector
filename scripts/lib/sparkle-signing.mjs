export const SPARKLE_VERSION = "2.10.0";
export const SPARKLE_NESTED_PATHS = [
  "Versions/B/XPCServices/Installer.xpc",
  "Versions/B/XPCServices/Downloader.xpc",
  "Versions/B/Autoupdate",
  "Versions/B/Updater.app",
];

export function validateSparkleSigning({
  args,
  appInfo,
  frameworkPresent,
  signingParts,
  adhoc,
  localFeedRehearsal,
}) {
  const blockers = [];
  const enabled = /^\s*enable_aux_sparkle\s*=\s*true\s*$/m.test(args);
  const feed = appInfo?.SUFeedURL;
  const key = appInfo?.SUPublicEDKey;
  if (enabled !== frameworkPresent) blockers.push("GN Sparkle flag and bundled framework disagree");
  if (!enabled) {
    if (feed || key) blockers.push("Sparkle metadata is present without the bundled updater");
    return blockers;
  }
  if (adhoc) blockers.push("Sparkle update delivery requires Developer ID signing");
  if (!signingParts?.includes("aux-sparkle-framework"))
    blockers.push("Chromium signing pipeline does not sign nested Sparkle code");
  if (typeof key !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(key))
    blockers.push("Sparkle EdDSA public key must be a 32-byte base64 value");
  try {
    const url = new URL(feed);
    const local = url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !(localFeedRehearsal && local))
      blockers.push("Sparkle feed must use HTTPS, except an explicit loopback rehearsal");
    if (url.username || url.password || url.hash)
      blockers.push("Sparkle feed URL cannot include credentials or a fragment");
  } catch {
    blockers.push("Sparkle feed URL is missing or invalid");
  }
  return blockers;
}
