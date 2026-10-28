/** Email sign-in against the real migrations: every send and verify limit, consent and the sign-in mail. */
import test, {mock} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {app} from './app';
import {clientNetworks,OTP_ALERT_PER_HOUR,OTP_SEND_LIMITS as L,OTP_VERIFY_LIMITS as V} from './auth';
import {TERMS_VERSION} from './legal';
import {withMigratedDatabase,type Query} from './test-database';

type Mail={from:string;to:string[];reply_to:string;text:string};
type Harness={query:Query;mail:Mail[];logs:Record<string,unknown>[];start:(email:string,ip?:string)=>Promise<Response>;verify:(body:object,ip?:string)=>Promise<Response>;code:(email:string)=>string};
const post=async(path:string,body:object,ip:string)=>app.request('/api/v1/auth/email/'+path,{method:'POST',headers:{'content-type':'application/json','x-vercel-forwarded-for':ip,'x-vercel-id':'iad1::fixture-request'},body:JSON.stringify(body)});
const clerkUser=(id:string,email:string)=>({object:'user',id,email_addresses:[{object:'email_address',id:'idn_'+id,email_address:email,verification:{status:'verified',strategy:'admin'},linked_to:[]}],primary_email_address_id:'idn_'+id,banned:false,locked:false,two_factor_enabled:false,first_name:null,last_name:null,image_url:'',external_accounts:[]});

/** Starts at a UTC midnight so hourly and daily windows are predictable; `advance` moves the clock. */
async function signIn(run:(h:Harness,advance:(ms:number)=>void)=>Promise<void>){
  await withMigratedDatabase(async query=>{
    const mail:Mail[]=[],logs:Record<string,unknown>[]=[],clerk=new Map<string,object>(),fallback=globalThis.fetch,env={key:process.env.RESEND_API_KEY,from:process.env.RESEND_FROM};
    process.env.RESEND_API_KEY='re_fixture_synthetic';process.env.RESEND_FROM='Aux <hello@notify.getaux.co>';
    globalThis.fetch=async(input,init)=>{
      const url=new URL(input instanceof Request?input.url:String(input));
      if(url.hostname==='api.resend.com'){mail.push(JSON.parse(String(init!.body)));return Response.json({id:'fixture'});}
      if(url.hostname==='api.clerk.com'&&url.pathname==='/v1/users/count')return Response.json({object:'total_count',total_count:clerk.has(url.searchParams.get('email_address')!)?1:0});
      if(url.hostname==='api.clerk.com'&&url.pathname==='/v1/users'&&init?.method==='POST'){const email=JSON.parse(String(init.body)).email_address[0],user=clerkUser('user_'+clerk.size,email);clerk.set(email,user);return Response.json(user);}
      if(url.hostname==='api.clerk.com'&&url.pathname==='/v1/users'){const user=clerk.get(url.searchParams.get('email_address')!);return Response.json(user?[user]:[]);}
      return fallback(input,init);
    };
    for(const level of ['warn','error'] as const)mock.method(console,level,(line:string)=>logs.push(JSON.parse(line)));
    mock.timers.enable({apis:['Date'],now:Date.UTC(2026,10,2)});
    try{
      await run({query,mail,logs,start:(email,ip='203.0.113.10')=>post('start',{email},ip),verify:(body,ip='203.0.113.10')=>post('verify-code',body,ip),
        code:email=>mail.findLast(m=>m.to[0]===email)!.text.match(/\d{6}/)![0]},ms=>mock.timers.tick(ms));
    }finally{
      mock.timers.reset();mock.restoreAll();globalThis.fetch=fallback;
      for(const [name,value] of [['RESEND_API_KEY',env.key],['RESEND_FROM',env.from]] as const)if(value===undefined)delete process.env[name];else process.env[name]=value;
    }
  });
}
async function refused(response:Response,limit:string,logs:Record<string,unknown>[]){
  assert.equal(response.status,429);assert.equal((await response.json()).code,'RATE_LIMITED');
  assert.ok(Number(response.headers.get('retry-after'))>0);
  assert.deepEqual(logs.at(-1),{event:'aux.auth.rate_limited',requestId:'iad1::fixture-request',path:'/api/v1/auth/email/'+(limit.startsWith('otp-verify')?'verify-code':'start'),limit});
}
const ok=async(response:Promise<Response>)=>assert.equal((await response).status,200);

