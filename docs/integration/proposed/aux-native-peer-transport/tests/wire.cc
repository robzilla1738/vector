#include "AuxNativePeerWire.h"
#include <cassert>
using namespace aux::peer::detail;
int main() {
  Received request{};
  request.wire.header.msgh_id = kRequest;
  request.wire.header.msgh_size = sizeof(Wire);
  request.trailer.msgh_trailer_type = MACH_MSG_TRAILER_FORMAT_0;
  request.trailer.msgh_trailer_size = sizeof(mach_msg_audit_trailer_t);
  assert(ValidWire(request, kRequest));
  request.wire.header.msgh_size--;
  assert(!ValidWire(request, kRequest));
  request.wire.header.msgh_size++;
  request.wire.header.msgh_bits = MACH_MSGH_BITS_COMPLEX;
  assert(!ValidWire(request, kRequest));
  request.wire.header.msgh_bits = 0;
  request.wire.version++;
  assert(!ValidWire(request, kRequest));
  request.wire.version = kVersion;
  request.wire.reserved = 1;
  assert(!ValidWire(request, kRequest));
  request.wire.reserved = 0;
  request.trailer.msgh_trailer_size--;
  assert(!ValidWire(request, kRequest));
  request.trailer.msgh_trailer_size++;
  assert(!ValidWire(request, kReply));
  assert(RecoverableSendError(MACH_SEND_INVALID_DEST));
  assert(RecoverableSendError(MACH_SEND_TIMED_OUT));
  assert(RecoverableSendError(MACH_SEND_INTERRUPTED));
  assert(!RecoverableSendError(KERN_SUCCESS));
  assert(!RecoverableSendError(MACH_SEND_INVALID_DATA));
}
