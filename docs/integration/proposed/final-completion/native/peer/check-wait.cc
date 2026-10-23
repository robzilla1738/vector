#include "source/AuxOwnedChildWait.h"
using namespace aux::peer;
static_assert(ClassifyOwnedChildReap(42,42,0,0)==OwnedChildReap::terminal);
static_assert(ClassifyOwnedChildReap(42,42,SIGTERM,0)==OwnedChildReap::terminal);
static_assert(ClassifyOwnedChildReap(42,-1,0,ECHILD)==OwnedChildReap::unknown);
static_assert(ClassifyOwnedChildReap(42,-1,0,EINTR)==OwnedChildReap::pending);
static_assert(ClassifyOwnedChildReap(42,0,0,0)==OwnedChildReap::unknown);
static_assert(ClassifyOwnedChildReap(42,43,0,0)==OwnedChildReap::unknown);
static_assert(ClassifyOwnedChildReap(42,42,(SIGSTOP<<8)|0x7f,0)==OwnedChildReap::unknown);
