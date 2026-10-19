"use strict";
// Stand-in for aside-native.node's installation-key and secure-storage commands.
//
// The vendored binding stores keys in a Keychain access group that only Aside's
// signing team may use, so those commands fail under Aux's signature. They are
// reimplemented here against files in $ASIDE_HOME/install (mode 0600). The browser
// reads the same signing key, which is how daemon and browser authenticate each other.
// Every other command (PDF, thumbnails, open-with, ...) is forwarded to the original.
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const home = process.env.ASIDE_HOME
  ? path.resolve(process.env.ASIDE_HOME)
  : path.join(os.homedir(), ".aux");
const dir = path.join(home, "install");
const secureDir = path.join(dir, "secure");
const file = (name) => path.join(dir, name);

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });
  fs.chmodSync(target, 0o700);
}
function writePrivate(target, data) {
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, data, { mode: 0o600 });
  fs.renameSync(tmp, target);
}
function rawPublic(publicKey) {
  const jwk = publicKey.export({ format: "jwk" });
  return Buffer.concat([
    Buffer.from([4]),
    Buffer.from(jwk.x, "base64url"),
    Buffer.from(jwk.y, "base64url"),
  ]).toString("base64");
}
function loadPair(name) {
  const privateKey = crypto.createPrivateKey(fs.readFileSync(file(name)));
  return { privateKey, publicKey: crypto.createPublicKey(privateKey) };
}
const installed = () => fs.existsSync(file("sig.pem")) && fs.existsSync(file("kem.pem"));

function init() {
  if (installed()) return;
  ensureDir(dir);
  for (const name of ["sig.pem", "kem.pem"]) {
    const { privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    writePrivate(file(name), privateKey.export({ format: "pem", type: "pkcs8" }));
  }
  writePrivate(file("dk.bin"), crypto.randomBytes(32));
}
function publicKeys() {
  const sig = loadPair("sig.pem");
  const kem = loadPair("kem.pem");
  return { scheme: "p256_v1", sig: rawPublic(sig.publicKey), kem: rawPublic(kem.publicKey) };
}
function secureFile(key) {
  return path.join(secureDir, crypto.createHash("sha256").update(String(key)).digest("hex"));
}

const handlers = {
  "install-status": () => ({ installed: installed(), scheme: "p256_v1" }),
  "install-init": () => {
    init();
    const keys = publicKeys();
    return { scheme: keys.scheme, sig_pub: keys.sig, kem_pub: keys.kem };
  },
  "get-public-keys": () => {
    if (!installed()) throw new Error("Installation keys are not initialized");
    return publicKeys();
  },
  "dk-unwrap": () => {
    if (!installed()) throw new Error("Installation keys are not initialized");
    return { dk: fs.readFileSync(file("dk.bin")).toString("base64") };
  },
  "cdp-sign": ({ challenge }) => {
    const { privateKey } = loadPair("sig.pem");
    const signature = crypto.sign("sha256", Buffer.from(challenge, "base64"), privateKey);
    return { signature: signature.toString("base64") };
  },
  "install-destroy": () => {
    fs.rmSync(dir, { recursive: true, force: true });
    return {};
  },
  "secure-save": ({ key, data }) => {
    ensureDir(secureDir);
    writePrivate(secureFile(key), String(data));
    return {};
  },
  "secure-read": ({ key }) => {
    try {
      return { data: fs.readFileSync(secureFile(key), "utf8") };
    } catch (error) {
      if (error.code === "ENOENT") return {};
      throw error;
    }
  },
  "secure-clear": ({ key }) => {
    fs.rmSync(secureFile(key), { force: true });
    return {};
  },
};

let original;
function loadOriginal() {
  if (original !== undefined) return original;
  const target = process.env.AUX_ASIDE_NATIVE_BINDING;
  try {
    original = target ? require(target) : null;
  } catch {
    original = null;
  }
  return original;
}

module.exports = {
  run(command, input) {
    const handler = handlers[command];
    if (handler) {
      try {
        return JSON.stringify(handler(input ? JSON.parse(input) : {}));
      } catch (error) {
        return JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
      }
    }
    const binding = loadOriginal();
    if (!binding) return JSON.stringify({ error: `Unknown native binding command: ${command}` });
    return binding.run(command, input);
  },
  get pdf() {
    return loadOriginal()?.pdf;
  },
};
