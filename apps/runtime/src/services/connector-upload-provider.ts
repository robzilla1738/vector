import { notionFileAllocationShape } from "./connector-file-capability.js";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { AuxError, type OutboundMcpTool, type OutboundMcpCallResult } from "@aux/contracts";
import type { ConnectorFileTransferRecord } from "@aux/contracts/connector-file-upload";
import type { ConnectorUploadInstruction } from "./connector-upload-network.js";

const httpsUrl = z
  .string()
  .url()
  .max(8192)
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.hash;
  });
// Only this concrete multipart instruction shape is implemented. It is NOT asserted to be a live Notion schema.
const notionInstruction = z
  .object({
    upload_url: httpsUrl,
    upload_method: z.literal("POST"),
    upload_headers: z.record(z.string(), z.string()),
    upload_form_field: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),
    file_upload_id: z.string().min(1).max(300).optional(),
    notices: z.array(z.unknown()).max(50).optional(),
  })
  .strict();
const slackInstruction = z
  .object({
    upload_url: httpsUrl,
    file_id: z.string().regex(/^F[A-Z0-9_]{1,100}$/),
    ok: z.literal(true).optional(),
    notices: z.array(z.unknown()).max(50).optional(),
  })
  .strict();
const result = z
  .object({
    content: z.array(z.unknown()).optional(),
    structuredContent: z.record(z.string(), z.unknown()).optional(),
    isError: z.boolean().optional(),
  })
  .passthrough();
export const allocationTool = (provider: "notion" | "slack") =>
  provider === "notion" ? "notion-create-file-upload" : "slack_get_file_upload_url";

export function allocationArguments(
  provider: "notion" | "slack",
  tool: OutboundMcpTool,
  source: { filename: string; mediaType: string; size: number },
) {
  if (provider === "slack") return { filename: source.filename, length: source.size };
  const shape = notionFileAllocationShape(tool);
  if (!shape)
    throw new AuxError(
      "capability_unsupported",
      "The returned Notion tool does not advertise a supported local-upload schema.",
    );
  return { filename: source.filename, ...(shape.contentType ? { content_type: source.mediaType } : {}) };
}

export function decodedConnectorOutput(output: OutboundMcpCallResult): Record<string, unknown> {
  if (output.status !== "completed" || output.isError)
    throw new AuxError(
      "backend_unavailable",
      output.status === "uncertain"
        ? "The provider tool outcome is uncertain; inspect the original receipt."
        : "The provider refused the connector file operation.",
    );
  const parsed = result.parse(JSON.parse(output.output));
  let data: unknown = parsed.structuredContent;
  if (!data && parsed.content?.length === 1) {
    const content = parsed.content[0];
    if (
      content &&
      typeof content === "object" &&
      "type" in content &&
      content.type === "text" &&
      "text" in content &&
      typeof content.text === "string"
    ) {
      try {
        data = JSON.parse(content.text);
      } catch {
        data = undefined;
      }
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new AuxError(
      "capability_unsupported",
      "The provider returned no supported structured file result. The original tool receipt is retained.",
    );
  if ("ok" in data && data.ok === false)
    throw new AuxError(
      "backend_unavailable",
      "The provider refused the connector file operation; inspect its retained receipt.",
    );
  return z.record(z.string(), z.unknown()).parse(data);
}

export function uploadInstruction(
  provider: "notion" | "slack",
  output: OutboundMcpCallResult,
): { instruction: ConnectorUploadInstruction; fileId?: string } {
  const data = decodedConnectorOutput(output);
  if (provider === "slack") {
    const parsed = slackInstruction.safeParse(data);
    if (!parsed.success)
      throw new AuxError(
        "capability_unsupported",
        "Slack returned unsupported upload instructions; its allocation receipt is retained.",
      );
    const value = parsed.data;
    return {
      instruction: { url: value.upload_url, headers: {}, encoding: { kind: "raw" } },
      fileId: value.file_id,
    };
  }
  const parsed = notionInstruction.safeParse(data);
  if (!parsed.success)
    throw new AuxError(
      "capability_unsupported",
      "Notion returned unsupported multipart instructions; its allocation receipt is retained.",
    );
  const value = parsed.data;
  return {
    instruction: {
      url: value.upload_url,
      headers: value.upload_headers,
      encoding: {
        kind: "multipart",
        field: value.upload_form_field,
        boundary: `aux-${randomBytes(24).toString("hex")}`,
      },
    },
    ...(value.file_upload_id ? { fileId: value.file_upload_id } : {}),
  };
}

export function connectorUploadDigest(
  job: ConnectorFileTransferRecord,
  request: {
    toolName?: string;
    arguments?: unknown;
    url?: string;
    headers?: Record<string, string>;
    bodySha256?: string;
  },
): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        job.transferId,
        job.runId,
        job.ownerIdentity,
        job.taskId,
        job.taskRevision,
        job.workspaceId,
        job.serverId,
        job.sourceDigest,
        job.toolsRevision,
        job.oauthEpoch,
        job.source,
        job.slack ?? null,
        job.phase,
        request,
      ]),
    )
    .digest("hex");
}

export function suggestedMarkdown(job: ConnectorFileTransferRecord): string | undefined {
  if (job.provider !== "notion" || job.state !== "uploaded" || !job.upload) return;
  const data: unknown = JSON.parse(job.upload.response);
  return data &&
    typeof data === "object" &&
    "suggested_markdown" in data &&
    typeof data.suggested_markdown === "string" &&
    data.suggested_markdown.length <= 20_000
    ? data.suggested_markdown
    : undefined;
}

/** Notices remain attached to the actual provider response, with upload credentials removed from presentation. */
export function connectorUploadNotices(output: OutboundMcpCallResult): unknown[] {
  try {
    const value = result.parse(JSON.parse(output.output)).structuredContent?.notices;
    return Array.isArray(value) && Buffer.byteLength(JSON.stringify(value)) <= 20_000
      ? value.slice(0, 50)
      : [];
  } catch {
    return [];
  }
}
export function publicUploadNotices(job: ConnectorFileTransferRecord): unknown[] | undefined {
  if (job.allocation && !job.allocation.instruction) return undefined;
  const secrets = [
    job.allocation?.instruction?.url,
    ...Object.values(job.allocation?.instruction?.headers ?? {}),
  ].filter((value): value is string => !!value);
  const redact = (value: unknown): unknown => {
    if (typeof value === "string")
      return secrets.reduce((text, secret) => text.replaceAll(secret, "[private upload instruction]"), value);
    if (Array.isArray(value)) return value.map(redact);
    if (value && typeof value === "object")
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, redact(child)]));
    return value;
  };
  return job.notices?.map(redact);
}
