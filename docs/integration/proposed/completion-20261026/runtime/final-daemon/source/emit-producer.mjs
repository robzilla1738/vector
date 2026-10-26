// Execute only the exact supplied pure account/date producer expressions.
// No application imports, account directories, runtime helpers or credentials.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const input='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs';
const bytes=fs.readFileSync(input),source=bytes.toString('utf8');
if(crypto.createHash('sha256').update(bytes).digest('hex')!=='48af998738fb6d2fc30cb8d5b2e9de03cb04ab7d8563ebdaa5fe8100944fc514')throw Error('A51 producer pin changed');
function expression(start,end){const at=source.indexOf(start);if(at<0)throw Error(start);const stop=source.indexOf(end,at);if(stop<0)throw Error(end);return source.slice(at,stop)}
const common=expression('__commonJSMin=',',__exportAll='),dayjs=expression('require_dayjs_min=',',require_duration='),resolver=expression('getExpectedSessionStorageDir=',',isSessionStorageDirForId=');
const registry=expression('createDefaultAccountRegistry=',',AccountRegistryStore=');
const body=`let ${common};let ${dayjs};const import_dayjs_min$2={default:require_dayjs_min()};const DEFAULT_LOCAL_ACCOUNT_NAME='Fixture';let ${registry};const getAccountRoot=id=>'/synthetic/Control/u/'+id;const isCloudRuntime=()=>false;let ${resolver};const session={id:'fixture_session',createdAt:new Date('2025-01-01T00:30:00Z')};return {registry:createDefaultAccountRegistry(),session:{id:session.id,created_at:Math.floor(session.createdAt.getTime()/1000)},controlName:path.basename(getExpectedSessionStorageDir(session,0))};`;
const output=Function('path','randomUUID',body)(path,crypto.randomUUID);
const profile=crypto.randomUUID();output.registry.profileAccountBindings[profile]={profileId:profile,accountId:0,profileIndex:0,profilePath:'/synthetic/Browser/Profile 1',updatedAt:Date.now()};
output.producerPins=Object.fromEntries([['common',common],['dayjs',dayjs],['resolver',resolver],['registry',registry]].map(([name,value])=>[name,crypto.createHash('sha256').update(value).digest('hex')]));
if(output.controlName!=='2024-12-31_fixture_session')throw Error('Fixture must run with TZ=America/Chicago');
fs.writeFileSync(process.argv[2],JSON.stringify(output));
