import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { Hono } from 'hono';
import { ZodError } from 'zod';
import { eventsRoutes, eventSnapshotSQL, eventPollReply, eventTopics } from './events';
import type { AuthVariables } from './auth';

test('actual current-schema invalidation snapshots isolate owners and detect edits, deletes, sessions and settings', async () => {
  const pg = new PGlite(), owner = randomUUID(), other = randomUUID(), secret = 'synthetic-offline-event-cursor-key-0001';
  try {
    for (const name of (await readdir(new URL('../migrations/', import.meta.url))).filter(name => name.endsWith('.sql')).sort()) {
      const source = (await readFile(new URL('../migrations/' + name, import.meta.url), 'utf8')).replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', '');
      await pg.exec(source);
    }
    await pg.query('INSERT INTO aux_users(id,clerk_id,email) VALUES($1,$2,$3),($4,$5,$6)', [owner, 'owner', 'owner@example.invalid', other, 'other', 'other@example.invalid']);
    const snapshot = async (user: string) => (await pg.query<{snapshot:Record<string,string>}>(eventSnapshotSQL, [user])).rows[0].snapshot;
    const baseline = await snapshot(owner), first = eventPollReply(owner, [...eventTopics], undefined, baseline, secret);
    assert.deepEqual(first.changed, [...eventTopics]);
    assert.deepEqual(eventPollReply(owner, [...eventTopics], first.cursor, await snapshot(owner), secret).changed, []);
    await pg.query("INSERT INTO sync_entities(user_id,kind,entity_id,payload) VALUES($1,'project','other', $2::jsonb)", [other, JSON.stringify({private:'other-user'})]);
    assert.equal(eventPollReply(owner, [...eventTopics], first.cursor, await snapshot(owner), secret).cursor, first.cursor);
    await pg.query("INSERT INTO sync_entities(user_id,kind,entity_id,payload) VALUES($1,'project','p1',$2::jsonb),($1,'project','p2',$3::jsonb)", [owner, JSON.stringify({id:'p1',updatedAt:'2026-10-26T01:00:00Z'}), JSON.stringify({id:'p2',updatedAt:'2026-10-26T02:00:00Z'})]);
    const withProjects = await snapshot(owner); assert.notEqual(withProjects.drive, baseline.drive);
    await pg.query("UPDATE sync_entities SET payload=jsonb_set(payload,'{name}','\"changed without timestamp change\"') WHERE user_id=$1 AND entity_id='p1'", [owner]);
    const edited = await snapshot(owner); assert.notEqual(edited.drive, withProjects.drive);
    await pg.query("DELETE FROM sync_entities WHERE user_id=$1 AND entity_id='p1'", [owner]);
    assert.notEqual((await snapshot(owner)).drive, edited.drive);
    await pg.query("INSERT INTO sync_entities(user_id,kind,entity_id,payload) VALUES($1,'settings','settings','{\"sync\":true}')", [owner]);
    assert.notEqual((await snapshot(owner))['user-settings'], baseline['user-settings']);
    await pg.query("INSERT INTO aux_session_snapshots(user_id,session_id,generation,deleted_at) VALUES($1,'fixture-session',0,now())", [owner]);
    assert.notEqual((await snapshot(owner)).sessions, baseline.sessions);
    assert.notEqual(eventPollReply(other, [...eventTopics], undefined, baseline, secret).cursor, first.cursor);
    assert.ok(JSON.stringify(first).length < 1024); assert.ok(!JSON.stringify(first).includes(owner));
  } finally { await pg.close(); }
});

test('event receiver rejects unauthenticated, unknown, duplicate and malformed topics/cursors before storage', async () => {
  assert.equal((await eventsRoutes.request('/events/poll?topics=drive')).status, 401);
  const app = new Hono<{Variables:AuthVariables}>();
  app.use('*', async (c,next) => { c.set('user',{id:randomUUID(),clerkId:'fixture',email:'fixture@example.invalid',sessionId:'fixture'}); await next(); });
  app.route('/',eventsRoutes);
  app.onError((error,c) => error instanceof ZodError ? c.json({error:'Invalid event request'},400) : c.json({error:'Request rejected'},'status' in error ? (error.status as 400) : 500));
  for (const query of ['topics=pwm', 'topics=drive,drive', 'topics=drive&cursor=not-a-cursor', 'topics=drive&unexpected=1']) assert.equal((await app.request('/events/poll?'+query)).status,400);
});
