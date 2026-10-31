#!/usr/bin/env python3
"""Rebuild the rest of the agent runtime from upstream for macOS 15 (build-pdf-runtime.py covers poppler).

    build-runtime.py [--only GROUP ...] [--from SOURCE] [--clean] [--train-python] [--jobs N]
                     [--write-manifest] [--check]

Builds ripgrep, Node, CPython with Tcl/Tk, and the native parts of Pillow and lxml from the
sha256-pinned sources in runtime-macos15.json, for arm64 with MACOSX_DEPLOYMENT_TARGET=15.0. The
versions, module set and build options match what the supplied runtime carries; CPython follows
python-build-standalone's recipe, with its patches (the pbs source), Setup.local and per-object
flags (python-Setup.local, python-Makefile.extra). Nothing is installed system-wide.

Everything lands in out/runtime/macos15: sources/, tools/, src/, py/ (Python's dependencies and
install), pil/ and lxml/ (library prefixes), and tree/, which mirrors agent-runtime and holds only
the Mach-O files the manifest lists, with the supplied file names, install names, links and rpaths,
signed ad hoc. Everything else in the runtime stays as supplied. Release assembly re-signs the tree
with Aux's identity (assemble.py --runtime).

--write-manifest records the built hashes, plus the supplied files' hashes, load commands and
entitlements from --supplied; assembly accepts only matching files. --check overlays the tree on a
copy of the supplied runtime in out/runtime/macos15/check and exercises it.
"""
import argparse
import hashlib
import json
import lzma
import os
import plistlib
import re
import shutil
import struct
import subprocess
import sys
from pathlib import Path

from runtime_common import extract, fetch, output, run, sha256

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
MANIFEST = HERE / 'runtime-macos15.json'
PGO_PROFILE = HERE / 'python-pgo.profclangd.xz'
PDF_MANIFEST = HERE / 'pdf-runtime-macos15.json'
PDF_OUT = REPO / 'out/runtime/pdf-macos15'
OUT = REPO / 'out/runtime/macos15'
SOURCES, SRC, TOOLS, TREE, CHECK, STAMPS = (OUT / d for d in ('sources', 'src', 'tools', 'tree', 'check', 'stamps'))
PY, PIL, LXML = OUT / 'py', OUT / 'pil', OUT / 'lxml'
PY_DEPS, PY_INSTALL = PY / 'tools/deps', PY / 'install'
SUPPLIED = REPO / 'out/provided-candidate-completion-20261026-a1/Aux.app/Contents/Resources/aux/agent-runtime'
SYSTEM = ('/usr/lib/', '/System/Library/')
TARGET = '15.0'
ARCH = f'-arch arm64 -mmacosx-version-min={TARGET}'
SITE = 'python/venv/lib/python3.13/site-packages'
TRIPLE = 'aarch64-apple-darwin'
# Node hardens with these keys; get-task-allow is left out because notarization refuses it.
STATIC_IN_LXML = {'_libiconv', '_libiconv_open', '_libiconv_close', '_inflate', '_deflate', '_xmlParseMemory'}
DROPPED_ENTITLEMENTS = {'com.apple.security.get-task-allow'}
PYTHON_PATCHES = (
    'patch-macos-link-extension-modules-13.patch', 'patch-python-link-modules-3.11.patch',
    'patch-ctypes-callproc.patch', 'patch-tkinter-3.13.patch', 'patch-ctypes-static-binary.patch',
    'patch-pwd-remove-conditional.patch', 'patch-checksharedmods-disable.patch', 'patch-jit-cflags-313.patch',
    'patch-python-getpath-backport-3.13.patch', 'patch-python-getpath-library.patch',
    'patch-getpath-use-base_executable-for-executable_dir.patch',
)


def environment(sdk: str, jobs: int, prefix: Path | None = None, opt: str = '-O2', extra: str = '', **more) -> dict:
    """A clean build environment: Xcode's clang and tools only, nothing from Homebrew but what tools/ links."""
    flags = f'{opt} -fPIC {ARCH} -ffile-prefix-map={OUT}=/aux-runtime {extra}'.strip()
    include = f'-I{prefix}/include' if prefix else ''
    env = {
        'PATH': f'{TOOLS}/bin:{TOOLS}/rust/bin:{prefix or TOOLS}/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        'HOME': os.environ['HOME'], 'TMPDIR': os.environ.get('TMPDIR', '/tmp'), 'LANG': 'C', 'LC_ALL': 'C',
        'MACOSX_DEPLOYMENT_TARGET': TARGET, 'SDKROOT': sdk, 'CC': '/usr/bin/clang', 'CXX': '/usr/bin/clang++',
        'OBJC': '/usr/bin/clang', 'CFLAGS': flags, 'CXXFLAGS': flags, 'OBJCFLAGS': flags, 'CPPFLAGS': include,
        'LDFLAGS': f'{ARCH} -Wl,-headerpad_max_install_names', 'MAKEFLAGS': f'-j{jobs}',
        'PKG_CONFIG': f'{TOOLS}/bin/pkg-config',
        'PKG_CONFIG_LIBDIR': f'{prefix}/lib/pkgconfig:{prefix}/share/pkgconfig' if prefix else '',
        'CARGO_HOME': f'{OUT}/cargo',
    }
    if prefix:
        env['LDFLAGS'] += f' -L{prefix}/lib'
    return {**env, **more}


def prepare_tools(tools: dict):
    """meson, ninja and the Python build helpers in a private venv; cmake and pkg-config from Homebrew,
    and python3.14 for Node's configure, which refuses newer ones."""
    if not (TOOLS / 'bin/meson').exists():
        run([sys.executable, '-m', 'venv', TOOLS])
    pure = {k: v for k, v in tools.items() if k not in ('setuptools', 'pybind11')}
    run([TOOLS / 'bin/pip', 'install', '-q', *(f'{k}=={v}' for k, v in pure.items())])
    run([TOOLS / 'bin/pip', 'install', '-q', '--target', OUT / 'pybuild', '--upgrade',
         f"setuptools=={tools['setuptools']}", f"pybind11=={tools['pybind11']}"])
    for name, formula in (('cmake', 'cmake'), ('pkg-config', 'pkgconf'), ('python3.14', 'python@3.14')):
        found = shutil.which(name, path='/opt/homebrew/bin:/usr/local/bin')
        if not found:
            raise SystemExit(f'{name} is missing: brew install {formula}')
        link = TOOLS / 'bin' / name
        link.unlink(missing_ok=True)
        link.symlink_to(found)


def install_rust(src: Path, env: dict):
    run([src / 'install.sh', f'--prefix={TOOLS}/rust', '--disable-ldconfig', '--components=rustc,cargo,rust-std-aarch64-apple-darwin'],
        env=env)


