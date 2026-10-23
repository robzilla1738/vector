#include "AuxNativeExecDescriptorPolicy.h"
static_assert(AuxExecStdioFlagsAllowed(UV_IGNORE));
static_assert(AuxExecStdioFlagsAllowed(UV_CREATE_PIPE | UV_READABLE_PIPE));
static_assert(AuxExecStdioFlagsAllowed(UV_CREATE_PIPE | UV_WRITABLE_PIPE));
static_assert(AuxExecStdioFlagsAllowed(UV_CREATE_PIPE | UV_READABLE_PIPE | UV_WRITABLE_PIPE));
static_assert(!AuxExecStdioFlagsAllowed(UV_CREATE_PIPE));
static_assert(!AuxExecStdioFlagsAllowed(UV_INHERIT_FD));
static_assert(!AuxExecStdioFlagsAllowed(UV_INHERIT_STREAM));
static_assert(!AuxExecStdioFlagsAllowed(UV_CREATE_PIPE | UV_READABLE_PIPE | UV_OVERLAPPED_PIPE));
static_assert(!AuxExecStdioFlagsAllowed(UV_CREATE_PIPE | UV_WRITABLE_PIPE | UV_INHERIT_FD));
