"""Location of the isolated native Chromium tree used for Aux builds."""
import os
from pathlib import Path

DURABLE_SRC = Path('/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src')
LEGACY_TMP_SRC = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')


def chromium_src():
    override = os.environ.get('AUX_CHROMIUM_SRC')
    return Path(override).resolve() if override else DURABLE_SRC


def permitted_roots():
    return {chromium_src(), DURABLE_SRC, LEGACY_TMP_SRC}
