#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native-only genuine provider routing. No JS policy, scope, core or key input.
uint64_t AuxCreatePreparedDaemonAuthority(uint64_t prepared_provider);
// Buffers are native caller-owned: nonce readable16, Auth message readable51,
// output writable8192 (capacity exactly8192), written writable uint32_t.
// 0 ready actual payload,1 unknown-result observation only,2 busy,3 closed/lost,
// 4 completed error (cached, never replayed),5 bounded cache full,-1 bad input,
// -2 wrong process. Signature payload is raw bytes; public keys is actual JSON.
int32_t AuxBeginPreparedDaemonSignature(uint64_t,const uint8_t*,const uint8_t*,uint8_t*,uint32_t,uint32_t*);
int32_t AuxBeginPreparedDaemonPublicKeys(uint64_t,const uint8_t*,uint8_t*,uint32_t,uint32_t*);
int32_t AuxObservePreparedDaemonAuthority(uint64_t,const uint8_t*,uint8_t*,uint32_t,uint32_t*);
// Close permanently closes admission;0 actual owner retired,1 pending,
// 2 untracked,-1 bad handle,-2 wrong process. No timeout promoted to success.
int32_t AuxClosePreparedDaemonAuthority(uint64_t);
// Consumes native ownership once. Pending/untracked owners stay retained.
void AuxReleasePreparedDaemonAuthority(uint64_t);
#ifdef __cplusplus
}
#endif
