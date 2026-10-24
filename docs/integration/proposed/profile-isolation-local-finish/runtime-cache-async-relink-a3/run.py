#!/usr/bin/env python3
"""Execute the reviewed one-object successor under the workspace native lock.

This script does not sign, install, launch, load a module, or activate policy.
It refuses changed inputs, existing outputs and unexpected dependencies.
"""
import hashlib
import json
import os
from pathlib import Path
import shlex
import subprocess
import sys
import time


def sha(path):
    with open(path, "rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def read_json(path):
    return json.loads(Path(path).read_text())


def verify(pins):
    for path, digest in pins.items():
        if sha(path) != digest:
            raise ValueError("Pinned input changed: " + path)


def replace_operand(command, flag, value):
    if command.count(flag) != 1:
        raise ValueError("Ambiguous command operand: " + flag)
    result = command.copy()
    result[result.index(flag) + 1] = value
    return result


def main():
    here = Path(__file__).resolve().parent
    plan_path = here / "plan.json"
    plan = read_json(plan_path)
    if len(sys.argv) != 2 or sys.argv[1] not in ("--execute", "--inside-build-lock"):
        raise SystemExit("Use --execute to compile and link the reviewed unsigned successor.")
    runner_pins = read_json(here / "runner-inputs.json")["files"]
    if str(Path(__file__).resolve()) not in runner_pins or str(plan_path) not in runner_pins:
        raise ValueError("Run prepare.py in this checkout before execution")
    verify(runner_pins)
    if sys.argv[1] == "--execute":
        # The existing workspace wrapper serializes all native operations.
        return subprocess.call([sys.executable, plan["nativeBuildLockRunner"],
                                sys.executable, str(here / "run.py"),
                                "--inside-build-lock"])

    verify(plan["frozenFiles"])
    base = read_json(plan["baseManifest"])
    prior_link = read_json(plan["baseLinkReceipt"])
    prior_compile = read_json(plan["baseCompileReceipt"])
    if not prior_link["passed"] or prior_link["manifestSha256"] != sha(plan["baseManifest"]):
        raise ValueError("Prior link manifest is not paired")
    if prior_link["recipeSha256"] != sha(plan["linkChecker"]):
        raise ValueError("Prior native link checker changed")
    if not prior_compile["passed"] or not prior_compile["compiled"] or not prior_compile["linked"] or not prior_compile["inputsUnchanged"] or prior_compile["compileExitCode"] != 0 or sha(plan["oldObject"]) != prior_compile["objectSha256"]:
        raise ValueError("Prior host object is not paired")
    compile_command = prior_compile["compileCommand"]
    for flag, value in (("-c", plan["newSource"]),
                        ("-o", str(Path(plan["objectOutput"]) / "worker-host.o")),
                        ("-MF", str(Path(plan["objectOutput"]) / "worker-host.d"))):
        compile_command = replace_operand(compile_command, flag, value)
    if compile_command != plan["compileCommand"]:
        raise ValueError("Compile recipe changes more than reviewed source/output paths")
    expected_link = base["commands"][0].copy()
    if len(base["commands"]) != 1 or expected_link.count(plan["oldObject"]) != 1:
        raise ValueError("Ambiguous selected host object")
    expected_link[expected_link.index(plan["oldObject"])] = str(Path(plan["objectOutput"]) / "worker-host.o")
    expected_link = replace_operand(expected_link, "-module-cache-path", str(Path(plan["linkOutput"]) / "swift-cache"))
    expected_link = replace_operand(expected_link, "-o", str(Path(plan["linkOutput"]) / "Aux Daemon"))
    if expected_link != plan["linkCommand"] or "-no_adhoc_codesign" not in expected_link:
        raise ValueError("Link recipe changes more than reviewed host/output/cache paths")
    out = Path(plan["objectOutput"])
    link_out = Path(plan["linkOutput"])
    if out.exists() or link_out.exists():
        raise ValueError("Fresh object and link output directories required")
    out.mkdir(mode=0o700)
    (out / "tmp").mkdir(mode=0o700)
    receipt = dict(format="aux.runtime-cache-async-relink.result.v1",
                   passed=False, compiled=False, linked=False,
                   planSha256=sha(plan_path), runnerSha256=sha(__file__),
                   signed=False, executableRun=False, moduleLoaded=False,
                   acceptedAppChanged=False, policyActivated=False,
                   fullWriterIsolationProven=False)
    started = time.monotonic()
    try:
        environment = os.environ.copy()
        environment["TMPDIR"] = str(out / "tmp")
        environment["CLANG_MODULE_CACHE_PATH"] = str(out / "clang-cache")
        run = subprocess.run(compile_command, capture_output=True, text=True, env=environment)
        (out / "compile.log").write_text(run.stdout + run.stderr)
        receipt.update(compileCommand=compile_command, compileExitCode=run.returncode)
        if run.returncode:
            raise RuntimeError("Native host compile failed; see compile.log")
        dep_path = out / "worker-host.d"
        dependencies = shlex.split(dep_path.read_text().replace("\\\n", " ").split(":", 1)[1])
        actual = {str(Path(path).resolve()) for path in dependencies}
        expected = {str(Path(path).resolve()) for path in plan["compileDependencies"]}
        for old_path, new_path in plan["dependencyReplacements"].items():
            expected.remove(str(Path(old_path).resolve()))
            expected.add(str(Path(new_path).resolve()))
        if len(expected) != plan["expectedCanonicalDependencyCount"]:
            raise ValueError("Unexpected predecessor dependency cardinality")
        if actual != expected:
            raise ValueError("Compiler dependency identity changed: " + json.dumps({
                "extra": sorted(actual - expected), "missing": sorted(expected - actual)}))
        verify(plan["frozenFiles"])
        obj = out / "worker-host.o"
        receipt.update(compiled=True, objectSha256=sha(obj),
                       dependencyFileSha256=sha(dep_path),
                       dependenciesMatch=True, dependencyCount=len(actual))
        # Only now does a replacement object digest exist. Do not put a guessed
        # object digest or a success receipt into the preparation plan.
        successor = base.copy()
        successor.update(output=str(link_out), commands=[expected_link])
        successor["frozenFiles"] = dict(plan["frozenFiles"])
        successor["frozenFiles"][str(obj)] = sha(obj)
        successor["frozenFiles"][str(dep_path)] = sha(dep_path)
        successor["frozenFiles"][str(plan_path)] = sha(plan_path)
        successor_path = out / "daemon-inputs.json"
        successor_path.write_text(json.dumps(successor, indent=2) + "\n")
        run = subprocess.run([sys.executable, plan["linkChecker"], str(successor_path)],
                             capture_output=True, text=True, env=environment)
        (out / "link-checker.log").write_text(run.stdout + run.stderr)
        receipt["linkCheckerExitCode"] = run.returncode
        if run.returncode:
            raise RuntimeError("Unsigned link/check failed; see link-checker.log and link results")
        result_path = link_out / "results.json"
        result = read_json(result_path)
        if not result["passed"] or not result["inputsUnchanged"]:
            raise ValueError("Native link did not prove unchanged inputs")
        if result["manifestSha256"] != sha(successor_path) or result["recipeSha256"] != sha(plan["linkChecker"]):
            raise ValueError("Successor link receipt mismatch")
        if result["resolvedModuleImports"] != prior_link["resolvedModuleImports"] or result["privateDefinitionsBound"] != prior_link["privateDefinitionsBound"]:
            raise ValueError("Paired module ABI or private symbol boundary changed")
        if result["moduleSha256"] != prior_link["moduleSha256"]:
            raise ValueError("Paired module bytes changed")
        verify(plan["frozenFiles"])
        receipt.update(linked=True, passed=True,
                       daemonInputManifest=str(successor_path),
                       daemonInputManifestSha256=sha(successor_path),
                       daemonLinkReceipt=str(result_path),
                       daemonLinkReceiptSha256=sha(result_path),
                       executableSha256=result["executableSha256"],
                       preservedSwiftSourceCount=48, reusedNativeObjectCount=11,
                       sameModuleABI=True, samePrivateDefinitions=True,
                       inputsUnchanged=True)
    except Exception as error:
        receipt["error"] = str(error)
    finally:
        try:
            verify(plan["frozenFiles"])
        except Exception as error:
            receipt.update(passed=False, inputError=str(error))
        receipt["seconds"] = time.monotonic() - started
        (out / "results.json").write_text(json.dumps(receipt, indent=2) + "\n")
    if not receipt["passed"]:
        raise SystemExit(receipt.get("error", receipt.get("inputError", "Successor failed")))
    print("PASS: one host object and unsigned daemon successor; no product execution or activation")
    return 0


if __name__ == "__main__":
    sys.exit(main())
