#!/usr/bin/env python3
"""Rebuild the agent runtime's PDF tools (poppler and its 33 libraries) for macOS 15.

    build-pdf-runtime.py [--jobs N] [--from PACKAGE] [--clean] [--write-manifest]

The supplied runtime copies Homebrew bottles that declare minos 26.0. This builds the same
upstream releases from sha256-pinned tarballs (pdf-runtime-macos15.json) for arm64 with
MACOSX_DEPLOYMENT_TARGET=15.0, then gives the 34 shipped files the supplied install names
(@loader_path/<name>, tools at @loader_path/../lib/<name>), LC_RPATHs and file names, and
signs them ad hoc. Release assembly re-signs them (assemble.py --runtime).

Everything lands in out/runtime/pdf-macos15: sources/ (verified tarballs), tools/ (meson and
ninja in a venv), src/, prefix/ and native/{bin,lib} (the 34 files). Nothing is installed
system-wide. --write-manifest records the built files' sha256 in the manifest; assembly only
accepts files that match it.
"""
import argparse
import json
import os
import shutil
import sys
from pathlib import Path

from runtime_common import extract, fetch, output, run, sha256

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
MANIFEST = HERE / 'pdf-runtime-macos15.json'
OUT = REPO / 'out/runtime/pdf-macos15'
PREFIX, SOURCES, SRC, TOOLS, DIST = (OUT / d for d in ('prefix', 'sources', 'src', 'tools', 'native'))
SYSTEM = ('/usr/lib/', '/System/Library/')


def environment(sdk: str, jobs: int) -> dict:
    flags = '-O2 -arch arm64 -mmacosx-version-min=15.0'
    return {
        'PATH': f'{TOOLS}/bin:{PREFIX}/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        'HOME': os.environ['HOME'], 'TMPDIR': os.environ.get('TMPDIR', '/tmp'), 'LANG': 'C',
        'MACOSX_DEPLOYMENT_TARGET': '15.0', 'SDKROOT': sdk,
        'CC': '/usr/bin/clang', 'CXX': '/usr/bin/clang++', 'OBJC': '/usr/bin/clang',
        'CFLAGS': flags, 'CXXFLAGS': flags, 'OBJCFLAGS': flags, 'CPPFLAGS': f'-I{PREFIX}/include',
        'LDFLAGS': f'-L{PREFIX}/lib -arch arm64 -mmacosx-version-min=15.0 -Wl,-headerpad_max_install_names',
        'PKG_CONFIG': f'{TOOLS}/bin/pkg-config',
        'PKG_CONFIG_LIBDIR': f'{PREFIX}/lib/pkgconfig:{PREFIX}/share/pkgconfig:{OUT}/sdk-pc',
        'MAKEFLAGS': f'-j{jobs}',
    }


def prepare_tools(sdk: str, tools: dict):
    """meson and ninja in a private venv; cmake, pkg-config and the gettext tools (glib's catalogs
    only) linked from Homebrew; .pc files for
    the SDK libraries (zlib, bzip2, expat, libffi, libcurl) so nothing resolves to Homebrew."""
    if not (TOOLS / 'bin/meson').exists():
        run([sys.executable, '-m', 'venv', TOOLS])
    run([TOOLS / 'bin/pip', 'install', '-q', *(f'{k}=={v}' for k, v in tools.items())])
    for name, formula in (('cmake', 'cmake'), ('pkg-config', 'pkgconf'), ('xgettext', 'gettext'),
                          ('msgfmt', 'gettext'), ('msgmerge', 'gettext')):
        found = shutil.which(name, path='/opt/homebrew/bin:/usr/local/bin')
        if not found:
            raise SystemExit(f'{name} is missing: brew install {formula}')
        link = TOOLS / 'bin' / name
        link.unlink(missing_ok=True)
        link.symlink_to(found)
    pcs = OUT / 'sdk-pc'
    pcs.mkdir(parents=True, exist_ok=True)
    include = f'{sdk}/usr/include'
    system = {'zlib': ('1.2.12', '-lz', ''), 'bzip2': ('1.0.8', '-lbz2', ''),
              'expat': ('2.7.4', '-lexpat', ''), 'libffi': ('3.4.0', '-lffi', f'-I{include}/ffi'),
              'libcurl': ('8.7.1', '-lcurl', '')}
    for name, (version, libs, cflags) in system.items():
        (pcs / f'{name}.pc').write_text(f'Name: {name}\nDescription: macOS SDK {name}\nVersion: {version}\n'
                                        f'Libs: {libs}\nCflags: {cflags}\n')