def install_llvm(src: Path, env: dict):
    """CPython's JIT stencils need LLVM 18 by name; Xcode's clang is not used for them. Build tool only."""
    target = TOOLS / 'llvm18'
    shutil.rmtree(target, ignore_errors=True)
    src.rename(target)
    for name in ('clang', 'llvm-objdump', 'llvm-readobj'):
        link = TOOLS / 'bin' / f'{name}-18'
        link.unlink(missing_ok=True)
        link.symlink_to((target / 'bin' / name).resolve())


def build_rg(src: Path, env: dict):
    pcre2 = PDF_OUT / 'prefix/lib'
    if not (pcre2 / 'pkgconfig/libpcre2-8.pc').exists():
        raise SystemExit('rg links the rebuilt pcre2: run build-pdf-runtime.py first')
    remap = f'--remap-path-prefix={OUT}/cargo=/cargo --remap-path-prefix={src}=/ripgrep'
    run(['cargo', 'build', '--release', '--locked', '--features', 'pcre2'], cwd=src, env={
        **env, 'PKG_CONFIG_LIBDIR': f'{pcre2}/pkgconfig', 'PCRE2_SYS_STATIC': '0', 'RUSTFLAGS': remap,
        'GIT_CEILING_DIRECTORIES': str(OUT),  # rg stamps --version with any repository it finds.
        'CFLAGS': '', 'CXXFLAGS': '', 'LDFLAGS': ''})


def build_node(src: Path, env: dict):
    gypi = src / 'common.gypi'
    text = gypi.read_text()
    if text.count("'MACOSX_DEPLOYMENT_TARGET': '13.5'") != 1:
        raise SystemExit('common.gypi: deployment target line changed')
    gypi.write_text(text.replace("'MACOSX_DEPLOYMENT_TARGET': '13.5'", f"'MACOSX_DEPLOYMENT_TARGET': '{TARGET}'"))
    # Keep the build directory, and with it the owner's home, out of the binary.
    openssl = src / 'deps/openssl/openssl.gyp'
    openssl.write_text(openssl.read_text().replace('<(PRODUCT_DIR_ABS_CSTR)', '/aux-runtime/node'))
    env = {k: v for k, v in env.items() if k not in ('CFLAGS', 'CXXFLAGS', 'OBJCFLAGS', 'CPPFLAGS', 'LDFLAGS', 'MAKEFLAGS')}
    env['RUSTFLAGS'] = f'--remap-path-prefix={src}=/node --remap-path-prefix={OUT}/cargo=/cargo'
    run([TOOLS / 'bin/python3.14', 'configure', '--prefix=/', '--ninja',
         '--release-urlbase=https://nodejs.org/download/release/'], cwd=src, env=env)
    run(['ninja', '-C', 'out/Release', '-j', os.cpu_count() - 2, 'node'], cwd=src, env=env)


def configure(src: Path, env: dict, prefix, *options, destdir: Path | None = None, make: tuple = ()):
    run([src / 'configure', f'--prefix={prefix}', *options], cwd=src, env=env)
    run(['make', *make], cwd=src, env=env)
    run(['make', 'install', *([f'DESTDIR={destdir}'] if destdir else [])], cwd=src, env=env)


def configure_static(src: Path, env: dict, *options):
    configure(src, env, '/tools/deps', f'--build={TRIPLE}', f'--host={TRIPLE}', '--disable-shared', *options, destdir=PY)


def build_bzip2(src: Path, env: dict):
    run(['make', 'install', 'CC=/usr/bin/clang', f"CFLAGS={env['CFLAGS']}", f"LDFLAGS={env['LDFLAGS']}",
         f'PREFIX={PY_DEPS}'], cwd=src, env=env)


def build_libffi(src: Path, env: dict):
    """PBS keeps libffi's patches inline in its recipe; the new assembler needs its CFI fix."""
    recipe = (pbs_recipes() / 'build-libffi.sh').read_text()
    for patch in re.findall(r"^patch -p1 <<'EOF'\n(.*?)^EOF$", recipe, re.M | re.S):
        print('+ patch -p1', flush=True)
        subprocess.run(['patch', '-p1'], input=patch, text=True, cwd=src, env=env, check=True)
    configure_static(src, env)


def build_openssl(src: Path, env: dict):
    run(['/usr/bin/perl', 'Configure', '--prefix=/tools/deps', '--libdir=lib', 'darwin64-arm64-cc', 'no-legacy',
         'no-shared', 'no-tests', '--openssldir=/private/etc/ssl', f'-mmacosx-version-min={TARGET}'], cwd=src, env={
             k: v for k, v in env.items() if k not in ('CFLAGS', 'CXXFLAGS', 'CPPFLAGS', 'LDFLAGS')})
    # OpenSSL prints its build time; pin it so rebuilds are byte-identical.
    run(['make'], cwd=src, env={**env, 'SOURCE_DATE_EPOCH': '1790812800'})
    run(['make', 'install_sw', f'DESTDIR={PY}'], cwd=src, env=env)


def build_sqlite(src: Path, env: dict):
    defines = ' '.join(f'-DSQLITE_ENABLE_{n}' for n in (
        'DBSTAT_VTAB', 'FTS3', 'FTS3_PARENTHESIS', 'FTS4', 'FTS5', 'GEOPOLY', 'RTREE'))
    env = {**env, 'CFLAGS': f"{env['CFLAGS']} {defines}"}
    run([src / 'configure', f'--build={TRIPLE}', f'--host={TRIPLE}', '--prefix=/tools/deps', '--disable-shared'],
        cwd=src, env=env)
    run(['make', 'libsqlite3.a'], cwd=src, env=env)
    run(['make', 'install-lib', 'install-headers', 'install-pc', f'DESTDIR={PY}'], cwd=src, env=env)


def pbs_recipes() -> Path:
    return next((SRC / 'pbs').iterdir()) / 'cpython-unix'


def localize_deps():
    """Tcl and pkg-config files name /tools/deps, the prefix built into the binaries; point them here."""
    for path in [*PY_DEPS.glob('lib/*Config.sh'), *PY_DEPS.glob('lib/pkgconfig/*.pc')]:
        if not path.is_symlink():
            path.write_text(re.sub(r'(?<!/py)/tools/deps', str(PY_DEPS), path.read_text()))


