import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {applyAuxCommandPathParsers} from '../../../../vendor/provided/aux-command-path-parsers.mjs';
const input = process.argv[2];
if (!input) throw Error('Pass a statically staged supplied daemon entry');
const original = fs.readFileSync(input, 'utf8');
const {code, anchors} = applyAuxCommandPathParsers(original);
assert.equal(anchors.length, 4);
assert.throws(() => applyAuxCommandPathParsers(code));
const syntax = spawnSync(process.execPath, ['--input-type=module', '--check'], {input: code, encoding: 'utf8'});
assert.equal(syntax.status, 0, syntax.stderr);
function extract(begin,end) { const start=code.indexOf(begin); return code.slice(start,code.indexOf(end,start+begin.length)); }
let output='';
const context=vm.createContext({
 AbortSignal, PATH_LOOKUP_TIMEOUT_MS:1000, process:{env:{SHELL:'/bin/zsh'},platform:'darwin'}, fs:{existsSync:p=>p==='/fixture/bin/tool'}, path:{posix:{isAbsolute:p=>p.startsWith('/')}},
 spawnCommand:()=>({stdout:{}}),waitForExitCode:async()=>0,readProcessStream:async()=>output,
 isAbsoluteCommandPath:p=>p.startsWith('/'), PATH_START:'__AUX_MCP_PATH_START__', PATH_END:'__AUX_MCP_PATH_END__',
 CLAUDE_COMMAND_PATH_START:'__AUX_CLAUDE_PATH_START__', CLAUDE_COMMAND_PATH_END:'__AUX_CLAUDE_PATH_END__',MAX_CLAUDE_COMMAND_PATH_LENGTH:4096,
 COMMAND_LOOKUP_START$1:'__AUX_COMMAND_PATH_START__',COMMAND_LOOKUP_END$1:'__AUX_COMMAND_PATH_END__',
 COMMAND_LOOKUP_START:'__AUX_CLI_COMMAND_PATH_START__',COMMAND_LOOKUP_END:'__AUX_CLI_COMMAND_PATH_END__',
});
vm.runInContext([
 extract('async function resolveShellPath()','var PATH_START,'),
 extract('function parseClaudeCommandPath(Cn)','function parseClaudeCodeAuthStatus'),
 extract('async function resolveShellCommandPath(Cn)','async function readLastUsedAt'),
 extract('async function resolveAuxCommandPath(Cn,ei=fs.existsSync)','async function getWindowsCliInstallation'),
].join('\n'),context);
output='noise\n__AUX_MCP_PATH_START__\nPATH=/fixture/bin:/usr/bin\n__AUX_MCP_PATH_END__\n';
assert.equal(await context.resolveShellPath(),'/fixture/bin:/usr/bin');
assert.equal(context.parseClaudeCommandPath('__AUX_CLAUDE_PATH_START__\n/fixture/bin/tool\n__AUX_CLAUDE_PATH_END__'),'/fixture/bin/tool');
assert.equal(context.parseClaudeCommandPath('__AUX_CLAUDE_PATH_START__\n/a\n/b\n__AUX_CLAUDE_PATH_END__'),undefined);
output='__AUX_COMMAND_PATH_START__\n/fixture/bin/tool\n__AUX_COMMAND_PATH_END__';
assert.equal(await context.resolveShellCommandPath('tool'),'/fixture/bin/tool');
output='__AUX_COMMAND_PATH_START__\n/a\n/b\n__AUX_COMMAND_PATH_END__';
assert.equal(await context.resolveShellCommandPath('tool'),undefined);
output='__AUX_CLI_COMMAND_PATH_START__\n/fixture/bin/tool\n__AUX_CLI_COMMAND_PATH_END__';
assert.equal(await context.resolveAuxCommandPath({fallbackPaths:[]}),'/fixture/bin/tool');
output='missing markers';
assert.equal(await context.resolveAuxCommandPath({fallbackPaths:['/fixture/bin/tool']}),'/fixture/bin/tool');
assert.equal(await context.resolveShellCommandPath('tool'),undefined);
console.log(JSON.stringify({format:'aux.command-path-parser-fixtures.v1',inputSha256:createHash('sha256').update(original).digest('hex'),outputSha256:createHash('sha256').update(code).digest('hex'),anchors,syntax:true,actualSuppliedParserFixtures:true,realShellExecuted:false,appRuntimeAccepted:false},null,2));