test('rate limits key IPv4 by address and /24, IPv6 by /64 and /48',()=>{
  assert.deepEqual(clientNetworks('203.0.113.10'),{address:'203.0.113.10',network:'203.0.113.0/24'});
  assert.deepEqual(clientNetworks('::ffff:203.0.113.10'),{address:'203.0.113.10',network:'203.0.113.0/24'});
  assert.deepEqual(clientNetworks('2001:db8:aa:bb:1:2:3:4'),{address:'2001:db8:aa:bb::/64',network:'2001:db8:aa::/48'});
  assert.deepEqual(clientNetworks('2001:db8::1'),{address:'2001:db8:0:0::/64',network:'2001:db8:0::/48'});
  assert.deepEqual(clientNetworks('64:ff9b::203.0.113.10'),{address:'64:ff9b:0:0::/64',network:'64:ff9b:0::/48'});
  assert.deepEqual(clientNetworks('unknown'),{address:'unknown',network:'unknown'});
});

test('sign-in mail goes out with a getaux.co reply-to, a per-email cooldown, and hourly and daily caps',async()=>{
  await signIn(async({mail,logs,start},advance)=>{
    await ok(start('person@example.com'));
    assert.deepEqual({from:mail[0].from,reply_to:mail[0].reply_to},{from:'Aux <hello@notify.getaux.co>',reply_to:'hello@getaux.co'});
    await refused(await start('person@example.com','198.51.100.7'),'otp-resend',logs);
    for(let n=1;n<L.email[0];n++){advance(61_000);await ok(start('person@example.com'));}
    advance(61_000);await refused(await start('person@example.com'),'otp-email',logs);
    // Under the hourly cap every hour, the daily cap still holds.
    for(let n=L.email[0];n<L.emailDay[0];n++){advance(3_600_000);await ok(start('person@example.com'));}
    advance(3_600_000);await refused(await start('person@example.com'),'otp-email-day',logs);
    advance(86_400_000);await ok(start('person@example.com'));
  });
});

test('one address is capped hourly and daily, and IPv6 counts its whole /64 as one address',async()=>{
  await signIn(async({logs,start},advance)=>{
    let n=0;const next=(ip?:string)=>start(`a${n++}@example.com`,ip);
    for(let i=0;i<L.address[0];i++)await ok(next());
    await refused(await next(),'otp-ip',logs);
    for(let sent=L.address[0];sent<L.addressDay[0];){advance(3_600_000);for(let i=0;i<L.address[0]&&sent<L.addressDay[0];i++,sent++)await ok(next());}
    advance(3_600_000);await refused(await next(),'otp-ip-day',logs);
    for(let i=0;i<L.address[0];i++)await ok(next(`2001:db8:aa:bb::${i+1}`));
    await refused(await next('2001:db8:aa:bb:ffff::1'),'otp-ip',logs);
    await ok(next('2001:db8:aa:cc::1'));
  });
});

test('many addresses in one network share its hourly cap; other networks are unaffected',async()=>{
  await signIn(async({logs,start})=>{
    for(let i=0;i<L.network[0];i++)await ok(start(`n${i}@example.com`,`203.0.113.${1+i%10}`));
    await refused(await start('another@example.com','203.0.113.200'),'otp-net',logs);
    await ok(start('another@example.com','198.51.100.1'));
  });
});

test('a client over its own limit cannot spend a victim email budget, and volume alerts without locking anyone out',async()=>{
  await signIn(async({query,logs,start})=>{
    for(let i=0;i<L.address[0];i++)await ok(start(`x${i}@example.com`));
    for(let i=0;i<L.email[0]+2;i++)await refused(await start('victim@example.com'),'otp-ip',logs);
    await ok(start('victim@example.com','198.51.100.1'));
    // Put the hour just under the alert threshold: the next send alerts and still goes out.
    const key=createHmac('sha256',process.env.AUX_AUTH_SECRET!).update('rate\0otp-global').digest('hex');
    await query('UPDATE aux_rate_limits SET attempts=$1 WHERE key=$2',[OTP_ALERT_PER_HOUR-1,key]);
    await ok(start('late@example.com','192.0.2.1'));
    assert.deepEqual(logs.at(-1),{event:'aux.auth.otp_volume_alert',requestId:'iad1::fixture-request',path:'/api/v1/auth/email/start',sentThisHour:OTP_ALERT_PER_HOUR,threshold:OTP_ALERT_PER_HOUR});
    await query('UPDATE aux_rate_limits SET attempts=$1 WHERE key=$2',[50*OTP_ALERT_PER_HOUR,key]);
    await ok(start('later@example.com','192.0.2.2'));
  });
});

