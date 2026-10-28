# Aux release: owner plan

2026-10-28. Everything only Robert can do before Aux is released, in the order that unblocks the most work. Claude's side is in the [agent plan](2026-10-28-agent-plan.md). The decisions behind both are in the [release readiness checklist](2026-10-28-release-readiness.md), section 1.

Conventions:
- Every key, token or password goes into the **1Password Agents vault**, never into chat, a file or a commit. Suggested item names are given below. Claude reads them only through the `op-agents` skill and never copies a value out.
- Use **hello@getaux.co** as the contact on every vendor account. Internal alerts go to **robertcourson96@gmail.com**.
- When a step is done, tell Claude in one line (for example "Developer ID imported"). Claude verifies it and continues.

## Summary

| # | Item | Unblocks | Effort |
|---|---|---|---|
| 1 | UI access for Claude | Every UI check, the acceptance pass, release checks | A few clicks |
| 2 | Quit the running Aux candidate when asked | State-folder archive, reseal launches | One click |
| 3 | Run the cleanup script | Removes merged Codex worktrees and the stale launcher | One command |
| 4 | Import the Developer ID certificate | Release signing, notarization, 1Password test | A few minutes |
| 5 | Developer ID provisioning profile for the daemon | Signing the daemon for release | Apple portal |
| 6 | Tartelet GitHub App and repo settings | Local CI | GitHub settings |
| 7 | Better Stack account and token | Uptime alerts, log drain | Sign-up |
| 8 | Vercel settings (log drain, firewall, env cleanup) | Hosted operations | Vercel dashboard |
| 9 | Deploy the service when told | Hosted fixes live | One command or click |
| 10 | Delete the J5 test account | Live proof that account purge works | In Aux |
| 11 | Resend sender and DNS check | Sign-in email deliverability | Resend dashboard |
| 12 | Neon restore window | Recovery confidence | Neon console |
| 13 | Sentry project | Crash reports | Sign-up |
| 14 | Google Safe Browsing key | Phishing and malware protection | Google Cloud |
| 15 | Widevine license and castLabs EVS | Netflix, Spotify, Disney+ playback | Vendor applications, external wait |
| 16 | Apple `2H4D7KNGUP` follow-up | REPL (Bash, PTY, CLI) | External wait |
| 17 | Disposable 1Password account | 1Password pairing test (R18) | Sign-up |
| 18 | ChatGPT eligibility form (optional) | In-app ChatGPT sign-in without the Codex CLI | Form |
| 19 | Keychain check approval | Real-Keychain acceptance | When asked |
| 20 | Approve each publication | The release itself | When asked |

Items 1, 4 and 5 are on the critical path: without them nothing can be verified, signed or notarized. Items 14 to 16 have the longest outside waits, so start them early.

---

## 1. UI access for Claude (D12)

**Why.** Claude can't click, type or read the screen in Aux, so no journey has been driven on the current seal. Every UI check, the acceptance pass and the release checks wait on this.

**Option A, recommended: grant the app this session runs in.**
1. Open System Settings › Privacy & Security › Accessibility.
2. Turn on **Claude** (the desktop app running this session). If it isn't listed, press +, choose `/Applications/Claude.app`, and turn it on.
3. Open Privacy & Security › Automation. Under Claude, turn on **System Events** and **Aux** if they're listed. If they aren't, they appear the first time Claude asks; click **Allow** on that prompt.
4. Screen Recording already shows as allowed. If Privacy & Security › Screen & System Audio Recording doesn't list Claude, add it the same way.
5. Quit and reopen Claude so the grants apply.

**Option B: Computer use.** Turn on Computer use for this session in the Claude app instead. Claude then drives the desktop through screenshots.

**Done when** `python3 scripts/acceptance/aux_drive.py check` reports Accessibility, Automation and Screen Recording as ok. Claude runs it.

**Unblocks** agent plan phases 3 and 9 and every "verified on a real launch" claim.

## 2. Quit the running Aux candidate when asked

**Why.** An Aux candidate is open right now (launched with `--use-mock-keychain`). It holds `~/Library/Application Support/Aux` (its crash database) and `Aux Browser Completion 20261026` (its profile). The four old state folders can't be archived while it runs, and reseal launches need it closed.

**Steps.** When Claude asks, quit Aux with Cmd+Q. If anything was open in it that you want, save it first; that profile is a test profile and gets archived.

**Done when** no Aux process is running. Claude checks with `pgrep`.

## 3. Run the cleanup script

**Why.** You approved removing the four Codex worktrees whose commits are already in `main`, and the stale `~/Applications/Aux.app` launcher for the retired build. The safety check blocked Claude from doing it.