def cmake(src: Path, env: dict, sdk: str, *options, subdir: str = ''):
    build = src / '_build'
    run(['cmake', '-S', src / subdir, '-B', build, '-G', 'Ninja', f'-DCMAKE_MAKE_PROGRAM={TOOLS}/bin/ninja',
         '-DCMAKE_BUILD_TYPE=Release', f'-DCMAKE_INSTALL_PREFIX={PREFIX}', '-DCMAKE_INSTALL_LIBDIR=lib',
         f'-DCMAKE_INSTALL_NAME_DIR={PREFIX}/lib', '-DCMAKE_OSX_DEPLOYMENT_TARGET=15.0',
         '-DCMAKE_OSX_ARCHITECTURES=arm64', f'-DCMAKE_OSX_SYSROOT={sdk}', f'-DCMAKE_PREFIX_PATH={PREFIX}',
         '-DCMAKE_IGNORE_PREFIX_PATH=/opt/homebrew;/usr/local', '-DCMAKE_FIND_FRAMEWORK=LAST',
         '-DCMAKE_POLICY_VERSION_MINIMUM=3.5', '-DBUILD_SHARED_LIBS=ON', '-DBUILD_TESTING=OFF', *options],
        env=env)
    run(['cmake', '--build', build], env=env)
    run(['cmake', '--install', build], env=env)


def meson(src: Path, env: dict, *options):
    build = src / '_build'
    run([TOOLS / 'bin/meson', 'setup', build, src, f'--prefix={PREFIX}', '--libdir=lib',
         '--buildtype=release', '-Ddefault_library=shared', '--wrap-mode=nofallback', *options], env=env)
    run([TOOLS / 'bin/meson', 'compile', '-C', build], env=env)
    run([TOOLS / 'bin/meson', 'install', '-C', build], env=env)


def configure(src: Path, env: dict, *options, make: tuple = ()):
    run([src / 'configure', f'--prefix={PREFIX}', '--disable-static', '--disable-dependency-tracking', *options],
        cwd=src, env=env)
    run(['make', *make], cwd=src, env=env)
    run(['make', 'install'], cwd=src, env=env)


def absolute_ids(names, directory: Path):
    """NSPR and NSS name themselves @executable_path/...; point them at the prefix while building."""
    for name in names:
        path = directory / name
        changes = ['-id', path]
        for line in output('otool', '-L', path).splitlines()[2:]:
            dependency = line.split(' (')[0].strip()
            if dependency.startswith('@executable_path/'):
                changes += ['-change', dependency, directory / dependency.split('/')[-1]]
        run(['install_name_tool', *changes, path])


def build_nss(src: Path, env: dict):
    nss = src / 'nss'
    make = ['make', '-j1', 'BUILD_OPT=1', 'USE_64=1', 'NSS_USE_SYSTEM_SQLITE=1', 'NSS_DISABLE_GTESTS=1',
            'NSS_ENABLE_WERROR=0', f'NSPR_INCLUDE_DIR={PREFIX}/include/nspr', f'NSPR_LIB_DIR={PREFIX}/lib',
            'CC=/usr/bin/clang', 'CCC=/usr/bin/clang++']
    run(['make', '-j1', '-C', 'coreconf/nsinstall', *make[2:]], cwd=nss, env=env)
    run([*make, 'all'], cwd=nss, env=env)
    (objdir,) = (src / 'dist').glob('Darwin*OPT.OBJ')
    libs = sorted(p.name for p in (objdir / 'lib').glob('*.dylib'))
    for name in libs:
        shutil.copy2(objdir / 'lib' / name, PREFIX / 'lib' / name)
    absolute_ids(libs, PREFIX / 'lib')
    shutil.copytree(src / 'dist/public/nss', PREFIX / 'include/nss', dirs_exist_ok=True)
    version = output('sed', '-n', 's/^#define NSS_VERSION "\\([0-9.]*\\).*/\\1/p', nss / 'lib/nss/nss.h').strip()
    (PREFIX / 'lib/pkgconfig/nss.pc').write_text(
        f'prefix={PREFIX}\nName: NSS\nDescription: Network Security Services\nVersion: {version}\n'
        f'Requires: nspr\nLibs: -L{PREFIX}/lib -lssl3 -lsmime3 -lnss3 -lnssutil3\nCflags: -I{PREFIX}/include/nss\n')


