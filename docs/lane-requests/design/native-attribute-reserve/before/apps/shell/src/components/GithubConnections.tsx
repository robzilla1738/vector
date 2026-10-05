import { staticFieldInputProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { call } from "../store";
import { executeCommand } from "../commands";
import { staticButtonProps as auxClassButtonProps } from "../ui/class-props";
import { staticGrowProps as auxClassGrowProps } from "../ui/deferred-class-props";

export function GithubConnections() {
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof load>>>([]);
  const [name, setName] = useState(""); const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function load() { return call("github.connections.list"); }
  const alive = useRef({ value: false });
  useEffect(() => {
    const scope = alive.current; scope.value = true;
    void load().then(value => { if (scope.value) setAccounts(value); }).catch(error => { if (scope.value) setError(errorMessage(error)); });
    return () => { scope.value = false; };
  }, []);
  const connect = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try { await executeCommand("connect-github", { payload: { name: name.trim(), token } }); const accounts = await load(); if (alive.current.value) { setAccounts(accounts); setToken(""); setName(""); } }
    catch (error) { if (alive.current.value) setError(errorMessage(error)); }
    finally { if (alive.current.value) setBusy(false); }
  };
  return <section className="settings-section"><h3>GitHub live folders</h3><p {...staticHintProps}>Paste a fine-grained personal access token with read access to the repositories you choose. Aux keeps it in secure native storage. Agents cannot read it.</p>
    {accounts.map(account => <div className="settings-row" key={account.id}><span {...auxClassGrowProps}>{account.name}<span {...staticHintProps}> · {account.login}</span></span><button className="btn ghost sm" data-command-id="revoke-github" disabled={busy} onClick={() => {
      setBusy(true); void executeCommand("revoke-github", { payload: { connectionId: account.id } }).then(async () => { const accounts = await load(); if (alive.current.value) setAccounts(accounts); }).catch((error: unknown) => { if (alive.current.value) setError(errorMessage(error)); }).finally(() => { if (alive.current.value) setBusy(false); });
    }}>Disconnect</button></div>)}
    <label>Connection name<input {...staticFieldInputProps} value={name} maxLength={200} disabled={busy} onChange={event => setName(event.target.value)} placeholder="Work GitHub" /></label>
    <label>Personal access token<input {...staticFieldInputProps} type="password" autoComplete="off" value={token} maxLength={1000} disabled={busy} onChange={event => setToken(event.target.value)} /></label>
    {error && <p role="alert" className="error-text">{error}</p>}
    <button {...auxClassButtonProps} data-command-id="connect-github" disabled={busy || !name.trim() || !token} onClick={() => void connect()}>{busy ? "Connecting…" : "Connect GitHub"}</button>
  </section>;
}
