#include "AuxNativePeerWire.h"
using aux::peer::detail::ValidTimeout;
static_assert(!ValidTimeout(0));
static_assert(ValidTimeout(250));
static_assert(ValidTimeout(2'000));
static_assert(!ValidTimeout(2'001));
int main() { return 0; }