test('code checks are capped per code, per address and per network',async()=>{
  await signIn(async({logs,start,verify,code})=>{
    await ok(start('guess@example.com','192.0.2.50'));
    const right=code('guess@example.com'),wrong=right==='000000'?'111111':'000000';
    for(let i=0;i<5;i++)assert.equal((await verify({email:'guess@example.com',code:wrong},'192.0.2.50')).status,400);
    assert.equal((await (await verify({email:'guess@example.com',code:right},'192.0.2.50')).json()).code,'INVALID_CODE');
    for(let i=0;i<V.address[0]-6;i++)await verify({email:'guess@example.com',code:wrong},'192.0.2.50');
    await refused(await verify({email:'guess@example.com',code:wrong},'192.0.2.50'),'otp-verify',logs);
    for(let i=0;i<V.network[0]-V.address[0];i++)assert.equal((await verify({email:'guess@example.com',code:wrong},`192.0.2.${60+i%10}`)).status,400);
    await refused(await verify({email:'guess@example.com',code:wrong},'192.0.2.99'),'otp-verify-net',logs);
  });
});

test('desktop sign-up records the accepted terms version and age confirmation, and never invents them',async()=>{
  await signIn(async({query,logs,start,verify,code},advance)=>{
    const consent={termsVersion:TERMS_VERSION,ageConfirmed:true};
    await ok(start('new@example.com'));
    // Stale terms are refused before the code is spent, so the same code works after review.
    const stale=await verify({email:'new@example.com',code:code('new@example.com'),consent:{...consent,termsVersion:'2020-01-01'}});
    assert.equal(stale.status,409);assert.equal((await stale.json()).code,'TERMS_CHANGED');
    assert.equal((await verify({email:'new@example.com',code:code('new@example.com'),consent:{...consent,ageConfirmed:false}})).status,400);
    await ok(verify({email:'new@example.com',code:code('new@example.com'),consent}));
    const [created]=await query("SELECT terms_version,terms_accepted_at,age_confirmed_at FROM aux_users WHERE email='new@example.com'");
    assert.equal(created.terms_version,TERMS_VERSION);assert.ok(created.terms_accepted_at&&created.age_confirmed_at);

    await ok(start('quiet@example.com','198.51.100.9'));
    await ok(verify({email:'quiet@example.com',code:code('quiet@example.com')},'198.51.100.9'));
    assert.deepEqual((await query("SELECT terms_version,terms_accepted_at,age_confirmed_at FROM aux_users WHERE email='quiet@example.com'"))[0],{terms_version:null,terms_accepted_at:null,age_confirmed_at:null});
    assert.equal(logs.at(-1)?.event,'aux.auth.consent_missing');
    // Consent sent at a later sign-in is recorded then.
    advance(61_000);await ok(start('quiet@example.com','198.51.100.9'));
    await ok(verify({email:'quiet@example.com',code:code('quiet@example.com'),consent},'198.51.100.9'));
    assert.equal((await query("SELECT terms_version FROM aux_users WHERE email='quiet@example.com'"))[0].terms_version,TERMS_VERSION);
  });
});

test('auth failures log one JSON line with the request id and no provider detail',async()=>{
  await signIn(async({logs})=>{
    delete process.env.RESEND_API_KEY;
    const response=await post('start',{email:'down@example.com'},'192.0.2.9');
    assert.equal(response.status,503);
    assert.deepEqual(logs.at(-1),{event:'aux.auth.request_failed',requestId:'iad1::fixture-request',path:'/api/v1/auth/email/start',name:'Error',kind:'Error'});
  });
});
