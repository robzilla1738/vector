import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { isAbsolute, basename } from 'node:path';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const hex = (value, size) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${size}}$`).test(value);
const keys = (value, fields) => assert.deepEqual(Object.keys(value ?? {}).sort(), fields.split(' ').sort());
const absolute = value => assert.ok(typeof value === 'string' && value.length <= 4096 && isAbsolute(value) && !value.includes('\0'));
const sha = value => assert.ok(hex(value, 64));
const version = value => assert.match(value ?? '', /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/);
const mode = value => assert.ok(Number.isInteger(value) && value >= 0 && value <= 0o7777 && !(value & 0o6022));
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
function freeze(value) {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
}
function document(raw, expected) {
  assert.equal(typeof raw, 'string'); assert.ok(Buffer.byteLength(raw) > 0 && Buffer.byteLength(raw) <= 65536);
  sha(expected); assert.equal(hash(raw), expected, 'Independently approved original document bytes changed');
  const parsed = JSON.parse(raw); assert.equal(raw, JSON.stringify(canonical(parsed)) + '\n', 'Noncanonical/duplicate document fields');
  return parsed;
}
function logs(value) {
  for (const name of ['stdoutPath','stderrPath']) absolute(value[name]);
  for (const name of ['stdoutSha256','stderrSha256']) sha(value[name]);
  assert.equal(value.exitCode, 0);
}
/** Decode only externally approved original compiler and independent root audit
 * documents. This does not read/hold original artifacts, execute a helper,
 * prove a loaded process or qualify timing. A retained byte/Mach-O lease is
 * still required before any actual input-helper admission. */
export function decodeNativeWindowCompiler(manifestRaw, auditRaw, admission) {
  keys(admission, 'manifestPath manifestSha256 auditPath auditSha256');
  absolute(admission.manifestPath); absolute(admission.auditPath);
  assert.notEqual(admission.manifestPath, admission.auditPath);
  const m = document(manifestRaw, admission.manifestSha256), a = document(auditRaw, admission.auditSha256);
  keys(m, 'producer version source compiler sdk compile output readback admission');
  assert.equal(m.producer, 'aux-native-window-helper-compile'); assert.equal(m.version, 1);
  keys(m.source, 'commit productTree dirty path sha256 bytes mode');
  assert.ok(hex(m.source.commit,40) && hex(m.source.productTree,40)); assert.equal(m.source.dirty,false);
  absolute(m.source.path); assert.equal(basename(m.source.path),'native-window.swift'); sha(m.source.sha256); mode(m.source.mode);
  assert.ok(Number.isSafeInteger(m.source.bytes) && m.source.bytes > 0 && m.source.bytes <= 4*1024*1024);
  keys(m.compiler,'launcher swiftc frontend version argv originalOutputPath environment');
  for (const name of ['launcher','frontend']) { keys(m.compiler[name],'path sha256'); absolute(m.compiler[name].path); sha(m.compiler[name].sha256); }
  assert.equal(m.compiler.launcher.path,'/usr/bin/xcrun');
  keys(m.compiler.swiftc,'path resolvedPath sha256'); absolute(m.compiler.swiftc.path); absolute(m.compiler.swiftc.resolvedPath); sha(m.compiler.swiftc.sha256);
  keys(m.compiler.version,'stdoutPath stdoutSha256 stderrPath stderrSha256 exitCode'); logs(m.compiler.version);
  absolute(m.compiler.originalOutputPath);
  const explicitTarget = m.compiler.argv.length === 7;
  assert.deepEqual(m.compiler.argv, explicitTarget
    ? ['xcrun','swiftc',m.source.path,'-target',`arm64-apple-macosx${m.sdk.version}`,'-o',m.compiler.originalOutputPath]
    : ['xcrun','swiftc',m.source.path,'-o',m.compiler.originalOutputPath]);
  keys(m.compiler.environment,'PATH DEVELOPER_DIR SDKROOT TOOLCHAINS');
  for (const v of Object.values(m.compiler.environment)) assert.ok(v === null || (typeof v === 'string' && v.length <= 8192 && !v.includes('\0')));
  keys(m.sdk,'path resolvedPath settingsPath settingsSha256 version selection');
  for (const key of ['path','resolvedPath','settingsPath']) absolute(m.sdk[key]); sha(m.sdk.settingsSha256);
  assert.match(m.sdk.version ?? '', /^[0-9]+\.[0-9]+(?:\.[0-9]+)?$/);
  keys(m.sdk.selection,'stdoutPath stdoutSha256 stderrPath stderrSha256 exitCode'); logs(m.sdk.selection);
  keys(m.compile,'originalPid originalGroup exitCode timedOut cancelled originalGroupEmpty stdoutPath stdoutSha256 stderrPath stderrSha256'); logs(m.compile);
  assert.ok(Number.isInteger(m.compile.originalPid) && m.compile.originalPid > 0 && m.compile.originalPid <= 0x7fffffff);
  assert.equal(m.compile.originalGroup,m.compile.originalPid); assert.equal(m.compile.timedOut,false);
  assert.equal(m.compile.cancelled,false); assert.equal(m.compile.originalGroupEmpty,true);
  keys(m.output,'path sha256 bytes mode architecture fileType uuid minimumOS sdkVersion');
  absolute(m.output.path); sha(m.output.sha256); mode(m.output.mode); assert.ok(m.output.mode & 0o100);
  const cacheName = `native-window-${m.source.sha256.slice(0,12)}`;
  if (explicitTarget) {
    assert.match(basename(m.output.path), new RegExp(`^${cacheName}-target${m.sdk.version.split('.')[0]}-[0-9]{3}$`));
    assert.ok(!basename(m.output.path).endsWith('-000'));
  } else assert.equal(basename(m.output.path),cacheName);
  assert.notEqual(m.output.path,m.compiler.originalOutputPath);
  assert.ok(Number.isSafeInteger(m.output.bytes) && m.output.bytes > 0 && m.output.bytes <= 64*1024*1024);
  assert.equal(m.output.architecture,'arm64'); assert.equal(m.output.fileType,'MH_EXECUTE');
  assert.ok(hex(m.output.uuid,32) && !/^0+$/.test(m.output.uuid)); version(m.output.minimumOS); version(m.output.sdkVersion);
  if (explicitTarget) {
    const sdk = m.sdk.version.split('.');
    while (sdk.length < 3) sdk.push('0');
    assert.equal(m.output.minimumOS,sdk.join('.'),'Explicit target must match original selected SDK');
    assert.equal(m.output.sdkVersion,sdk.join('.'),'Original executable SDK must match selected SDK');
  }
  keys(m.readback,'readerPath readerSha256 stdoutPath stdoutSha256 exitCode'); absolute(m.readback.readerPath);
  sha(m.readback.readerSha256); absolute(m.readback.stdoutPath); sha(m.readback.stdoutSha256); assert.equal(m.readback.exitCode,0);
  keys(m.admission,'independentAuditRequired helperExecuted performanceQualified');
  assert.equal(m.admission.independentAuditRequired,true); assert.equal(m.admission.helperExecuted,false); assert.equal(m.admission.performanceQualified,false);
  const expected = { producer:'aux-native-window-helper-independent-audit',version:1,
    manifestPath:admission.manifestPath,manifestSha256:admission.manifestSha256,
    sourceSha256:m.source.sha256,executableSha256:m.output.sha256,launcherSha256:m.compiler.launcher.sha256,
    swiftcSha256:m.compiler.swiftc.sha256,frontendSha256:m.compiler.frontend.sha256,sdkSettingsSha256:m.sdk.settingsSha256,
    compilerVersionStdoutSha256:m.compiler.version.stdoutSha256,compilerVersionStderrSha256:m.compiler.version.stderrSha256,
    compileStdoutSha256:m.compile.stdoutSha256,compileStderrSha256:m.compile.stderrSha256,
    readbackStdoutSha256:m.readback.stdoutSha256,readerSha256:m.readback.readerSha256,
    compilerArgvSha256:hash(JSON.stringify(m.compiler.argv)),sourceCommit:m.source.commit,productTree:m.source.productTree,
    outputUuid:m.output.uuid,outputMinimumOS:m.output.minimumOS,outputSdkVersion:m.output.sdkVersion,
    sourceMode:m.source.mode,outputMode:m.output.mode };
  assert.deepEqual(a,expected,'Independent root artifact audit differs');
  return Object.freeze({ manifest:freeze(m), audit:freeze(a), manifestRaw, auditRaw, admission:Object.freeze({...admission}),
    independentDocumentsMatched:true, retainedOriginalFilesProven:false, loadedHelperProven:false, performanceQualified:false });
}
