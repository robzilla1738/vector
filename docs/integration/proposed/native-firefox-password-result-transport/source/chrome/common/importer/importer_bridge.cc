// Copyright 2011 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/common/importer/importer_bridge.h"

#include "base/notreached.h"

ImporterBridge::ImporterBridge() = default;

ImporterBridge::~ImporterBridge() = default;

void ImporterBridge::NotifyFirefoxPasswordImportResult(bool succeeded,
                                                     uint32_t count) {
  NOTREACHED();  // The real Firefox utility uses ExternalProcessImporterBridge.
}
