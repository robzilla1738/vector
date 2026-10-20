// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#include "chrome/browser/extensions/api/aux_browser_import/import_webui.h"
#include <algorithm>
#include <memory>
#include <optional>
#include <utility>

#include "base/numerics/safe_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/extensions/api/aux_browser_import/chromium_new_target_import.h"
#include "chrome/browser/extensions/api/aux_browser_import/firefox_import.h"
#include "chrome/browser/extensions/api/aux_browser_import/migrator.h"
#include "chrome/browser/extensions/api/aux_browser_import/safari_webui_import.h"
#include "chrome/browser/extensions/api/aux_browser_import/source_profile_picker_mac.h"
#include "chrome/browser/ui/webui/aux_importer/import_completion_choice.h"
#include "chrome/browser/ui/webui/aux_importer/import_target_chooser.h"
#include "chrome/browser/ui/webui/aux_importer/import_window_lifecycle.h"
#include "chrome/browser/ui/webui/aux_importer/safari_archive_picker.h"

#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "chrome/browser/extensions/api/aux_browser_import/source_crypto.h"
#include "third_party/skia/include/core/SkColor.h"
#include "base/memory/ref_counted_memory.h"
#include "chrome/browser/extensions/api/aux_browser_import/import_service.h"
#include "chrome/browser/extensions/api/aux_browser_import/import_webui_resources.h"
#include "chrome/browser/profiles/profile.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "content/public/browser/web_ui_message_handler.h"
#include "services/network/public/mojom/content_security_policy.mojom.h"
namespace aux_import {
namespace {
class Handler final : public content::WebUIMessageHandler {
 public:
  ~Handler() override {
    weak_.InvalidateWeakPtrs();
    if (profile_ && !current_job_.empty())
      ImportService::Get(profile_.get())->CancelChromiumWebUIImport(current_job_);
  }
  void RegisterMessages() override {
    profile_ = Profile::FromWebUI(web_ui())->GetWeakPtr();
    web_ui()->RegisterMessageCallback("showProfilePicker",
        base::BindRepeating(&Handler::ShowProfiles, base::Unretained(this)));
    web_ui()->RegisterMessageCallback("selectSafariExportZipFile",
        base::BindRepeating(&Handler::SelectSafariArchive, base::Unretained(this)));
    web_ui()->RegisterMessageCallback("importFirefoxData",
        base::BindRepeating(&Handler::ImportFirefox, base::Unretained(this)));
  }

