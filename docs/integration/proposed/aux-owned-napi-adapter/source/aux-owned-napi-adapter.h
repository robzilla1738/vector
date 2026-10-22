#ifndef AUX_OWNED_NAPI_ADAPTER_H_
#define AUX_OWNED_NAPI_ADAPTER_H_
#ifndef NAPI_VERSION
#define NAPI_VERSION 8
#endif
#include <node_api.h>
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Trusted native host only; no JS factory or module initializer is supplied.
// A nonnull owner+release pair is CONSUMED on every return, including failure.
// The caller must transfer exactly one retained owner for this exact handle.
// Invalid/null ownership pair is rejected without transfer (nothing callable).
// release_owner is native, nonthrowing and releases that one retained owner.
typedef void (*AuxReleaseOwnedDispatcher)(void* retained_owner);
napi_status AuxAttachOwnedDispatcher(napi_env env, napi_value target,
    uint64_t immutable_handle, void* retained_owner,
    AuxReleaseOwnedDispatcher release_owner);
#ifdef __cplusplus
}
#endif
#endif