**What's already saved.** Each worktree's HEAD is at `refs/archive/worktrees/codex-<name>`. Their untracked files are in `~/Documents/Aux-archive/worktree-salvage-2026-10-28/`. The launcher goes to the Trash, not deleted.

**Steps.**
1. Make sure Codex isn't open on any `aux-*` worktree.
2. Run:
   ```bash
   /Users/rcourson/Documents/Vibe/Aux/out/cleanup-2026-10-28/cleanup.sh
   ```

**Done when** `git worktree list` no longer shows `~/.codex/worktrees/aux-cloud-sessions`, `aux-features-frame`, `aux-features-navigation` or `aux-features-organization`, and `~/Applications/Aux.app` is gone.

## 4. Import the Developer ID certificate

**Why.** Only `Apple Development: Robert Courson (68DV3N28DS)` is installed. Release signing, notarization and the 1Password pairing test need `Developer ID Application: Robert Courson (9F2JXY8TCK)`. Its password isn't in 1Password Agents, so Claude can't import it.

**Steps.**
1. In Finder, open iCloud Drive and double-click `Aux Developer ID Application - 2026.p12`.
2. Keychain Access asks for the p12 password. Choose the **login** keychain.
3. Check it in Terminal:
   ```bash
   security find-identity -v -p codesigning
   ```
   It should list `Developer ID Application: Robert Courson (9F2JXY8TCK)`.
4. The first time Claude signs with it, macOS asks whether `codesign` may use the key. Enter your login password and choose **Always Allow**. Otherwise every one of the hundreds of nested binaries asks again.

**Done when** the identity is listed and one test signing runs without a prompt.

**Unblocks** agent plan phase 6 (release signing, notarization, DMG) and the 1Password copy.

## 5. Developer ID provisioning profile for the daemon

**Why.** The daemon (`dev.aux.browser.daemon`) uses `com.apple.application-identifier` and the keychain group `9F2JXY8TCK.dev.aux.local`. Under Developer ID signing those need an embedded Developer ID provisioning profile, or macOS refuses to launch it. The current profile is a development profile tied to this Mac.

**Steps.**
1. Sign in at developer.apple.com › Certificates, Identifiers & Profiles (team `9F2JXY8TCK`).
2. Under Identifiers, confirm the App ID `dev.aux.browser.daemon` exists, with the Keychain Sharing capability enabled. Don't change it if it's already there.
3. Under Profiles, press +, choose **Developer ID** (under Distribution), and continue.
4. Select the App ID `dev.aux.browser.daemon`, then the Developer ID Application certificate from step 4.
5. Name it `Aux Daemon Developer ID`, generate it and download it.
6. Save it as `~/Documents/Aux-archive/signing/Aux_Daemon_Developer_ID.provisionprofile` and tell Claude.

**Later, same steps:** when Apple approves `2H4D7KNGUP`, the profile must be regenerated to include the Endpoint Security entitlement. Claude will say when.

**Done when** Claude confirms that `security cms -D -i <profile>` shows team `9F2JXY8TCK`, the daemon's App ID and the Developer ID certificate.

## 6. Tartelet CI: GitHub App and repo settings

**Why.** You chose local CI through Tartelet: ephemeral macOS VMs on this Mac act as GitHub Actions runners for `robzilla1738/vector`. Tartelet registers each runner through a GitHub App you own. The repo is **public**, so it also needs settings that stop strangers from running code on your Mac through pull requests.

**Steps.**
1. Claude installs Tartelet (`brew install --cask tartelet`) and prepares the VM image. You do the GitHub part.
2. Signed in to GitHub as **robzilla1738**, go to Settings › Developer settings › GitHub Apps › **New GitHub App**.
   - Name: `Aux Tartelet Runner`. Homepage: `https://getaux.co`. Uncheck Webhook "Active".
   - Repository permissions: **Administration: Read and write**, **Metadata: Read-only**. Nothing else.
   - Where can it be installed: **Only on this account**.
3. Create it, note the **App ID**, then press **Generate a private key**. A `.pem` file downloads.
4. Press **Install App**, and install it on **only** `robzilla1738/vector`.
5. Open Tartelet › Settings › GitHub:
   - Runner scope: **Repository**. Owner `robzilla1738`, repository `vector`.
   - App ID: from step 3. Private key: choose the `.pem`. Tartelet stores it in your Keychain.
   - Then delete the `.pem` from Downloads and empty the Trash.
6. In `robzilla1738/vector` › Settings › Actions › General:
   - "Approval for running fork pull request workflows from contributors": **Require approval for all external contributors**.
   - Workflow permissions: **Read repository contents and packages permissions**.
   - Turn off "Allow GitHub Actions to create and approve pull requests".
7. Tell Claude the App is installed. Claude adds the workflows, which run only on pushes to `main` and on manual dispatch.

**Done when** a manual run of the test workflow completes on a Tartelet runner, and the VM is deleted afterward.

