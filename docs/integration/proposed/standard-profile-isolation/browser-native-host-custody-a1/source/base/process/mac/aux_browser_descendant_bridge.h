// Copyright 2026 The Aux Authors. Native executable/framework bridge only.
#ifndef BASE_PROCESS_MAC_AUX_BROWSER_DESCENDANT_BRIDGE_H_
#define BASE_PROCESS_MAC_AUX_BROWSER_DESCENDANT_BRIDGE_H_
#include <cstdint>
struct AuxBrowserDescendantBridgeV1 {
  uint32_t version;
  uint32_t size;
  uint64_t (*reserve)(uint32_t family) noexcept;
  bool (*may_spawn)(uint64_t) noexcept;
  void (*did_create)(uint64_t, int64_t) noexcept;
  void (*failed_before_child)(uint64_t) noexcept;
  void (*original_reap)(uint64_t, bool) noexcept;
  uint32_t (*inspect)(uint64_t) noexcept;
  uint32_t (*inspect_stream)() noexcept;
  void (*close_admission)() noexcept;
  bool (*transfer_daemon)(uint64_t,uint64_t) noexcept;
  uint32_t (*inspect_browser_scope)(uint64_t) noexcept;
};
// Exported only from the main browser executable, before loading the framework.
extern "C" __attribute__((visibility("default")))
const AuxBrowserDescendantBridgeV1* AuxGetBrowserDescendantBridgeV1() noexcept;
#endif
