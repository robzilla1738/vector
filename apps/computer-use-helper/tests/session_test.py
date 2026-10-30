#!/usr/bin/env python3
"""Drives the helper through a synthetic NDJSON session and the one-shot commands, checking every
stdout line against the daemon's schemas (docs/spec/computer-use-helper-protocol.md, 6.4 and 7.2).

    python3 apps/computer-use-helper/tests/session_test.py [path/to/aux-computer-use]

Defaults to the bundle build.sh makes, else the debug build. The permissions step shows the
permission sheet for a moment; nothing is granted.
"""
import json
import queue
import subprocess
import sys
import threading
import time
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANDIDATES = [ROOT / '.build/app/Aux Computer Use.app/Contents/MacOS/aux-computer-use', ROOT / '.build/debug/aux-computer-use']
HELPER = Path(sys.argv.pop(1)) if len(sys.argv) > 1 and not sys.argv[1].startswith('-') else next(p for p in CANDIDATES if p.exists())

# Field types from the daemon's zod schema (nativeContextAwarenessMessageSchema).
HEALTH = {'state': str, 'protocolVersion': int, 'accessibilityTrusted': bool, 'inputMonitoringTrusted': bool,
          'eventTapHealthy': bool, 'inputTapRunning': bool, 'observerRegistrationFailures': int, 'secureInput': bool,
          'screenRecordingTrusted': bool, 'permissionSheetVisible': bool, 'systemSessionActive': bool, 'idle': bool,
          'pid': int, 'observerPid': int, 'responsibleSelf': bool, 'message': str, 'capture': dict,
          'inputCaptureAvailable': bool}
EVENT_KINDS = {'session.started', 'session.ended', 'window.changed', 'selection.changed', 'screen.ocr'}
MENU_ACTIONS = {'pause', 'resume', 'clear', 'clear-app-session', 'include-application', 'exclude-application',
                'include-domain', 'exclude-domain', 'show-settings', 'shutdown', 'messages-permissions'}


def typed(value, kind):
    if kind is int:
        return isinstance(value, int) and not isinstance(value, bool)
    if kind in (float, 'number'):
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    return isinstance(value, kind)


def check_message(test, line):
    """One stdout line: a JSON object the daemon's schema accepts, and never an input-derived kind."""
    message = json.loads(line)
    kind = message.get('type')
    if kind == 'health':
        for key, value in message.items():
            if key in HEALTH:
                test.assertTrue(typed(value, HEALTH[key]), f'health.{key}={value!r}')
        test.assertIn(message.get('state'), {'starting', 'running', 'paused', 'stopped'})
        test.assertNotIn('inputMonitoringTrusted', message)
        test.assertEqual(message.get('inputMonitoring'), 'not-used')
        test.assertIs(message.get('inputCaptureAvailable'), False)
        if 'capture' in message:
            test.assertTrue(typed(message['capture']['bundleId'], str))
    elif kind == 'event':
        event = message['event']
        test.assertIn(event['kind'], EVENT_KINDS)
        test.assertEqual(event['source'], 'mac_ax')
        for key in ('appName', 'bundleId', 'windowTitle'):
            test.assertTrue(typed(event[key], str))
        test.assertTrue(typed(event['occurredAt'], 'number') and isinstance(event['payload'], dict))
        if 'ax' in event:
            test.assertIn(event['ax']['mode'], {'fullTree', 'diffFromPrevious'})
    elif kind == 'attention':
        test.assertTrue(typed(message['occurredAt'], 'number') and typed(message['frontmostBundleId'], str))
        test.assertGreaterEqual(message['inputAgeSeconds'], 0)
    elif kind == 'suppression':
        test.assertTrue(typed(message['bucketStartedAt'], 'number'))
        test.assertTrue(all(typed(v, int) and v >= 0 for v in message['counts'].values()))
    elif kind == 'menu-action':
        test.assertIn(message['action'], MENU_ACTIONS)
    elif kind == 'result':
        test.assertTrue(typed(message['ok'], bool) and typed(message['id'], str))
        if not message['ok']:
            test.assertTrue(typed(message['error']['code'], str) and typed(message['error']['message'], str))
    elif kind == 'protocol-error':
        test.assertTrue(typed(message['message'], str))
    else:
        test.fail(f'unexpected message type {kind!r} (browser-signal and input events are never sent)')
    return message


