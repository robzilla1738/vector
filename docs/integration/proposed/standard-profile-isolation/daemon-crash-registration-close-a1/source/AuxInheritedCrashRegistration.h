// Copyright 2026 The Aux Authors. Native executable-only, never a JS API.
#pragma once
#include <cstdint>
extern "C" __attribute__((visibility("hidden"))) int32_t AuxCaptureInheritedCrashRegistration();
extern "C" __attribute__((visibility("hidden"))) int32_t AuxCloseInheritedCrashRegistration();
