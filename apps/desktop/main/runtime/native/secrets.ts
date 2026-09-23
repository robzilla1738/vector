import { RpcChannel } from "@aux/contracts";
import { secrets } from "../../app/services.js";

export function registerSecretMethods(ch: RpcChannel) {
  ch.onMethod("native.storeSecret", (p) => {
    const { name, value } = p as { name: string; value: string };
    if (typeof name !== "string" || typeof value !== "string") throw new Error("Invalid credential request");
    secrets.write(name, value);
    return { ok: true };
  });
  ch.onMethod("native.readSecret", (p) => {
    const { name } = p as { name: string };
    if (typeof name !== "string") throw new Error("Invalid credential request");
    return { value: secrets.read(name) };
  });
}