 private:
  using Choice = aux_importer::ImportTargetChoice;
  struct Source {
    const char* id;
    const char16_t* name;
    ChromiumCloneSource kind;
  };
  // Original424e820 accepts these IDs. Edge is a native enum but not an
  // admitted message argument in the shipped handler (nor installed list).
  inline static constexpr Source kSources[] = {
      {"arc", u"Arc", ChromiumCloneSource::kArc},
      {"brave", u"Brave", ChromiumCloneSource::kBrave},
      {"atlas", u"ChatGPT Atlas", ChromiumCloneSource::kAtlas},
      {"chrome", u"Chrome", ChromiumCloneSource::kChrome},
      {"comet", u"Comet", ChromiumCloneSource::kComet},
      {"dia", u"Dia", ChromiumCloneSource::kDia},
      {"helium", u"Helium", ChromiumCloneSource::kHelium},
  };
  bool Admit() {
    if (!profile_ || !aux_importer::IsStandaloneImportOwner(
                         *web_ui()->GetWebContents())) return false;
    AllowJavascript();
    return true;
  }
  void Started(const std::string& source, const base::FilePath& path) {
    FireWebUIListener("browser-import-started", source, path.value());
  }
  void Finished(const std::string& source, bool success) {
    busy_ = false;
    if (IsJavascriptAllowed())
      FireWebUIListener(success ? "browser-import-succeeded"
                                : "browser-import-failed", source);
  }
  FirefoxImport::WebUILifecycle FirefoxLifecycle() {
    auto& contents = *web_ui()->GetWebContents();
    return {aux_importer::CaptureImportWindowControls(contents),
            aux_importer::CaptureImportOwnerRetirement(contents),
            base::BindOnce(&aux_importer::OpenImportedProfile)};
  }
  void ShowProfiles(const base::ListValue& args) {
    if (args.size() != 5 || !args[0].is_string()) return;
    const Source* source = nullptr;
    for (const auto& candidate : kSources)
      if (candidate.id == args[0].GetString()) source = &candidate;
    if (!source) return;
    for (size_t index = 1; index < 5; ++index)
      if (!args[index].is_int() && !args[index].is_double()) return;
    if (!Admit()) return;
    // Original424ecc8..424ed14 truncates numeric values to integer gfx::Rect
    // components and clamps negative dimensions; no page-owned path is read.
    gfx::Rect bounds(base::saturated_cast<int>(args[1].GetDouble()),
                     base::saturated_cast<int>(args[2].GetDouble()),
                     std::max(0, base::saturated_cast<int>(args[3].GetDouble())),
                     std::max(0, base::saturated_cast<int>(args[4].GetDouble())));
    aux_importer::ShowImportTargetChooser(source->name,
        base::BindOnce(&Handler::ChoseChromiumTarget, weak_.GetWeakPtr(),
                       *source, bounds));
  }
  void ChoseChromiumTarget(Source source, gfx::Rect bounds,
                            std::optional<Choice> choice) {
    if (!choice || !Admit()) return;
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(&DiscoverChromiumSourceProfiles, std::string(source.id)),
        base::BindOnce(&Handler::DiscoveredChromiumProfiles, weak_.GetWeakPtr(),
                       source, bounds, *choice));
  }
  void DiscoveredChromiumProfiles(Source source, gfx::Rect bounds, Choice choice,
                                  base::ListValue profiles) {
    if (!Admit()) return;
    ShowChromiumSourceProfilePicker(web_ui()->GetWebContents(), bounds,
        source.name, std::move(profiles),
        base::BindOnce(&Handler::ChoseChromiumProfile, weak_.GetWeakPtr(),
                       source, choice));
  }
  void ChoseChromiumProfile(Source source, Choice choice,
                            base::DictValue selected) {
    if (busy_ || !Admit()) return;
    const auto* path = selected.FindString("nativePath");
    const auto* name = selected.FindString("name");
    if (!path || !name) return;  // Only actual native discovery rows are valid.
    const base::FilePath source_path(*path);
    controls_ = aux_importer::CaptureImportWindowControls(
        *web_ui()->GetWebContents());
    retirement_ = aux_importer::CaptureImportOwnerRetirement(
        *web_ui()->GetWebContents());
    if (!controls_ || !retirement_) return;
    busy_ = true;
    Started(source.id, source_path);
    controls_.Run(false);
    if (choice == Choice::kNewProfile) {
      new_target_ = std::make_unique<ChromiumNewTargetImport>(
          *g_browser_process->profile_manager());
      new_target_->Start(
          {source.kind, source_path, base::UTF8ToUTF16(*name)},
          base::BindOnce(&Handler::NewChromiumCompleted, weak_.GetWeakPtr(), source));
      return;
    }
    current_job_ = ImportService::Get(profile_.get())->StartChromiumWebUIImport(
        source.id, selected,
        base::BindOnce(&Handler::CurrentChromiumCompleted,
                       weak_.GetWeakPtr(), source));
  }
  void CurrentChromiumCompleted(Source source, bool success) {
    current_job_.clear();
    CompleteChromium(source, success, std::nullopt);
  }
  void NewChromiumCompleted(Source source, ChromiumNewTargetCompletion result) {
    CompleteChromium(source, result.success, result.target_profile);
  }
  void CompleteChromium(Source source, bool success,
                        std::optional<base::FilePath> target) {
    if (!busy_) return;
    if (!success) {
      controls_.Run(true);
      retirement_.Reset();
    } else {
      // Original completion posts native retirement/actual explicit-open UX;
      // capture it independently of this page's subsequently destroyed Handler.
      base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
          base::BindOnce([](std::u16string name,
                            std::optional<base::FilePath> target,
                            base::OnceClosure retirement) {
            std::move(retirement).Run();
            if (target) {
              aux_importer::ShowNewProfileImportCompleted(name,
                  base::BindOnce(&aux_importer::OpenImportedProfile, *target));
            } else {
              aux_importer::ShowCurrentProfileImportCompleted(name);
            }
          }, std::u16string(source.name), std::move(target),
             std::move(retirement_)));
    }
    Finished(source.id, success);
  }
  void ImportFirefox(const base::ListValue& args) {
    if (!args.empty() || !Admit()) return;
    aux_importer::ShowImportTargetChooser(u"Firefox",
        base::BindOnce(&Handler::ChoseFirefoxTarget, weak_.GetWeakPtr()));
  }
  void ChoseFirefoxTarget(std::optional<Choice> choice) {
    if (!choice || busy_ || !Admit()) return;
    auto lifecycle = FirefoxLifecycle();
    if (!lifecycle.set_controls_enabled || !lifecycle.retire_owner) return;
    busy_ = true;
    firefox_ = std::make_unique<FirefoxImport>(profile_.get(), std::nullopt, false,
        base::BindRepeating(&Handler::ImportState, weak_.GetWeakPtr(),
                            std::string("firefox")));
    FireWebUIListener("browser-import-started", "firefox");
    firefox_->Start(*choice == Choice::kNewProfile
                       ? FirefoxImport::TargetMode::kNewProfile
                       : FirefoxImport::TargetMode::kCurrentProfile,
                    std::move(lifecycle));
  }
  void SelectSafariArchive(const base::ListValue& args) {
    if (!args.empty() || !Admit()) return;
    aux_importer::ShowImportTargetChooser(u"Safari",
        base::BindOnce(&Handler::ChoseSafariTarget, weak_.GetWeakPtr()));
  }
  void ChoseSafariTarget(std::optional<Choice> choice) {
    if (!choice || !Admit()) return;
    safari_choice_ = *choice;
    if (!safari_picker_) {
      safari_picker_ = std::make_unique<aux_importer::SafariArchivePicker>(
          base::BindRepeating(&Handler::SelectedSafariArchive, weak_.GetWeakPtr()),
          base::BindRepeating(&Handler::InvalidSafariArchive, weak_.GetWeakPtr()));
    }
    auto* contents = web_ui()->GetWebContents();
    safari_picker_->Show(contents, contents->GetTopLevelNativeWindow());
  }
  void InvalidSafariArchive() {
    if (Admit()) FireWebUIListener("safari-import-invalid-file",
        "This is not a valid Safari data ZIP file.");
  }
  void SelectedSafariArchive(base::FilePath path) {
    if (busy_ || !Admit()) return;
    SafariWebUIImport::WebUILifecycle lifecycle{
        aux_importer::CaptureImportOwnerRetirement(*web_ui()->GetWebContents()),
        base::BindOnce(&aux_importer::OpenImportedProfile)};
    if (!lifecycle.retire_owner) return;
    busy_ = true;
    safari_ = std::make_unique<SafariWebUIImport>(profile_.get(),
        base::BindRepeating(&Handler::ImportState, weak_.GetWeakPtr(),
                            std::string("safari")));
    safari_started_ = false;
    safari_->Start(safari_choice_ == Choice::kNewProfile
                       ? SafariWebUIImport::TargetMode::kNewProfile
                       : SafariWebUIImport::TargetMode::kCurrentProfile,
                   path, std::move(lifecycle));
  }
  void ImportState(std::string source, std::string state,
                   std::string, double, std::string) {
    if (!busy_) return;
    // Original42518c0 is the actual Safari import-start callback, after the
    // initialized destination/setup and immediately before PrepareImport.
    if (source == "safari" && state == "running" && !safari_started_) {
      safari_started_ = true;
      if (IsJavascriptAllowed())
        FireWebUIListener("browser-import-started", "safari");
    }
    if (state == "succeeded" || state == "failed")
      Finished(source, state == "succeeded");
  }

