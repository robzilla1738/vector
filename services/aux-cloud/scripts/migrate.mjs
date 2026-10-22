import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Pool, neonConfig } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
neonConfig.webSocketConstructor=globalThis.WebSocket;
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1});
const db=await pool.connect();
try {
  await db.query('CREATE TABLE IF NOT EXISTS aux_migrations (name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
  for (const name of (await readdir(new URL('../migrations/', import.meta.url))).filter(n=>n.endsWith('.sql')).sort()) {
    const source=await readFile(new URL(`../migrations/${name}`,import.meta.url),'utf8');
    const hash=createHash('sha256').update(source).digest('hex');
    await db.query('BEGIN');
    try {
      await db.query("SELECT pg_advisory_xact_lock(hashtext('aux-cloud-migrations'))");
      const existing=await db.query('SELECT sha256 FROM aux_migrations WHERE name=$1',[name]);
      if(existing.rows.length) {
        if(existing.rows[0].sha256!==hash) throw new Error(`Applied migration changed: ${name}`);
      } else {
        await db.query(source);
        await db.query('INSERT INTO aux_migrations(name,sha256) VALUES($1,$2)',[name,hash]);
        console.log(`Applied ${name}`);
      }
      await db.query('COMMIT');
    } catch(error) {await db.query('ROLLBACK');throw error;}
  }
} finally {db.release();await pool.end();}
