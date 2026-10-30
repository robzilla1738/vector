---
name: 1password
description: Read this skill when the user uses 1Password.
icon: "https://app.getaux.co/builtin-skills/v1/1password.jpg"
---

# 1Password

## Filling a login

1Password puts its fill options in a popover iframe next to a form field once the field has focus.

1. Click the field you want filled.
2. Give the popover 500 ms to 1 s to show up, then take a snapshot.
3. Look near the end of the snapshot for `iframe [origin="1Password"]` and decide:
   - The iframe menu is there and lists a login that fits the task: pick it.
   - No iframe, but the status `"1Password menu is available. Press down arrow to select."` appears: 1Password is locked. Unlock it as described below.
   - Neither one: 1Password can't fill this form.

## Unlocking 1Password

The extension page is for unlocking only:

`chrome-extension://aeblfdkhhhdcdjpifhhbdiojplfjncoa/popup/index.html`

1. Call `externalPasswordManagers.list()` to see whether an unlock password for 1Password is saved on this device.
2. Open the page above, take a fresh snapshot, and find the editable password field's ref.
3. Fill and submit it:

```js
await externalPasswordManagers.autofillUnlockPassword(page, '1password', 'e12'); // the real ref from your fresh snapshot
```

The provider argument has to be `'1password'`, matching this extension. A successful result only means the password was submitted. Take a new snapshot to confirm 1Password actually unlocked. If it failed, don't resubmit on your own.

Once unlocked:

1. Go back to the sign-in page you started on.
2. Close the extension tab you opened for the unlock.
3. **Reload the sign-in page. This step is required:** without it the 1Password menu won't appear.
4. Click the login field again so the menu reopens.
5. Fill from that menu.

Fill website logins from the menu on the site itself, not by searching inside the extension page.

No unlock password saved? Ask the user to unlock 1Password themselves. Don't set up Aux Password Manager and don't use a different provider's credential. Unlocking an external manager doesn't depend on Aux Password Manager being set up, locked or unlocked, or on its agent access settings.