  base::WeakPtr<Profile> profile_;
  bool busy_ = false;
  bool safari_started_ = false;
  Choice safari_choice_ = Choice::kNewProfile;
  std::unique_ptr<ChromiumNewTargetImport> new_target_;
  std::unique_ptr<FirefoxImport> firefox_;
  std::unique_ptr<SafariWebUIImport> safari_;
  std::unique_ptr<aux_importer::SafariArchivePicker> safari_picker_;
  std::string current_job_;
  base::RepeatingCallback<void(bool)> controls_;
  base::OnceClosure retirement_;
  base::WeakPtrFactory<Handler> weak_{this};
};
}  // namespace
ImportWebUI::ImportWebUI(content::WebUI* web_ui)
    : content::WebUIController(web_ui) {
  auto* source = content::WebUIDataSource::CreateAndAdd(
      web_ui->GetWebContents()->GetBrowserContext(), "aux-import-data");
  // Supplied424e0c0 calls42653d0 for installed app IDs only. Do not read
  // browser profiles merely to render the original available-browser list.
  base::ListValue installed;
  for (const char* id : {"chrome", "brave", "safari", "firefox", "arc",
                         "atlas", "comet", "dia", "helium"}) {
    if (InstalledSourceApplication(id)) installed.Append(id);
  }
  source->AddString("installedBrowsers", base::WriteJson(installed).value());
  source->UseStringsJs();
  web_ui->GetWebContents()->SetPageBaseBackgroundColor(
      SkColorSetRGB(0x18, 0x18, 0x1b));
  source->OverrideContentSecurityPolicy(
      network::mojom::CSPDirectiveName::StyleSrc,
      "style-src 'self' 'unsafe-inline';");
  source->SetRequestFilter(
      base::BindRepeating([](const std::string& path) {
        return HasSuppliedImporterResource(path);
      }),
      base::BindRepeating(
          [](const std::string& path,
             content::WebUIDataSource::GotDataCallback callback) {
            auto resource = GetSuppliedImporterResource(path);
            if (!resource) {
              std::move(callback).Run(nullptr);
              return;
            }
            std::move(callback).Run(
                base::MakeRefCounted<base::RefCountedString>(
                    std::move(*resource)));
          }));
  web_ui->AddMessageHandler(std::make_unique<Handler>());
}
ImportWebUI::~ImportWebUI() = default;
}  // namespace aux_import
