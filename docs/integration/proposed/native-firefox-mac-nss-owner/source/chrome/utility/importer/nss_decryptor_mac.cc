// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include <string_view>
#include "chrome/utility/importer/nss_decryptor_mac.h"

#include "base/base64.h"
#include "base/files/file_util.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"

NSSDecryptor::NSSDecryptor() = default;
NSSDecryptor::~NSSDecryptor() {
  Free();
}

void NSSDecryptor::Free() {
  if (is_nss_initialized_ && NSS_Shutdown)
    NSS_Shutdown();
  is_nss_initialized_ = false;
  if (softokn3_)
    base::UnloadNativeLibrary(softokn3_);
  if (nss3_)
    base::UnloadNativeLibrary(nss3_);
  if (mozglue_)
    base::UnloadNativeLibrary(mozglue_);
  softokn3_ = nss3_ = mozglue_ = nullptr;
  NSS_Init = nullptr;
  NSS_Shutdown = nullptr;
  PK11_GetInternalKeySlot = nullptr;
  PK11_FreeSlot = nullptr;
  PK11_Authenticate = nullptr;
  PK11SDR_Decrypt = nullptr;
  SECITEM_FreeItem = nullptr;
  database_copy_.Delete();
}

bool NSSDecryptor::Init(const base::FilePath& dll_path,
                        const base::FilePath& db_path) {
  Free();
  const auto mozglue_path = dll_path.AppendASCII("libmozglue.dylib");
  const auto nss_path = dll_path.AppendASCII("libnss3.dylib");
  const auto softokn_path = dll_path.AppendASCII("libsoftokn3.dylib");
  if (!base::PathExists(mozglue_path) || !base::PathExists(nss_path))
    return false;
  mozglue_ = base::LoadNativeLibrary(mozglue_path, nullptr);
  if (mozglue_)
    nss3_ = base::LoadNativeLibrary(nss_path, nullptr);
  if (!mozglue_ || !nss3_) {
    Free();
    return false;
  }
  // The original attempts the optional module but does not require its load.
  if (base::PathExists(softokn_path))
    softokn3_ = base::LoadNativeLibrary(softokn_path, nullptr);
  if (!database_copy_.CreateUniqueTempDir()) {
    Free();
    return false;
  }
  static constexpr const char* kFiles[] = {"key4.db", "cert9.db", "pkcs11.txt",
                                           "key3.db", "cert8.db", "secmod.db"};
  for (const char* name : kFiles) {
    const auto source = db_path.AppendASCII(name);
    if (!base::PathExists(source))
      continue;
    const auto destination = database_copy_.GetPath().AppendASCII(name);
    bool copied;
    if (std::string_view(name) == "pkcs11.txt") {
      std::string contents;
      copied = base::ReadFileToString(source, &contents);
      if (copied) {
        base::ReplaceSubstringsAfterOffset(&contents, 0, db_path.value(),
                                           database_copy_.GetPath().value());
        copied = base::WriteFile(destination, contents);
      }
    } else {
      copied = base::CopyFile(source, destination);
    }
    if (!copied) {
      Free();
      return false;
    }
  }
  NSS_Init = reinterpret_cast<NSSInitFunc>(
      base::GetFunctionPointerFromNativeLibrary(nss3_, "NSS_Init"));
  NSS_Shutdown = reinterpret_cast<NSSShutdownFunc>(
      base::GetFunctionPointerFromNativeLibrary(nss3_, "NSS_Shutdown"));
  PK11_GetInternalKeySlot = reinterpret_cast<PK11GetInternalKeySlotFunc>(
      base::GetFunctionPointerFromNativeLibrary(nss3_,
                                                "PK11_GetInternalKeySlot"));
  PK11_FreeSlot = reinterpret_cast<PK11FreeSlotFunc>(
      base::GetFunctionPointerFromNativeLibrary(nss3_, "PK11_FreeSlot"));
  PK11_Authenticate = reinterpret_cast<PK11AuthenticateFunc>(
      base::GetFunctionPointerFromNativeLibrary(nss3_, "PK11_Authenticate"));
  PK11SDR_Decrypt = reinterpret_cast<PK11SDRDecryptFunc>(
      base::GetFunctionPointerFromNativeLibrary(nss3_, "PK11SDR_Decrypt"));
  SECITEM_FreeItem = reinterpret_cast<SECITEMFreeItemFunc>(
      base::GetFunctionPointerFromNativeLibrary(nss3_, "SECITEM_FreeItem"));
  if (!NSS_Init || !NSS_Shutdown || !PK11_GetInternalKeySlot ||
      !PK11_FreeSlot || !PK11_Authenticate || !PK11SDR_Decrypt ||
      !SECITEM_FreeItem) {
    Free();
    return false;
  }
  const std::string sql_path = "sql:" + database_copy_.GetPath().value();
  if (NSS_Init(sql_path.c_str()) != SECSuccess &&
      NSS_Init(database_copy_.GetPath().value().c_str()) != SECSuccess) {
    Free();
    return false;
  }
  is_nss_initialized_ = true;
  return true;
}

std::u16string NSSDecryptor::Decrypt(const std::string& crypt) const {
  if (!is_nss_initialized_ || crypt.empty())
    return {};
  std::string plain;
  if (crypt[0] == '~') {
    if (!base::Base64Decode(crypt.substr(1), &plain))
      return {};
  } else {
    std::string decoded;
    if (!base::Base64Decode(crypt, &decoded) || !PK11_GetInternalKeySlot)
      return {};
    PK11SlotInfo* slot = PK11_GetInternalKeySlot();
    if (!slot)
      return {};
    if (PK11_Authenticate(slot, PR_TRUE, nullptr) != SECSuccess) {
      if (PK11_FreeSlot)
        PK11_FreeSlot(slot);
      return {};
    }
    SECItem request{};
    request.data = reinterpret_cast<unsigned char*>(decoded.data());
    request.len = static_cast<unsigned int>(decoded.size());
    SECItem reply{};
    if (PK11SDR_Decrypt(&request, &reply, nullptr) == SECSuccess)
      plain.assign(reinterpret_cast<char*>(reply.data), reply.len);
    SECITEM_FreeItem(&reply, PR_FALSE);
    if (PK11_FreeSlot)
      PK11_FreeSlot(slot);
  }
  return base::UTF8ToUTF16(plain);
}
