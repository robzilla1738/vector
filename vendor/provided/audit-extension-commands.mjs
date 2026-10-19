/** Static protocol evidence only; never imports or runs supplied code. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
const root='/Users/rcourson/Library/Application Support/Aside';
const daemonPath=`${root}/AsideDaemon/mac-arm64/1.26.1016.1852/Aside Daemon.app/Contents/MacOS/aside-daemon`;
const agentPath=`${root}/AsideAgentManager/1.26.1016.1852/background.js`;
const bytes=fs.readFileSync(daemonPath),section=findMachOSeaSection(bytes);
const daemon=readSeaBlob(bytes.subarray(section.offset,section.offset+section.size)).code;
const agent=fs.readFileSync(agentPath,'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
if(sha(bytes)!=='60d3c50a649a528927137c427d284e695a98162476d28065bb9634e937fed286')throw Error('Pinned daemon changed');
if(sha(daemon)!=='5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5')throw Error('Pinned SEA code changed');
function anchor(source,find,tail=0){const at=source.indexOf(find);if(at<0||source.indexOf(find,at+1)>=0)throw Error(`Expected unique anchor: ${find}`);return {offset:at,line:source.slice(0,at).split('\n').length,text:source.slice(at,at+find.length+tail)};}
const commands=[...agent.matchAll(/case "(Aside\.[a-z][A-Za-z0-9_.]*)":/g)].map(match=>({method:match[1],handler:anchor(agent,match[0],Math.min(1400,(agent.indexOf('\n    case ',match.index+1)>0?agent.indexOf('\n    case ',match.index+1):agent.indexOf('\n  }',match.index+1))-match.index-match[0].length))}));
const prefixes=[...new Set(daemon.match(/Aside\.[a-z][A-Za-z0-9_]*/g))].sort();
for(const prefix of prefixes)if(prefix!=='Aside.pickDirectory'&&!commands.some(c=>c.method===prefix||c.method.startsWith(`${prefix}.`)))throw Error(`No supplied handler: ${prefix}`);
const result={version:'1.26.1016.1852',sources:[{path:daemonPath,sha256:sha(bytes),seaCodeSha256:sha(daemon)},{path:agentPath,sha256:sha(agent)}],conclusion:'Aside.* is the supplied extension command protocol, intercepted before the native CDP websocket; preserve the original handlers and route.',prefixes,commands,daemonAnchors:[anchor(daemon,'if(Cn.startsWith(`Aside.`)){let ti=await sendCommandToExtension',280),anchor(daemon,'method:`runCommand`,command:Cn,route:',260),anchor(daemon,'method:`cancelCommand`',70)],agentAnchors:[anchor(agent,'var yy = As(new URL("/extension-bridge/extension", Je).toString())'),anchor(agent,'const u = Ne.runCommandMessageSchema.safeParse(s);',110),anchor(agent,'if (u.data.route.accountId !== l.accountId || u.data.route.profileId !== l.profileId || u.data.route.browserMode !== l.browserMode)',220),anchor(agent,'const d = await vy(u.data.command, f.signal, u.data.route);',170),anchor(agent,'this.runningCommands.get(a.data.id)?.abort',100)]};
fs.writeFileSync(new URL('../../docs/integration/provided-extension-command-anchors.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({prefixes:prefixes.length,actualHandlers:commands.length,daemonSha256:sha(bytes),agentSha256:sha(agent)}));
