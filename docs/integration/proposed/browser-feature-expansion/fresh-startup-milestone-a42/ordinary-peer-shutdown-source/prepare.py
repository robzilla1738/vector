from pathlib import Path
import difflib,hashlib,json,shlex
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
REL=Path('docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42')
source=ROOT/REL/'startup-diagnostics-source/AuxNativeDaemonMain.cc'
receipt=ROOT/REL/'actual-daemon-startup-diagnostics-build-a10.json'
node=ROOT/'out/aux-node-static-26.5.0/node-v26.5.0'
make=node/'out/libnode.target.mk'
sha=lambda b:hashlib.sha256(b).hexdigest()
before=source.read_text()
assert sha(before.encode())==json.loads(receipt.read_text())['inputFiles'][str(source)]
changes=[('#include <vector>\n','#include <vector>\n#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP\n#include "env-inl.h"\n#endif\n'),('int Refuse(const char* stage, int status, int exit_code) {', '''// Peer loss still records a native failure. Give only the existing, actually
// registered SIGTERM listener the opportunity to drain its physical producers.
// No listener/exception retains the fatal Stop behavior; no timeout is clean.
void RequestPeerLossShutdown(node::Environment* environment) {
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  environment->SetImmediateThreadsafe([](node::Environment* actual) {
    if (!actual->can_call_into_js()) {
      node::Stop(actual);
      return;
    }
    auto* isolate = actual->isolate();
    v8::HandleScope handles(isolate);
    v8::Context::Scope context_scope(actual->context());
    v8::TryCatch caught(isolate);
    v8::Local<v8::Value> args[] = {
        v8::String::NewFromUtf8Literal(isolate, "SIGTERM")};
    v8::Local<v8::Value> emitted;
    // EventEmitter.emit is true only if a real listener was invoked. The
    // supplied listener synchronously starts its idempotent shutdown routine.
    if (!node::MakeCallback(isolate, actual->process_object(), "emit", 1, args,
                            {0, 0}).ToLocal(&emitted) || !emitted->IsTrue()) {
      node::Stop(actual);
    }
  });
#else
  node::Stop(environment);
#endif
}

int Refuse(const char* stage, int status, int exit_code) {'''),('        if (environment) node::Stop(environment);','        if (environment) RequestPeerLossShutdown(environment);'),('          // Exact Node26 Stop→ExitEnv uses atomic stopping, V8 thread-safe\n          // termination and SetImmediateThreadsafe; setup stays alive until join.\n          node::Stop(environment_);','          // Setup remains alive until this thread and actual native work join.\n          RequestPeerLossShutdown(environment_);')]
after=before
anchors=[]
for a,b in changes:
 assert after.count(a)==1,(a[:90],after.count(a))
 after=after.replace(a,b,1);anchors.append({'before':a,'after':b,'count':1})
(HERE/source.name).write_text(after)
(HERE/'AuxNativeDaemonMain.cc.before').write_text(before)
(HERE/'ordinary-peer-shutdown.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+source.name,tofile='b/'+source.name)))
# The inline Environment API must use the linked Node build's actual layout.
s=make.read_text()
def group(name):
 return shlex.split(s.split(name+' := \\\n',1)[1].split('\n\n',1)[0].replace('\\\n',''))
defs=group('DEFS_Release')
includes=[v.replace('$(srcdir)',str(node)).replace('$(obj)',str(node/'out/Release/obj')) for v in group('INCS_Release')]
assert all('$(' not in v for v in includes)
assert '-DNODE_WANT_INTERNALS=1' in defs
profile={'nodeTargetMakefile':str(make),'nodeTargetMakefileSha256':sha(make.read_bytes()),'additionalArguments':defs+includes,'reason':'Exact linked Node26 Release Environment layout and native immediate-queue API; main owner only, no Node rebuild.'}
(HERE/'node-release-compile-additions.json').write_text(json.dumps(profile,indent=2)+'\n')
projection={'format':'aux.ordinary-peer-shutdown.source.v1','files':[{'input':str(source),'inputSha256':sha(before.encode()),'output':str(ROOT/REL/'ordinary-peer-shutdown-source'/source.name),'outputSha256':sha(after.encode()),'anchors':anchors}],'anchorCount':len(anchors),'nodeCompileProfile':'node-release-compile-additions.json','failureStatusPreserved':True,'physicalDrainUnchanged':True,'noNativeBuild':True,'noRuntimeAcceptance':True}
(HERE/'projection.json').write_text(json.dumps(projection,indent=2)+'\n')
print(json.dumps({'anchors':len(anchors),'sourceSha256':sha(after.encode()),'nodeCompileArguments':len(defs+includes)}))
