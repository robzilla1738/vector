// Operator tasks for the hosted service. Reads DATABASE_URL and BLOB_READ_WRITE_TOKEN from the
// process environment only, and never prints them.
//   feedback list
//   feedback get <id> --output <new file>
//   share revoke <share id>
import { writeFile } from 'node:fs/promises';
import { get } from '@vercel/blob';
import { sql } from '../src/db';

const usage = 'Usage: operator.mts feedback list | feedback get <id> --output <new file> | share revoke <share id>';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function listFeedback() {
  return sql`SELECT id, user_id, expected_size AS size, created_at FROM aux_attachments
    WHERE purpose = 'feedback' AND state = 'ready' ORDER BY created_at DESC LIMIT 100`;
}

export async function saveFeedback(id: string, output: string) {
  if (!uuid.test(id)) throw new Error('Feedback id must be a UUID.');
  const [row] = await sql`SELECT pathname FROM aux_attachments WHERE id = ${id} AND purpose = 'feedback' AND state = 'ready'`;
  if (!row) throw new Error('No such feedback report.');
  const blob = await get(row.pathname, { access: 'private', useCache: false });
  if (!blob || blob.statusCode !== 200) throw new Error('The report file is unavailable.');
  // Reports can hold private session data: owner-only, and never overwrite an existing file.
  await writeFile(output, Buffer.from(await new Response(blob.stream).arrayBuffer()), { flag: 'wx', mode: 0o600 });
}

// Takes the share down and blocks it: its owner cannot republish that conversation.
export async function revokeShare(id: string) {
  if (!/^[A-Za-z0-9_-]{12,32}$/.test(id)) throw new Error('Not a share id.');
  const rows = await sql`UPDATE shared_sessions SET revoked_at = COALESCE(revoked_at, now()), blocked_at = COALESCE(blocked_at, now()), messages = '[]'::jsonb, title = ''
    WHERE id = ${id} RETURNING id`;
  if (!rows.length) throw new Error('No such share.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [area, action, id, flag, output] = process.argv.slice(2);
  try {
    if (area === 'feedback' && action === 'list') console.table(await listFeedback());
    else if (area === 'feedback' && action === 'get' && id && flag === '--output' && output) { await saveFeedback(id, output); console.log(`Saved to ${output}`); }
    else if (area === 'share' && action === 'revoke' && id) { await revokeShare(id); console.log(`Revoked ${id}`); }
    else { console.error(usage); process.exitCode = 2; }
  } catch (error) { console.error(error instanceof Error ? error.message : 'Operation failed'); process.exitCode = 1; }
}
