---
name: bitwarden
description: Read this skill when the user uses Bitwarden.
icon: "https://app.getaux.co/builtin-skills/v1/bitwarden.svg"
---

# Bitwarden

## Filling a login

Bitwarden shows its fill options next to a login field once the field has focus.

1. Click the field you want filled.
2. Give the menu 500 ms to 1 s to show up (a menu, an icon, or an `iframe [origin="Bitwarden"]`), then take a snapshot.
3. Decide from that snapshot:
   - A Bitwarden menu with a login that fits the task: pick it.
   - Bitwarden asks to be unlocked first: unlock it as described below.
   - No menu and no unlock prompt: Bitwarden can't fill this form.

## Unlocking Bitwarden

The extension page is for unlocking only:

`chrome-extension://nngceckbapebfimnlniiiahkandclblb/popup/index.html`

1. Call `externalPasswordManagers.list()` to see whether an unlock password for Bitwarden is saved on this device.
2. Open the page above, take a fresh snapshot, and find the editable password field's ref.
3. Fill and submit it:

```js
await externalPasswordManagers.autofillUnlockPassword(page, 'bitwarden', 'e12'); // the real ref from your fresh snapshot
```

The provider argument has to be `'bitwarden'`, matching this extension. A successful result only means the password was submitted. Take a new snapshot to confirm Bitwarden actually unlocked. If it failed, don't resubmit on your own.

Once unlocked:

1. Go back to the sign-in page you started on.
2. Close the extension tab you opened for the unlock.
3. If the Bitwarden menu doesn't come back, reload the sign-in page.
4. Click the login field again so the menu reopens.
5. Fill from that menu.

Fill website logins from the menu on the site itself, not by searching inside the extension page.

No unlock password saved? Ask the user to unlock Bitwarden themselves. Don't set up Aux Password Manager and don't use a different provider's credential. Unlocking an external manager doesn't depend on Aux Password Manager being set up, locked or unlocked, or on its agent access settings.
