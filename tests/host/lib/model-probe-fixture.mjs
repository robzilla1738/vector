import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const successPath='/appearance-model-probe-success/v1',failurePath='/appearance-model-probe-failure/v1';
const model='aux-owned-probe-model';
/** Fixed one-use loopback cohorts. No credentials, caller scripts or fake
 * application statuses: only real original HTTP requests and responses. */
function install(fixture,signal,rejectResponse){
  assert.ok(signal instanceof AbortSignal&&!signal.aborted);
  assert.equal(typeof fixture.claimRoute,'function','Exclusive original route ownership capability is required');
  const base=new URL(fixture.url);assert.ok(base.protocol==='http:'&&base.hostname==='127.0.0.1'&&base.port&&base.pathname==='/'&&!base.search&&!base.username&&!base.password);
  const prefix=rejectResponse?failurePath:successPath,receipts=[],pending=new Set();let release,cancelled=false,released=false;
  const gate=new Promise(done=>{release=done;});
  const cancel=()=>{cancelled=true;release();for(const response of pending)response.destroy();};

  const listLease=fixture.claimRoute(`${prefix}/models`,()=>{assert.ok(!cancelled&&!signal.aborted);return {data:[{id:model}]};},{headers:{'content-type':'application/json'}});
  let requestLease;try {requestLease=fixture.claimRoute(`${prefix}/chat/completions`,async(request,response)=>{
    assert.ok(!cancelled&&!signal.aborted&&receipts.length<(rejectResponse?1:2),'Original probe cohort is retired or consumed');
    assert.ok(listLease.current()&&requestLease.current(),'Original fixed HTTP route owner retired');
    assert.equal(request.method,'POST');
    assert.ok(request.headers.authorization==='Bearer aux-local','Only the fixed synthetic local token is permitted');
    let bytes=0,body='';for await(const chunk of request){bytes+=chunk.length;assert.ok(bytes<=65536,'Probe HTTP body exceeds original bound');body+=chunk.toString();}
    assert.ok(listLease.current()&&requestLease.current(),'Original fixed HTTP route retired while reading body');
    const value=JSON.parse(body);assert.equal(value.model,model);assert.ok(Array.isArray(value.messages)&&value.stream!==true);
    const messages=value.messages,kind=receipts.length===0?'structured':'vision';
    const user=messages.filter(row=>row.role==='user');assert.equal(user.length,1);
    if(kind==='structured'){
      assert.equal(messages.length,2);assert.equal(messages[0].role,'system');
      assert.equal(messages[0].content,'You answer probes with strict JSON.');
      assert.equal(user[0].content,'Return {"ok":true}');
    }else{
      assert.equal(messages.length,2);assert.deepEqual(messages[0],{role:'system',content:''});assert.equal(user[0].role,'user');
      assert.deepEqual(user[0].content,[{type:'text',text:'What color dominates this image? One word.'},{type:'image_url',image_url:{url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='}}]);
    }
    const receipt={index:receipts.length+1,method:request.method,path:request.url,state:'pending',status:rejectResponse?503:200,kind,bodySha256:createHash('sha256').update(body).digest('hex'),bodyBytes:bytes,rawBody:body};receipts.push(receipt);pending.add(response);
    const disconnected=()=>{pending.delete(response);if(!response.writableEnded){receipt.state='disconnected';cancel();}};response.once('close',disconnected);
    response.once('finish',()=>{if(receipt.state!=='refused')receipt.state='delivered';receipt.status=response.statusCode;pending.delete(response);});
    await gate;
    if(!listLease.current()||!requestLease.current()){receipt.state='refused';assert.fail('Original fixed HTTP route retired while response held');}
    if(cancelled||signal.aborted||response.destroyed){receipt.state='cancelled';response.destroy();return;}
    receipt.state='released';
    if(rejectResponse){response.statusCode=503;return {error:{message:'Owned synthetic probe unavailable',type:'server_error',code:'owned_probe_unavailable'}};}
    return {id:`aux-owned-probe-${receipt.index}`,object:'chat.completion',created:1,model,choices:[{index:0,message:{role:'assistant',content:receipt.index===1?' {"ok":true} ':'blue'},finish_reason:'stop'}],usage:{prompt_tokens:10,completion_tokens:10,total_tokens:20}};
  },{method:'POST',headers:{'content-type':'application/json'}});
  }catch(primary){try{listLease.remove();}catch(cleanup){throw new AggregateError([primary,cleanup],'Probe acquisition failed with original route debt');}throw primary;}
  signal.addEventListener('abort',cancel,{once:true});
  return {endpoint:`${fixture.url}${prefix}`,model,receipts,kind:rejectResponse?'failure':'success',
    requirePending(){assert.ok(listLease.current()&&requestLease.current());assert.ok(!cancelled&&!released&&receipts.length===1&&receipts[0].state==='pending','Original structured probe HTTP is no longer pending');},
    release(){assert.ok(listLease.current()&&requestLease.current());assert.ok(!cancelled&&!released&&receipts.length===1);released=true;release();},
    dispose(){cancel();signal.removeEventListener('abort',cancel);const errors=[];for(const lease of [requestLease,listLease])try{lease.remove();}catch(reason){errors.push(reason);}if(errors.length)throw new AggregateError(errors,'Original fixed route cleanup debt');},
    get unresolved(){return pending.size;}};
}
export const createSuccessfulModelProbeFixture=(fixture,signal)=>install(fixture,signal,false);
export const createRejectedModelProbeFixture=(fixture,signal)=>install(fixture,signal,true);