def build_tcl(src: Path, env: dict):
    for pattern in ('sqlite*', 'tdbc*'):
        for package in (src / 'pkgs').glob(pattern):
            shutil.rmtree(package)
    unix = src / 'unix'
    run([unix / 'configure', '--prefix=/tools/deps', f'--build={TRIPLE}', f'--host={TRIPLE}', '--enable-shared',
         '--enable-threads', '--disable-zipfs'], cwd=unix, env=env)
    run(['make', 'DYLIB_INSTALL_DIR=@rpath'], cwd=unix, env=env)
    run(['make', 'install', 'install-private-headers', f'DESTDIR={PY}', 'DYLIB_INSTALL_DIR=@rpath'], cwd=unix, env=env)
    localize_deps()


def build_tk(src: Path, env: dict):
    shutil.rmtree(PY_DEPS / 'include/uuid', ignore_errors=True)  # shadows the SDK's; uuid is built next
    unix = src / 'unix'
    quiet = '-Wno-availability -Wno-deprecated-declarations -Wno-unknown-attributes -Wno-typedef-redefinition'
    env = {**env, 'CFLAGS': f"{env['CFLAGS']} {quiet}", 'OBJCFLAGS': f"{env['OBJCFLAGS']} {quiet}"}
    run([unix / 'configure', '--prefix=/tools/deps', f'--build={TRIPLE}', f'--host={TRIPLE}',
         f'--with-tcl={PY_DEPS}/lib', '--enable-shared', '--enable-threads', '--disable-zipfs', '--enable-aqua=yes',
         '--without-x'], cwd=unix, env=env)
    makefile = unix / 'Makefile'
    text = makefile.read_text().replace('all: binaries libraries', 'all: libraries').replace(
        'install-binaries: $(TK_STUB_LIB_FILE) $(TK_LIB_FILE) ${WISH_EXE}', 'install-binaries: $(TK_STUB_LIB_FILE) $(TK_LIB_FILE)')
    makefile.write_text(text)
    run(['make', 'DYLIB_INSTALL_DIR=@rpath'], cwd=unix, env=env)
    (unix / 'wish').touch()
    # Installing compiles the install root into tkPkgConfig; a neutral link keeps the owner's home out.
    root = Path('/tmp/aux-runtime-install')
    root.unlink(missing_ok=True)
    root.symlink_to(PY)
    run(['make', 'install', 'install-private-headers', f'DESTDIR={root}', 'DYLIB_INSTALL_DIR=@rpath'], cwd=unix, env=env)
    root.unlink()
    localize_deps()


def build_host_python(src: Path, env: dict) -> Path:
    """A plain build of the same source to freeze modules with: the bootstrap freezer can't link the
    test modules Setup.local compiles in, so PBS always supplies a host Python too."""
    host = PY / 'host'
    if not (host / 'bin/python3.13').exists():
        build = src.with_name('host')
        shutil.rmtree(build, ignore_errors=True)
        shutil.copytree(src, build)
        env = {**env, 'CFLAGS': '', 'CPPFLAGS': '', 'LDFLAGS': '', 'MAKEFLAGS': f'-j{os.cpu_count() - 2}'}
        configure(build, env, host, '--without-ensurepip', '--disable-test-modules')
    return host / 'bin/python3.13'


def build_python(src: Path, env: dict, train: bool):
    host = build_host_python(src, env)
    for patch in PYTHON_PATCHES:
        run(['patch', '-p1', '-i', pbs_recipes() / patch], cwd=src, env=env)
    shutil.copyfile(HERE / 'python-Setup.local', src / 'Modules/Setup.local')
    # The stamp sys.version shows; __DATE__ and __TIME__ would differ every build.
    info = src / 'Modules/getbuildinfo.c'
    info.write_text('#define DATE "Oct 30 2026"\n#define TIME "00:00:00"\n' + info.read_text())
    # Setup.local builds every module; configure must not offer its own copies.
    modules = sorted(set(re.findall(r'py_cv_module_(\w+?)=', (src / 'configure').read_text())) - {'$1'})
    flags = (f"{env['CFLAGS']} -I{PY_DEPS}/include -I{PY_DEPS}/include/uuid -Wno-nullability-completeness "
             '-Wno-expansion-to-defined -Wno-undef-prefix -Werror=unguarded-availability-new')
    env = {**env, 'CFLAGS': flags, 'CPPFLAGS': flags, 'CFLAGS_JIT': flags, 'MAKEFLAGS': '',
           'LDFLAGS': f'{ARCH} -L{PY_DEPS}/lib -Wl,-headerpad_max_install_names',
           'PKG_CONFIG': f'{TOOLS}/bin/pkg-config --static', 'PKG_CONFIG_LIBDIR': '',
           'PKG_CONFIG_PATH': f'{PY_DEPS}/lib/pkgconfig:{PY_DEPS}/share/pkgconfig',
           'LLVM_PROFDATA': output('xcrun', '-f', 'llvm-profdata').strip(), 'PROFILE_TASK': '-m test --pgo'}
    run([src / 'configure', f'--build={TRIPLE}', f'--host={TRIPLE}', '--prefix=/install', f'--with-openssl={PY_DEPS}',
         f'--with-build-python={host}', '--with-system-expat', '--with-system-libmpdec', '--without-ensurepip', '--enable-shared', '--with-mimalloc',
         '--enable-optimizations', '--enable-experimental-jit=yes-off', '--with-lto', '--with-dbmliborder=ndbm',
         'ac_cv_lib_intl_textdomain=no', 'ac_cv_func_ptsname_r=no', *(f'py_cv_module_{m}=n/a' for m in modules),
         # This SDK exposes these, but only from macOS 27.
         'ac_cv_func_dup3=no', 'ac_cv_func_pipe2=no', 'ac_cv_header_sys_endian_h=no'], cwd=src, env=env)
    # PBS's getpath patches add dladdr to configure.ac and regenerate; libpython finds itself with it.
    config = src / 'pyconfig.h'
    config.write_text(config.read_text().replace('/* #undef HAVE_DLADDR */', '#define HAVE_DLADDR 1'))
    # PBS's patch-always-build-python-for-freeze, in the generated Makefile: freeze with the host Python.
    makefile = src / 'Makefile'
    text = makefile.read_text() + (HERE / 'python-Makefile.extra').read_text()
    for name, value in (('FREEZE_MODULE_BOOTSTRAP', '$(PYTHON_FOR_FREEZE) $(srcdir)/Programs/_freeze_module.py'),
                        ('FREEZE_MODULE_BOOTSTRAP_DEPS', '$(srcdir)/Programs/_freeze_module.py'),
                        ('FREEZE_MODULE', '$(FREEZE_MODULE_BOOTSTRAP)'),
                        ('FREEZE_MODULE_DEPS', '$(FREEZE_MODULE_BOOTSTRAP_DEPS)'), ('PYTHON_FOR_BUILD_DEPS', '')):
        text, count = re.subn(rf'^{name}=.*$', lambda _: f'{name}={value}', text, flags=re.M)
        if count != 1:
            raise SystemExit(f'Makefile: expected one {name}')
    makefile.write_text(text)
    profile = src / 'code.profclangd'
    if not train:
        # PGO training varies run to run, so rebuilds reuse the checked-in profile.
        profile.write_bytes(lzma.decompress(PGO_PROFILE.read_bytes()))
        (src / 'profile-run-stamp').touch()
    jobs = f'-j{os.cpu_count() - 2}'
    run(['make', jobs], cwd=src, env=env)
    if train:
        PGO_PROFILE.write_bytes(lzma.compress(profile.read_bytes(), preset=9 | lzma.PRESET_EXTREME))
    run(['make', jobs, 'install', f'DESTDIR={PY}'], cwd=src, env=env)
    library = PY_INSTALL / 'lib/libpython3.13.dylib'
    library.chmod(0o755)
    run(['install_name_tool', '-id', '@rpath/libpython3.13.dylib', library])
    run(['install_name_tool', '-change', '/install/lib/libpython3.13.dylib', '@rpath/libpython3.13.dylib',
         '-add_rpath', '@executable_path/../lib', PY_INSTALL / 'bin/python3.13'])
    run(['codesign', '--force', '--sign', '-', library, PY_INSTALL / 'bin/python3.13'])


