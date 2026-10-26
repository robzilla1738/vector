#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native actual-main owner only. Account/session IDs are lookup data, never
// paths or readiness flags. Expected bytes freeze the existing authenticated
// source's nonsecret account/profile snapshot; the registry remains authority.
int32_t AuxCaptureSelectedAccount(uint64_t dispatcher,int64_t account,
    const uint8_t* expected_identity_json,uint32_t count,uint64_t* selected_lease);
int32_t AuxValidateSelectedAccount(uint64_t dispatcher,uint64_t selected_lease);
// Read-only cancellation observation remains available during retirement.
int32_t AuxSelectedAccountStopRequested(uint64_t dispatcher,uint64_t selected_lease);
// roles 1=Control account,2=Task account,3=TaskLayout home (native journal only).
int32_t AuxCopySelectedAccountDirectory(uint64_t dispatcher,uint64_t selected_lease,
    uint32_t role,int32_t* descriptor);
int32_t AuxReleaseSelectedAccount(uint64_t dispatcher,uint64_t selected_lease);
int32_t AuxCaptureSelectedSession(uint64_t dispatcher,uint64_t selected_account,
    const char* session_id,uint64_t* session_lease);
int32_t AuxValidateSelectedSession(uint64_t dispatcher,uint64_t session_lease);
// roles 1=stored Control session,2=Task session. No account/auth root exposed.
int32_t AuxCopySelectedSessionDirectory(uint64_t dispatcher,uint64_t session_lease,
    uint32_t role,int32_t* descriptor);
int32_t AuxReleaseSelectedSession(uint64_t dispatcher,uint64_t session_lease);
// Per-invocation existing daemon utility core; result uses malloc/free. No
// arbitrary command, owner pointer, root or completion flag enters this ABI.
int32_t AuxBeginSelectedSessionUtility(uint64_t dispatcher,uint64_t session_lease,uint64_t* job);
int32_t AuxRunSelectedSessionUtility(uint64_t dispatcher,uint64_t job,const char* command,
    const uint8_t* input,uint32_t count,char** result);
// 0=actual callbacks drained/retired,1=pending,-1=unknown. Safe after closure.
int32_t AuxCloseSelectedSessionUtility(uint64_t dispatcher,uint64_t job);
// Separate finite Computer Use journal; never the memory role/record format.
int32_t AuxPrepareComputerUseAccountLaunch(uint64_t dispatcher,uint64_t selected_lease);
int32_t AuxPublishSuspendedComputerUseAccountLaunch(uint64_t dispatcher,uint64_t selected_lease,int32_t pid);
int32_t AuxObserveComputerUseAccountTerminal(uint64_t dispatcher,uint64_t selected_lease,
    int32_t pid,int32_t wait_status,int32_t spawn_error);
int32_t AuxReleaseRegisteredComputerUseAccount(uint64_t dispatcher,uint64_t selected_lease);
#ifdef __cplusplus
}
#endif
