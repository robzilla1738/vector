// Additive Aux development migration only; never emits connection/provider data.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
import {checkEnvironment,migrationInventory} from './check-environment.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
try {
 const resources=JSON.parse(await readFile(new URL('../config/deployment-resources.json',import.meta.url)));
 const checked=checkEnvironment(process.env,resources);
 if(checked.profile!=='development'||resources.development.databaseHost!=='ep-spring-darkness-b824br4r-pooler.c-14.us-east-1.aws.neon.tech')throw Error('target');
 const manifest=JSON.parse(await readFile(new URL('../src/schema-manifest.json',import.meta.url)));
 if(JSON.stringify(await migrationInventory())!==JSON.stringify(manifest)||manifest['012-sync-recovery-v2.sql']!=='c7b963011657f8d6e28acdc0969eca1d0b6d7f118954142c918cf2bb52ba2e5e')throw Error('source');
 const db=neon(process.env.DATABASE_URL),before=await db`SELECT name,sha256 FROM aux_migrations ORDER BY name`;
 if(before.length!==11&&before.length!==12)throw Error('history');
 for(const r of before)if(manifest[r.name]!==r.sha256)throw Error('history');
 if(before.length===11&&before.some(r=>r.name==='012-sync-recovery-v2.sql'))throw Error('history');
 // Existing normal migration runner uses transaction/advisory-lock/hash checks.
 await import('./migrate.mjs');
 const after=await db`SELECT name,sha256 FROM aux_migrations ORDER BY name`;
 if(after.length!==12||after.some(r=>manifest[r.name]!==r.sha256))throw Error('verification');
 const tables=await db`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('aux_sync_recovery_v2','aux_sync_recovery_challenges_v2') ORDER BY table_name`;
 if(tables.length!==2)throw Error('verification');
 const evidence={format:'aux.development.recovery.migration.v1',profile:'development',databaseHost:resources.development.databaseHost,beforeMigrations:before.length,afterMigrations:after.length,manifestSha256:hash(await readFile(new URL('../src/schema-manifest.json',import.meta.url))),migrationSha256:manifest['012-sync-recovery-v2.sql'],tables:tables.map(r=>r.table_name),allMigrationHashesMatch:true,productionTouched:false,existingKeyOrAccountUpdate:false,desktopActivated:false};
 await writeFile(new URL('../evidence/development-recovery-migration.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
 console.log('Aux development migration012 verified;12 exact migration hashes; two additive recovery tables.');
} catch {
 console.error('Aux development recovery migration did not verify; private diagnostics withheld.');
 process.exitCode=1;
}