def cmake(src: Path, env: dict, sdk: str, prefix: Path, *options):
    build = src / '_build'
    run(['cmake', '-S', src, '-B', build, '-G', 'Ninja', f'-DCMAKE_MAKE_PROGRAM={TOOLS}/bin/ninja',
         '-DCMAKE_BUILD_TYPE=Release', f'-DCMAKE_INSTALL_PREFIX={prefix}', '-DCMAKE_INSTALL_LIBDIR=lib',
         f'-DCMAKE_INSTALL_NAME_DIR={prefix}/lib', f'-DCMAKE_OSX_DEPLOYMENT_TARGET={TARGET}',
         '-DCMAKE_OSX_ARCHITECTURES=arm64', f'-DCMAKE_OSX_SYSROOT={sdk}', f'-DCMAKE_PREFIX_PATH={prefix}',
         '-DCMAKE_IGNORE_PREFIX_PATH=/opt/homebrew;/usr/local', '-DCMAKE_FIND_FRAMEWORK=LAST',
         '-DCMAKE_POLICY_VERSION_MINIMUM=3.5', '-DBUILD_SHARED_LIBS=ON', '-DBUILD_TESTING=OFF', *options], env=env)
    run(['cmake', '--build', build], env=env)
    run(['cmake', '--install', build], env=env)


def build_avif(src: Path, env: dict, sdk: str):
    """Pillow's wheel recipe. Its codecs are the versions libavif pins, unpacked into ext/ so nothing is fetched."""
    ext = src / 'ext'
    for name, directory in (('dav1d', 'dav1d'), ('aom', 'aom'), ('libyuv', 'libyuv'), ('sharpyuv', 'libwebp')):
        shutil.rmtree(ext / directory, ignore_errors=True)
        extract_source(name).rename(ext / directory)
    env = {**env, 'CFLAGS': env['CFLAGS'].replace('-O2 ', ''), 'CXXFLAGS': env['CXXFLAGS'].replace('-O2 ', '')}
    cmake(src, env, sdk, PIL, '-DAVIF_LIBSHARPYUV=LOCAL', '-DAVIF_LIBYUV=LOCAL', '-DAVIF_CODEC_AOM=LOCAL',
          '-DCONFIG_AV1_HIGHBITDEPTH=0', '-DCMAKE_C_VISIBILITY_PRESET=hidden', '-DCMAKE_CXX_VISIBILITY_PRESET=hidden',
          '-DCMAKE_BUILD_TYPE=MinSizeRel', '-DCMAKE_C_FLAGS_MINSIZEREL=-Oz -DNDEBUG -flto',
          '-DCMAKE_CXX_FLAGS_MINSIZEREL=-Oz -DNDEBUG -flto',
          '-DCMAKE_SHARED_LINKER_FLAGS_INIT=-Wl,-S,-x,-dead_strip_dylibs', '-DAVIF_CODEC_AOM_DECODE=OFF',
          '-DAVIF_CODEC_DAV1D=LOCAL', f'-DFETCHCONTENT_SOURCE_DIR_LIBAOM={ext}/aom', '-DFETCHCONTENT_FULLY_DISCONNECTED=ON')


def build_freetype(src: Path, env: dict):
    """Pillow's wheel recipe: FreeType and HarfBuzz want each other, so FreeType is built twice."""
    options = ('--disable-static', '--disable-dependency-tracking', '--without-bzip2')
    configure(src, env, PIL, *options, '--with-harfbuzz=no')
    meson_harfbuzz(extract_source('harfbuzz'), env)
    run(['make', 'distclean'], cwd=src, env=env)
    env = {**env, 'CFLAGS': f"{env['CFLAGS']} -DFT_CONFIG_OPTION_USE_HARFBUZZ"}
    configure(src, env, PIL, *options, '--with-harfbuzz=yes')


def meson_harfbuzz(src: Path, env: dict):
    build = src / '_build'
    run(['meson', 'setup', build, src, f'--prefix={PIL}', '--libdir=lib', '--buildtype=minsize', '--wrap-mode=nofallback',
         '-Dfreetype=enabled', '-Dglib=disabled', '-Dgobject=disabled', '-Dicu=disabled', '-Dcairo=disabled',
         '-Dchafa=disabled', '-Dtests=disabled', '-Ddocs=disabled', '-Dutilities=disabled'], env=env)
    run(['meson', 'install', '-C', build], env=env)


def python_env(env: dict, prefix: Path, extra_cflags: str = '') -> dict:
    return {**env, 'PYTHONPATH': str(OUT / 'pybuild'), 'CFLAGS': f"{env['CFLAGS']} -I{prefix}/include {extra_cflags}".strip()}


def build_pillow(src: Path, env: dict):
    env = {**python_env(env, PIL), 'PKG_CONFIG_LIBDIR': f'{PIL}/lib/pkgconfig:{PIL}/share/pkgconfig'}
    run([PY_INSTALL / 'bin/python3.13', 'setup.py', 'build_clib', 'build_ext', '--inplace', '--vendor-raqm', '--vendor-fribidi',
         '--disable-imagequant', '--disable-platform-guessing'], cwd=src, env=env)


