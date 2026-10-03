// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_CDP_STOP_INPUT_MAC_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_CDP_STOP_INPUT_MAC_H_
namespace content { class NativePlatformInputAdmission; }
namespace aux {
// Measurement-only shell branch. False preserves ordinary native guest input.
bool AdmitNativeCdpStopMeasurementInput(const content::NativePlatformInputAdmission& admission);
}
#endif
