"""Fixed owned-fixture metadata writer. No browser effects or caller selectors."""
import json
import os
import re
import stat
import sys

OPERATIONS = {
    "prepareCdpStopMeasurement", "prepareCdpTakeoverMeasurement", "completeCdpRetirementMeasurement",
    "sampleShellMemory", "sampleProcessMemory", "sampleStockProcessMemory", "prepareStockWarmWindow", "completeStockWarmWindow", "prepareAuxWarmWindow", "completeAuxWarmWindow", "prepareSubagentMemoryWorkload",
    "prepareLittleWindowPresentation", "completeLittleWindowPresentation",
    "prepareOrganizationAutoArchiveWork", "prepareOrganizationLiveFolderWork", "completeOrganizationWork",
    "prepareGuestSplitDropPresentation", "prepareGuestDividerFramePresentation",
    "prepareGuestTabSwitchPresentation", "completeGuestPresentation",
}
FILE = "performance-request.json"
TEMP = FILE + ".next"


def directory(info, device, inode):
    if not (stat.S_ISDIR(info.st_mode) and info.st_uid == os.geteuid()
            and stat.S_IMODE(info.st_mode) == 0o700
            and info.st_dev == device and info.st_ino == inode):
        raise ValueError("foreign fixture directory")


def admission(value):
    if not re.fullmatch(r"/private/tmp/aux-native-journey-[A-Za-z0-9_-]+/profile", value["profile"]):
        raise ValueError("invalid owned profile")
    root = os.path.dirname(value["profile"])
    fd = os.open(root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        validate(value, fd)
        return fd
    except BaseException:
        os.close(fd)
        raise


def validate(value, fd):
    root = os.path.dirname(value["profile"])
    directory(os.fstat(fd), value["rootDevice"], value["rootInode"])
    directory(os.lstat(root), value["rootDevice"], value["rootInode"])
    profile = os.open("profile", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=fd)
    try:
        directory(os.fstat(profile), value["profileDevice"], value["profileInode"])
        directory(os.lstat(value["profile"]), value["profileDevice"], value["profileInode"])
    finally:
        os.close(profile)


def protected_file(fd, name):
    try:
        info = os.stat(name, dir_fd=fd, follow_symlinks=False)
    except FileNotFoundError:
        return False
    if not (stat.S_ISREG(info.st_mode) and info.st_uid == os.geteuid()
            and stat.S_IMODE(info.st_mode) == 0o600 and info.st_nlink == 1):
        raise ValueError("unsafe prior mailbox")
    return True


def execute(value, fd):
    validate(value, fd)
    if value["action"] == "reset":
        for name in (FILE, TEMP):
            if protected_file(fd, name):
                os.unlink(name, dir_fd=fd)
        os.fsync(fd)
        validate(value, fd)
        return
    protected_file(fd, FILE)
    temporary = os.open(TEMP, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o600, dir_fd=fd)
    try:
        if not protected_file(fd, TEMP):
            raise ValueError("missing private temporary")
        body = json.dumps({"sequence": value["sequence"], "operation": value["operation"]}, separators=(",", ":")).encode()
        if len(body) > 512 or os.write(temporary, body) != len(body):
            raise ValueError("incomplete bounded mailbox")
        os.fsync(temporary)
        validate(value, fd)
        os.rename(TEMP, FILE, src_dir_fd=fd, dst_dir_fd=fd)
        os.fsync(fd)
        final, original = os.stat(FILE, dir_fd=fd, follow_symlinks=False), os.fstat(temporary)
        if final.st_dev != original.st_dev or final.st_ino != original.st_ino:
            raise ValueError("published mailbox replaced")
        protected_file(fd, FILE)
        validate(value, fd)
    finally:
        os.close(temporary)
        try:
            os.unlink(TEMP, dir_fd=fd)
        except FileNotFoundError:
            pass


def parse(body):
    if len(body) > 1024:
        raise ValueError("oversized fixed request")
    value = json.loads(body)
    keys = {"profile", "rootDevice", "rootInode", "profileDevice", "profileInode", "action"}
    if not isinstance(value, dict) or value.get("action") not in ("reset", "publish"):
        raise ValueError("invalid fixed action")
    if value["action"] == "publish":
        keys.update(("operation", "sequence"))
        if (value.get("operation") not in OPERATIONS or not isinstance(value.get("sequence"), str)
                or not re.fullmatch(r"[1-9][0-9]{0,3}", value["sequence"]) or int(value["sequence"]) > 4000):
            raise ValueError("invalid fixed operation")
    if set(value) != keys or not isinstance(value["profile"], str):
        raise ValueError("unknown selector")
    for key in ("rootDevice", "rootInode", "profileDevice", "profileInode"):
        if type(value[key]) is not int or value[key] < 0 or value[key] > 2**64 - 1:
            raise ValueError("invalid fixture pin")
    return value


if __name__ == "__main__":
    try:
        if len(sys.argv) != 1:
            raise ValueError("no command-line selectors")
        request = parse(sys.stdin.buffer.read(1025))
        root_fd = admission(request)
        try:
            execute(request, root_fd)
        finally:
            os.close(root_fd)
    except Exception:
        # Never print arbitrary caller/file content or fabricate native evidence.
        sys.stderr.write("Private fixture metadata write refused\n")
        sys.exit(1)
