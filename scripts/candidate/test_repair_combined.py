"""Refusal paths of the repair executor, run against a tiny fixture app with a codesign stub.

The executor is copied into a temporary repository root together with the approved review,
owner approval and Info.plist amendment (byte-identical, so their pinned hashes hold). Its
recorded paths re-root into that fixture, so it never sees the real candidate. The few leaves
the review pins by hash (daemon Info.plist, provisioning profile, memory helper and policy, the
amended outer Info.plist) are copied from the real candidate, read-only; everything else in the
fixture app is synthetic. The executor calls /usr/bin/codesign by absolute path, so a PATH stub
cannot intercept it: a small driver runs it in-process with subprocess.run routing that one
binary to the fake below. No real signing, Keychain use or launch happens.
"""
import hashlib, importlib.util, json, os, plistlib, shutil, subprocess, sys, tempfile, unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(REPO/'scripts/lib'))
from inputs import require_input  # noqa: E402

CANDIDATE = 'out/provided-candidate-completion-20261026-a1/Aux.app'
REVIEW_DIR = 'docs/integration/proposed/completion-20261026/runtime/authority-review'
HELPER = 'docs/integration/proposed/profile-isolation-delivery/package/assemble.py'
ENTITLEMENTS = 'docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42'
DAEMON = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app'
NODE = DAEMON + '/Contents/Resources/node-development/'
PINNED_LEAVES = ('Contents/Info.plist', DAEMON + '/Contents/Info.plist', DAEMON + '/Contents/embedded.provisionprofile',
                 DAEMON + '/Contents/Resources/memory-helper/aux-memory', DAEMON + '/Contents/Resources/AuxMemoryHelperLaunchPolicy.json')
FRAMEWORK = 'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework'
APPROVED = '20572af30ef6613f1fc8bced01edada6d52f4b3f7c1f21dd97fb610ec2b257f2'

FAKE_CODESIGN = r'''
import json, os, plistlib, sys
from pathlib import Path
args, log = sys.argv[1:], Path(os.environ['FAKE_CODESIGN_LOG'])
with log.open('a') as stream: stream.write(json.dumps(args) + '\n')
state = Path(os.environ['FAKE_CODESIGN_STATE']); signed = json.loads(state.read_text()) if state.exists() else {}
target = Path(args[-1])
if args[0] == '--force':
    entitlements = args[args.index('--entitlements') + 1] if '--entitlements' in args else None
    signed[str(target)] = entitlements; state.write_text(json.dumps(signed))
    seal = target/'Contents/_CodeSignature' if (target/'Contents').is_dir() else target/'_CodeSignature'
    seal.mkdir(parents=True, exist_ok=True); (seal/'CodeResources').write_text('fake seal\n')
    if os.environ.get('FAKE_CODESIGN_TOUCH'): Path(os.environ['FAKE_CODESIGN_TOUCH']).write_text('touched by signing\n')
elif args[0] == '--verify':
    sys.exit(1 if os.environ.get('FAKE_CODESIGN_VERIFY_FAIL') else 0)
elif args[0] == '--display':
    path = signed.get(str(target))
    value = plistlib.loads(Path(path).read_bytes()) if path else {}
    if os.environ.get('FAKE_CODESIGN_EXTRA_ENTITLEMENT'): value['com.apple.security.cs.disable-library-validation'] = True
    if value: sys.stdout.buffer.write(plistlib.dumps(value))
'''

DRIVER = r'''
import runpy, subprocess, sys
fake, executor = sys.argv[1], sys.argv[2]
real = subprocess.run
def run(command, *args, **kwargs):
    if command and command[0] == '/usr/bin/codesign':
        command = [sys.executable, fake, *command[1:]]
    return real(command, *args, **kwargs)
subprocess.run = run
sys.argv = [executor, *sys.argv[3:]]
runpy.run_path(executor, run_name='__main__')
'''


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def pin(path):
    return {'path': str(Path(path).resolve()), 'sha256': sha(path)}


class RepairExecutorTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        candidate = require_input('candidateApp')
        cls.base = Path(tempfile.mkdtemp(prefix='aux-repair-fixture-')).resolve()
        root = cls.base/'root'
        for relative in (REVIEW_DIR + '/signing-execution-review.json', REVIEW_DIR + '/owner-approval-a4.json',
                         REVIEW_DIR + '/info-plist-amendment.json', HELPER,
                         ENTITLEMENTS + '/daemon-local.plist', ENTITLEMENTS + '/browser-jit.plist'):
            (root/relative).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(REPO/relative, root/relative)
        (root/'scripts/candidate').mkdir(parents=True)
        shutil.copyfile(HERE/'repair_combined.py', root/'scripts/candidate/repair_combined.py')
        app = root/CANDIDATE
        for relative in PINNED_LEAVES:
            (app/relative).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(candidate/relative, app/relative)
        for relative, text in (('Contents/MacOS/Aux', 'browser'), (DAEMON + '/Contents/MacOS/aux-daemon', 'daemon'),
                               (NODE + 'index.mjs', 'old index'), (NODE + 'aux-native-entry.mjs', 'old entry'),
                               (FRAMEWORK, 'framework'), ('Contents/_CodeSignature/CodeResources', 'outer seal'),
                               (DAEMON + '/Contents/_CodeSignature/CodeResources', 'daemon seal')):
            (app/relative).parent.mkdir(parents=True, exist_ok=True)
            (app/relative).write_text(text + '\n')
        (app/'Contents/MacOS/Aux').chmod(0o755)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.base)

    def setUp(self):
        self.work = Path(tempfile.mkdtemp(prefix='aux-repair-case-')).resolve()
        self.addCleanup(shutil.rmtree, self.work)
        self.root = self.work/'root'
        subprocess.run(['/bin/cp', '-cR', str(self.base/'root'), str(self.root)], check=True)
        self.app = self.root/CANDIDATE
        self.executor = self.root/'scripts/candidate/repair_combined.py'
        spec = importlib.util.spec_from_file_location('inventory_helper', self.root/HELPER)
        self.helper = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.helper)
        self.fake = self.work/'codesign.py'
        self.fake.write_text(FAKE_CODESIGN)
        self.driver = self.work/'driver.py'
        self.driver.write_text(DRIVER)
        self.env = {**os.environ, 'FAKE_CODESIGN_LOG': str(self.work/'codesign.log'), 'FAKE_CODESIGN_STATE': str(self.work/'codesign.json')}
        self.inputs = self.work/'inputs'
        self.inputs.mkdir()
        (self.inputs/'index.mjs').write_text('new index\n')
        (self.inputs/'entry.mjs').write_text('new entry\n')
        (self.inputs/'evidence.json').write_text('{}\n')

    def seal(self):
        """Write bundle.json for the current fixture and the signed receipt that describes it."""
        resources = self.app/'Contents/Resources/aux'
        records = [{'path': row['path'], 'mode': row['mode'], **({'sha256': row['sha256'], 'bytes': (resources/row['path']).stat().st_size}
                    if row['type'] == 'file' else {'linkTarget': row['target']})}
                   for row in self.helper.inventory(resources) if row['path'] != 'bundle.json']
        (resources/'bundle.json').write_text(json.dumps({'files': records, 'currentCompletionIntegration': {}}))
        files = self.helper.inventory(self.app)
        receipt = self.work/'signed-receipt.json'
        receipt.write_text(json.dumps({'passed': True, 'approvedReviewSha256': APPROVED, 'files': files,
                                       'inventorySha256': self.helper.digest(files)}))
        return receipt

    def plan(self, replacements=None, removals=(), **changes):
        receipt = self.seal()
        rows = {row['path']: row for row in self.helper.inventory(self.app)}
        replacements = replacements or [(NODE + 'index.mjs', self.inputs/'index.mjs'), (NODE + 'aux-native-entry.mjs', self.inputs/'entry.mjs')]
        plan = {'format': 'aux.combined-product.same-scope-repair.v1', 'app': str(self.app), 'approvedReviewSha256': APPROVED,
                'executor': pin(self.executor), 'signedReceipt': pin(receipt),
                'replacements': [{'target': target, 'input': pin(source), 'beforeSha256': rows[target]['sha256'] if target in rows else '0' * 64}
                                 for target, source in replacements],
                'removals': [{'target': target, 'beforeSha256': '0' * 64} for target in removals],
                'sourceEvidence': [pin(self.inputs/'evidence.json')], 'receiptDirectory': 'repair-test-a1', **changes}
        path = self.work/'plan.json'
        path.write_text(json.dumps(plan))
        return path

    def execute(self, plan, plan_sha=None, **env):
        return subprocess.run([sys.executable, '-I', str(self.driver), str(self.fake), str(self.executor),
                               '--plan', str(plan), '--plan-sha256', plan_sha or sha(plan)],
                              capture_output=True, text=True, env={**self.env, **env}, cwd=self.work)

    def refuses(self, done, message):
        self.assertNotEqual(done.returncode, 0, done.stdout)
        self.assertIn(message, done.stderr)

    def untouched(self):
        self.assertEqual((self.app/NODE/'index.mjs').read_text(), 'old index\n')
        self.assertFalse((self.app.parent/'repair-test-a1').exists())

    def codesign_calls(self):
        log = self.work/'codesign.log'
        return [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []

    def test_bounded_repair_signs_only_daemon_and_outer_with_the_approved_commands(self):
        done = self.execute(self.plan())
        self.assertEqual(done.returncode, 0, done.stderr)
        receipt = json.loads((self.app.parent/'repair-test-a1/receipt.json').read_text())
        self.assertTrue(receipt['passed'])
        self.assertEqual(receipt['signedObjects'], [DAEMON, '.'])
        self.assertEqual((self.app/NODE/'index.mjs').read_text(), 'new index\n')
        self.assertTrue((self.app.parent/'repair-test-a1/before-repair.app/Contents/Info.plist').is_file())
        signs = [call for call in self.codesign_calls() if call[0] == '--force']
        self.assertEqual([call[-1] for call in signs], [str(self.app/DAEMON), str(self.app/'.')])
        self.assertIn('47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90', signs[0])

    def test_wrong_plan_hash_is_refused(self):
        self.refuses(self.execute(self.plan(), plan_sha='0' * 64), 'Exact bounded repair plan required')
        self.untouched()

    def test_other_app_or_scope_is_refused(self):
        self.refuses(self.execute(self.plan(app=str(self.work/'Other.app'))), 'Wrong app or repair scope')
        self.refuses(self.execute(self.plan(approvedReviewSha256='0' * 64)), 'Wrong app or repair scope')
        self.untouched()

    def test_a_different_executor_is_refused(self):
        copy = self.work/'repair_combined.py'
        shutil.copyfile(self.executor, copy)
        self.refuses(self.execute(self.plan(executor=pin(copy))), 'Wrong executor')
        self.untouched()

    def test_altered_replacement_input_is_refused(self):
        plan = self.plan()
        (self.inputs/'entry.mjs').write_text('edited after freezing\n')
        self.refuses(self.execute(plan), 'Changed repair input')
        self.untouched()

    def test_unenumerated_targets_and_removals_are_refused(self):
        stray = DAEMON + '/Contents/Resources/node-development/other.mjs'
        (self.app/stray).write_text('other\n')
        extra = [(NODE + 'index.mjs', self.inputs/'index.mjs'), (NODE + 'aux-native-entry.mjs', self.inputs/'entry.mjs'), (stray, self.inputs/'index.mjs')]
        self.refuses(self.execute(self.plan(extra)), 'Only enumerated existing leaves may change')
        self.refuses(self.execute(self.plan(removals=[stray])), 'Only enumerated legacy leaves may be removed')
        self.refuses(self.execute(self.plan([(NODE + 'index.mjs', self.inputs/'index.mjs')])), 'Only enumerated existing leaves may change')
        self.untouched()

    def test_info_plist_may_change_only_version_and_copyright(self):
        values = plistlib.loads((self.app/'Contents/Info.plist').read_bytes())
        values['CFBundleIdentifier'] = 'dev.aux.other'
        changed = self.inputs/'Info.plist'
        changed.write_bytes(plistlib.dumps(values))
        replacements = [(NODE + 'index.mjs', self.inputs/'index.mjs'), (NODE + 'aux-native-entry.mjs', self.inputs/'entry.mjs'), ('Contents/Info.plist', changed)]
        self.refuses(self.execute(self.plan(replacements)), 'Info.plist may change only its product version and copyright')
        self.untouched()

    def test_candidate_changed_since_the_signed_receipt_is_refused(self):
        plan = self.plan()
        (self.app/'Contents/MacOS/Aux').write_text('changed\n')
        self.refuses(self.execute(plan), 'Signed candidate changed')
        self.untouched()

    def test_running_candidate_is_refused(self):
        # A copied system binary is killed on launch, so build a tiny one inside the fixture app.
        helper = self.app/'Contents/Helpers/sleeper'
        helper.parent.mkdir()
        (self.work/'sleeper.c').write_text('#include <unistd.h>\nint main(void){sleep(30);return 0;}\n')
        subprocess.run(['/usr/bin/cc', '-o', str(helper), str(self.work/'sleeper.c')], check=True)
        plan = self.plan()
        process = subprocess.Popen([str(helper), '30'])
        try:
            self.refuses(self.execute(plan), 'Candidate still running')
        finally:
            process.kill()
            process.wait()
        self.untouched()

    def test_existing_receipt_directory_is_refused(self):
        plan = self.plan()
        (self.app.parent/'repair-test-a1').mkdir()
        self.refuses(self.execute(plan), 'Fresh confined repair directory required')
        self.assertEqual((self.app/NODE/'index.mjs').read_text(), 'old index\n')

    def test_unaccounted_entitlements_fail_the_repair_and_keep_a_backup(self):
        done = self.execute(self.plan(), FAKE_CODESIGN_EXTRA_ENTITLEMENT='1')
        self.refuses(done, 'Actual entitlements changed')
        receipt = json.loads((self.app.parent/'repair-test-a1/receipt.json').read_text())
        self.assertFalse(receipt['passed'])
        self.assertIn('Actual entitlements changed', receipt['error'])
        backup = self.app.parent/'repair-test-a1/before-repair.app'
        self.assertEqual((backup/NODE/'index.mjs').read_text(), 'old index\n')

    def test_failed_verification_stops_before_the_outer_signature(self):
        self.refuses(self.execute(self.plan(), FAKE_CODESIGN_VERIFY_FAIL='1'), 'Repair signing/verification failed: verify dev.aux.browser.daemon')
        self.assertNotIn(str(self.app/'.'), [call[-1] for call in self.codesign_calls()])

    def test_unrelated_bytes_changed_during_signing_are_refused(self):
        done = self.execute(self.plan(), FAKE_CODESIGN_TOUCH=str(self.app/FRAMEWORK))
        self.refuses(done, 'Unrelated signed-package bytes changed')


if __name__ == '__main__':
    unittest.main()
