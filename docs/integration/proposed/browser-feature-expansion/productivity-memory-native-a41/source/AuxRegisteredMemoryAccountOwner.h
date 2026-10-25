#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// PRIVATE native main-service consumer only. Neither dispatcher nor lease IDs
// are page/Worker-selected. No executable, model, account path or rights input.
int32_t AuxCaptureRegisteredMemoryAccount(uint64_t dispatcher, int64_t account,
                                        uint64_t* retained_owner);
int32_t AuxCopyRegisteredMemoryDirectory(uint64_t dispatcher, uint64_t retained_owner,
                                       int32_t* directory);
int32_t AuxValidateRegisteredMemoryAccount(uint64_t dispatcher, uint64_t retained_owner);
// Journal prepare must durably ACK before physical spawn. Publish must
// independently verify stopped original child PID/birth and ACK before resume.
int32_t AuxPrepareMemoryAccountLaunch(uint64_t dispatcher,uint64_t retained_owner);
int32_t AuxPublishSuspendedMemoryAccountLaunch(uint64_t dispatcher,uint64_t retained_owner,int32_t pid);
int32_t AuxObserveMemoryAccountTerminal(uint64_t dispatcher,uint64_t retained_owner,
                                      int32_t original_child,int32_t wait_status,int32_t spawn_error);
// Sole physical launcher/reaper calls only after definite pre-child failure or
// original reap AND observed stdio closure. No JS settlement callback.
int32_t AuxReleaseRegisteredMemoryAccount(uint64_t dispatcher, uint64_t retained_owner);
// Refusal fence, only inside the existing native account-registry callback.
int32_t AuxValidateRegisteredMemoryRegistryTarget(uint64_t dispatcher,
                                                 const uint8_t* exact_target_bytes,
                                                 uint32_t count);
#ifdef __cplusplus
}
#endif

int32_t AuxFinishRegisteredMemoryRegistryTarget(uint64_t dispatcher,const uint8_t* exact_target,uint32_t count);
