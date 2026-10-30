---
name: nordpass
description: Read this skill when the user uses NordPass.
---

# NordPass

## Filling a login

1. Click the login field you want filled.
2. Give the NordPass menu or icon 500 ms to 1 s to show up, then take a fresh snapshot.
3. A NordPass menu with a login that fits the task: pick it. An unlock prompt: unlock as described below. Neither: NordPass can't fill this form.

## Unlocking NordPass

The extension page is for unlocking only:

`chrome-extension://eiaeiblijfjekdanodkjadfinkhbfgcd/app.html`

1. Call `externalPasswordManagers.list()` to see whether a NordPass unlock password is saved on this device.
2. Open the page above and take a fresh snapshot. If it offers biometric unlock, choose the master-password option instead and snapshot again.
3. Fill the editable **master password** field from that snapshot:

```js
await externalPasswordManagers.autofillUnlockPassword(page, 'nordpass', 'e12'); // the real ref from your fresh snapshot
```

A successful result only means the password was submitted. Take a new snapshot to confirm NordPass unlocked, and don't resubmit on your own if it failed. The saved secret is the NordPass master password. Not the Nord Account login, and not a PIN. If NordPass wants an account sign-in, MFA or some other unlock method, ask the user to do it.

Once unlocked, go back to the sign-in page you started on and close the extension tab you opened. Reload the sign-in page if needed, click its login field again, and fill from NordPass's menu there. Don't look up website logins inside the extension vault.

No unlock password saved? Ask the user to unlock NordPass themselves. Don't set up Aux Password Manager and don't use a different provider's credential. Unlocking an external manager doesn't depend on Aux Password Manager being set up, locked or unlocked, or on its agent access settings.
