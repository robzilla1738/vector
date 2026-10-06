import { digest as hash } from "@aux/contracts/util/digest";
import { AuxError, ZapInstallReceiptSchema, ZapSitePolicySchema, ZapStylesheetInstallSchema,
  type ZapInstallReceipt, type ZapSitePolicy, type ZapStylesheetInstall } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

const KEY = "zapSitePolicies";
const MAX_SITES = 100;

export function zapStylesheet(policy: Pick<ZapSitePolicy, "enabled" | "selectors" | "userCss">): string {
  if (!policy.enabled) return "";
  const hidden = policy.selectors.map(selector => `${selector} { display: none !important; }`).join("\n");
  return [hidden, policy.userCss].filter(Boolean).join("\n");
}

export function zapInstallRequest(policy: ZapSitePolicy): ZapStylesheetInstall {
  const stylesheet = zapStylesheet(policy);
  return ZapStylesheetInstallSchema.parse({ profileId: policy.profileId, origin: policy.origin, revision: policy.revision,
    stylesheet, stylesheetSha256: hash(stylesheet), phase: "document_start", frameScope: "matching_origin" });
}

/** One runtime/DB per native Profile. The host owns document-start installation. */
export class ZapService {
  private pending: Promise<unknown> = Promise.resolve();
  constructor(private repo: Repo, private native: NativeBridge | undefined, readonly profileId: string) {
    if (!profileId || profileId.length > 200) throw new AuxError("invalid_params", "A native Profile ID is required for Zap.");
  }

  list(): ZapSitePolicy[] {
    const policies = ZapSitePolicySchema.array().max(MAX_SITES).parse(this.repo.getSetting<ZapSitePolicy[]>(KEY) ?? []);
    if (policies.some(policy => policy.profileId !== this.profileId)) throw new AuxError("permission_denied", "Zap policies belong to another Profile.");
    return policies;
  }

  snapshot(profileId: string): ZapStylesheetInstall[] {
    if (profileId !== this.profileId) throw new AuxError("permission_denied", "Zap policies belong to another Profile.");
    return this.list().map(zapInstallRequest);
  }

  grant(origin: string): Promise<{ policy: ZapSitePolicy; receipt: ZapInstallReceipt }> {
    return this.serial(async () => {
      const parsed = ZapSitePolicySchema.shape.origin.parse(origin);
      const existing = this.list();
      if (existing.some(policy => policy.origin === parsed)) throw new AuxError("conflict", "This site already has a Zap grant.");
      if (existing.length >= MAX_SITES) throw new AuxError("invalid_params", "Zap is limited to 100 granted sites per Profile.");
      const now = Date.now();
      const policy = ZapSitePolicySchema.parse({ profileId: this.profileId, origin: parsed, revision: 1,
        grantedAt: now, updatedAt: now, selectors: [], userCss: "", enabled: true });
      const receipt = await this.install(zapInstallRequest(policy));
      this.repo.setSetting(KEY, [...existing, policy]);
      return { policy, receipt };
    });
  }

  update(input: { origin: string; expectedRevision: number; selectors: string[]; userCss: string; enabled: boolean }): Promise<{ policy: ZapSitePolicy; receipt: ZapInstallReceipt }> {
    return this.serial(async () => {
      const existing = this.list();
      const current = existing.find(policy => policy.origin === input.origin);
      if (!current) throw new AuxError("permission_denied", "Grant this exact site before saving Zap styles.");
      if (current.revision !== input.expectedRevision) throw new AuxError("conflict", "Zap policy changed. Refresh and try again.");
      const policy = ZapSitePolicySchema.parse({ ...current, selectors: input.selectors, userCss: input.userCss, enabled: input.enabled,
        revision: current.revision + 1, updatedAt: Date.now() });
      const receipt = await this.install(zapInstallRequest(policy));
      this.repo.setSetting(KEY, existing.map(item => item.origin === current.origin ? policy : item));
      return { policy, receipt };
    });
  }

  revoke(origin: string, expectedRevision: number): Promise<{ policy: null; receipt: ZapInstallReceipt }> {
    return this.serial(async () => {
      const existing = this.list();
      const current = existing.find(policy => policy.origin === origin);
      if (!current) throw new AuxError("not_found", "No Zap grant exists for this site.");
      if (current.revision !== expectedRevision) throw new AuxError("conflict", "Zap policy changed. Refresh and try again.");
      const request = zapInstallRequest({ ...current, revision: current.revision + 1, enabled: false, selectors: [], userCss: "" });
      const receipt = await this.install(request);
      this.repo.setSetting(KEY, existing.filter(item => item.origin !== origin));
      return { policy: null, receipt };
    });
  }

  private async install(request: ZapStylesheetInstall): Promise<ZapInstallReceipt> {
    if (!this.native?.installZapStylesheet) throw new AuxError("backend_unavailable", "The native Zap stylesheet installer is unavailable.");
    const receipt = ZapInstallReceiptSchema.parse(await this.native.installZapStylesheet(request));
    if (receipt.profileId !== request.profileId || receipt.origin !== request.origin || receipt.revision !== request.revision ||
        receipt.stylesheetSha256 !== request.stylesheetSha256 || receipt.activeDocuments.some(item => item.frameOrigin !== request.origin))
      throw new AuxError("conflict", "The native Zap installer returned a mismatched receipt.");
    return receipt;
  }

  private serial<T>(work: () => Promise<T>): Promise<T> {
    const next = this.pending.then(work, work);
    this.pending = next.then(() => undefined, () => undefined);
    return next;
  }
}
