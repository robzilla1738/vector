#!/usr/bin/env python3
"""Extend the actual loaded writer participant without creating app services."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    specs = {}

    def add(path, label, find, replace):
        specs.setdefault(path, []).append((label, find, replace))

    header = 'chrome/browser/ui/aux_session_writer_participant.h'
    anchor = 'struct ProfileSessionWriterObservation {'
    add(header, 'independent installed-app observation', anchor, '''// The installed-web-app service is a sibling writer with its own app-restore
// backend. Never fold its absence, failure or owner loss into the browser row.
struct ProfileAppSessionWriterObservation {
  ProfileSessionWriterOutcome outcome = ProfileSessionWriterOutcome::kNotAttempted;
  std::optional<sessions::SessionWriteCompletion> write;
  std::optional<sessions::SessionManagerCloseObservation> close;
};

''' + anchor)
    anchor = '''  size_t inventory_index = 0;
  ProfileSessionWriterOutcome outcome = ProfileSessionWriterOutcome::kNotAttempted;
  std::optional<sessions::SessionWriteCompletion> write;
  std::optional<sessions::SessionManagerCloseObservation> close;
};'''
    add(header, 'preserve browser fields append app sibling', anchor, anchor[:-3] +
        '\n  ProfileAppSessionWriterObservation app_session;\n};')

    source = 'chrome/browser/ui/aux_profile_switch_session_rebuild.cc'
    anchor = '#include "chrome/browser/sessions/session_service.h"'
    add(source, 'actual app service and existing-only factory types', anchor,
        '#include "chrome/browser/sessions/app_session_service.h"\n'
        '#include "chrome/browser/sessions/app_session_service_factory.h"\n' + anchor)
    anchor = '  void DidWrite(size_t index, sessions::SessionWriteCompletion result);'
    add(source, 'distinct app write callback', anchor, anchor +
        '\n  void DidAppWrite(size_t index, sessions::SessionWriteCompletion result);')
    anchor = '  void DidClose(size_t index, sessions::SessionManagerCloseObservation result);'
    add(source, 'distinct app close callback', anchor, anchor +
        '\n  void DidAppClose(size_t index, sessions::SessionManagerCloseObservation result);')
    anchor = '  std::vector<base::WeakPtr<SessionServiceBase>> services_;'
    add(source, 'separate weak native service lifetimes', anchor, anchor +
        '\n  std::vector<base::WeakPtr<SessionServiceBase>> app_services_;')
    anchor = '      services_(profiles_.size()),'
    add(source, 'app owner slots match same profile inventory', anchor, anchor +
        '\n      app_services_(profiles_.size()),')
    anchor = '''  write_submission_.Finish();
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::DidWrite('''
    add(source, 'actual existing-only app final writes inside same submission guard', anchor, '''  for (size_t i = 0; i < profiles_.size(); ++i) {
    auto& observation = result_.profiles[i].app_session;
    // A browser-service write above can reenter profile destruction. Check the
    // weak owner again before the separate existing-only app-service lookup.
    if (!profiles_[i]) {
      observation.outcome = ProfileSessionWriterOutcome::kProfileOwnerLost;
      continue;
    }
    AppSessionService* service =
        AppSessionServiceFactory::GetForProfileIfExisting(profiles_[i].get());
    if (!service) {
      observation.outcome = ProfileSessionWriterOutcome::kNoExistingService;
      continue;
    }
    app_services_[i] = service->GetWeakPtrForNativeSessionWriterParticipant();
    observation.outcome = ProfileSessionWriterOutcome::kServiceObserved;
    ++pending_writes_;
    service->ResetFromCurrentBrowsersWithWriteCompletion(base::BindOnce(
        &LoadedSessionWriterParticipant::DidAppWrite, base::WrapRefCounted(this), i));
    // No raw app service/profile access after this potentially reentrant call.
  }
  write_submission_.Finish();
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::DidWrite(''')
    anchor = 'void LoadedSessionWriterParticipant::BeginManagerCloses() {'
    add(source, 'retain actual app write outcome separately', anchor, '''void LoadedSessionWriterParticipant::DidAppWrite(
    size_t index, sessions::SessionWriteCompletion result) {
  CHECK(phase_ == Phase::kWriting);
  CHECK(pending_writes_ && !result_.profiles[index].app_session.write.has_value());
  result_.profiles[index].app_session.write = std::move(result);
  --pending_writes_;
  ScheduleAdvance();
}

''' + anchor)
    anchor = '''  close_submission_.Finish();
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::DidClose('''
    add(source, 'app manager and backend close uses common real seam', anchor, '''  for (size_t i = 0; i < app_services_.size(); ++i) {
    auto& observation = result_.profiles[i].app_session;
    if (!observation.write.has_value()) continue;
    if (!profiles_[i]) {
      observation.outcome = ProfileSessionWriterOutcome::kProfileOwnerLost;
      continue;
    }
    if (!app_services_[i]) {
      observation.outcome = ProfileSessionWriterOutcome::kServiceOwnerLost;
      continue;
    }
    ++pending_closes_;
    app_services_[i]->CloseCommandWriterAdmissionAndObserve(base::BindOnce(
        &LoadedSessionWriterParticipant::DidAppClose,
        base::WrapRefCounted(this), i));
  }
  close_submission_.Finish();
  ScheduleAdvance();
}

void LoadedSessionWriterParticipant::DidClose(''')
    anchor = 'void LoadedSessionWriterParticipant::Finish() {'
    add(source, 'app close completion preserves per-profile owner loss', anchor, '''void LoadedSessionWriterParticipant::DidAppClose(
    size_t index, sessions::SessionManagerCloseObservation result) {
  CHECK(phase_ == Phase::kClosing);
  CHECK(pending_closes_ && !result_.profiles[index].app_session.close.has_value());
  auto& observation = result_.profiles[index].app_session;
  observation.close = std::move(result);
  if (!profiles_[index])
    observation.outcome = ProfileSessionWriterOutcome::kProfileOwnerLost;
  else if (!app_services_[index])
    observation.outcome = ProfileSessionWriterOutcome::kServiceOwnerLost;
  --pending_closes_;
  ScheduleAdvance();
}

''' + anchor)

    pins = json.loads((HERE / 'original-input-pins.json').read_text())
    patch = ''
    records = []
    for path, edits in specs.items():
        original = (NATIVE / path).read_bytes()
        assert sha(original) == pins[path], path
        text = original.decode()
        reviewed = []
        for label, find, replace in edits:
            assert text.count(find) == 1, (path, label)
            text = text.replace(find, replace)
            reviewed.append({'name': label, 'find': find, 'replace': replace, 'count': 1})
        output = text.encode()
        (HERE / 'source' / path).write_bytes(output)
        records.append({'path': path, 'inputSha256': sha(original),
                        'outputSha256': sha(output), 'edits': reviewed})
        patch += 'diff --git a/' + path + ' b/' + path + '\n'
        patch += ''.join(difflib.unified_diff(original.decode().splitlines(True),
                                            text.splitlines(True),
                                            fromfile='a/' + path, tofile='b/' + path))
    (HERE / 'followup.patch').write_text(patch)
    (HERE / 'inputs.json').write_text(json.dumps({
        'format': 'aux.installed-app-session-writer.v1',
        'sourceRoot': str(NATIVE), 'files': records,
        'patchSha256': sha(patch.encode()), 'applied': False, 'compiled': False,
        'uiGeometryAssetsChanged': False, 'newServiceCreated': False,
    }, indent=2) + '\n')


if __name__ == '__main__':
    main()
