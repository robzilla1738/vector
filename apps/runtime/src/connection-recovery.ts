/** Retry connection setup only. Never replays a browser command or user action. */
export class ConnectionRecovery {
  private timer?: ReturnType<typeof setTimeout>;
  private pending?: Promise<void>;
  private stopped = false;
  private failures = 0;

  constructor(
    private readonly connection: {
      reconnect(): Promise<void>;
      isConnected(): boolean;
      onReady(): void;
    },
  ) {}

  retry(): void {
    if (this.stopped || this.timer || this.pending) return;
    const delay = Math.min(1000 * 2 ** Math.min(this.failures, 4), 15_000);
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.pending = this.attempt().finally(() => {
        this.pending = undefined;
        if (!this.stopped && !this.connection.isConnected()) this.retry();
      });
    }, delay);
    this.timer.unref?.();
  }

  private async attempt(): Promise<void> {
    try {
      await this.connection.reconnect();
      if (!this.stopped && this.connection.isConnected()) {
        this.failures = 0;
        this.connection.onReady();
      } else {
        this.failures++;
      }
    } catch {
      // The owner retains its degraded status until a connection succeeds.
      this.failures++;
    }
  }

  async stop(): Promise<void> {
    this.stopped = true;
    clearTimeout(this.timer);
    this.timer = undefined;
    // The owner disconnects the driver after any connection in flight settles.
    await this.pending;
  }
}
