// Import address observation only. Never invokes any Security function.
#include <Security/Security.h>
#include <cstdint>
extern "C" __attribute__((visibility("hidden"))) const void*
AuxCleanHostImportedSecuritySymbol(uint32_t index) {
  switch (index) {
    case 0: return reinterpret_cast<const void*>(&SecItemAdd);
    case 1: return reinterpret_cast<const void*>(&SecItemCopyMatching);
    case 2: return reinterpret_cast<const void*>(&SecItemDelete);
    case 3: return reinterpret_cast<const void*>(&SecItemUpdate);
    case 4: return reinterpret_cast<const void*>(&SecKeyCreateRandomKey);
    default: return nullptr;
  }
}
