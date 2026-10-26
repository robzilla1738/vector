// Copyright 2026 The Aux Authors.
#ifndef BASE_FILES_AUX_READ_ONLY_APP_H_
#define BASE_FILES_AUX_READ_ONLY_APP_H_
#include "base/base_export.h"
#include "base/files/file_path.h"
namespace base {
// Native authenticated startup registers its exact containing bundle once.
BASE_EXPORT bool RegisterAuxReadOnlyApp(const FilePath& app);
// Ancestors are protected only for destructive directory operations.
BASE_EXPORT bool AuxAppAllowsMutation(const FilePath& path, bool destructive = false);
BASE_EXPORT bool AuxAppAllowsDescriptorMutation(int fd);
}
#endif
