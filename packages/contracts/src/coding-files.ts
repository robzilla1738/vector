import { z } from "zod";
export const CloudCodingIdentitySchema = z
  .object({
    backend: z.literal("cloud"),
    resourceId: z.string().min(1),
    sandboxName: z.string().min(1),
    sessionId: z.string().min(1),
    root: z.string().min(1),
  })
  .strict();
export type CloudCodingIdentity = z.infer<typeof CloudCodingIdentitySchema>;
export interface CodingFileSnapshot {
  path: string;
  content: string;
  version: string;
}
export type CodingFileChange =
  | { kind: "create"; path: string; content: string; encoding?: "base64"; mode?: number }
  | {
      kind: "edit";
      path: string;
      expectedVersion: string;
      content: string;
      encoding?: "base64";
      mode?: number;
    }
  | { kind: "delete"; path: string; expectedVersion: string }
  | { kind: "move"; path: string; destination: string; expectedVersion: string };
export interface CodingFileState {
  path: string;
  content: string | null;
  contentBase64?: string;
  contentTruncated?: boolean;
  mode?: number;
  version: string | null;
}
export interface CodingFileReceipt {
  /** Absent only for local execution; remote receipts remain bound to their original session. */
  execution?: CloudCodingIdentity;
  receiptId: string;
  actionId: string;
  runId: string;
  createdAt: number;
  status: "pending" | "confirmed" | "partially_applied" | "uncertain" | "not_applied";
  before: CodingFileState[];
  after: CodingFileState[];
  undoOf?: string;
  requestHash?: string;
  fileOutcomes?: { path: string; status: "pending" | "confirmed" | "uncertain" | "not_applied" }[];
  error?: string;
}
export interface CodingSearchRequest {
  root: string;
  pattern?: string;
  query?: string;
  regex?: boolean;
  cursor?: string;
  limit?: number;
}
export interface CodingSearchResult {
  matches: { path: string; line?: number; text?: string }[];
  cursor?: string;
}
export interface CodingFileStat {
  path: string;
  kind: "file" | "directory" | "missing";
  size: number;
  version: string | null;
}
