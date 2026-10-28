#!/usr/bin/env python3
"""Drive the Aux candidate for the desktop acceptance pass.

Needs Accessibility (macOS 27: Device Control and Data Access; keys, clicks, menus) and Screen Recording (shots) for the
process running it, plus Automation for AppleScript URL/tab commands. Uses the
candidate's own launcher and its disposable completion namespace only.

  aux_drive.py check                     report which permissions work
  aux_drive.py launch | quit | abort     lifecycle (abort = SIGABRT to the browser)
  aux_drive.py key "text" | combo t cmd,shift | code 53
  aux_drive.py menu "Tab>New Tab"        click a menu-bar item by path
  aux_drive.py click X Y | drag X1 Y1 X2 Y2   screen points
  aux_drive.py open URL                  navigate the front tab (AppleScript)
  aux_drive.py shot NAME                 screenshot, scaled to 1440 wide, path printed
  aux_drive.py record ID accepted|defect|external "note" [shot...]
"""
import json, os, signal, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT/'out/provided-candidate-completion-20261026-a1'
# AUX_DRIVE_APP selects another build, such as a release assembly, launched the same way.
APP = Path(os.environ['AUX_DRIVE_APP']).resolve() if os.environ.get('AUX_DRIVE_APP') else CANDIDATE/'Aux.app'
BUNDLE = 'dev.aux.browser'
RUN = ROOT/'out/acceptance'/time.strftime('%Y%m%d')
PROCESS = f'(first process whose bundle identifier is "{BUNDLE}")'
# Required argument count per command (record takes extra evidence paths).
ARITY = {'check': 0, 'launch': 0, 'quit': 0, 'abort': 0, 'key': 1, 'combo': 2, 'code': 1, 'menu': 1,
         'click': 2, 'drag': 4, 'open': 1, 'shot': 1, 'record': 3}
OUTCOMES = ('accepted', 'defect', 'external')


def parse(args):
    """Validate the whole command line before anything runs; usage errors exit without side effects."""
    cmd, rest = (args[0], args[1:]) if args else ('check', [])
    if cmd not in ARITY or len(rest) < ARITY[cmd] or (cmd != 'record' and len(rest) > ARITY[cmd]):
        raise SystemExit(__doc__)
    if cmd in ('code', 'click', 'drag') and not all(value.lstrip('-').isdigit() for value in rest):
        raise SystemExit(f'{cmd} takes integers')
    if cmd == 'combo' and not set(rest[1].split(',')) <= {'command', 'cmd', 'shift', 'option', 'control'}:
        raise SystemExit('combo modifiers: command, shift, option, control')
    if cmd == 'menu' and (len(rest[0].split('>')) < 2 or '' in rest[0].split('>')):
        raise SystemExit('menu takes a path like "Tab>New Tab"')
    if cmd in ('shot', 'record') and (not rest[0] or '/' in rest[0] or rest[0].startswith('.')):
        raise SystemExit(f'{cmd} name must be a plain file name')
    if cmd == 'record' and rest[1] not in OUTCOMES:
        raise SystemExit('record outcome: ' + '|'.join(OUTCOMES))
    return cmd, rest


def osa(script, timeout=15):
    done = subprocess.run(['osascript', '-e', script], capture_output=True, text=True, timeout=timeout)
    if done.returncode:
        raise SystemExit(done.stderr.strip())
    return done.stdout.strip()


def front():
    osa(f'tell application "System Events" to set frontmost of {PROCESS} to true')
    time.sleep(0.3)


def pids():
    out = subprocess.run(['ps', '-axo', 'pid=,ppid=,comm='], capture_output=True, text=True).stdout
    browser = daemon = None
    for line in out.splitlines():
        fields = line.split(None, 2)
        if len(fields) != 3:
            continue
        pid, ppid, comm = fields
        if comm == str(APP/'Contents/MacOS/Aux'):
            browser = int(pid)
        elif comm.endswith('Aux Daemon.app/Contents/MacOS/aux-daemon') and comm.startswith(str(APP)):
            daemon = int(pid)
    return browser, daemon


def listening():
    return subprocess.run(['lsof', '-nP', '-iTCP:21520', '-sTCP:LISTEN'], capture_output=True).returncode == 0


def running():
    """The browser and daemon PIDs; refuses (exits) when the candidate browser is not running."""
    browser, daemon = pids()
    if browser is None:
        raise SystemExit('Aux is not running; nothing to do')
    return browser, daemon


