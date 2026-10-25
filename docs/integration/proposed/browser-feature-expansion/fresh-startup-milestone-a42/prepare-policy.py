"""Prepare new disposable roots and the fixed ordinary startup resource only."""
import json
from pathlib import Path
import tempfile


def prepare_policy(app):
    app = Path(app).resolve(strict=True)
    scope = Path(tempfile.mkdtemp(prefix='aux-fresh-browser-', dir='/private/tmp'))
    scope.chmod(0o700)
    home = scope / 'home'
    directories = [scope / 'control', scope / 'tasks', home, home / 'Library',
        home / 'Library/Application Support', home / 'Library/Caches',
        home / 'Library/Application Support/Aux', home / 'Library/Caches/Aux',
        home / 'Downloads']
    for path in directories:
        path.mkdir(mode=0o700)
    policy = dict(format='aux.fresh.bootstrap.policy.v8', role='daemon',
        canonicalPrivateParent=str(scope / 'control'),
        canonicalTaskParent=str(scope / 'tasks'),
        accessGroup='9F2JXY8TCK.dev.aux.local',
        authoritySelection='aux.fresh.authority.host-availability.v1',
        nativeHostLayout='embedded-daemon', taskLayout='aux.native.task-control-split.v1',
        browserStartup=dict(format='aux.browser.ordinary-root-lease.v1',
            dataRoot=str(home / 'Library/Application Support/Aux'),
            cacheRoot=str(home / 'Library/Caches/Aux')))
    resource = app / 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/AuxFreshBootstrapPolicy.json'
    with resource.open('x') as output:
        output.write(json.dumps(policy, indent=2, sort_keys=True) + '\n')
    resource.chmod(0o644)
    return dict(scope=str(scope), home=str(home), policy=policy,
                resource=str(resource), installationCreated=False,
                keychainAccessed=False, signed=False)
