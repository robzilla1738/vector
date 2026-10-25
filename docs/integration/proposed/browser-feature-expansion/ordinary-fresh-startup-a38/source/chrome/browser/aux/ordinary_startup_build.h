// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ORDINARY_STARTUP_BUILD_H_
#define CHROME_BROWSER_AUX_ORDINARY_STARTUP_BUILD_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
// Fixed local product build selection, never environment/JS/marker authority.
// Actual signed policy, native parent/child and root-generation checks still run.
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_BROWSER)
#define AUX_BROWSER_ONLY_NATIVE_STARTUP 1
#define AUX_SEALED_NATIVE_COLD_ENTRY 1
#endif
#endif
