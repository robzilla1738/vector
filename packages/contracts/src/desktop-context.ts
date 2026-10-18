import { z } from "zod";

const id = z.string().min(1).max(200);
const timestamp = z.number().int().nonnegative();
const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const DesktopAppSchema = z
  .object({
    bundleId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{1,254}$/),
    displayName: z.string().min(1).max(200),
  })
  .strict();
export const DesktopContextSettingsSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    enabled: z.boolean(),
    paused: z.boolean(),
    workspaceId: id.nullable(),
    selectedApps: z.array(DesktopAppSchema).max(32),
    ocrEnabled: z.boolean(),
    retentionDays: z.literal(14),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (new Set(value.selectedApps.map((app) => app.bundleId)).size !== value.selectedApps.length)
      ctx.addIssue({ code: "custom", message: "Select each app once." });
    if (value.enabled && (!value.workspaceId || !value.selectedApps.length))
      ctx.addIssue({ code: "custom", message: "Choose a Space and at least one app." });
  });
export const desktopContextDefaults = (): DesktopContextSettings => ({
  revision: 0,
  enabled: false,
  paused: false,
  workspaceId: null,
  selectedApps: [],
  ocrEnabled: false,
  retentionDays: 14,
});
export const DesktopContextNativeStatusSchema = z
  .object({
    supported: z.boolean(),
    phase: z.enum([
      "off",
      "permission-required",
      "waiting-picker",
      "running",
      "paused",
      "locked",
      "unavailable",
    ]),
    accessibilityTrusted: z.boolean(),
    ocrSupported: z.boolean(),
    pickerGrantActive: z.boolean(),
    leaseId: id.nullable(),
    configurationRevision: z.number().int().nonnegative(),
    consentRevision: z.number().int().nonnegative().max(2147483647),
    dropped: z.number().int().nonnegative(),
    reason: z.enum([
      "none",
      "unsupported",
      "permission",
      "sensitive",
      "excluded",
      "not-foreground",
      "busy",
      "retired",
      "picker-required",
      "locked",
      "ax-unavailable",
    ]),
  })
  .strict();
export const DesktopContextCaptureSchema = z
  .object({
    captureId: z.string().uuid(),
    workspaceId: id,
    leaseId: id,
    configurationRevision: z.number().int().nonnegative(),
    sourceEpoch: id,
    app: DesktopAppSchema,
    processId: z.number().int().positive(),
    windowId: id,
    capturedAt: timestamp,
    expiresAt: timestamp,
    kind: z.enum(["accessibility", "ocr"]),
    text: z.string().min(1).max(32768),
    selection: z.string().max(4096),
    windowTitle: z.string().max(500),
    documentUrl: z.string().url().max(8192).optional(),
    sha256: hash,
  })
  .strict();
export const DesktopContextSourceSchema = DesktopContextCaptureSchema.omit({ text: true, selection: true });
export const DesktopContextSearchSchema = z
  .object({
    workspaceId: id,
    queries: z.array(z.string().trim().min(2).max(300)).min(1).max(8),
    appBundleIds: z.array(DesktopAppSchema.shape.bundleId).max(32).optional(),
    from: timestamp.optional(),
    to: timestamp.optional(),
    cursor: z.string().max(2048).optional(),
    mode: z.enum(["auto", "lexical"]).default("auto"),
    limit: z.number().int().min(1).max(50).default(20),
  })
  .strict();
export const DesktopContextReadSchema = z
  .object({
    workspaceId: id,
    captureId: z.string().uuid(),
    sha256: hash,
    startLine: z.number().int().min(1).default(1),
    limitLines: z.number().int().min(1).max(200).default(80),
  })
  .strict();
const scope = z.object({ workspaceId: id }).strict();
export const DesktopContextMethodSchemas = {
  "desktopContext.settings": z.object({}).strict(),
  "desktopContext.apps": z.object({}).strict(),
  "desktopContext.configure": z
    .object({ expectedRevision: z.number().int().nonnegative(), settings: DesktopContextSettingsSchema })
    .strict(),
  "desktopContext.permission": z
    .object({
      expectedRevision: z.number().int().nonnegative(),
      kind: z.enum(["accessibility", "ocr-picker"]),
    })
    .strict(),
  "desktopContext.pause": z
    .object({ expectedRevision: z.number().int().nonnegative(), paused: z.boolean() })
    .strict(),
  "desktopContext.sources": scope
    .extend({
      appBundleId: DesktopAppSchema.shape.bundleId.optional(),
      cursor: z.string().max(512).optional(),
      limit: z.number().int().min(1).max(50).default(50),
    })
    .strict(),
  "desktopContext.search": DesktopContextSearchSchema,
  "desktopContext.read": DesktopContextReadSchema,
  "desktopContext.forget": scope
    .extend({
      expectedRevision: z.number().int().nonnegative(),
      appBundleId: DesktopAppSchema.shape.bundleId.optional(),
      captureId: z.string().uuid().optional(),
    })
    .strict(),
} as const;
export type DesktopContextSettings = z.infer<typeof DesktopContextSettingsSchema>;
export type DesktopContextCapture = z.infer<typeof DesktopContextCaptureSchema>;
export type DesktopContextSource = z.infer<typeof DesktopContextSourceSchema>;
export type DesktopContextNativeStatus = z.infer<typeof DesktopContextNativeStatusSchema>;
export type DesktopApp = z.infer<typeof DesktopAppSchema>;
export type DesktopContextSearch = z.input<typeof DesktopContextSearchSchema>;
export type DesktopContextRead = z.infer<typeof DesktopContextReadSchema>;
export type DesktopContextSnapshot = {
  settings: DesktopContextSettings;
  status: DesktopContextNativeStatus;
  storedCount: number;
  storedBytes: number;
};
export type DesktopContextSearchResult = {
  items: { source: DesktopContextSource; startLine: number; endLine: number; text: string; score: number }[];
  nextCursor: string | null;
  mode: "semantic" | "lexical";
  fallbackReason?: string;
  modelId?: string;
  truncated: boolean;
};
/** Native consent is authoritative; attach never grants consent or prompts. */
export interface DesktopContextNativePort {
  status(): Promise<DesktopContextNativeStatus>;
  apps(ownerToken: string): Promise<DesktopApp[]>;
  configure(settings: DesktopContextSettings, ownerToken: string): Promise<DesktopContextNativeStatus>;
  attach(settings: DesktopContextSettings): Promise<DesktopContextNativeStatus>;
  permission(
    kind: "accessibility" | "ocr-picker",
    revision: number,
    ownerToken: string,
  ): Promise<DesktopContextNativeStatus>;
  take(leaseId: string): Promise<DesktopContextCapture | null>;
  validate(capture: DesktopContextSource): Promise<boolean>;
  acknowledge(leaseId: string, captureId: string): Promise<void>;
  stop(): Promise<void>;
}
const snapshot = z
  .object({
    settings: DesktopContextSettingsSchema,
    status: DesktopContextNativeStatusSchema,
    storedCount: z.number().int().nonnegative(),
    storedBytes: z.number().int().nonnegative(),
  })
  .strict();