def build_lxml(src: Path, env: dict):
    """Static libxml2 and libxslt from LXML: the prefix holds only archives, so the linker takes those."""
    run([PY_INSTALL / 'bin/python3.13', 'setup.py', 'build_ext', '--inplace', '--without-cython',
         f'--with-xml2-config={LXML}/bin/xml2-config', f'--with-xslt-config={LXML}/bin/xslt-config'],
        cwd=src, env={**python_env(env, LXML), 'LDFLAGS': f"{env['LDFLAGS']} {LXML}/lib/libiconv.a {LXML}/lib/libz.a"})


def recipes(sdk: str, jobs: int, train: bool) -> dict:
    tool = environment(sdk, jobs)
    deps = environment(sdk, jobs, PY_DEPS, '-O3')
    pil = environment(sdk, jobs, PIL)
    lx = environment(sdk, jobs, LXML)
    shared = ('--disable-static', '--disable-dependency-tracking')
    static = ('--disable-shared', '--disable-dependency-tracking')
    pil_configure = lambda s, *options, env=pil: configure(s, env, PIL, *shared, *options)
    lx_configure = lambda s, *options: configure(s, lx, LXML, *static, *options)
    return {
        'rust': lambda s: install_rust(s, tool),
        'llvm': lambda s: install_llvm(s, tool),
        'ripgrep': lambda s: build_rg(s, tool),
        'node': lambda s: build_node(s, tool),
        'bzip2': lambda s: build_bzip2(s, deps),
        'expat': lambda s: configure_static(s, deps, '--without-examples', '--without-tests', '--without-xmlwf',
                                            'ax_cv_check_cflags___fexceptions=no'),
        'libffi': lambda s: build_libffi(s, deps),
        'mpdecimal': lambda s: configure_static(s, deps, '--disable-cxx'),
        'openssl': lambda s: build_openssl(s, deps),
        'sqlite': lambda s: build_sqlite(s, deps),
        'uuid': lambda s: configure_static(s, {**deps, 'CFLAGS': f"{deps['CFLAGS']} -Wno-error=implicit-function-declaration"}),
        'xz': lambda s: configure_static(s, deps, '--disable-xz', '--disable-xzdec', '--disable-lzmadec',
                                         '--disable-lzmainfo', '--disable-lzma-links', '--disable-scripts'),
        'tcl': lambda s: build_tcl(s, deps),
        'tk': lambda s: build_tk(s, deps),
        'pbs': lambda s: None,
        'cpython': lambda s: build_python(s, deps, train),
        'pil-xz': lambda s: pil_configure(s, '--disable-xz', '--disable-xzdec', '--disable-lzmadec', '--disable-lzmainfo',
                                          '--disable-lzma-links', '--disable-scripts', '--disable-nls', '--disable-doc'),
        'zlib-ng': lambda s: run([s / 'configure', f'--prefix={PIL}', f'--installnamedir={PIL}/lib', '--zlib-compat'], cwd=s,
                                 env=pil) or run(['make', 'install'], cwd=s, env=pil),
        'xcb-proto': lambda s: pil_configure(s),
        'xorgproto': lambda s: pil_configure(s),
        'libXau': lambda s: pil_configure(s),
        'libpthread-stubs': lambda s: pil_configure(s),
        'libxcb': lambda s: pil_configure(s),
        'libjpeg-turbo': lambda s: cmake(s, pil, sdk, PIL, '-DENABLE_STATIC=OFF', '-DWITH_TURBOJPEG=OFF',
                                         '-DCMAKE_POSITION_INDEPENDENT_CODE=1'),
        'tiff': lambda s: pil_configure(s, '--disable-contrib', '--disable-cxx', '--disable-docs', '--disable-libdeflate',
                                        '--disable-tests', '--disable-tools', '--disable-webp', '--disable-zstd', '--without-x',
                                        f'--with-jpeg-include-dir={PIL}/include', f'--with-jpeg-lib-dir={PIL}/lib'),
        'dav1d': lambda s: None, 'aom': lambda s: None, 'libyuv': lambda s: None, 'sharpyuv': lambda s: None,
        'libavif': lambda s: build_avif(s, pil, sdk),
        'libpng': lambda s: pil_configure(s, '--disable-tools'),
        'lcms2': lambda s: pil_configure(s, '--without-jpeg', '--without-tiff'),
        'openjpeg': lambda s: cmake(s, pil, sdk, PIL, '-DBUILD_CODEC=OFF', '-DBUILD_STATIC_LIBS=OFF'),
        'libwebp': lambda s: pil_configure(s, '--enable-libwebpmux', '--enable-libwebpdemux', env={
            **pil, 'CFLAGS': pil['CFLAGS'].replace('-O2 ', '-O3 -DNDEBUG ')}),
        'brotli': lambda s: cmake(s, pil, sdk, PIL, '-DBROTLI_BUILD_TOOLS=OFF'),
        'harfbuzz': lambda s: None,
        'freetype': lambda s: build_freetype(s, pil),
        'pillow': lambda s: build_pillow(s, pil),
        'zlib': lambda s: run([s / 'configure', f'--prefix={LXML}', '--static'], cwd=s, env=lx) or run(['make', 'install'], cwd=s, env=lx),
        'libiconv': lambda s: lx_configure(s),
        'libxml2': lambda s: lx_configure(s, '--sysconfdir=/etc', '--without-python', f'--with-iconv={LXML}', f'--with-zlib={LXML}',
                                          '--without-lzma', '--enable-rebuild-docs=no'),
        # lxml ships a backport for this libxslt in its own sdist.
        'libxslt': lambda s: run(['patch', '-p1', '-i', extract_source('lxml') / 'libxslt-1.1.43-backport1.patch'], cwd=s)
        or lx_configure(s, '--without-python', f'--with-libxml-prefix={LXML}', '--without-crypto'),
        'lxml': lambda s: build_lxml(s, lx),
    }


def extract_source(name: str) -> Path:
    source = next(s for s in json.loads(MANIFEST.read_text())['sources'] if s['name'] == name)
    return obtain(source)


def obtain(source: dict) -> Path:
    if 'commit' not in source:
        return extract(source, fetch(source, SOURCES), SRC)
    target = SRC / source['name'] / source['name']
    shutil.rmtree(target.parent, ignore_errors=True)
    target.parent.mkdir(parents=True)
    run(['git', 'init', '-q', target])
    run(['git', '-C', target, 'fetch', '-q', '--depth', '1', source['url'], source['commit']])
    run(['git', '-C', target, 'checkout', '-q', 'FETCH_HEAD'])
    if output('git', '-C', target, 'rev-parse', 'HEAD').strip() != source['commit']:
        raise SystemExit(f"{source['name']}: not at the pinned commit")
    return target