def recipes(env: dict, sdk: str) -> dict:
    off = lambda *names: [f'-D{n}=OFF' for n in names]
    return {
        'zstd': lambda s: cmake(s, env, sdk, '-DZSTD_BUILD_STATIC=OFF', *off(
            'ZSTD_BUILD_PROGRAMS', 'ZSTD_BUILD_TESTS', 'ZSTD_LZMA_SUPPORT', 'ZSTD_ZLIB_SUPPORT',
            'ZSTD_LZ4_SUPPORT'), subdir='build/cmake'),
        'xz': lambda s: configure(s, env, '--disable-nls', '--disable-doc', '--disable-xz', '--disable-xzdec',
                                  '--disable-lzmadec', '--disable-lzmainfo', '--disable-scripts',
                                  '--disable-lzma-links'),
        'brotli': lambda s: cmake(s, env, sdk, *off('BROTLI_BUILD_TOOLS')),
        'libpng': lambda s: configure(s, env, '--disable-tools'),
        'freetype': lambda s: configure(s, env, '--with-harfbuzz=no', '--with-png=yes', '--with-brotli=yes',
                                        '--with-bzip2=yes', '--with-zlib=yes'),
        'gettext': lambda s: configure(s / 'gettext-runtime', env, '--with-included-gettext', '--disable-java',
                                       '--disable-csharp', '--disable-libasprintf', '--disable-c++',
                                       '--disable-openmp', '--without-emacs', '--without-git',
                                       # macOS's iconv fails gettext's probe; the supplied libintl uses it.
                                       'am_cv_func_iconv_works=yes'),
        'pcre2': lambda s: configure(s, env, '--enable-jit', '--enable-unicode'),
        'glib': lambda s: meson(s, env, '-Dintrospection=disabled', '-Dtests=false', '-Dman-pages=disabled',
                                '-Ddocumentation=false', '-Dnls=enabled', '-Dsysprof=disabled',
                                '-Ddtrace=disabled', '-Dsystemtap=disabled', '-Dlibelf=disabled'),
        'graphite2': lambda s: cmake(s, env, sdk),
        'harfbuzz': lambda s: meson(s, env, '-Dcoretext=enabled', '-Dfreetype=enabled', '-Dglib=enabled',
                                    '-Dgraphite2=enabled', '-Dgobject=disabled', '-Dicu=disabled',
                                    '-Dcairo=disabled', '-Dchafa=disabled', '-Dintrospection=disabled',
                                    '-Dtests=disabled', '-Ddocs=disabled', '-Dutilities=disabled'),
        # The supplied library reads the same configuration and cache paths as Homebrew's.
        'fontconfig': lambda s: meson(s, env, '--sysconfdir=/opt/homebrew/etc', '--localstatedir=/opt/homebrew/var',
                                      '-Ddoc=disabled', '-Dtests=disabled', '-Dtools=disabled',
                                      '-Dcache-build=disabled', '-Dnls=enabled', '-Dxml-backend=expat',
                                      '-Ddefault-fonts-dirs=/System/Library/Fonts,/Library/Fonts,~/Library/Fonts'),
        'libjpeg-turbo': lambda s: cmake(s, env, sdk, '-DWITH_JPEG8=ON', '-DENABLE_STATIC=OFF',
                                         '-DWITH_TURBOJPEG=OFF'),
        'openjpeg': lambda s: cmake(s, env, sdk, *off('BUILD_CODEC', 'BUILD_STATIC_LIBS')),
        'lcms2': lambda s: configure(s, env, '--without-jpeg', '--without-tiff'),
        'libwebp': lambda s: cmake(s, env, sdk, *off(
            'WEBP_BUILD_ANIM_UTILS', 'WEBP_BUILD_CWEBP', 'WEBP_BUILD_DWEBP', 'WEBP_BUILD_GIF2WEBP',
            'WEBP_BUILD_IMG2WEBP', 'WEBP_BUILD_VWEBP', 'WEBP_BUILD_WEBPINFO', 'WEBP_BUILD_WEBPMUX',
            'WEBP_BUILD_EXTRAS')),
        'libtiff': lambda s: configure(s, env, '--enable-jpeg', '--enable-lzma', '--enable-zstd',
                                       '--enable-webp', '--disable-jbig', '--disable-lerc', '--disable-libdeflate',
                                       '--disable-cxx', '--disable-tools', '--disable-tests', '--disable-docs',
                                       '--disable-contrib', '--without-x'),
        'nspr': lambda s: (configure(s / 'nspr', env, '--enable-64bit', '--enable-optimize', '--disable-debug',
                                     '--with-pthreads', '--enable-ipv6', '--enable-macos-target=15.0',
                                     # NSPR records its build time; pin it so rebuilds are byte-identical.
                                     make=('SH_DATE=2026-10-01 00:00:00', 'SH_NOW=1790812800000000')),
                           absolute_ids(['libnspr4.dylib', 'libplc4.dylib', 'libplds4.dylib'], PREFIX / 'lib')),
        'nss': lambda s: build_nss(s, env),
        'libgpg-error': lambda s: configure(s, env, '--disable-doc', '--disable-tests',
                                            '--enable-install-gpg-error-config'),
        'libassuan': lambda s: configure(s, env, f'--with-libgpg-error-prefix={PREFIX}', '--disable-doc'),
        'gpgme': lambda s: configure(s, env, f'--with-libgpg-error-prefix={PREFIX}',
                                     f'--with-libassuan-prefix={PREFIX}', '--disable-gpg-test',
                                     '--disable-gpgsm-test', '--disable-gpgconf-test', '--disable-g13-test'),
        'gpgmepp': lambda s: cmake(s, env, sdk),
        'poppler': lambda s: cmake(s, env, sdk, '-DENABLE_UNSTABLE_API_ABI_HEADERS=OFF', '-DENABLE_UTILS=ON',
                                   '-DENABLE_CPP=OFF', '-DENABLE_GLIB=OFF', '-DENABLE_QT5=OFF', '-DENABLE_QT6=OFF',
                                   '-DENABLE_BOOST=OFF', '-DENABLE_GOBJECT_INTROSPECTION=OFF',
                                   '-DENABLE_LIBCURL=ON', '-DENABLE_NSS3=ON', '-DENABLE_GPGME=ON',
                                   '-DENABLE_LIBTIFF=ON', '-DENABLE_LCMS=ON', '-DENABLE_DCTDECODER=libjpeg',
                                   '-DENABLE_LIBOPENJPEG=openjpeg2', '-DWITH_Cairo=OFF', '-DWITH_NSS3=ON',
                                   '-DBUILD_GTK_TESTS=OFF', '-DBUILD_QT5_TESTS=OFF', '-DBUILD_QT6_TESTS=OFF',
                                   '-DBUILD_CPP_TESTS=OFF', '-DBUILD_MANUAL_TESTS=OFF',
                                   '-DRUN_GPERF_IF_PRESENT=OFF'),
    }


