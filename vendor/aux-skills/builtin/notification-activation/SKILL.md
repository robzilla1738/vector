---
name: notification-activation
description: Enable browser notifications on websites for monitoring and event-driven routine flows.
icon: "/builtin-skills/v1/notification-activation.jpg"
autoInject:
  keywords:
    - notification
    - notifications
    - notify me
    - subscribe to notifications
    - alert me when
    - wait for notification
    - 브라우저 알림
    - 푸시 알림
---

# Turning on site notifications

A site's notifications only reach Aux when **both** are on: the browser permission and the site's own setting. The permission alone does nothing if the site was never told to send notifications.

## 0. Already granted?

```js
// Ask the daemon whether this origin already has a notification grant.
const origin = new URL(page.url()).origin;
const existing = await trpcClient.inbox.getNotificationGrant.query({ origin });
if (existing) {
  // Already granted: go to step 2 if the site setting isn't on yet, otherwise step 3.
}
```

If a grant exists, the browser already allows notifications from this origin for the AI. Skip step 1, do step 2 if the site setting still needs turning on, and always do step 3 before waiting.

## 1. Grant the browser permission

```js
await page.grantNotificationPermission();
```

Run this on the target site before anything else. It silently gives the origin "Allow for AI" notification permission (no dialog), and records the grant with the daemon so later sessions can check it instead of granting again. When it returns, let the page settle before step 2.

## 2. Turn notifications on in the site

This is the step that matters. Most sites make you opt in to desktop, browser or push notifications on their own settings page.

**Find the settings.** Take `await snapshot(page, { interactive: true })` and look for a gear icon or profile menu. Ways in:

- a direct URL, if you know it or can guess it from history (`/settings/notifications`, `/preferences`, `/account/notifications`);
- the gear icon, then a Notifications section;
- the profile menu, then Settings or Preferences, then a Notifications tab.

**Find the control.** Snapshot the settings page and look for "Desktop notifications", "Browser notifications", "Push notifications", toggles, checkboxes, or Enable / Turn on / Allow buttons. Mail-style sites may call it "New mail notifications"; chat-style sites "Notify me about…". Ignore email and SMS notification settings: you want push or desktop.

**Turn it on and check.**

```js
await page.locator('<ref>').click();

// Snapshot again and confirm the toggle now reads on, or a success message appeared.
const after = await snapshot(page);
```

**If something's off:**

- "Notifications blocked": step 1 didn't take. Run `page.grantNotificationPermission()`, reload, try again.
- A confirmation dialog: accept it.
- Several kinds of notification: turn on Desktop, Browser or Push specifically, and leave email and SMS alone.
- The toggle is buried: keep opening subsections.
- No notification settings anywhere: the site may ask through a banner on its main page instead. Go back there and look for an "Enable notifications" prompt.

## 3. Pin down the site before waiting

Before setting up a routine that waits on notifications, turn what the user called the site into its exact page origin. Never put the user's own words into `eventFilter.from`.

Work it out in this order:

1. For "this site", "here", "that service" or "the one I just used": the origin of the current or most recent task tab.
2. URLs from recent tasks and this conversation.
3. Existing grants, from `trpcClient.inbox.listNotificationGrants.query()`.
4. A browsing-history search for the site or service name.
5. If more than one origin still fits, ask a short question.

Use the origin internally, but talk to the user in terms of the site or domain: "I'll watch for Gmail notifications", or "I'll watch for notifications from mail.google.com". Don't say things like "origin subscription" unless they ask how it works.

If the user wants every browser notification looked at, leave `eventFilter.from` out and inspect each event when it arrives. For one named site or service, resolve it first and use its origin.

## 4. Schedule a check

Once notifications are on, schedule a background check with `routine_update`. Routines no longer fire on events (that went away with Routine V2), so write a self-contained prompt describing what to look for, give it an hourly RRULE, and have it read the inbox and tell its parent only about new, relevant events. Keep the ids of events it has already checked in the routine's memory so nothing is reported twice.