## 7. Better Stack account and API token

**Why.** Nothing watches the hosted service today. A failing maintenance cron returns 500 and nobody hears about it.

**Steps.**
1. Sign up at betterstack.com with hello@getaux.co.
2. Add **robertcourson96@gmail.com** as the on-call alert email, and confirm it from that inbox.
3. Create an API token (Settings › API tokens, Uptime) and save it in 1Password Agents as **`Aux Better Stack API token`**.
4. Tell Claude. Claude creates the monitor on `https://api.getaux.co/api/v1/internal/readiness`:
   - It uses the readiness bearer token, which Claude references from the vault and never prints.
   - It checks every 3 minutes, alerts after 2 failures, and also alerts on SSL expiry.
5. Optional: a status page at `status.getaux.co`. Claude gives you the DNS record.

**Done when** a test alert arrives at robertcourson96@gmail.com.

## 8. Vercel settings for `aux-cloud`

Use the **personal** team `robzilla1738s-projects`, project `aux-cloud`.

**8a. Log drain.** Team Settings › Log Drains (or the Better Stack integration in the Marketplace). Add a drain for `aux-cloud`: Production, runtime and build logs. This lets you search the request-ID logs later.

**8b. Firewall rate rule on email sign-in.** Today one global cap of 300 code emails an hour protects sign-in, so a spread-out attack can block everyone. Claude's code adds Vercel BotID; this rule backs it up.
1. Project › Firewall › Configure › **New Rule**. Name: `Email code rate limit`.
2. If: Request Path **equals** `/api/v1/auth/email/start` **and** Method **equals** `POST`.
3. Then: **Rate Limit**, fixed window, **5 requests per 10 minutes**, keyed by **IP**, action **Deny (429)**.
4. Add a second rule for `/api/v1/auth/email/verify-code` (POST): 20 per 10 minutes per IP, Deny.
5. Review and **Publish**.

