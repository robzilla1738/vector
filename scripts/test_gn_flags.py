import re
import unittest
from pathlib import Path

CHROMIUM = Path(__file__).resolve().parents[1] / 'chromium'
SHARED = ('is_debug', 'is_component_build', 'dcheck_always_on', 'target_cpu', 'proprietary_codecs',
          'ffmpeg_branding', 'enable_widevine', 'enable_aux_browser')


def args(name):
    text = (CHROMIUM / name).read_text()
    if 'import(' in text:
        raise AssertionError(f'{name}: GN resolves args-file imports from the build directory; inline them')
    return dict(re.findall(r'^(\w+) = (.+)$', text, re.M))


class GnFlags(unittest.TestCase):
    def test_official_variants_match_the_local_browser(self):
        local = args('flags.aux.gn')
        for name in ('flags.fast.gn', 'flags.release.gn'):
            official = args(name)
            self.assertEqual({k: official[k] for k in SHARED}, {k: local[k] for k in SHARED}, name)
            self.assertEqual(official['is_official_build'], 'true', name)

    def test_release_ships_updates(self):
        release = args('flags.release.gn')
        self.assertEqual(release['enable_aux_sparkle'], 'true')
        self.assertEqual(release['aux_sparkle_feed_url'], '"https://getaux.co/updates/appcast.xml"')
        # Aux's own EdDSA key (Keychain account dev.aux.browser.sparkle); never another app's.
        self.assertEqual(release['aux_sparkle_public_ed_key'], '"UBNrxzKVI36ii/HG/gywivbitrC58MjsAsaa5HLC8Sk="')


if __name__ == '__main__':
    unittest.main()
