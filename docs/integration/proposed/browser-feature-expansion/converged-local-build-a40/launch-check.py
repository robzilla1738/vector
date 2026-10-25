"""One bounded, disposable startup attempt. Never grants admission or signs."""
import json
import os
from pathlib import Path
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
APP = REPO / 'out/provided-candidate-converged-local-20261024-a40/Aux.app'
scope = Path(tempfile.mkdtemp(prefix='aux-converged-launch-a40-', dir='/private/tmp'))
scope.chmod(0o700)
home, profile = scope / 'home', scope / 'profile'
home.mkdir(mode=0o700)
profile.mkdir(mode=0o700)
environment = dict(PATH=os.environ.get('PATH', '/usr/bin:/bin'), HOME=str(home),
    CFFIXED_USER_HOME=str(home), TMPDIR=str(scope), LANG='en_US.UTF-8',
    AUX_HOME=str(home), AUX_PORT='21520', AUX_HOST='127.0.0.1',
    DAEMON_BASE_URL='http://127.0.0.1:21520', AUX_BROWSER_CDP_HOST='127.0.0.1:45203',
    AUX_AGENT_RUNTIME_DIR=str(home / 'runtime'))
launcher = subprocess.run(['node', str(REPO / 'scripts/aux.mjs'), '--app', str(APP),
    '--home', str(home), '--profile', str(profile)], env=environment,
    capture_output=True, timeout=15)
(scope / 'launcher.stdout').write_bytes(launcher.stdout)
(scope / 'launcher.stderr').write_bytes(launcher.stderr)
ports_free = all(subprocess.run(['/usr/sbin/lsof', '-nP', f'-iTCP:{port}', '-sTCP:LISTEN'],
    capture_output=True).returncode == 1 for port in [21520, 45203])
native = dict(attempted=False)
if ports_free:
    executable = APP / 'Contents/MacOS/Aux'
    command = [str(executable), f'--user-data-dir={profile}', '--no-first-run',
        '--no-default-browser-check', '--use-mock-keychain',
        '--disable-background-networking', '--disable-component-update']
    with (scope / 'native.stdout').open('wb') as stdout, (scope / 'native.stderr').open('wb') as stderr:
        try:
            child = subprocess.Popen(command, env=environment, stdout=stdout, stderr=stderr,
                                     start_new_session=True)
            native = dict(attempted=True, pid=child.pid, command=command)
            try:
                native.update(exitCode=child.wait(timeout=10), stillRunning=False)
            except subprocess.TimeoutExpired:
                native.update(exitCode=None, stillRunning=True)
        except OSError as error:
            native.update(attempted=True, spawnError=str(error), errno=error.errno)
signature = subprocess.run(['/usr/bin/codesign', '--verify', '--verbose=2',
    str(APP / 'Contents/MacOS/Aux')], capture_output=True)
(scope / 'signature.stderr').write_bytes(signature.stderr)
result = dict(format='aux.converged-local.launch.actual.v1', app=str(APP), disposableScope=str(scope),
    passed=False, launcherExitCode=launcher.returncode,
    launcherRefusedStateV2=b'unaccepted migration candidate' in launcher.stderr,
    fixedPortsFree=ports_free, nativeEntry=native, signatureVerificationExitCode=signature.returncode,
    productSigned=False, admissionGuardChanged=False, acceptedAppReplaced=False,
    ownerStateRead=False, ownerAppsStopped=False, actualUiAcceptance=False,
    runtimeAcceptance=False, remainingJourneys='Blocked at startup; not run or represented as passed')
with (HERE / 'actual-launch-a1.json').open('x') as output:
    output.write(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