class Session:
    def __init__(self, test):
        self.test = test
        self.process = subprocess.Popen([str(HELPER)], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE, text=True, bufsize=1)
        self.lines = queue.Queue()
        self.seen = []
        threading.Thread(target=self._read, daemon=True).start()

    def _read(self):
        for line in self.process.stdout:
            self.lines.put(line)
        self.lines.put(None)

    def send(self, command):
        self.process.stdin.write((command if isinstance(command, str) else json.dumps(command)) + '\n')
        self.process.stdin.flush()

    def expect(self, predicate, timeout=5.0):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            try:
                line = self.lines.get(timeout=max(0.01, deadline - time.monotonic()))
            except queue.Empty:
                break
            if line is None:
                self.test.fail('helper closed stdout')
            message = check_message(self.test, line)
            self.seen.append(message)
            if predicate(message):
                return message
        self.test.fail('timed out waiting for a matching line')

    def health(self):
        self.send({'command': 'health'})
        return self.expect(lambda m: m['type'] == 'health')

    def close(self):
        if self.process.poll() is None:
            self.process.kill()
        self.process.wait()
        for stream in (self.process.stdin, self.process.stdout, self.process.stderr):
            if not stream.closed:
                stream.close()


class ObserverSession(unittest.TestCase):
    def test_full_session(self):
        s = Session(self)
        self.addCleanup(s.close)
        first = s.expect(lambda m: m['type'] == 'health')
        self.assertEqual(first['state'], 'paused', 'starts paused (G7)')
        self.assertEqual(first['pid'], s.process.pid, 'the disclaim re-exec keeps the PID')
        self.assertEqual(first['protocolVersion'], 1)
        self.assertEqual(s.health()['state'], 'paused')

        s.send({'command': 'policy', 'excludedBundleIds': ['com.example.secret'], 'excludedDomains': ['bank.example'],
                'captureTypedText': False, 'screenText': True})
        self.assertEqual(s.expect(lambda m: m['type'] == 'health')['state'], 'paused', 'a policy alone does not resume')
        s.send({'command': 'policy', 'excludedBundleIds': [], 'excludedDomains': [], 'captureTypedText': False, 'screenText': 1})
        self.assertEqual(s.expect(lambda m: m['type'] == 'protocol-error')['message'], 'Invalid policy')
        s.send({'command': 'menu', 'recentApplications': [
            {'name': 'Notes', 'bundleId': 'com.apple.Notes', 'isExcluded': False, 'domains': []}]})

        # pause and resume answer with a health line of their own.
        s.send({'command': 'resume'})
        self.assertEqual(s.expect(lambda m: m['type'] == 'health')['state'], 'running')
        s.send({'command': 'pause'})
        self.assertEqual(s.expect(lambda m: m['type'] == 'health')['state'], 'paused')

        s.send({'command': 'permissions', 'kind': 'observer'})
        sheet = s.expect(lambda m: m['type'] == 'health')
        self.assertIsInstance(sheet['permissionSheetVisible'], bool)
        if not sheet['accessibilityTrusted']:
            self.assertTrue(sheet['permissionSheetVisible'])
        s.send({'command': 'permissions', 'kind': 'messages'})
        action = s.expect(lambda m: m['type'] == 'menu-action')
        self.assertEqual((action['action'], action['completed']), ('messages-permissions', False))

        s.send({'command': 'invoke', 'id': 'inv-1', 'name': 'applications.list', 'payload': {}})
        apps = s.expect(lambda m: m['type'] == 'result' and m['id'] == 'inv-1', timeout=15)
        self.assertTrue(apps['ok'])
        self.assertTrue(apps['data'] and all(set(a) == {'name', 'bundleId'} for a in apps['data']))
        self.assertIn('com.apple.finder', {a['bundleId'] for a in apps['data']})
        s.send({'command': 'invoke', 'id': 'inv-2', 'name': 'discard-context-awareness-buffer', 'payload': {}})
        self.assertTrue(s.expect(lambda m: m['type'] == 'result' and m['id'] == 'inv-2')['ok'])
        s.send({'command': 'invoke', 'id': 'inv-3', 'name': 'imessage.list-chats', 'payload': {}})
        refused = s.expect(lambda m: m['type'] == 'result' and m['id'] == 'inv-3')
        self.assertEqual((refused['ok'], refused['error']['code']), (False, 'AUX_COMPUTER_USE_EXTERNAL_DATA_UNAVAILABLE'))
        s.send({'command': 'invoke', 'name': 'applications.list'})
        self.assertEqual(s.expect(lambda m: m['type'] == 'protocol-error')['message'], 'invoke requires id and name')
        s.send({'command': 'frob'})
        self.assertEqual(s.expect(lambda m: m['type'] == 'protocol-error')['message'], 'Unknown command: frob')
        s.send('not json')
        s.expect(lambda m: m['type'] == 'protocol-error')

        s.send({'command': 'shutdown'})
        self.assertEqual(s.expect(lambda m: m['type'] == 'health' and m['state'] == 'stopped')['state'], 'stopped')
        self.assertEqual(s.process.wait(timeout=5), 0)
        kinds = {m.get('event', {}).get('kind') for m in s.seen if m['type'] == 'event'}
        self.assertFalse({k for k in kinds if k and k.split('.')[0] in ('keyboard', 'mouse')})

    def test_stdin_eof_exits_cleanly(self):
        s = Session(self)
        self.addCleanup(s.close)
        s.expect(lambda m: m['type'] == 'health')
        s.process.stdin.close()
        s.expect(lambda m: m['type'] == 'health' and m['state'] == 'stopped')
        self.assertEqual(s.process.wait(timeout=5), 0)