def source_of(rel: str) -> Path:
    """Where the tree's file comes from in the build."""
    if rel == 'native/bin/rg':
        return next((SRC / 'ripgrep').iterdir()) / 'target/release/rg'
    if rel == 'node/bin/node':
        return next((SRC / 'node').iterdir()) / 'out/Release/node'
    if rel.startswith('python/venv/bin/'):
        return PY_INSTALL / 'bin/python3.13'
    if rel == 'python/venv/lib/libpython3.13.dylib':
        return PY_INSTALL / 'lib/libpython3.13.dylib'
    if rel.startswith('python/runtime/lib/') and 'lib-dynload' in rel:
        return PY_INSTALL / rel.removeprefix('python/runtime/')
    if rel.startswith('python/runtime/lib/') and rel.count('/') == 4:
        return PY_DEPS / 'lib' / '/'.join(rel.split('/')[3:])
    if rel.startswith('python/runtime/lib/'):
        name = rel.split('/')[-1]
        return (PY_INSTALL if name.startswith('libpython') else PY_DEPS) / 'lib' / name
    if rel.startswith('python/runtime/'):
        return PY_INSTALL / rel.removeprefix('python/runtime/')
    if rel.startswith(f'{SITE}/PIL/.dylibs/'):
        return PIL / 'lib' / rel.split('/')[-1]
    package = rel.removeprefix(f'{SITE}/')
    return next((SRC / package.split('/')[0].lower().replace('pil', 'pillow')).iterdir()) / 'src' / package


def loads(path: Path) -> tuple[str | None, list, list]:
    """(install name, linked libraries, rpaths) from the load commands."""
    lines = output('otool', '-l', path).splitlines()
    identity, links, rpaths = None, [], []
    for i, line in enumerate(lines):
        kind = line.split()[-1] if 'cmd LC_' in line else ''
        value = lambda: lines[i + 2].split()[1]
        if kind == 'LC_ID_DYLIB':
            identity = value()
        elif kind in ('LC_LOAD_DYLIB', 'LC_LOAD_WEAK_DYLIB', 'LC_REEXPORT_DYLIB'):
            links.append(value())
        elif kind == 'LC_RPATH':
            rpaths.append(value())
    return identity, links, rpaths


def real_leaf(dependency: str) -> str:
    """The file a built library resolves to: libjpeg.62.dylib is shipped as libjpeg.62.4.0.dylib."""
    path = Path(dependency)
    return path.resolve().name if path.is_absolute() and path.exists() else path.name


def stabilize_uuid(path: Path):
    """ld's LC_UUID differs between identical links. Derive it from the contents; signing comes after."""
    data = bytearray(path.read_bytes())
    commands = struct.unpack_from('<I', data, 16)[0]
    offset = 32
    for _ in range(commands):
        command, size = struct.unpack_from('<II', data, offset)
        if command == 0x1b:
            data[offset + 8:offset + 24] = bytes(16)
            digest = bytearray(hashlib.sha256(data).digest()[:16])
            digest[6], digest[8] = digest[6] & 0x0f | 0x50, digest[8] & 0x3f | 0x80  # RFC 4122 v5 shape
            data[offset + 8:offset + 24] = digest
            path.write_bytes(data)
            return
        offset += size


def relocate(files: dict) -> list:
    """Copy the built files into the tree and give them the supplied load commands."""
    shutil.rmtree(TREE, ignore_errors=True)
    problems = []
    for rel, spec in files.items():
        source, target = source_of(rel), TREE / rel
        if not source.is_file():
            problems.append(f'{rel}: {source} was not built')
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        target.chmod(spec['mode'])
        run(['/usr/bin/strip', '-x', target])
        identity, links, rpaths = loads(target)
        wanted = {link.split('/')[-1]: link for link in spec['links']}
        changes = ['-id', spec['id']] if spec['id'] and identity != spec['id'] else []
        for dependency in links:
            if dependency.startswith(SYSTEM):
                continue
            leaf = real_leaf(dependency)
            if leaf not in wanted:
                problems.append(f'{rel} links {dependency}, which the supplied file does not')
            elif wanted[leaf] != dependency:
                changes += ['-change', dependency, wanted[leaf]]
        for rpath in rpaths:
            if rpath not in spec['rpaths']:
                changes += ['-delete_rpath', rpath]
        for rpath in spec['rpaths']:
            if rpath not in rpaths:
                changes += ['-add_rpath', rpath]
        if changes:
            run(['install_name_tool', *changes, target])
        run(['codesign', '--remove-signature', target])
        stabilize_uuid(target)
        run(['codesign', '--force', '--sign', '-', '--identifier', spec['identifier'], target])
    return problems


def verify(files: dict) -> list:
    problems = []
    for rel, spec in files.items():
        path = TREE / rel
        if not path.exists():
            continue
        build = output('vtool', '-show-build', path)
        if f'minos {TARGET}' not in build:
            problems.append(f'{rel}: {" ".join(build.split())}')
        if output('lipo', '-archs', path).split() != ['arm64']:
            problems.append(f'{rel}: not arm64')
        # -undefined dynamic_lookup hides a missing static library until import.
        if '/site-packages/lxml/' in rel and (missing := STATIC_IN_LXML & set(output('nm', '-u', path).split())):
            problems.append(f'{rel}: unresolved {sorted(missing)}')
        identity, links, rpaths = loads(path)
        ours = [link for link in links if not link.startswith(SYSTEM)]
        if (identity, sorted(ours), sorted(rpaths)) != (spec['id'], sorted(spec['links']), sorted(spec['rpaths'])):
            problems.append(f'{rel}: load commands differ: {identity} {ours} {rpaths}')
    return problems


def record_supplied(manifest: dict, supplied: Path):
    """Fill in what assembly and relocate need to know about the supplied files."""
    pdf = json.loads(PDF_MANIFEST.read_text())['files']
    machos = sorted(p for p in supplied.rglob('*') if p.is_file() and not p.is_symlink()
                    and p.open('rb').read(4) in (b'\xcf\xfa\xed\xfe', b'\xca\xfe\xba\xbe'))
    files = {}
    for path in machos:
        rel = str(path.relative_to(supplied))
        if rel in pdf:
            continue
        identity, links, rpaths = loads(path)
        details = subprocess.run(['codesign', '-d', '--entitlements', '-', '--xml', path], capture_output=True).stdout
        entitlements = sorted(k for k, v in plistlib.loads(details).items() if v and k not in DROPPED_ENTITLEMENTS) if details else []
        signed = subprocess.run(['codesign', '-dvv', path], capture_output=True, text=True).stderr
        entry = {'originalSha256': sha256(path), 'id': identity, 'links': [l for l in links if not l.startswith(SYSTEM)],
                 'rpaths': rpaths, 'mode': path.stat().st_mode & 0o777,
                 'identifier': re.search(r'^Identifier=(.+)$', signed, re.M).group(1),
                 'sha256': manifest['files'].get(rel, {}).get('sha256', '')}
        if entitlements:
            entry['entitlements'] = entitlements
        files[rel] = entry
    manifest['files'] = files


