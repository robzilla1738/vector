---
name: apple-passwords
description: Use Apple Passwords on macOS when the user asks to save, retrieve, or autofill Apple/iCloud passwords or OTPs.
icon: "https://app.getaux.co/builtin-skills/v1/apple-password.jpg"
autoInject:
  keywords: ["Apple Passwords", "iCloud Passwords", "Passwords app", "apple password", "icloud password"]
---

# Apple Passwords

The `applePasswords` global in the REPL saves, reads and fills logins from the macOS Passwords app.

## Touch ID: tell the user first

Send a `notification` before every call to `getPasswords`, `getOtps`, `autofillLogin` or `saveLogin`. Each one can bring up Apple Passwords UI on the Mac, and the call **blocks until the user approves or cancels**.

Reading and filling may ask for Touch ID. `saveLogin` usually shows a save or update notice, but it can block too.

Never ask the user to tell you a password, an OTP seed, a recovery code or a Touch ID result. To sign in, use `autofillLogin`: it fills the secret without it ever being printed.

## Calls

```js
// What the helper can do here.
console.log(await applePasswords.capabilities());

// Only when a call reports Apple Passwords isn't authenticated yet:
await applePasswords.requestAuth();
// If macOS shows a 6-digit code, ask the user for it.
await applePasswords.verifyAuth('<pin>');

// Accounts saved for a site. Returns no passwords.
console.log(await applePasswords.listLogins('https://example.com'));
// -> [{ username, domains }]

// Notify first: may wait for Touch ID.
const passwords = await applePasswords.getPasswords('https://example.com', 'me@example.com');
// -> [{ username, domain, password }]

// Notify first: may wait for Touch ID.
await applePasswords.autofillLogin(page, {
  url: 'https://example.com',
  username: 'me@example.com',
  usernameField: 'e12',
  passwordField: 'e13',
  submit: true,
});
// -> { status: 'filled', username, domain, passwordFilled: true }

// Notify first: may wait for Touch ID.
console.log(await applePasswords.getOtps('https://example.com'));
// -> [{ username, domain, code, source }]

// Notify first. Pass field refs so the password is never printed.
await applePasswords.saveLogin(page, {
  usernameField: 'e12',
  passwordField: 'e13',
});
// -> { status: 'saved', username, domain, passwordSaved: true }
```

## Types

```ts
declare global {
  const applePasswords: ApplePasswordsApi;
}

interface ApplePasswordsApi {
  capabilities(): Promise<Record<string, unknown>>;
  requestAuth(): Promise<{ status: 'auth-requested'; instruction: string }>;
  verifyAuth(pin: string): Promise<{ status: 'authenticated' }>;
  listLogins(url: string): Promise<Array<{ username: string; domains: string[] }>>;
  getPasswords(url: string, username?: string): Promise<Array<{ username: string; domain: string; password: string }>>;
  getOtps(url: string): Promise<Array<{ username: string; domain: string; code: string; source?: string }>>;
  saveLogin(page: Page, options: {
    url?: string; // defaults to page.url(); http(s) only
    username?: string; // or usernameField
    usernameField?: string; // snapshot ref or CSS selector
    password?: string; // or passwordField; never print it
    passwordField?: string; // snapshot ref or CSS selector
  }): Promise<{ status: 'saved'; username: string; domain: string; passwordSaved: true }>;
  autofillLogin(page: Page, options?: {
    url?: string; // defaults to page.url()
    username?: string; // needed when more than one login matches
    usernameField?: string; // snapshot ref or CSS selector
    passwordField?: string; // snapshot ref or CSS selector; defaults to the first password input
    submit?: boolean; // press Enter once the password is in
  }): Promise<{ status: 'filled'; username: string; domain: string; passwordFilled: true }>;
}
```

## Picking an account

- Not sure which account? Call `listLogins(url)` first.
- Several matches: choose from what the page and task show about the account. Ask only if it's truly unclear.
- Print a password only when the user asked to see or retrieve it. For signing in, use `autofillLogin`.
- If `autofillLogin` can't find the fields, take a fresh `snapshot()` and pass `usernameField` and `passwordField` refs.

## Saving

- `saveLogin` adds a login, or replaces the password of an existing domain and username. Call `listLogins(url)` first. If the username is already there, let the user know you'll be overwriting its password.
- If the user asked for exactly this save, just do it. If you're inferring the save or the target is unclear, confirm first. When final-confirm mode calls for it, always go through `request_action_confirmation`.
- Notify right before saving, naming only the domain and username. Never the password.
- Use `usernameField` and `passwordField`, or runtime variables read from those fields. Never write a literal password into REPL code, print it, or put it in an error message.
- After a timeout or disconnect you don't know whether the save happened. Check `listLogins` or the Passwords app before trying again, and never retry automatically.
- Saving doesn't work in incognito sessions.