def relocate(files: dict) -> list:
    """Copy the 34 shipped files out of the prefix and give them the supplied load commands."""
    names = {Path(rel).name for rel in files}
    shutil.rmtree(DIST, ignore_errors=True)
    problems = []
    for rel, spec in files.items():
        name, tool = Path(rel).name, rel.startswith('native/bin/')
        source = (PREFIX / ('bin' if tool else 'lib') / name).resolve()
        target = OUT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        target.chmod(0o755 if tool else 0o644)
        lines = output('otool', '-L', target).splitlines()[1:]
        changes = []
        if not tool:
            changes += ['-id', f'@loader_path/{name}']
            lines = lines[1:]
        for line in lines:
            dependency = line.split(' (')[0].strip()
            if dependency.startswith(SYSTEM):
                continue
            peer = dependency.split('/')[-1]
            if peer not in names:
                problems.append(f'{rel} links {dependency}, which the runtime does not ship')
            changes += ['-change', dependency, f'@loader_path/{"../lib/" if tool else ""}{peer}']
        load = output('otool', '-l', target).splitlines()
        for i, line in enumerate(load):
            if 'LC_RPATH' in line:
                changes += ['-delete_rpath', load[i + 2].split()[1]]
        for rpath in spec['rpaths']:
            changes += ['-add_rpath', rpath]
        run(['install_name_tool', *changes, target])
        run(['codesign', '--force', '--sign', '-', target])
    return problems