CHECK_NODE = r"""
const assert = require('assert'), crypto = require('crypto'), zlib = require('zlib');
const modules = require('module').builtinModules;
for (const name of modules) require(name);
assert.strictEqual(process.version, 'v26.5.0');
assert.strictEqual(crypto.createHash('sha256').update('aux').digest('hex').length, 64);
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
assert(crypto.verify(null, Buffer.from('a'), publicKey, crypto.sign(null, Buffer.from('a'), privateKey)));
const text = Buffer.from('aux'.repeat(1000));
assert(zlib.gunzipSync(zlib.gzipSync(text)).equals(text));
assert(zlib.brotliDecompressSync(zlib.brotliCompressSync(text)).equals(text));
assert(zlib.zstdDecompressSync(zlib.zstdCompressSync(text)).equals(text));
assert.strictEqual(new Intl.NumberFormat('de-DE').format(1234.5), '1.234,5');
assert.strictEqual(new Intl.DateTimeFormat('ja-JP', { timeZone: 'UTC', dateStyle: 'long' }).format(0), '1970年1月1日');
assert.deepStrictEqual(Intl.Collator.supportedLocalesOf(['ja', 'de', 'zh', 'ar']), ['ja', 'de', 'zh', 'ar']);
assert.strictEqual(typeof Temporal.Now.instant, 'function');
assert.strictEqual(new (require('node:sqlite').DatabaseSync)(':memory:').prepare('select 1 a').get().a, 1);
assert.strictEqual(process.versions.icu, '78.3');
console.log('node', process.version, modules.length, 'built-ins', process.versions.openssl, 'icu', process.versions.icu);
"""

CHECK_PYTHON = r"""
import ctypes, io, os, sqlite3, ssl, sys, tempfile, zlib, bz2, lzma, decimal, hashlib, curses, readline, dbm, uuid, uuid as _
import ctypes.util, xml.parsers.expat, json, asyncio, zoneinfo
import tkinter, _tkinter
from lxml import etree, html, objectify, builder, sax
from lxml.html import diff
import docx, pptx, openpyxl, xlsxwriter, pip
from PIL import Image, ImageCms, ImageFont, features
assert sys.version_info[:3] == (3, 13, 12), sys.version
assert ssl.OPENSSL_VERSION == 'OpenSSL 3.5.5 27 Jan 2026', ssl.OPENSSL_VERSION
assert sqlite3.sqlite_version == '3.50.4'
connection = sqlite3.connect(':memory:')
connection.execute('create virtual table t using fts5(a)'); connection.execute('create virtual table r using rtree(id, x, y)')
assert ctypes.CDLL(None).getpid() == os.getpid()
assert hashlib.scrypt(b'a', salt=b'b', n=2, r=8, p=1, dklen=8)
assert decimal.__libmpdec_version__ == '4.0.0'
assert uuid.uuid1() and readline.backend == 'editline'
tcl = tkinter.Tcl()
assert tcl.eval('info patchlevel') == '9.0.3'
assert tcl.eval('package require Thread') == '3.0.4' and tcl.eval('package require Itcl') == '4.3.5'
tk = os.path.join(sys.base_prefix, 'lib', 'libtcl9tk9.0.dylib')
ctypes.CDLL(tk)
root = etree.fromstring(b'<a><b>c</b></a>')
assert root.xpath('string(/a/b)') == 'c' and etree.LIBXML_VERSION == (2, 14, 6) and etree.LIBXSLT_VERSION == (1, 1, 43)
assert str(etree.XSLT(etree.XML('<x:stylesheet version="1.0" xmlns:x="http://www.w3.org/1999/XSL/Transform"><x:template match="/"><o/></x:template></x:stylesheet>'))(root)).strip().endswith('<o/>')
assert etree.fromstring('<a>日本</a>'.encode('shift_jis'), etree.XMLParser(encoding='shift_jis')).text == '日本'
assert diff.htmldiff('<p>a</p>', '<p>b</p>')
assert {f: features.version(f) for f in ('freetype2', 'littlecms2', 'webp', 'avif', 'jpg', 'jpg_2000', 'zlib', 'libtiff')} == {
    'freetype2': '2.14.3', 'littlecms2': '2.19', 'webp': '1.6.0', 'avif': '1.4.2', 'jpg': '6.2', 'jpg_2000': '2.5.4',
    'zlib': '1.3.1.zlib-ng', 'libtiff': '4.7.2'}, 'pillow library versions'
assert features.check('libjpeg_turbo') and features.check('zlib_ng') and features.check('xcb') and features.check('tkinter')
assert features.version('zlib_ng') == '2.3.3' and features.version('libjpeg_turbo') == '3.2.0'
assert not features.check('mozjpeg') and not features.check('libimagequant')
Image.init()
assert sorted(Image.OPEN) == %r
assert sorted(Image.SAVE) == %r
sample = Image.radial_gradient('L').convert('RGB')
for compression in ('tiff_lzw', 'tiff_deflate', 'tiff_adobe_deflate', 'jpeg', 'packbits'):
    buffer = io.BytesIO(); sample.save(buffer, 'TIFF', compression=compression); buffer.seek(0); Image.open(buffer).load()
ImageCms.createProfile('sRGB')
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 24)
assert font.getbbox('aux')[2] > 0
assert sample.copy().filter(__import__('PIL.ImageFilter').ImageFilter.GaussianBlur(2))
print('python', sys.version.split()[0], ssl.OPENSSL_VERSION, 'sqlite', sqlite3.sqlite_version, 'formats', len(Image.OPEN), len(Image.SAVE))
"""


# Every format against every common mode; the result must match the supplied runtime's exactly.
CHECK_FORMATS = r"""
import io, json
from PIL import Image
Image.init()
results = {}
source = Image.radial_gradient('L').resize((64, 64))
for name in sorted(Image.SAVE):
    for mode in ('1', 'L', 'P', 'RGB', 'RGBA', 'CMYK', 'I;16'):
        try:
            buffer = io.BytesIO()
            source.convert(mode if mode != 'I;16' else 'I').convert(mode).save(buffer, name)
            buffer.seek(0)
            image = Image.open(buffer)
            image.load()
            results[f'{name}/{mode}'] = image.format
        except Exception as error:
            results[f'{name}/{mode}'] = type(error).__name__
print(json.dumps(results, sort_keys=True))
"""


