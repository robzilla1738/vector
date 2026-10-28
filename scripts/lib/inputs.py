"""Python side of scripts/lib/inputs.json: a missing input is an error, never a skip."""
import json, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INPUTS = json.loads(Path(__file__).with_name('inputs.json').read_text())


def require_input(name):
    spec = INPUTS[name]
    path = Path(next((os.environ[k] for k in spec.get('env', []) if os.environ.get(k)), ROOT/spec['path']))
    if not path.exists():
        raise FileNotFoundError(f'Required input "{name}" is missing at {path}. '
                                f'Restore out/ from docs/backup/2026-10-27.md ({spec["backup"]}).')
    return path
