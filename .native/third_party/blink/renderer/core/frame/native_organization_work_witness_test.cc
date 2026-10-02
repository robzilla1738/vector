// Copyright 2026 The Aux Authors
// Actual Blink timeline fixture tests; never native performance qualification.
#include "third_party/blink/renderer/core/frame/native_organization_work_witness.h"
#include "third_party/blink/renderer/core/frame/native_organization_work_controller.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "base/process/process_handle.h"
#include "base/unguessable_token.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/script/classic_script.h"
#include "third_party/blink/renderer/core/frame/settings.h"
#include "third_party/blink/renderer/core/testing/page_test_base.h"
#include "third_party/blink/renderer/core/timing/dom_window_performance.h"
#include "third_party/blink/renderer/core/timing/window_performance.h"
#include "base/threading/platform_thread.h"
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "third_party/blink/renderer/platform/testing/unit_test_helpers.h"
namespace blink {
class NativeOrganizationWorkWitnessTest : public PageTestBase {
 protected:
  void Fixture() {
    GetDocument().GetSettings()->SetScriptEnabled(true);
    GetDocument().SetURL(KURL("chrome://aux/"));
    SetBodyInnerHTML("<p>Owned synthetic shell</p>");
    UpdateAllLifecyclePhasesForTest();
  }
  void ScriptTask(const char* script, base::TimeDelta after = base::TimeDelta()) {
    base::PlatformThread::Sleep(base::Milliseconds(1));
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce([](Document* document, std::string script, base::TimeDelta after) {
          ClassicScript::CreateUnspecifiedScript(String::FromUTF8(script))->RunScript(document->domWindow());
          if (!after.is_zero()) base::PlatformThread::Sleep(after);
        }, base::Unretained(&GetDocument()), std::string(script), after));
    test::RunPendingTasks();
    test::RunDelayedTasks(base::Milliseconds(2));
  }
  void Measure() {
    // Synthetic timeline tests allow the real clock to advance past its
    // privacy precision. No journey/performance deadline is changed.
    base::PlatformThread::Sleep(base::Milliseconds(1));
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce([](Document* document) {
          ClassicScript::CreateUnspecifiedScript(
              "performance.mark('work-start'); performance.mark('work-end'); "
              "performance.measure('aux:autoArchive:cycle', {start:'work-start', end:'work-end', "
              "detail:JSON.stringify({operationId:'00000000-0000-4000-8000-000000000001', units:1, committed:true})});")
              ->RunScript(document->domWindow());
        }, base::Unretained(&GetDocument())));
    test::RunPendingTasks();
  }
};
TEST_F(NativeOrganizationWorkWitnessTest, ForeignDocumentCannotArmOrRead) {
  NativeOrganizationWorkWitness foreign(GetDocument(), NativeOrganizationWork::kAutoArchive);
  EXPECT_FALSE(foreign.armed()); EXPECT_FALSE(foreign.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, ExistingMeasureCannotBecomeFreshWork) {
  Fixture(); Measure();
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kAutoArchive);
  ASSERT_TRUE(witness.armed()); EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, ExactFreshMeasureRequiredAndSuccessfulReadCannotReplay) {
  Fixture();
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kAutoArchive);
  ASSERT_TRUE(witness.armed()); EXPECT_FALSE(witness.Read(GetDocument()));
  Measure();
  test::RunDelayedTasks(base::Milliseconds(2));
  auto sample = witness.Read(GetDocument()); ASSERT_TRUE(sample);
  EXPECT_TRUE(sample->long_task_coverage);
  EXPECT_GT(sample->completed_tasks, 0u);
  EXPECT_GE(sample->completed_through_ms, sample->start_ms + sample->duration_upper_bound_ms);
  EXPECT_GE(sample->duration_ms, 0); EXPECT_EQ(sample->overlapping_long_tasks, 0u);
  EXPECT_GT(sample->duration_upper_bound_ms, sample->duration_ms);
  EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, TwoFreshMeasuresCannotBeMisattributedToOneCycle) {
  Fixture();
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kAutoArchive);
  ASSERT_TRUE(witness.armed()); Measure(); Measure();
  EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, FreshMeasureReusingOldMarksCannotCount) {
  Fixture();
  ClassicScript::CreateUnspecifiedScript(
      "performance.mark('stale-start'); performance.mark('stale-end');")
      ->RunScript(GetDocument().domWindow());
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kAutoArchive);
  ASSERT_TRUE(witness.armed());
  ClassicScript::CreateUnspecifiedScript(
      "performance.measure('aux:autoArchive:cycle', 'stale-start', 'stale-end');")
      ->RunScript(GetDocument().domWindow());
  EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, OtherMetricAndDocumentChangeCannotCount) {
  Fixture();
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kLiveFolderRefresh);
  Measure(); EXPECT_FALSE(witness.Read(GetDocument()));
  GetDocument().SetURL(KURL("https://fixture.invalid/"));
  EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, MissingOrEmptyCompletionCannotBecomeWork) {
  Fixture();
  NativeOrganizationWorkWitness missing(GetDocument(), NativeOrganizationWork::kAutoArchive);
  ASSERT_TRUE(missing.armed());
  ScriptTask("performance.mark('missing-start'); performance.mark('missing-end'); "
      "performance.measure('aux:autoArchive:cycle', 'missing-start', 'missing-end');");
  EXPECT_FALSE(missing.Read(GetDocument()));
  NativeOrganizationWorkWitness empty(GetDocument(), NativeOrganizationWork::kAutoArchive);
  ASSERT_TRUE(empty.armed());
  ScriptTask("performance.mark('empty-start'); performance.mark('empty-end'); "
      "performance.measure('aux:autoArchive:cycle', {start:'empty-start',end:'empty-end', "
      "detail:JSON.stringify({operationId:'00000000-0000-4000-8000-000000000002',units:0,committed:true})});");
  EXPECT_FALSE(empty.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, ActualCompletedTaskRetainsWorkAfterEndMark) {
  Fixture();
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kAutoArchive);
  ASSERT_TRUE(witness.armed());
  ScriptTask("performance.mark('slow-start'); performance.mark('slow-end'); "
      "performance.measure('aux:autoArchive:cycle', {start:'slow-start',end:'slow-end', "
      "detail:JSON.stringify({operationId:'00000000-0000-4000-8000-000000000003',units:1,committed:true})});",
      base::Milliseconds(60));
  auto sample = witness.Read(GetDocument()); ASSERT_TRUE(sample);
  EXPECT_GT(sample->maximum_task_ms, 50);
  EXPECT_GE(sample->completed_through_ms, sample->start_ms + sample->duration_upper_bound_ms);
  EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, LiveMetadataCannotReplaceActualCommittedRows) {
  Fixture();
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kLiveFolderRefresh);
  ASSERT_TRUE(witness.armed());
  ScriptTask("performance.mark('live-start'); performance.mark('live-end'); "
      "performance.measure('aux:liveFolders:refresh', {start:'live-start',end:'live-end', "
      "detail:JSON.stringify({operationId:'00000000-0000-4000-8000-000000000004',units:2,committed:true,folderId:'owned-folder'})});");
  EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, LiveCurrentRowsAndNativeTaskBoundaryAreBothRequired) {
  Fixture();
  SetBodyInnerHTML("<div class='live-folder-rows' data-aux-live-folder-id='owned-folder' aria-busy='false'>"
      "<button class='live-folder-item'>First fixture row</button><button class='live-folder-item'>Second fixture row</button></div>");
  UpdateAllLifecyclePhasesForTest();
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kLiveFolderRefresh);
  ASSERT_TRUE(witness.armed());
  ScriptTask("performance.mark('owned-live-start'); performance.mark('owned-live-end'); "
      "performance.measure('aux:liveFolders:refresh', {start:'owned-live-start',end:'owned-live-end', "
      "detail:JSON.stringify({operationId:'00000000-0000-4000-8000-000000000005',units:2,committed:true,folderId:'owned-folder'})});");
  auto sample = witness.Read(GetDocument()); ASSERT_TRUE(sample);
  EXPECT_EQ(sample->units, 2u); EXPECT_EQ(sample->folder_id, "owned-folder");
  EXPECT_GT(sample->completed_tasks, 0u); EXPECT_TRUE(sample->long_task_coverage);
  EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, ActualSaturatedLongTaskBufferRefuses) {
  Fixture(); auto* performance = DOMWindowPerformance::performance(*GetDocument().domWindow());
  const auto began = performance->GetTimeOriginInternal();
  for (unsigned i = 0; i < 200; ++i)
    performance->AddLongTaskTiming(began, began + base::Milliseconds(60),
        AtomicString("self"), AtomicString("window"), g_empty_atom, g_empty_atom, g_empty_atom);
  NativeOrganizationWorkWitness witness(GetDocument(), NativeOrganizationWork::kAutoArchive);
  EXPECT_FALSE(witness.armed()); EXPECT_FALSE(witness.Read(GetDocument()));
}
TEST_F(NativeOrganizationWorkWitnessTest, RealMojoReadSerializesBeforeReadOncePipeRetirement) {
  Fixture();
  auto scope = mojom::blink::NativeOrganizationWorkScope::New();
  scope->metric = mojom::blink::NativeOrganizationWorkMetric::kAutoArchive;
  scope->nonce = base::UnguessableToken::Create(); scope->sample_sequence = 1;
  scope->window_id = 1; scope->renderer_pid = base::GetCurrentProcId();
  scope->widget_routing_id = 1; scope->document_generation = 1;
  scope->document = GetDocument().Token();
  mojo::Remote<mojom::blink::NativeOrganizationWorkLease> remote;
  NativeOrganizationWorkController controller(GetDocument(), scope->Clone(), remote.BindNewPipeAndPassReceiver());
  ASSERT_TRUE(controller.armed());
  bool replied = false; mojom::blink::NativeOrganizationWorkSamplePtr sample;
  remote->Read(base::BindOnce([](bool* replied, mojom::blink::NativeOrganizationWorkSamplePtr* sample,
      mojom::blink::NativeOrganizationWorkSamplePtr result) {
    *replied = true; *sample = std::move(result);
  }, &replied, &sample));
  test::RunPendingTasks();
  EXPECT_FALSE(replied);
  Measure(); test::RunDelayedTasks(base::Milliseconds(20));
  ASSERT_TRUE(replied); ASSERT_TRUE(sample);
  EXPECT_TRUE(sample->scope->Equals(*scope)); EXPECT_EQ(sample->units, 1u);
  EXPECT_TRUE(sample->long_task_coverage); EXPECT_FALSE(controller.armed());
  sample.reset(); replied = false;
  remote->Read(base::BindOnce([](bool* replied, mojom::blink::NativeOrganizationWorkSamplePtr* sample,
      mojom::blink::NativeOrganizationWorkSamplePtr result) {
    *replied = true; *sample = std::move(result);
  }, &replied, &sample));
  test::RunPendingTasks();
  EXPECT_TRUE(replied); EXPECT_FALSE(sample);
}
}  // namespace blink
