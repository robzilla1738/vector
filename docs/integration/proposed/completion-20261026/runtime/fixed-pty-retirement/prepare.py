#!/usr/bin/env python3
"""Inactive source joins; no build, task execution or candidate mutation."""
from pathlib import Path
import json,hashlib,difflib
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
BASE=HERE.parent/'fixed-pty-linked'
sha=lambda x:hashlib.sha256(x).hexdigest()
records=[];patch=[]
def change(path,name,pairs):
 before=path.read_text();after=before
 for a,z in pairs:
  assert after.count(a)==1,(name,a[:110],after.count(a));after=after.replace(a,z)
 (HERE/'source'/name).write_text(after)
 records.append({'input':str(path),'inputSha256':sha(before.encode()),'output':str(ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-pty-retirement/source'/name),'outputSha256':sha(after.encode()),'anchors':[{'before':a,'after':z,'count':1} for a,z in pairs]})
 patch.append(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=str(path),tofile=name)))
 return after
worker=change(BASE/'source/AuxDevelopmentWorkerHost.cc','AuxDevelopmentWorkerHost.cc',[
 ('  bool descendant_completed = false;\n  std::shared_ptr<Worker> worker;', '  bool descendant_completed = false;\n  bool transport_settled=true,runtime_cohort_released=false;\n  bool physical_registered=false,reaper_thread_joined=false,transport_closed=false;\n  std::shared_ptr<Worker> worker;'),
 ('  bool descendant_completed = false;\n  // Registry.retained', '  bool descendant_completed = false;\n  bool transport_settled=true,runtime_cohort_released=false;\n  // Registry.retained'),
 ('            runtime = item->runtime_scope;', '            if(item->transport_settled&&!item->runtime_cohort_released){item->runtime_cohort_released=true;runtime = item->runtime_scope;}'),
 ('extern "C" void AuxNativePtySpawnFailed(void* token) noexcept {', '#include "AuxPtyPhysicalRetirement.inc"\nextern "C" void AuxNativePtySpawnFailed(void* token) noexcept {')])
pty=change(BASE/'source/pty-linked.cc','pty-linked.cc',[
 ('#include <AuxNativePtyReservation.h>', '#include <AuxNativePtyReservation.h>\nextern "C" int32_t AuxNativePtyRetainPhysical(void*) noexcept;\nextern "C" void AuxNativePtyReaperThreadJoined(void*) noexcept;\nextern "C" void AuxNativePtyTransportClosed(void*) noexcept;'),
 ('    state_->reservation = reservation;\n    auto state = state_;','    state_->reservation = reservation;\n    if(!AuxNativePtyRetainPhysical(reservation))throw Napi::Error::New(env,"PTY physical custody unavailable");\n    auto state = state_;'),
 ('          if (state->thread.joinable()) state->thread.join();', '          if (state->thread.joinable()) state->thread.join();\n          AuxNativePtyReaperThreadJoined(state->reservation);'),
 ('  explicit ScopedPtyMaster(int& fd) : fd_(fd) {}\n  ~ScopedPtyMaster() { if (fd_ != -1) close(fd_); }', '  ScopedPtyMaster(int& fd,void* reservation) : fd_(fd),reservation_(reservation) {}\n  ~ScopedPtyMaster() {\n    if(fd_!=-1){if(close(fd_)==0)AuxNativePtyTransportClosed(reservation_);}\n    else if(!transferred_)AuxNativePtyTransportClosed(reservation_);\n  }'),
 ('  void Release() { fd_ = -1; }\n private:\n  int& fd_;', '  void Release() { transferred_=true;fd_ = -1; }\n private:\n  int& fd_;\n  void* reservation_;\n  bool transferred_=false;'),
 ('  PreparedExitCallback exit_callback(\n      napiEnv, info[10].As<Napi::Function>(), reservation.Handle());\n  pid_t pid;\n  int master = -1;\n  ScopedPtyMaster master_owner(master);', '  int master = -1;\n  ScopedPtyMaster master_owner(master,reservation.Handle());\n  PreparedExitCallback exit_callback(\n      napiEnv, info[10].As<Napi::Function>(), reservation.Handle());\n  pid_t pid;'),
 ('    auto tsfn = Napi::ThreadSafeFunction::New(', '    Napi::ThreadSafeFunction tsfn;\n    try { tsfn = Napi::ThreadSafeFunction::New('),
 ('          AuxNativePtyReaperThreadJoined(state->reservation);\n        });', '          AuxNativePtyReaperThreadJoined(state->reservation);\n        }); } catch(...) {AuxNativePtyReaperThreadJoined(state->reservation);throw;}'),
 ('          if (status == napi_closing) return;', '          if (status == napi_closing) {tsfn.Release();return;}'),
 ('  obj.Set("pty", Napi::String::New(napiEnv, ptsname(master)));','  obj.Set("pty", Napi::String::New(napiEnv, ptsname(master)));\n  // Immutable private callback, not a caller-selected reservation or PID.\n  napi_value closed;\n  auto callback=[](napi_env env,napi_callback_info info)->napi_value{void* token=nullptr;size_t count=0;if(napi_get_cb_info(env,info,&count,nullptr,nullptr,&token)!=napi_ok)return nullptr;AuxNativePtyTransportClosed(token);napi_value value;napi_get_undefined(env,&value);return value;};\n  if(napi_create_function(napiEnv,"auxOriginalTransportClosed",NAPI_AUTO_LENGTH,callback,reservation.Handle(),&closed)!=napi_ok)throw Napi::Error::New(napiEnv,"PTY transport completion capture failed");\n  const napi_property_descriptor property{"auxOriginalTransportClosed",nullptr,nullptr,nullptr,nullptr,closed,napi_default,nullptr};\n  if(napi_define_properties(napiEnv,obj,1,&property)!=napi_ok)throw Napi::Error::New(napiEnv,"PTY transport completion binding failed");')])
package=change(BASE/'source/unixTerminal.js','unixTerminal.js',[
 ('        _this._socket = new tty.ReadStream(term.fd);', '''        // Capture the original physical close before any consumer can cancel.
        var transportClosed = term.auxOriginalTransportClosed;
        var socketClosed = false, writerDrained = false, transportReported = false;
        var reportTransport = function () {
            if (!transportReported && socketClosed && writerDrained) {
                transportReported = true;
                transportClosed();
            }
        };
        try { _this._socket = new tty.ReadStream(term.fd); }
        catch(error) { fs.close(term.fd, function(closeError) { if (!closeError) transportClosed(); }); throw error; }
        _this._socket.once('close', function () {
            socketClosed = true;
            if (_this._writeStream) _this._writeStream.dispose();
            reportTransport();
        });'''),
 ('        if (encoding !== null) {\n            _this._socket.setEncoding(encoding);\n        }\n        _this._writeStream = new CustomWriteStream(term.fd, (encoding || undefined));', '''        try {
        if (encoding !== null) _this._socket.setEncoding(encoding);
        _this._writeStream = new CustomWriteStream(term.fd, (encoding || undefined), function () {
            writerDrained = true;
            reportTransport();
        });
        } catch(error) {
            writerDrained = !_this._writeStream;
            if (_this._writeStream) _this._writeStream.dispose();
            _this._socket.destroy();
            throw error;
        }'''),
 ('    function CustomWriteStream(_fd, _encoding) {', '    function CustomWriteStream(_fd, _encoding, onDrained) {'),
 ('        this._writeQueue = [];', '        this._writeQueue = [];\n        this._disposed = false;\n        this._inFlight = 0;\n        this._onDrained = onDrained;'),
 ('        this._writeImmediate = undefined;\n    };\n    CustomWriteStream.prototype.write', '''        this._writeImmediate = undefined;
        this._disposed = true;
        this._writeQueue.length = 0;
        this._reportDrained();
    };
    CustomWriteStream.prototype._reportDrained = function () {
        if (this._disposed && this._inFlight === 0 && this._onDrained) {
            var callback = this._onDrained;
            this._onDrained = undefined;
            callback();
        }
    };
    CustomWriteStream.prototype.write'''),
 ('        // Writes are put in a queue', '        if (this._disposed) return;\n        // Writes are put in a queue'),
 ('        if (this._writeQueue.length === 0) {', '        if (this._disposed || this._writeQueue.length === 0) {'),
 ('        fs.write(this._fd, task.buffer, task.offset, function (err, written) {', '''        this._inFlight++;
        try { fs.write(this._fd, task.buffer, task.offset, function (err, written) {
            _this._inFlight--;
            if (_this._disposed) { _this._reportDrained(); return; }'''),
 ('        });\n    };\n    return CustomWriteStream;', '        }); } catch(error) {this._inFlight--;this._reportDrained();throw error;}\n    };\n    return CustomWriteStream;')])
(HERE/'changes.json').write_text(json.dumps({'format':'aux.fixed-pty-physical-retirement-proposal.v1','predecessor':'53660ed22','records':records,'EntitlementRequired':True,'compiled':False,'activated':False,'candidateChanged':False},indent=2)+'\n')
(HERE/'source.patch').write_text(''.join(patch))
(HERE/'source-pins.json').write_text(json.dumps({str(f.relative_to(HERE)):sha(f.read_bytes()) for f in (HERE/'source').iterdir()},indent=2)+'\n')
