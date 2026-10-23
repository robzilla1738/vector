// INACTIVE DESIGN CONTRACT ONLY. Not included, compiled or exported.
#pragma once
#include <stdint.h>
// owner is derived solely from the registered native Environment, never JS.
// expected_* are mismatch detectors, never authorities or root selectors.
// task root and fixed destination "runtime" are selected by retained Owner.
// outcome: 0 no publication, 1 published, 2 existing destination retained,
//          3 unknown (including failure after the rename committed).
// A nonzero status must not be interpreted as proof that no rename occurred.
// Native admitted lifetime, namespace custody and durability are required;
// implementation must not substitute plain rename or repair an existing cache.
int32_t AuxNativeContextPublishRuntimeSeed(
    uint64_t owner,
    uint64_t expected_transport_generation,
    const char* staging_basename,
    uint64_t expected_stage_device,
    uint64_t expected_stage_inode,
    uint32_t* outcome);
