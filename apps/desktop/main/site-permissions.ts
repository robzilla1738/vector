import { dialog, type BaseWindow, type Session, type WebContents } from "electron";

export type SitePermissions = Record<string, Record<string, "allow" | "deny">>;
const promptable = new Set(["clipboard-read", "clipboard-sanitized-write", "media", "geolocation", "notifications", "pointerLock", "idle-detection"]);
const labels: Record<string, string> = {
  "media:audio": "microphone", "media:video": "camera",
  "clipboard-read": "clipboard contents", "clipboard-sanitized-write": "clipboard writing",
  geolocation: "location", notifications: "notifications", pointerLock: "pointer lock", "idle-detection": "idle detection",
};
export function permissionOrigin(url: string): string | undefined {
  try { const origin = new URL(url).origin; return origin === "null" ? undefined : origin; }
  catch { return undefined; }
}

/** The same consent lifecycle applies to persistent and memory-only profiles. */
export function installSitePermissions(ses: Session, options: {
  owner(contents: WebContents): BaseWindow | undefined;
  read(): SitePermissions;
  save(value: SitePermissions): void;
  privateMode?: boolean;
}) {
  ses.setPermissionCheckHandler((contents, permission, requestingOrigin, details) => {
    if (!contents || contents.isDestroyed() || !options.owner(contents)) return false;
    if (permission === "fullscreen") return true;
    if (!promptable.has(permission)) return false;
    const origin = permissionOrigin(details.securityOrigin || requestingOrigin || contents.getURL());
    const key = permission === "media" ? `media:${details.mediaType}` : permission;
    return !!origin && options.read()[origin]?.[key] === "allow";
  });
  ses.setPermissionRequestHandler((contents, permission, callback, details) => {
    const owner = contents.isDestroyed() ? undefined : options.owner(contents);
    if (!owner || owner.isDestroyed()) { callback(false); return; }
    if (permission === "fullscreen") { callback(true); return; }
    const origin = permissionOrigin(("securityOrigin" in details && details.securityOrigin) || details.requestingUrl || contents.getURL());
    const mediaTypes = "mediaTypes" in details ? details.mediaTypes : undefined;
    // Empty media types also cover legacy desktop capture. Never turn a saved
    // microphone/camera grant into screen capture or silently select a screen.
    const keys = permission === "media"
      ? [...new Set(mediaTypes ?? [])].filter(type => type === "audio" || type === "video").map(type => `media:${type}`)
      : [permission];
    if (!origin || !keys.length || !promptable.has(permission)) { callback(false); return; }
    const initial = options.read(), saved = initial[origin] ?? {};
    if (keys.some(key => saved[key] === "deny")) { callback(false); return; }
    const missing = keys.filter(key => saved[key] !== "allow");
    if (!missing.length) { callback(true); return; }
    const controller = new AbortController();
    let finished = false;
    const finish = (allowed: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      contents.removeListener("did-start-navigation", navigated);
      contents.removeListener("destroyed", cancel);
      owner.removeListener("closed", cancel);
      controller.abort();
      callback(allowed);
    };
    const cancel = () => finish(false);
    const navigated = (_event: unknown, _url: string, inPlace: boolean) => { if (!inPlace) cancel(); };
    const timeout = setTimeout(cancel, 120_000); timeout.unref();
    contents.on("did-start-navigation", navigated);
    contents.once("destroyed", cancel);
    owner.once("closed", cancel);
    void dialog.showMessageBox(owner, {
      type: "question", buttons: ["Don’t Allow", "Allow"], defaultId: 0, cancelId: 0,
      title: options.privateMode ? "Private site permission" : "Site permission", signal: controller.signal,
      message: `${origin} wants to use your ${missing.map(key => labels[key] ?? key).join(" and ")}.`,
      detail: options.privateMode
        ? "This decision lasts only until you close this private window. Change it in this page’s site controls."
        : "This decision is saved for this website in the shared human and agent browsing profile. Change it in Settings → Site permissions.",
    }).then(({ response }) => {
      if (finished) return;
      if (contents.isDestroyed() || owner.isDestroyed() || options.owner(contents) !== owner || options.read() !== initial) { finish(false); return; }
      const decision = response === 1 ? "allow" : "deny";
      const updated = { ...saved };
      if (permission === "media") delete updated.media;
      for (const key of missing) updated[key] = decision;
      options.save({ ...initial, [origin]: updated });
      finish(decision === "allow");
    }).catch(() => finish(false));
  });
}
