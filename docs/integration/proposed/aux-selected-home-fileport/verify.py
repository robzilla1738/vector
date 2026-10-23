#!/usr/bin/env python3
"""Verify the inactive fileport composition; never load or run native code."""
import hashlib
import json
from pathlib import Path

proposal = Path(__file__).resolve().parent
root = proposal.parents[3]
manifest = json.loads((proposal / "source-pins.json").read_text())
assert manifest["status"] == "source-only-uncompiled-unexecuted"
assert len(list((proposal / "source").iterdir())) == manifest["sourceCount"] == 9
for section in ("files", "productionDependencies"):
    for relative, expected in manifest[section].items():
        path = root / relative
        assert path.is_file(), relative
        assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, relative
source = proposal / "source"
transport = (source / "AuxNativePeerTransport.cc").read_text()
assert transport.count("ParentTransport::ServiceOne(") == 1
assert transport.count("AuthenticatedNativeParentConnection::SendSelectedHome(") == 1
assert transport.count("AuxCopyAuthenticatedFreshColdHomeDescriptor(ready_service, &directory)") == 1
assert transport.count("fileport_makeport(directory, &port)") == 1
assert transport.count("fileport_makefd(incoming.selected.wire.fileport.name)") == 1
assert transport.count("NativeOperations::AuthenticatedGuestParent(audit, *state->policy)") == 1
assert "selected_home_cleanup_unresolved" in transport
assert "throw " not in transport
wire = (source / "AuxNativePeerWire.h").read_text()
assert "kVersion = 1" in wire and "kSelectedHomeVersion = 2" in wire
assert "msgh_descriptor_count == 1" in wire
owner = (source / "AuxOwnedNativePeerChild.cc").read_text()
assert owner.count("OwnedNativePeerChild::TakeSelectedHome()") == 1
assert "transfer->DuplicateRevalidatedDirectory()" in owner
assert "State::CloseAndRetain(state_->child)" in owner
assert "throw " not in owner
loader = (source / "AuxSignedFreshBootstrapPolicyLoader.swift").read_text()
assert loader.count('@_cdecl("AuxCopyAuthenticatedFreshChildParentDescriptor")') == 1
assert "SecCodeValidateFileResource(code," in loader
print("Verified 9 inactive source files, 8 frozen baselines and 42 exact dependencies; no compilation or execution.")
