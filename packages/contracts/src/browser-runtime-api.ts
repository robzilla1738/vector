import { z } from "zod";
import { LiveFolderItemsSchema } from "./live-folders.js";
import { DownloadCompletedNativeSchema, DownloadRenameReceiptSchema } from "./download-naming.js";
import { DemonstrationSchema, RecorderStartSchema, RecorderControlSchema } from "./demonstration.js";
import { NightShiftQueueSchema, NightShiftItemSchema } from "./night-shift.js";
import { OriginPoliciesSnapshotSchema, SetOriginPoliciesSchema } from "./agent-site-permissions.js";

const Id = z.string().min(1).max(200);
const Folder = z.object({ folderId: Id }).strict();
const Connection = z.object({ id: Id, name: z.string().min(1).max(200), login: z.string().max(200),
  connected: z.boolean(), error: z.string().max(1000).optional() }).strict();
const Ok = z.object({ ok: z.literal(true) }).strict();

export const BrowserRuntimeMethodSchemas = {
  "liveFolders.items": Folder,
  "liveFolders.refresh": Folder,
  "liveFolders.markRead": Folder.extend({ itemId: Id }),
  "github.connections.list": z.object({}).strict(),
  "github.connections.connect": z.object({ name: z.string().min(1).max(200), token: z.string().min(1).max(1000) }).strict(),
  "github.connections.revoke": z.object({ connectionId: Id }).strict(),
  "downloads.completedNative": DownloadCompletedNativeSchema,
  "downloads.renameReceipts": z.object({}).strict(),
  "downloads.undoRename": z.object({ receiptId: Id }).strict(),
  "safety.originPolicies.list": z.object({}).strict(),
  "safety.originPolicies.set": SetOriginPoliciesSchema,
  "recorder.start": RecorderStartSchema,
  "recorder.pause": RecorderControlSchema,
  "recorder.resume": RecorderControlSchema,
  "recorder.stop": RecorderControlSchema,
  "recorder.discard": RecorderControlSchema,
  "nightShift.propose": NightShiftQueueSchema,
  "nightShift.queue": NightShiftQueueSchema,
  "nightShift.list": z.object({}).strict(),
  "nightShift.review": z.object({ id: Id, decision: z.enum(["approve", "discard", "apply"]) }).strict(),
} as const;

export const BrowserRuntimeResultSchemas = {
  "liveFolders.items": LiveFolderItemsSchema,
  "liveFolders.refresh": LiveFolderItemsSchema,
  "liveFolders.markRead": Ok,
  "github.connections.list": z.array(Connection).max(100),
  "github.connections.connect": Connection,
  "github.connections.revoke": Ok,
  "downloads.completedNative": z.object({ status: z.enum(["skipped", "renamed", "failed"]), receiptId: Id.optional(), filename: z.string().max(255).optional(), reason: z.string().max(1000).optional() }).strict(),
  "downloads.renameReceipts": z.array(DownloadRenameReceiptSchema).max(1000),
  "downloads.undoRename": z.object({ status: z.enum(["restored", "conflict", "expired"]), filename: z.string().max(255).optional() }).strict(),
  "safety.originPolicies.list": OriginPoliciesSnapshotSchema,
  "safety.originPolicies.set": OriginPoliciesSnapshotSchema,
  "recorder.start": DemonstrationSchema,
  "recorder.pause": DemonstrationSchema,
  "recorder.resume": DemonstrationSchema,
  "recorder.stop": DemonstrationSchema,
  "recorder.discard": Ok,
  "nightShift.propose": NightShiftItemSchema,
  "nightShift.queue": NightShiftItemSchema,
  "nightShift.list": z.array(NightShiftItemSchema).max(1000),
  "nightShift.review": NightShiftItemSchema,
} as const;

export const BrowserRuntimeMethodPolicy = {
  "liveFolders.items": { feature: "liveFolders", auth: "aux-webui" },
  "liveFolders.refresh": { feature: "liveFolders", auth: "aux-webui" },
  "liveFolders.markRead": { feature: "liveFolders", auth: "aux-webui" },
  "github.connections.list": { feature: "liveFolders", auth: "aux-webui" },
  "github.connections.connect": { feature: "liveFolders", auth: "aux-webui" },
  "github.connections.revoke": { feature: "liveFolders", auth: "aux-webui" },
  "downloads.completedNative": { feature: "smartDownloadNames", auth: "handler-guarded" },
  "downloads.renameReceipts": { feature: "smartDownloadNames", auth: "aux-webui" },
  "downloads.undoRename": { feature: "smartDownloadNames", auth: "aux-webui" },
  "safety.originPolicies.list": { feature: "agentSitePermissions", auth: "aux-webui" },
  "safety.originPolicies.set": { feature: "agentSitePermissions", auth: "aux-webui" },
  "recorder.start": { feature: "demonstrationSkills", auth: "aux-webui" },
  "recorder.pause": { feature: "demonstrationSkills", auth: "aux-webui" },
  "recorder.resume": { feature: "demonstrationSkills", auth: "aux-webui" },
  "recorder.stop": { feature: "demonstrationSkills", auth: "aux-webui" },
  "recorder.discard": { feature: "demonstrationSkills", auth: "aux-webui" },
  "nightShift.propose": { feature: "overnightReview", auth: "handler-guarded" },
  "nightShift.queue": { feature: "overnightReview", auth: "aux-webui" },
  "nightShift.list": { feature: "overnightReview", auth: "aux-webui" },
  "nightShift.review": { feature: "overnightReview", auth: "aux-webui" },
} as const;
