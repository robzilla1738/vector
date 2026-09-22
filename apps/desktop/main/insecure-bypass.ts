/**
 * Hosts the person explicitly proceeded past a certificate error for.
 * In-memory only — like Chrome, bypasses never persist across restarts and
 * apply to the shared browsing profile for this session only. Agent and
 * page code cannot reach this list.
 */
export function createInsecureBypass() {
  const hosts = new Set<string>();
  return {
    has: (hostname: string) => hosts.has(hostname.toLowerCase()),
    proceed: (url: string): string => {
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error("Enter a valid HTTPS address to proceed.");
      }
      if (parsed.protocol !== "https:" || !parsed.hostname) {
        throw new Error("Only HTTPS addresses can proceed past a certificate warning.");
      }
      const host = parsed.hostname.toLowerCase();
      hosts.add(host);
      return host;
    },
    clear: () => hosts.clear(),
  };
}
