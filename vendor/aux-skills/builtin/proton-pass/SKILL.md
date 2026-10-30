---
name: proton-pass
description: Read this skill when the user uses Proton Pass.
---

# Proton Pass

## Filling a login

Proton Pass shows its fill options next to a login field once the field has focus.

1. Click the field you want filled.
2. Give the menu 500 ms to 1 s to show up (a menu, an icon, or an `iframe [origin="Proton Pass"]`), then take a snapshot.
3. Decide from that snapshot:
   - A Proton Pass menu with a login that fits the task: pick it.
   - Proton Pass asks to be unlocked first: unlock it as described below.
   - No menu and no unlock prompt: Proton Pass can't fill this form.

## Unlocking Proton Pass

The extension page is for unlocking only:

`chrome-extension://ghmbeldphafepmbegfdlkpapadhbakde/popup.html`

1. Call `externalPasswordManagers.list()` to see whether an unlock password for Proton Pass is saved on this device.
2. Open the page above, take a fresh snapshot, and find the editable password field's ref.
3. Fill and submit it:

```js
await externalPasswordManagers.autofillUnlockPassword(page, 'proton-pass', 'e12'); // the real ref from your fresh snapshot
```

The provider argument has to be `'proton-pass'`, matching this extension. A successful result only means the password was submitted. Take a new snapshot to confirm Proton Pass actually unlocked. If it failed, don't resubmit on your own.

Once unlocked:

1. Go back to the sign-in page you started on.
2. Close the extension tab you opened for the unlock.
3. If the Proton Pass menu doesn't come back, reload the sign-in page.
4. Click the login field again so the menu reopens.
5. Fill from that menu.

Fill website logins from the menu on the site itself, not by searching inside the extension page.

No unlock password saved? Ask the user to unlock Proton Pass themselves. Don't set up Aux Password Manager and don't use a different provider's credential. Unlocking an external manager doesn't depend on Aux Password Manager being set up, locked or unlocked, or on its agent access settings.
