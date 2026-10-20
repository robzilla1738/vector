# Use actual resolved account for native Chats

The supplied aside.account_id preference represents cloud/user binding: SetAccountProfileBinding clears it when user ID is empty. Stamping a local account ID there would conflict with the actual updater.

After authenticated ensureProfileAccount returns, remember its actual numeric ID in a Profile-owned presentation cache. Cache lifetime ends with Profile and cached profile/user/bound-ID changes invalidate selection. No registry, preference, session, onboarding or credential mutation is introduced.

Chats polling/actions now read the actual validated native profile binding through existing ReadProfileSecurity metadata parsing, rather than interpreting profile display order as account ID. They ignore Vault lock/setup status and retain the existing actual daemon authorization, account recheck and response lifecycle. Successful binding reads refresh the same presentation cache for row selection and new-chat classification. Missing/invalid bindings yield no request until the supplied Agent resolves the profile.

Based on native-local-browser; files do not overlap frame/default or local-profile-route follow-ups. Integrator owns focused compilation and actual Chat observation.