def check(files: dict) -> int:
    """Overlay the tree on the supplied runtime and exercise every part."""
    shutil.rmtree(CHECK, ignore_errors=True)
    root = CHECK / 'agent-runtime'
    CHECK.mkdir(parents=True)
    run(['cp', '-R', SUPPLIED, root])
    pdf = json.loads(PDF_MANIFEST.read_text())['files']
    for rel in pdf:
        shutil.copyfile(PDF_OUT / rel, root / rel)
    for rel in files:
        target = root / rel
        mode = target.stat().st_mode & 0o777
        target.unlink()
        shutil.copyfile(TREE / rel, target)
        target.chmod(mode)
    env = {'PATH': f'{root}/bin:/usr/bin:/bin', 'HOME': str(CHECK), 'TMPDIR': str(CHECK), 'LANG': 'en_US.UTF-8',
           'PYTHONDONTWRITEBYTECODE': '1'}
    supplied_env = {**env, 'PYTHONHOME': str(SUPPLIED / 'python/runtime')}
    probe = 'from PIL import Image; Image.init(); print(sorted(Image.OPEN)); print(sorted(Image.SAVE))'
    opened, saved = (eval(line) for line in subprocess.run(
        [SUPPLIED / 'python/venv/bin/python', '-c', probe], env=supplied_env, capture_output=True, text=True,
        check=True).stdout.splitlines())
    (CHECK / 'node.cjs').write_text(CHECK_NODE)
    (CHECK / 'python.py').write_text(CHECK_PYTHON % (opened, saved))
    (CHECK / 'haystack.txt').write_text('foobar 123\nfoobaz\n')
    results = [
        [root / 'bin/node', CHECK / 'node.cjs'],
        [root / 'bin/python', CHECK / 'python.py'],
        # What the daemon runs after seeding a runtime.
        [root / 'bin/npm', '--version'], [root / 'bin/npx', '--version'],
        *([root / 'bin' / name, '-c', 'import openpyxl, docx, pptx'] for name in ('python', 'python3', 'python3.13')),
        [root / 'bin/pip', '--version'], [root / 'bin/pip3', '--version'],
        [root / 'bin/rg', '--version'],
        [root / 'bin/rg', '-P', r'foo(?=bar)\w+\s\d+', CHECK / 'haystack.txt'],
        [root / 'bin/pdfinfo', '-v'],
    ]
    (CHECK / 'formats.py').write_text(CHECK_FORMATS)
    matrix = [json.loads(subprocess.run([python, CHECK / 'formats.py'], env=environ, capture_output=True, text=True,
                                        check=True).stdout)
              for python, environ in ((SUPPLIED / 'python/venv/bin/python', supplied_env),
                                      (root / 'python/venv/bin/python', {**env, 'PYTHONHOME': str(root / 'python/runtime')}))]
    different = {k: (matrix[0][k], matrix[1].get(k)) for k in matrix[0] if matrix[0][k] != matrix[1].get(k)}
    working = sum(not v.endswith('Error') for v in matrix[1].values())
    print(f'pillow matrix: {len(matrix[1])} format/mode pairs, {working} round-trip, {len(different)} differ from supplied: {different}')
    failed = len(different) > 0
    for command in results:
        print('$', ' '.join(str(c).replace(str(root), 'runtime') for c in command), flush=True)
        result = subprocess.run(command, env=env, capture_output=True, text=True)
        print(result.stdout.strip()[:600], result.stderr.strip()[-1500:])
        failed += result.returncode != 0
    print(f'{len(results) - failed}/{len(results)} checks passed')
    return failed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--jobs', type=int, default=os.cpu_count() - 2)
    parser.add_argument('--only', nargs='*', help='groups to build (tools, rg, node, python, pillow, lxml); default all')
    parser.add_argument('--from', dest='start', help='rebuild from this source on (earlier ones are kept)')
    parser.add_argument('--clean', action='store_true', help='start over; sources and tools/ are kept')
    parser.add_argument('--train-python', action='store_true', help='rerun PGO training and replace the checked-in profile')
    parser.add_argument('--no-tree', action='store_true', help='build only; leave the tree alone')
    parser.add_argument('--write-manifest', action='store_true', help='record the built and supplied files in the manifest')
    parser.add_argument('--supplied', type=Path, default=SUPPLIED, help='the supplied agent-runtime, for --write-manifest')
    parser.add_argument('--check', action='store_true', help='exercise the tree on a copy of the supplied runtime')
    args = parser.parse_args()
    if os.uname().machine != 'arm64':
        raise SystemExit('build on an arm64 Mac')
    manifest = json.loads(MANIFEST.read_text())
    if args.clean:
        for directory in (SRC, PY, PIL, LXML, TREE, CHECK):
            shutil.rmtree(directory, ignore_errors=True)
        for source in manifest['sources']:
            if source['group'] != 'tools':
                (STAMPS / source['name']).unlink(missing_ok=True)
    sdk = output('xcrun', '--show-sdk-path').strip()
    prepare_tools(manifest['tools'])
    steps = recipes(sdk, args.jobs, args.train_python)
    STAMPS.mkdir(parents=True, exist_ok=True)
    names = [s['name'] for s in manifest['sources']]
    if set(names) != set(steps):
        raise SystemExit(f'manifest sources and recipes differ: {sorted(set(names) ^ set(steps))}')
    if args.start:
        for source in manifest['sources'][names.index(args.start):]:
            if not args.only or source['group'] in args.only:
                (STAMPS / source['name']).unlink(missing_ok=True)
    for source in manifest['sources']:
        stamp = STAMPS / source['name']
        pin = source.get('sha256') or source['commit']
        if (args.only and source['group'] not in args.only) or (stamp.exists() and stamp.read_text() == pin):
            continue
        print(f"== {source['name']} {source['version']}", flush=True)
        steps[source['name']](obtain(source))
        stamp.write_text(pin)
    if args.write_manifest:
        record_supplied(manifest, args.supplied)
    files = manifest['files']
    if not args.no_tree:
        problems = relocate(files) + verify(files)
        if problems:
            raise SystemExit('\n'.join(problems))
        built = {rel: sha256(TREE / rel) for rel in files}
        if args.write_manifest:
            for rel, digest in built.items():
                files[rel]['sha256'] = digest
            MANIFEST.write_text(json.dumps(manifest, indent=1) + '\n')
        stale = [rel for rel, digest in built.items() if files[rel]['sha256'] != digest]
        print(f'{len(built)} files in {TREE}, minos {TARGET}; '
              + (f'{len(stale)} differ from the manifest (rerun with --write-manifest)' if stale else 'manifest matches'))
    return check(files) if args.check else 0


if __name__ == '__main__':
    sys.exit(main())
