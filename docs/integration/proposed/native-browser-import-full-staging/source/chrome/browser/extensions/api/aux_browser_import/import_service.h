// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_IMPORT_SERVICE_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_IMPORT_SERVICE_H_
#include <map>

#include "base/memory/weak_ptr.h"
#include "base/supports_user_data.h"
#include "chrome/browser/profiles/profile.h"
#include "components/user_data_importer/utility/bookmark_parser.h"
namespace aux_import {
class ImportService final : public base::SupportsUserData::Data {
 public:
  static ImportService* Get(Profile*);
  explicit ImportService(Profile*);
  ~ImportService() override;
  using Reply =
      base::OnceCallback<void(std::optional<base::Value>, std::string)>;
  void Invoke(std::string method,
              base::ListValue arguments,
              std::string extension_id,
              Reply reply);

 private:
  struct Job;
  void DidDiscover(Reply reply, base::ListValue);
  void Next(std::string id);
  void DidStageChromium(std::string id, base::DictValue);
  void DidRead(std::string id, base::DictValue);
  void DidParseBookmarks(std::string id,
                         user_data_importer::BookmarkParser::ParsedBookmarks);
  void FailJob(std::string id, std::string error);
  void ApplySecret(std::string id);
  void DidWriteSecret(std::string id, bool accepted, bool skipped = false);
  void ApplyHistory(std::string id);
  void CompleteCategory(std::string id);
  void Emit(const Job&);
  base::ListValue PublicSources() const;
  base::WeakPtr<Profile> profile_;
  base::ListValue sources_;
  bool discovered_ = false;
  std::map<std::string, std::unique_ptr<Job>> jobs_;
  base::WeakPtrFactory<ImportService> weak_{this};
};
}  // namespace aux_import
#endif
