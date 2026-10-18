import { AuxError } from "@aux/contracts";
import {
  NativeDesktopContextResultSchema,
  type NativeDesktopContextRequest,
  type NativeDesktopContextResult,
  type DesktopContextNativePort,
  type DesktopContextSettings,
  type DesktopContextSource,
} from "@aux/contracts/desktop-context";
import type { NativeBridge } from "../native.js";
/** The single registered native dispatch owns OS consent and the original Profile lease. */
export class DesktopContextNativeAdapter implements DesktopContextNativePort {
  constructor(
    private readonly native: NativeBridge,
    private readonly available: () => Promise<boolean>,
  ) {}
  private async call<O extends NativeDesktopContextRequest["op"]>(
    input: Extract<NativeDesktopContextRequest, { op: O }>,
  ): Promise<Extract<NativeDesktopContextResult, { op: O }>> {
    if (!this.native.desktopContext || !(await this.available()))
      throw new AuxError("backend_unavailable", "Desktop context is unavailable in this native host.");
    const result = NativeDesktopContextResultSchema.parse(await this.native.desktopContext(input));
    if (result.op !== input.op) throw new AuxError("conflict", "Native desktop context operation changed.");
    return result as Extract<NativeDesktopContextResult, { op: O }>;
  }
  async status() {
    return (await this.call({ op: "status" })).status;
  }
  async apps(token: string) {
    if (!token) throw new AuxError("permission_denied", "Choose the original normal Settings window.");
    return (await this.call({ op: "apps", token })).apps;
  }
  async configure(settings: DesktopContextSettings, token: string) {
    const original = await this.status();
    return (
      await this.call({ op: "configure", settings, token, expectedConsentRevision: original.consentRevision })
    ).status;
  }
  async attach(settings: DesktopContextSettings) {
    return (await this.call({ op: "attach", settings })).status;
  }
  async permission(kind: "accessibility" | "ocr-picker", revision: number, token: string) {
    return (await this.call({ op: "permission", kind, revision, token })).status;
  }
  async take(leaseId: string) {
    return (await this.call({ op: "take", leaseId })).capture;
  }
  async validate(source: DesktopContextSource) {
    return (await this.call({ op: "validate", source })).valid;
  }
  async acknowledge(leaseId: string, captureId: string) {
    await this.call({ op: "acknowledge", leaseId, captureId });
  }
  async stop() {
    await this.call({ op: "stop" });
  }
}