def one_shot(*args):
    result = subprocess.run([str(HELPER), *args], capture_output=True, text=True, timeout=30)
    lines = [line for line in result.stdout.splitlines() if line.strip()]
    return result.returncode, json.loads(lines[-1])


class OneShot(unittest.TestCase):
    def test_permissions_check(self):
        status, envelope = one_shot('permissions.check', '--json', '{}')
        self.assertEqual(status, 0)
        self.assertTrue(envelope['ok'])
        data = envelope['data']
        for key in ('automation', 'contacts', 'fullDiskAccess', 'responsibleSelf', 'accessibility', 'screenRecording'):
            self.assertIsInstance(data[key], bool, key)
        self.assertEqual(data['inputMonitoring'], 'not-used')
        self.assertTrue(data['responsibleSelf'], 'the helper disclaims TCC responsibility')

    def test_applications_list(self):
        status, envelope = one_shot('applications.list')
        self.assertEqual(status, 0)
        names = [a['name'] for a in envelope['data']]
        self.assertTrue(names and all(set(a) == {'name', 'bundleId'} for a in envelope['data']))
        self.assertEqual(names, sorted(names, key=str.casefold))

    def test_usage_errors_exit_1(self):
        for args, message in [(('applications.list', '--json'), '--json requires a JSON object'),
                              (('applications.list', '--json', '[]'), '--json must be a JSON object'),
                              (('applications.list', '--frob'), 'Unknown argument: --frob'),
                              (('frob',), 'Unknown command: frob')]:
            status, envelope = one_shot(*args)
            self.assertEqual((status, envelope['ok'], envelope['error']['code'], envelope['error']['message']),
                             (1, False, 'usage', message))

    def test_external_data_refused(self):
        status, envelope = one_shot('imessage.send', '--json', '{"to":"x","text":"hi"}', '--no-dialog')
        self.assertEqual((status, envelope['error']['code']), (1, 'AUX_COMPUTER_USE_EXTERNAL_DATA_UNAVAILABLE'))


if __name__ == '__main__':
    print(f'helper: {HELPER}', file=sys.stderr)
    unittest.main()
