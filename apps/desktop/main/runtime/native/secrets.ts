import { RpcChannel } from "@aux/contracts";
import { secrets } from "../../app/services.js";
import { onNative } from "./validate.js";

export function registerSecretMethods(ch: RpcChannel) {
  onNative(ch, "native.storeSecret", ({ name, value }) => {
    secrets.write(name, value);
    return { ok: true };
  });
  onNative(ch, "native.readSecret", ({ name }) => {
    return { value: secrets.read(name) };
  });
}
