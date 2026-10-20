// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_UTILITY_IMPORTER_NSS_DECRYPTOR_MAC_H_
#define CHROME_UTILITY_IMPORTER_NSS_DECRYPTOR_MAC_H_
#include <string>
#include <vector>
#include "base/files/file_path.h"
#include "base/files/scoped_temp_dir.h"
#include "base/memory/raw_ptr_exclusion.h"
#include "base/native_library.h"

// The following declarations of functions and types are from Firefox
// NSS library.
// source code:
//   security/nss/lib/util/seccomon.h
//   security/nss/lib/nss/nss.h
// The license block is:

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Netscape security libraries.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1994-2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

enum SECItemType {
  siBuffer = 0,
  siClearDataBuffer = 1,
  siCipherDataBuffer = 2,
  siDERCertBuffer = 3,
  siEncodedCertBuffer = 4,
  siDERNameBuffer = 5,
  siEncodedNameBuffer = 6,
  siAsciiNameString = 7,
  siAsciiString = 8,
  siDEROID = 9,
  siUnsignedInteger = 10,
  siUTCTime = 11,
  siGeneralizedTime = 12
};

struct SECItem {
  SECItemType type;
  // RAW_PTR_EXCLUSION: Non-Windows platforms use SECItem from seccomon.h, which
  // is not in this repo and doesn't use raw_ptr<>.
  RAW_PTR_EXCLUSION unsigned char* data;
  unsigned int len;
};

enum SECStatus { SECWouldBlock = -2, SECFailure = -1, SECSuccess = 0 };

typedef int PRBool;
#define PR_TRUE 1
#define PR_FALSE 0

typedef enum { PR_FAILURE = -1, PR_SUCCESS = 0 } PRStatus;

typedef struct PK11SlotInfoStr PK11SlotInfo;

typedef SECStatus (*NSSInitFunc)(const char* configdir);
typedef SECStatus (*NSSShutdownFunc)(void);
typedef PK11SlotInfo* (*PK11GetInternalKeySlotFunc)(void);
typedef void (*PK11FreeSlotFunc)(PK11SlotInfo* slot);
typedef SECStatus (*PK11CheckUserPasswordFunc)(PK11SlotInfo* slot, char* pw);
typedef SECStatus (*PK11AuthenticateFunc)(PK11SlotInfo* slot,
                                          PRBool loadCerts,
                                          void* wincx);
typedef SECStatus (*PK11SDRDecryptFunc)(SECItem* data,
                                        SECItem* result,
                                        void* cx);
typedef void (*SECITEMFreeItemFunc)(SECItem* item, PRBool free_it);
typedef void (*PLArenaFinishFunc)(void);
typedef PRStatus (*PRCleanupFunc)(void);

struct FirefoxRawPasswordInfo;
namespace user_data_importer {
struct ImportedPasswordForm;
}

// Supplied Mac NSS owner; libraries come from the selected Firefox
// installation.
class NSSDecryptor {
 public:
  NSSDecryptor();
  NSSDecryptor(const NSSDecryptor&) = delete;
  NSSDecryptor& operator=(const NSSDecryptor&) = delete;
  ~NSSDecryptor();
  bool Init(const base::FilePath& dll_path, const base::FilePath& db_path);
  void Free();
  std::u16string Decrypt(const std::string& crypt) const;
  bool ReadAndParseLogins(
      const base::FilePath& json_file,
      std::vector<user_data_importer::ImportedPasswordForm>* forms);

 private:
  bool CreatePasswordFormFromRawInfo(
      const FirefoxRawPasswordInfo& raw,
      user_data_importer::ImportedPasswordForm* form);
  NSSInitFunc NSS_Init = nullptr;
  NSSShutdownFunc NSS_Shutdown = nullptr;
  PK11GetInternalKeySlotFunc PK11_GetInternalKeySlot = nullptr;
  PK11FreeSlotFunc PK11_FreeSlot = nullptr;
  PK11AuthenticateFunc PK11_Authenticate = nullptr;
  PK11SDRDecryptFunc PK11SDR_Decrypt = nullptr;
  SECITEMFreeItemFunc SECITEM_FreeItem = nullptr;
  // Loader handles are released only with UnloadNativeLibrary.
  RAW_PTR_EXCLUSION base::NativeLibrary mozglue_ = nullptr;
  RAW_PTR_EXCLUSION base::NativeLibrary nss3_ = nullptr;
  RAW_PTR_EXCLUSION base::NativeLibrary softokn3_ = nullptr;
  base::ScopedTempDir database_copy_;
  bool is_nss_initialized_ = false;
};
#endif  // CHROME_UTILITY_IMPORTER_NSS_DECRYPTOR_MAC_H_
