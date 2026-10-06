/** A source-bound refusal before any Cloud SDK request or resource reservation. */
export class CloudSetupUnavailable extends Error {
  constructor(
    readonly runId: string,
    readonly proof: { runId: string; originalDigest: string },
    readonly ready: () => Promise<void>,
  ) {
    super("Cloud execution needs a configured Vercel account and reviewed resource rates.");
    this.name = "CloudSetupUnavailable";
  }
}