const pageSource = z
  .object({ items: z.array(DesktopContextSourceSchema).max(50), nextCursor: z.string().nullable() })
  .strict();
export const DesktopContextResultSchemas = {
  "desktopContext.settings": snapshot,
  "desktopContext.apps": z.array(DesktopAppSchema).max(200),
  "desktopContext.configure": snapshot,
  "desktopContext.permission": snapshot,
  "desktopContext.pause": snapshot,
  "desktopContext.sources": pageSource,
  "desktopContext.search": z
    .object({
      items: z
        .array(
          z
            .object({
              source: DesktopContextSourceSchema,
              startLine: z.number().int().positive(),
              endLine: z.number().int().nonnegative(),
              text: z.string().max(32768),
              score: z.number(),
            })
            .strict(),
        )
        .max(50),
      nextCursor: z.string().nullable(),
      mode: z.enum(["semantic", "lexical"]),
      fallbackReason: z.string().max(500).optional(),
      modelId: id.optional(),
      truncated: z.boolean(),
    })
    .strict(),
  "desktopContext.read": z
    .object({
      source: DesktopContextSourceSchema,
      text: z.string().max(32768),
      selection: z.string().max(4096),
      startLine: z.number().int().positive(),
      endLine: z.number().int().nonnegative(),
      totalLines: z.number().int().positive(),
    })
    .strict(),
  "desktopContext.forget": snapshot.extend({ removed: z.number().int().nonnegative() }).strict(),
} as const;
export const NativeDesktopContextRequestSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("status") }).strict(),
  z.object({ op: z.literal("apps"), token: id }).strict(),
  z
    .object({
      op: z.literal("configure"),
      settings: DesktopContextSettingsSchema,
      expectedConsentRevision: z.number().int().nonnegative().max(2147483646),
      token: id,
    })
    .strict(),
  z.object({ op: z.literal("attach"), settings: DesktopContextSettingsSchema }).strict(),
  z
    .object({
      op: z.literal("permission"),
      kind: z.enum(["accessibility", "ocr-picker"]),
      revision: z.number().int().nonnegative(),
      token: id,
    })
    .strict(),
  z.object({ op: z.literal("take"), leaseId: id }).strict(),
  z.object({ op: z.literal("validate"), source: DesktopContextSourceSchema }).strict(),
  z.object({ op: z.literal("acknowledge"), leaseId: id, captureId: z.string().uuid() }).strict(),
  z.object({ op: z.literal("stop") }).strict(),
]);
export const NativeDesktopContextResultSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("status"), status: DesktopContextNativeStatusSchema }).strict(),
  z.object({ op: z.literal("apps"), apps: z.array(DesktopAppSchema).max(200) }).strict(),
  z.object({ op: z.literal("configure"), status: DesktopContextNativeStatusSchema }).strict(),
  z.object({ op: z.literal("attach"), status: DesktopContextNativeStatusSchema }).strict(),
  z.object({ op: z.literal("permission"), status: DesktopContextNativeStatusSchema }).strict(),
  z.object({ op: z.literal("take"), capture: DesktopContextCaptureSchema.nullable() }).strict(),
  z.object({ op: z.literal("validate"), valid: z.boolean() }).strict(),
  z.object({ op: z.literal("acknowledge"), ok: z.literal(true) }).strict(),
  z.object({ op: z.literal("stop"), ok: z.literal(true) }).strict(),
]);
export type NativeDesktopContextRequest = z.infer<typeof NativeDesktopContextRequestSchema>;
export type NativeDesktopContextResult = z.infer<typeof NativeDesktopContextResultSchema>;
/** Credential stores are never desktop capture sources, even if a client forges selection. */
export const desktopContextExcludedApps: readonly string[] = [
  "com.1password.1password",
  "com.agilebits.onepassword7",
  "com.apple.keychainaccess",
  "com.apple.Passwords",
  "com.bitwarden.desktop",
  "com.lastpass.LastPass",
  "com.dashlane.Dashlane",
  "com.apple.Safari",
  "com.google.Chrome",
  "com.google.Chrome.canary",
  "org.chromium.Chromium",
  "com.microsoft.edgemac",
  "com.brave.Browser",
  "org.mozilla.firefox",
  "company.thebrowser.Browser",
  "company.thebrowser.dia",
  "com.aside.browser",
];
