export function validateCrashpadDistribution({ args, appInfo }) {
  const blockers = [];
  const aux = /^\s*enable_aux_shell\s*=\s*true\s*$/m.test(args);
  if (!aux) return blockers;

  const configured = /^\s*aux_crash_upload_url\s*=\s*"([^"]*)"\s*$/m.exec(args)?.[1] ?? "";
  if (appInfo?.AuxCrashUploadURL !== configured) {
    blockers.push("Aux crash upload URL differs from the GN configuration");
  }
  if (!configured) return blockers;
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.hash) {
      blockers.push("Aux crash upload URL must be HTTPS without credentials or a fragment");
    }
  } catch {
    blockers.push("Aux crash upload URL is invalid");
  }
  return blockers;
}