def main(args):
    cmd, rest = parse(args)
    args = [cmd, *rest]
    if cmd == 'check':
        # An Apple Event to a stopped app launches it without the launcher's
        # --use-mock-keychain, so automation is checked only against a running Aux.
        aux_running = subprocess.run(['pgrep', '-f', f'{APP}/Contents/MacOS/Aux'], capture_output=True).returncode == 0
        checks = [('accessibility', 'tell application "System Events" to key code 63')]
        if aux_running:
            checks.append(('automation', f'tell application "{APP}" to count windows'))
        else:
            print('automation not checked: start Aux with `launch` first')
        for label, script in checks:
            try:
                osa(script, timeout=8); print(label, 'ok')
            except (SystemExit, subprocess.TimeoutExpired) as error:
                print(label, 'refused:', error)
        shot = Path('/tmp')/f'aux-drive-check-{os.getpid()}.png'
        ok = subprocess.run(['screencapture', '-x', str(shot)]).returncode == 0 and shot.exists()
        print('screen recording', 'ok' if ok else 'refused'); shot.unlink(missing_ok=True)
    elif cmd == 'launch':
        subprocess.run(['/usr/bin/open', '-n', '-a', str(APP), '--args', '--use-mock-keychain'], check=True)
        for second in range(60):
            if listening():
                print(f'daemon listening after {second}s'); break
            time.sleep(1)
        else:
            raise SystemExit('daemon did not start; check for a stale daemon or a refused launch')
    elif cmd == 'quit':
        browser, daemon = running(); start = time.time()
        osa(f'tell application "{APP}" to quit')
        while any(p and subprocess.run(['ps', '-p', str(p)], capture_output=True).returncode == 0 for p in (browser, daemon)):
            if time.time() - start > 60:
                raise SystemExit('still running 60 s after Quit')
            time.sleep(0.5)
        print(f'quit settled in {time.time() - start:.1f}s')
    elif cmd == 'abort':
        browser, daemon = running(); start = time.time()
        os.kill(browser, signal.SIGABRT)
        while daemon and subprocess.run(['ps', '-p', str(daemon)], capture_output=True).returncode == 0:
            if time.time() - start > 60:
                raise SystemExit('daemon still running 60 s after abort')
            time.sleep(0.5)
        print(f'daemon exited {time.time() - start:.1f}s after abort' if daemon else 'aborted; no daemon was running')
    elif cmd == 'key':
        front(); osa(f'tell application "System Events" to keystroke {json.dumps(args[1])}')
    elif cmd == 'combo':
        mods = ', '.join(f'{"command" if m == "cmd" else m} down' for m in args[2].split(','))
        front(); osa(f'tell application "System Events" to keystroke {json.dumps(args[1])} using {{{mods}}}')
    elif cmd == 'code':
        front(); osa(f'tell application "System Events" to key code {int(args[1])}')
    elif cmd == 'menu':
        parts = args[1].split('>')
        target = f'menu item {json.dumps(parts[-1])} of menu {json.dumps(parts[-2])}'
        for name in reversed(parts[:-2]):
            target += f' of menu item {json.dumps(name)} of menu {json.dumps(name)}'
        front(); osa(f'tell application "System Events" to tell {PROCESS} to click {target} of menu bar item {json.dumps(parts[0])} of menu bar 1')
    elif cmd == 'click':
        front(); osa(f'tell application "System Events" to click at {{{int(args[1])}, {int(args[2])}}}')
    elif cmd == 'drag':
        # System Events has no drag; use a CoreGraphics event sequence via Swift.
        x1, y1, x2, y2 = map(int, args[1:5]); front()
        swift = f'''import CoreGraphics; import Foundation
func post(_ t: CGEventType, _ x: Int, _ y: Int) {{ CGEvent(mouseEventSource: nil, mouseType: t, mouseCursorPosition: CGPoint(x: x, y: y), mouseButton: .left)!.post(tap: .cghidEventTap); usleep(40000) }}
post(.leftMouseDown, {x1}, {y1}); for i in 1...20 {{ post(.leftMouseDragged, {x1} + ({x2}-{x1})*i/20, {y1} + ({y2}-{y1})*i/20) }}; post(.leftMouseUp, {x2}, {y2})'''
        subprocess.run(['swift', '-e', swift], check=True)
    elif cmd == 'open':
        front(); osa(f'tell application "{APP}" to set URL of active tab of front window to {json.dumps(args[1])}')
    elif cmd == 'shot':
        RUN.mkdir(parents=True, exist_ok=True)
        full, small = RUN/f'{args[1]}-full.png', RUN/f'{args[1]}.png'
        subprocess.run(['screencapture', '-x', str(full)], check=True)
        subprocess.run(['sips', '-Z', '1440', str(full), '--out', str(small)], capture_output=True, check=True)
        print(small)
    elif cmd == 'record':
        RUN.mkdir(parents=True, exist_ok=True)
        results = RUN/'results.json'
        data = json.loads(results.read_text()) if results.exists() else {'seal': None, 'results': {}}
        data['results'][args[1]] = {'outcome': args[2], 'note': args[3], 'evidence': args[4:], 'at': time.strftime('%Y-%m-%dT%H:%M:%S')}
        results.write_text(json.dumps(data, indent=1) + '\n'); print(f'{args[1]}: {args[2]}')


if __name__ == '__main__':
    main(sys.argv[1:])
