"""Compile exact SBPL with synthetic data only; never apply a sandbox."""
import ctypes,hashlib,json,re
from pathlib import Path
HERE=Path(__file__).resolve().parent
source=(HERE/'source/AuxAccountMemoryHelper.mm').read_text()
profile=re.search(r'constexpr char kSeatbelt\[\]=R"SB\((.*?)\)SB";',source,re.S).group(1)
lib=ctypes.CDLL('/usr/lib/libsandbox.1.dylib')
lib.sandbox_create_params.restype=ctypes.c_void_p
lib.sandbox_set_param.argtypes=[ctypes.c_void_p,ctypes.c_char_p,ctypes.c_char_p];lib.sandbox_set_param.restype=ctypes.c_int
lib.sandbox_compile_string.argtypes=[ctypes.c_char_p,ctypes.c_void_p,ctypes.POINTER(ctypes.c_void_p)];lib.sandbox_compile_string.restype=ctypes.c_void_p
lib.sandbox_free_profile.argtypes=[ctypes.c_void_p];lib.sandbox_free_params.argtypes=[ctypes.c_void_p];lib.sandbox_free_error.argtypes=[ctypes.c_void_p]
params=lib.sandbox_create_params();assert params
compiled=None;error=ctypes.c_void_p()
try:
 encoded=[(key.encode(),("/aux-synthetic-no-files/"+key).encode()) for key in sorted(set(re.findall(r'\(param "([A-Z_]+)"\)',profile)))]
 # The native parameter object may retain these byte pointers until compilation.
 for key,value in encoded:
  assert lib.sandbox_set_param(params,key,value)==0
 compiled=lib.sandbox_compile_string(profile.encode(),params,ctypes.byref(error))
 result={'format':'aux.exact-memory-read-denial-sbpl.v1','profileSha256':hashlib.sha256(profile.encode()).hexdigest(),'compiled':bool(compiled),'error':ctypes.string_at(error).decode() if error.value else None,'syntheticParametersOnly':True,'sandboxApplied':False,'helperExecuted':False,'hostExecutableCreated':False}
 (HERE/'actual-profile-compile.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));assert compiled
finally:
 if compiled:lib.sandbox_free_profile(compiled)
 if error.value:lib.sandbox_free_error(error)
 lib.sandbox_free_params(params)
