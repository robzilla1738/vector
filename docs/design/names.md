# Aux names and local boundaries

All independently built components use Aux-owned names:

| Component | Name |
| --- | --- |
| Browser extension API | `chrome.aux*` |
| Private extension permission | `dev.aux.ext.private.*` |
| Daemon session token | `AuxDaemonSessionToken` |
| Daemon auth subprotocol | `aux.daemon.auth.` |
| Signature domain | `Aux Daemon Auth v1\0` |
| Health service | `aux-daemon` |
| Browser session token | `AuxSessionToken` |
| CDP extension domain | `Aux.*` |
| Environment | `AUX_*` |
| Keychain service | `Aux Agent` |
| State home | `~/.aux` |
| App data | `~/Library/Application Support/Aux` |
| Daemon / bridge / secure CDP ports | `21520` / `21522` / `45203` |

New independently generated extension keys define fresh extension IDs. Secrets remain outside the repository. The browser and daemon run locally; account sync, cloud billing, remote control and cloud channels are hidden until separately authorized.
