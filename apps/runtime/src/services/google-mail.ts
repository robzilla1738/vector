import { createHash } from "node:crypto";
import emailAddresses from "email-addresses";
import { AuxError } from "@aux/contracts";

export const googleMessageHash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const googleRawMessageHash = (value: unknown) => {
  const raw = (value as { message?: { raw?: unknown } })?.message?.raw;
  if (typeof raw !== "string" || !/^[A-Za-z0-9_-]+={0,2}$/.test(raw))
    throw new AuxError("backend_unavailable", "Google returned no valid original draft bytes.");
  return createHash("sha256").update(Buffer.from(raw, "base64url")).digest("hex");
};
export function foldMailHeader(name: string, values: string[], separator = " "): string {
  let line = `${name}: `,
    result = "";
  for (const [index, value] of values.entries()) {
    const join = index ? separator : "";
    if (line.length + join.length + value.length > 78 && index) {
      result += `${line}${separator.trimEnd()}\r\n`;
      line = ` ${value}`;
    } else line += join + value;
  }
  return result + line;
}
export function encodedMailSubject(value: string): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const char of value) {
    if (Buffer.byteLength(current + char) > 42) {
      chunks.push(current);
      current = "";
    }
    current += char;
  }
  if (current || !chunks.length) chunks.push(current);
  return chunks.map((text) => `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=`);
}
function unfold(value: string): string {
  const text = value.replace(/\r\n[ \t]+/g, " ");
  if (
    text.length > 8_000 ||
    [...text].some((char) => (char.charCodeAt(0) < 32 && char !== "\t") || char.charCodeAt(0) === 127)
  )
    throw new AuxError("invalid_params", "The original message contains an unsupported header.");
  return text;
}
function addresses(value: string): string[] {
  const parsed = emailAddresses.parseAddressList({ input: value, strict: true, partial: false });
  if (!parsed) throw new AuxError("invalid_params", "The original message has an invalid recipient address.");
  const mailboxes = parsed.flatMap((item) => (item.type === "group" ? item.addresses : [item]));
  if (mailboxes.length > 100 || mailboxes.some((item) => /[^\x20-\x7e]/.test(item.address)))
    throw new AuxError("invalid_params", "This reply requires unsupported international mailbox handling.");
  return mailboxes.map((item) => item.address);
}
/** Read only trusted field structure; message content never becomes instructions or authority. */
export function googleReplyEnvelope(source: Record<string, unknown>, owner: string, replyAll: boolean) {
  const payload = source.payload as { headers?: unknown } | undefined;
  if (
    typeof source.id !== "string" ||
    typeof source.threadId !== "string" ||
    !Array.isArray(payload?.headers)
  )
    throw new AuxError("backend_unavailable", "Google returned an incomplete original message.");
  const headers = new Map<string, string[]>();
  for (const item of payload.headers) {
    const h = item as { name?: unknown; value?: unknown };
    if (typeof h.name !== "string" || typeof h.value !== "string") continue;
    const key = h.name.toLowerCase();
    headers.set(key, [...(headers.get(key) ?? []), unfold(h.value)]);
  }
  const single = (key: string, required = false) => {
    const values = headers.get(key) ?? [];
    if (values.length > 1 || (required && !values.length))
      throw new AuxError("invalid_params", `The original message has an ambiguous ${key} header.`);
    return values[0] ?? "";
  };
  const from = addresses(single("reply-to") || single("from", true));
  if (!from.length) throw new AuxError("invalid_params", "The original reply address has no mailbox.");
  const seen = new Set([owner.toLowerCase()]);
  const unique = (values: string[]) =>
    values.filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  let to = unique(from);
  const originalTo = headers.get("to")?.flatMap(addresses) ?? [];
  if (!to.length) to = unique(originalTo);
  const cc = replyAll ? unique([...originalTo, ...(headers.get("cc")?.flatMap(addresses) ?? [])]) : [];
  if (!to.length || to.length + cc.length > 100)
    throw new AuxError("invalid_params", "The original message has no eligible bounded reply recipients.");
  const messageId = single("message-id", true);
  const messageIdPattern = /^<[^<>\s]+>$/;
  const validId = (value: string) =>
    value.length <= 900 &&
    messageIdPattern.test(value) &&
    [...value].every((char) => char.charCodeAt(0) >= 33 && char.charCodeAt(0) <= 126);
  if (!validId(messageId))
    throw new AuxError("invalid_params", "The original message has an invalid Message-ID.");
  const references = single("references").trim().split(/\s+/).filter(Boolean);
  if (references.some((value) => !validId(value)) || references.length > 100)
    throw new AuxError("invalid_params", "The original message has unsupported References.");
  const subject = single("subject");
  if (subject.length > 500) throw new AuxError("invalid_params", "The original message subject is too long.");
  return {
    to,
    cc,
    subject: /^re:/i.test(subject) ? subject : `Re: ${subject}`,
    threadId: source.threadId,
    headers: [
      `In-Reply-To: ${messageId}`,
      foldMailHeader("References", [...references.filter((value) => value !== messageId), messageId]),
    ],
  };
}
