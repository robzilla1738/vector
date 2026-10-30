/** The task transcript store: one messages.jsonl per session, a JSON message per line. A row's id
 * is its line's byte offset, so readers can resume from it. A line that does not parse is skipped
 * with a warning. Writes run under the native broker, as the supplied store's do; a rewrite also
 * re-points routines that were created from a message to that message's new offset. */
import {appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, readSync, renameSync, statSync, unlinkSync, writeFileSync} from 'node:fs';

const NEWLINE = 10;

export function create({stateDb, stores: {transcripts: t}}) {
  const parseLine = (line, filePath, offset) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      t.logger.warn('[Sessions] skipping corrupted messages.jsonl line', {filePath, offset, error: t.errorMessage(error)});
      return null;
    }
  };
  /** The complete lines of `buffer[0, end)`, as rows at `base` + their offset; a partial last line is left out. */
  const rowsOf = (buffer, end, base, filePath) => {
    const rows = [];
    for (let offset = 0; offset < end;) {
      const newline = buffer.indexOf(NEWLINE, offset);
      if (newline < 0 || newline >= end) break;
      const msg = parseLine(buffer.toString('utf8', offset, newline), filePath, base + offset);
      if (msg) rows.push({id: String(base + offset), jsonlReadSize: newline - offset + 1, msg});
      offset = newline + 1;
    }
    return rows;
  };
  const fileOf = (accountId, session) => t.sessionMessagesJsonlPath(t.resolveSessionMessageDir(accountId, session));
  /** The session's directory, created if needed, and its transcript path. */
  const writable = (accountId, session) => {
    const directory = t.resolveSessionMessageDir(accountId, session);
    mkdirSync(directory, {recursive: true});
    return t.sessionMessagesJsonlPath(directory);
  };

  const append = (accountId, session, message) => t.auxBrokerBoundary().sync(() => {
    const file = writable(accountId, session), offset = existsSync(file) ? statSync(file).size : 0;
    appendFileSync(file, `${JSON.stringify(message)}\n`, 'utf8');
    return String(offset);
  });
  /** Writes `rows` as the whole transcript; returns old row id → new offset. */
  const rewrite = (accountId, session, rows) => t.auxBrokerBoundary().sync(() => {
    const file = writable(accountId, session), temporary = `${file}.tmp`, offsets = new Map();
    if (existsSync(temporary)) unlinkSync(temporary);
    let offset = 0, text = '';
    for (const row of rows) {
      offsets.set(row.id, String(offset));
      const line = `${JSON.stringify(row.msg)}\n`;
      text += line;
      offset += Buffer.byteLength(line);
    }
    writeFileSync(temporary, text, 'utf8');
    renameSync(temporary, file);
    return offsets;
  });
  /** Routines created from a message of `session` follow it to its new offset. */
  const repointRoutines = (accountId, session, offsets) => {
    const database = stateDb(accountId).$client;
    for (const routine of database.prepare('select "id", "metadata" from "routines"').all()) {
      const metadata = JSON.parse(routine.metadata), origin = metadata.origin;
      if (origin?.type !== 'session-message' || origin.sessionId !== session.id) continue;
      const messageId = offsets.get(origin.messageId);
      if (messageId) database.prepare('update "routines" set "metadata" = ? where "routines"."id" = ?').run(JSON.stringify({...metadata, origin: {...origin, messageId}}), routine.id);
    }
  };

  return class JsonlSessionMessageStore {
    accountId;
    constructor(accountId) {
      this.accountId = accountId;
    }
    listRows(session) {
      const file = fileOf(this.accountId, session);
      if (!existsSync(file)) return Promise.resolve([]);
      const buffer = readFileSync(file);
      return Promise.resolve(rowsOf(buffer, buffer.length, 0, file));
    }
    async readRange(session, start, length) {
      const file = fileOf(this.accountId, session), descriptor = openSync(file, 'r');
      try {
        const buffer = Buffer.alloc(length);
        return rowsOf(buffer, readSync(descriptor, buffer, 0, length, start), start, file);
      } finally {
        closeSync(descriptor);
      }
    }
    append(session, message) {
      return append(this.accountId, session, message);
    }
    rewrite(session, rows) {
      const offsets = rewrite(this.accountId, session, rows);
      repointRoutines(this.accountId, session, offsets);
      return Promise.resolve(offsets);
    }
  };
}
