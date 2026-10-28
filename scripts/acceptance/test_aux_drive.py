"""aux_drive.py argument handling and safety, with every process lookup and side effect stubbed.

Nothing here launches, signals or scripts Aux: subprocess, os.kill and osascript are replaced.
"""
import importlib.util
import os
import subprocess
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

spec = importlib.util.spec_from_file_location('aux_drive', Path(__file__).with_name('aux_drive.py'))
drive = importlib.util.module_from_spec(spec)
spec.loader.exec_module(drive)


def forbidden(*args, **kwargs):
    raise AssertionError(f'unexpected side effect: {args}')


class AuxDriveTest(unittest.TestCase):
    def setUp(self):
        # Any real process, signal, AppleScript or file write fails the test.
        for target in ('subprocess.run', 'osa', 'os.kill', 'front'):
            patcher = mock.patch.object(drive.subprocess if target == 'subprocess.run' else drive.os if target == 'os.kill' else drive,
                                        target.split('.')[-1], side_effect=forbidden)
            patcher.start()
            self.addCleanup(patcher.stop)

    def test_usage_errors_exit_before_any_side_effect(self):
        for args in (['nope'], ['key'], ['combo', 't'], ['combo', 't', 'hyper'], ['code', 'x'], ['click', '1'],
                     ['drag', '1', '2', '3'], ['menu', 'File'], ['menu', 'File>'], ['open'], ['shot'],
                     ['shot', '../escape'], ['record', 'R01', 'maybe', 'note'], ['record', 'R01', 'accepted'],
                     ['launch', 'extra'], ['abort', 'now']):
            with self.subTest(args=args), self.assertRaises(SystemExit):
                drive.main(args)

    def test_valid_command_lines_parse(self):
        self.assertEqual(drive.parse([]), ('check', []))
        self.assertEqual(drive.parse(['combo', 't', 'cmd,shift']), ('combo', ['t', 'cmd,shift']))
        self.assertEqual(drive.parse(['record', 'R01', 'defect', 'note', 'a.png', 'b.png'])[1][3:], ['a.png', 'b.png'])
        self.assertEqual(drive.parse(['menu', 'Tab>New Tab']), ('menu', ['Tab>New Tab']))

    def test_abort_and_quit_with_nothing_running_refuse_without_signals(self):
        with mock.patch.object(drive, 'pids', return_value=(None, None)):
            for command in ('abort', 'quit'):
                with self.subTest(command=command), self.assertRaises(SystemExit) as raised:
                    drive.main([command])
                self.assertIn('not running', str(raised.exception))
        drive.os.kill.assert_not_called()

    def test_abort_without_a_daemon_signals_only_the_browser(self):
        with mock.patch.object(drive, 'pids', return_value=(4242, None)), \
             mock.patch.object(drive.os, 'kill') as kill, mock.patch('builtins.print'):
            drive.main(['abort'])
        kill.assert_called_once_with(4242, drive.signal.SIGABRT)

    def test_process_lookup_matches_only_this_candidate(self):
        app = str(drive.APP)
        table = '\n'.join([
            f'  10     1 {app}/Contents/MacOS/Aux',
            f'  11    10 {app}/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon',
            '  12     1 /Applications/Aside.app/Contents/MacOS/Aside',
            '  13     1 /other/Aux Daemon.app/Contents/MacOS/aux-daemon',
            '  14     1',
        ])
        with mock.patch.object(drive.subprocess, 'run', return_value=SimpleNamespace(stdout=table)):
            self.assertEqual(drive.pids(), (10, 11))
        with mock.patch.object(drive.subprocess, 'run', return_value=SimpleNamespace(stdout='  12     1 /Applications/Aside.app/Contents/MacOS/Aside')):
            self.assertEqual(drive.pids(), (None, None))

    def test_combo_maps_cmd_to_the_applescript_modifier(self):
        with mock.patch.object(drive, 'front'), mock.patch.object(drive, 'osa') as osa:
            drive.main(['combo', 't', 'cmd,shift'])
        self.assertIn('using {command down, shift down}', osa.call_args.args[0])


if __name__ == '__main__':
    unittest.main()
