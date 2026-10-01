import { z } from "zod";

const Host = z.string().min(1).max(253).refine(value => {
  try { const url = new URL(`https://${value}`); return url.hostname === value && url.pathname === "/" && !url.username && !url.password && !url.port; }
  catch { return false; }
}, "Expected a source host without a URL path or query.");
export const DownloadNamingSettingsSchema = z.object({ mode: z.enum(["off", "unclear", "all"]), useAi: z.boolean(),
  excludedHosts: z.array(z.string().min(1).max(253)).max(200), excludedExtensions: z.array(z.string().min(1).max(32)).max(100),
  excludedMimeTypes: z.array(z.string().min(1).max(200)).max(100), template: z.string().min(1).max(500) }).strict();
export const DownloadCompletedNativeSchema = z.object({ id: z.string().min(1).max(200), filename: z.string().min(1).max(255),
  mime: z.string().max(200), sourceHost: Host, tabTitle: z.string().max(500), referrerHost: Host.optional(), endedAt: z.number().int().nonnegative() }).strict();
export const DownloadNameStemSchema = z.string().min(1).max(100).refine(value => value.trim() === value &&
  !value.startsWith(".") && [...value].every(character => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127 &&
    character !== "/" && character !== ":" && character !== "\\" && !/[\p{Cc}\p{Cf}]/u.test(character)), "Unsafe download name.");
export const RenameDownloadSchema = z.object({ downloadId: z.string().min(1).max(200), expectedName: z.string().min(1).max(255),
  stem: DownloadNameStemSchema, mode: z.enum(["unclear", "all"]) }).strict();
export type DownloadNamingSettings = z.infer<typeof DownloadNamingSettingsSchema>;

export const DownloadRenameReceiptSchema = z.object({ receiptId: z.string().min(1).max(200), downloadId: z.string().min(1).max(200), originalName: z.string().min(1).max(255), filename: z.string().min(1).max(255), renamedAt: z.number().int().nonnegative(), expiresAt: z.number().int().nonnegative() }).strict();
export type DownloadRenameReceipt = z.infer<typeof DownloadRenameReceiptSchema>;

export const DEFAULT_DOWNLOAD_NAMING: DownloadNamingSettings = {
  mode: "unclear", useAi: true, excludedHosts: [], excludedExtensions: [], excludedMimeTypes: [],
  template: "{date} {site} {title}",
};