**8c. Remove stale variables.** Settings › Environment Variables. Delete:
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, every `STRIPE_PRICE_*`, `STRIPE_PORTAL_CONFIGURATION_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `AUX_AI_MODEL`, `AUX_AI_FAST_MODEL`
- `AUX_PAYMENTS_ENABLED`, `AUX_HOSTED_AI_ENABLED`

The service no longer reads any of them, and readiness always reports both launch flags as false.

**8d. Sensitive values.** `DATABASE_URL`, `PGPASSWORD`, `POSTGRES_PASSWORD`, the `POSTGRES_URL*` variables and `BLOB_READ_WRITE_TOKEN` are visible to anyone with project access.
- If a variable is managed by the Neon or Blob integration, leave it, and keep project access to yourself.
- Otherwise remove it and add it again with **Sensitive** turned on (Production and Preview only).
- Redeploy afterward (item 9).

**Done when** Claude's read-only `vercel env ls` shows no Stripe or AI names and the firewall rules list both routes. Claude only reads the variable names.

## 9. Deploy the service when Claude says it's ready

**Why.** Production deploys are yours under AGENTS.md. Two fixes are waiting now: `09c024eba` (partial user-settings writes merge) and `608f900e3` (site icon; `app.getaux.co/icon.png` is a 404). The hosted batch (agent plan phase 5) follows.

**Steps.**
```bash
cd /Users/rcourson/Documents/Vibe/Aux/services/aux-cloud
```
```bash
vercel deploy --prod --global-config ~/.config/vercel-personal --scope robzilla1738s-projects
```
Then tell Claude the deployment URL. Claude runs readiness, checks all five aliases, and records the previous deployment as the rollback target.

**Or** tell Claude it may run production deploys of `aux-cloud`, and AGENTS.md gets updated to say so.

## 10. Delete the J5 test account

**Why.** Account deletion (Clerk user, every user table, blobs) is tested in code but has never run against production. J5 step 10 is the only live proof.

**Steps.** In Aux, signed in as the J5 test account: Settings › Account › **Delete account**, then confirm. Then tell Claude, who checks the database, Blob and Clerk cleanup read-only and records it.

## 11. Resend sender and DNS

**Steps.**
1. In Resend › Domains, confirm **getaux.co** is verified, with SPF and DKIM green.
2. Confirm a DMARC record exists for getaux.co, at least `v=DMARC1; p=none; rua=mailto:hello@getaux.co`.
3. Confirm the `RESEND_FROM` value in Vercel is an `@getaux.co` address, for example `Aux <signin@getaux.co>`. Claude adds a build check that refuses anything else, and sets Reply-To to hello@getaux.co.

**Done when** a sign-in code email lands in a Gmail inbox, not spam, with "Reply" going to hello@getaux.co.

## 12. Neon restore window

**Why.** The docs say 7 days of point-in-time restore, but the Neon account connected to Claude doesn't hold the Aux project, so it couldn't be checked.

**Steps.** In the Neon console, open the Aux production project and find its restore window setting (shown as history retention or instant restore). Make sure it is at least 7 days, then tell Claude the value.

## 13. Sentry project for crash reports

**Why.** You chose opt-in crash reports (decision 6). Aux asks once after the first crash, and minidumps go to Sentry without URLs or page content.

**Steps.**
1. Sign up at sentry.io with hello@getaux.co. Create an organization `aux` and a project of platform **Native** named `aux-mac`.
2. In the project's Security & Privacy settings, keep Data Scrubbing on, turn on **Prevent Storing of IP Addresses**, and leave **Store Native Crash Reports** off (Aux only needs the processed event).
3. Copy the DSN into 1Password Agents as **`Aux Sentry DSN`**.
4. Tell Claude. Claude wires Crashpad's upload URL and uploads debug symbols (dSYMs) for each release.

Whoever handles legal adds the crash-report line to the privacy page.

## 14. Google Safe Browsing key

**Why.** Without it, Aux has no phishing or malware warnings (decision 7).

**Steps.**
1. In Google Cloud Console (signed in with hello@getaux.co or your account), create a project `aux-browser`.
2. Enable **Safe Browsing API**. Google limits the free API to non-commercial use. If that doesn't fit, apply for **Web Risk API** instead (paid, needs approval). Your legal track decides which.
3. Create an API key, and restrict it to the Safe Browsing (or Web Risk) API only.
4. Save it in 1Password Agents as **`Aux Safe Browsing API key`** and tell Claude.

Until it exists, Aux ships with Safe Browsing off and the "API keys missing" banner hidden.

## 15. Widevine license and castLabs EVS

**Why.** Without Widevine, Netflix, Spotify, Disney+ and similar sites won't play (decision 8). A non-Google browser needs a Widevine license from Google, and every release needs VMP signing.

**Steps.**
1. At widevine.com, use the contact or partner form to request a **Widevine CDM license for a Chromium-based desktop browser** (Aux, macOS, Apple silicon). Contact hello@getaux.co. Expect questions and a wait.
2. Open a **castLabs EVS** account (castlabs.com, Electron for Content Security / EVS). It provides the VMP signing service. Save the EVS credentials in 1Password Agents as **`Aux castLabs EVS`**.
3. Forward Google's answer to Claude when it arrives. Claude adds the VMP signing step to the release script.

## 16. Apple `2H4D7KNGUP`

**Why.** The REPL (Bash, PTY and CLI tools for the agent) needs the Endpoint Security entitlement for `dev.aux.browser.daemon`. The source is complete and inactive.

**Steps.** In the Apple Developer account (Membership or the request's thread), follow up on request `2H4D7KNGUP`. Ask whether approval covers the daemon only, or also the browser's early observer process. Forward the answer to Claude. After approval, regenerate the profile as in item 5.

## 17. Disposable 1Password account

**Why.** The 1Password check (R18) installs the official extension, fills a dummy login and tests desktop-app pairing. It must not touch your real vault.

**Steps.**
1. Create a new 1Password account (free trial is fine) with a throwaway address, for example a hello@getaux.co plus-address.
2. Add one dummy login for the fixture site Claude names.
3. Save the account's sign-in details in 1Password Agents as **`Aux 1Password test account`**, and tell Claude.

The pairing test also needs item 4 (Developer ID), because 1Password only pairs with a Developer ID app in `/Applications`.

## 18. ChatGPT eligibility form (optional)

With the T3-style wiring (decision 1), Aux uses the user's own `codex login`, so Aux doesn't need its own OpenAI client to ship. Submit the prepared form only if you also want in-app "Sign in with ChatGPT" without the Codex CLI. The proposed answers are in `docs/integration/proposed/completion-20261026/integration/chatgpt-eligibility/request-packet/proposed-answers.md`.

## 19. Approve the real-Keychain check

**Why.** Shipping Aux uses the real macOS Keychain for saved passwords and cookies (D2). Testing it touches Keychain, so it needs your yes at the time.

**What happens.** Claude launches the release candidate with a disposable profile and no mock keychain, saves one dummy password and checks that cookies survive Quit and reopen. It then removes only the Keychain items that test created (the `Aux Safe Storage` entry). macOS may ask you to allow access once.

## 20. Approve each publication

Claude builds, signs, notarizes, staples and verifies everything, and prepares the download page and appcast. It stops before each outward step and asks:
1. Upload the DMG and update archive to the `aux-downloads` Blob store.
2. Deploy `aux-web` with `/download` and `/updates/appcast.xml`.
3. Publish the appcast entry, which existing users' update checks will see.

Each needs a separate yes. A published version is never replaced with different bytes.