def verify(files: dict) -> list:
    problems = []
    for rel in files:
        path = OUT / rel
        build = output('vtool', '-show-build', path)
        if 'minos 15.0' not in build:
            problems.append(f'{rel}: {" ".join(build.split())}')
        if 'arm64' not in output('lipo', '-archs', path):
            problems.append(f'{rel}: not arm64')
        for line in output('otool', '-L', path).splitlines()[1:]:
            dependency = line.split(' (')[0].strip()
            if not dependency.startswith(('@loader_path/', *SYSTEM)):
                problems.append(f'{rel}: {dependency}')
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--jobs', type=int, default=os.cpu_count())
    parser.add_argument('--from', dest='start', help='rebuild from this package on (earlier ones are kept)')
    parser.add_argument('--clean', action='store_true', help='remove the prefix and sources first')
    parser.add_argument('--write-manifest', action='store_true', help='record the built files in the manifest')
    args = parser.parse_args()
    if os.uname().machine != 'arm64':
        raise SystemExit('build on an arm64 Mac')
    manifest = json.loads(MANIFEST.read_text())
    if args.clean:
        for directory in (PREFIX, SRC, DIST):
            shutil.rmtree(directory, ignore_errors=True)
    sdk = output('xcrun', '--show-sdk-path').strip()
    prepare_tools(sdk, manifest['tools'])
    env = environment(sdk, args.jobs)
    steps, stamps = recipes(env, sdk), OUT / 'stamps'
    stamps.mkdir(parents=True, exist_ok=True)
    names = [s['name'] for s in manifest['sources']]
    if set(names) != set(steps):
        raise SystemExit('manifest sources and recipes differ')
    if args.start:
        for name in names[names.index(args.start):]:
            (stamps / name).unlink(missing_ok=True)
    for source in manifest['sources']:
        stamp = stamps / source['name']
        if stamp.exists() and stamp.read_text() == source['sha256']:
            continue
        print(f"== {source['name']} {source['version']}", flush=True)
        steps[source['name']](extract(source, fetch(source, SOURCES), SRC))
        for la in (PREFIX / 'lib').glob('*.la'):
            la.unlink()
        stamp.write_text(source['sha256'])
    problems = relocate(manifest['files']) + verify(manifest['files'])
    if problems:
        raise SystemExit('\n'.join(problems))
    built = {rel: sha256(OUT / rel) for rel in manifest['files']}
    if args.write_manifest:
        for rel, digest in built.items():
            manifest['files'][rel]['sha256'] = digest
        MANIFEST.write_text(json.dumps(manifest, indent=1) + '\n')
    stale = [rel for rel, digest in built.items() if manifest['files'][rel]['sha256'] != digest]
    print(f'{len(built)} files in {DIST}, minos 15.0; '
          + (f'{len(stale)} differ from the manifest (rerun with --write-manifest)' if stale else 'manifest matches'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
