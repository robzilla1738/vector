# Optional native behavior fixtures

`native_person_observer_script.h` and `native_recorder_script.h` preserve the generated producer bytes from the retired local native snapshot. Unit tests execute their fixed JavaScript and compare it with the maintained observer and recorder producers in `packages/chromium-driver/src/`.

When a producer changes, regenerate these headers with the matching generator in `packages/chromium-driver/scripts/` and retain the updated headers here. Keep the source-byte/hash comparisons: these fixtures test producer behavior and do not qualify an actual native build.
