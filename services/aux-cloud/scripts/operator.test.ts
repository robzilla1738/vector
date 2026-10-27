import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {withMigratedDatabase} from '../src/test-database';
import {getPublicShare} from '../src/sync';
import {listFeedback,revokeShare,saveFeedback} from './operator.mjs';

test('operator revokes a share and lists only ready feedback reports',async()=>{
  await withMigratedDatabase(async query=>{
    const user=randomUUID(),report=randomUUID(),attachment=randomUUID();
    await query('INSERT INTO aux_users(id,clerk_id,email) VALUES($1,$2,$3)',[user,'fixture-operator','fixture-operator@example.invalid']);
    await query(`INSERT INTO shared_sessions(id,user_id,source_session_id,title,messages) VALUES('fixture-share-1',$1,'s','Public','[{"role":"user"}]'::jsonb)`,[user]);
    await revokeShare('fixture-share-1');
    assert.equal(await getPublicShare('fixture-share-1'),null);
    assert.deepEqual((await query("SELECT title,messages FROM shared_sessions WHERE id='fixture-share-1'"))[0],{title:'',messages:[]});
    await assert.rejects(revokeShare('missing-share-x'),/No such share/);
    for(const [id,purpose] of [[report,'feedback'],[attachment,'attachment']])
      await query("INSERT INTO aux_attachments(id,user_id,pathname,name,content_type,expected_size,expected_sha256,purpose,state,expires_at) VALUES($1,$2,$3,'r.json','application/json',10,repeat('a',64),$4,'ready',now())",[id,user,`aux/${user}/${id}/content`,purpose]);
    assert.deepEqual((await listFeedback()).map(row=>row.id),[report]);
    await assert.rejects(saveFeedback(attachment,'/nonexistent/out.json'),/No such feedback/);
  });
});
