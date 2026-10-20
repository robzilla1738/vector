# Supplied27-column password projection

Two-file immutable followup: migrator.cc follows af004b80a encrypted-reader-caps output; service.cc follows66b295a59 destination-skips output. Root may rebase disjoint bookmark destination changes. No new target/GN; existing importer migrator and service objects only.

The original SQL literal0xdb1f67a reads27 named columns, and425b820..425bda4 constructs all their persisted PasswordForm fields before the genuine batch destination. This replaces the independent13-column projection with that exact query/order, including moving blocked/decrypt/name/time/scheme indices to their real positions. A source schema lacking required original columns remains a source error; no invented reduced-schema success fallback is added.

| Source column | Actual destination field |
|---|---|
| 0 /1 /7 | url / action / signon_realm |
| 2 /3 /4 /5 /6 | username_element / username_value / password_element / decrypted password_value / submit_element |
| 8 /18 /19 /22 /25 | date_created / date_last_used / date_password_modified / date_received / date_last_filled |
| 9 /10 /11 /12 | blocked_by_user / scheme / type / times_used_in_html_form |
| 13 /14 /15 | display_name / icon_url / federation_origin |
| 16 /17 | skip_zero_click / generation_upload_status |
| 20 /21 /23 /24 /26 | sender_email / sender_name / sharing_notification_displayed / sender_profile_image_url / actor_login_approved |

The current155 StoredCredential represents every listed persisted field. Its federation field is now url::SchemeHostPort, the actual155 persisted type, so the original source federation URL is parsed with that native type. The UTF8→UTF16 destinations and GURL fields use actual native conversions. This introduces no new password validation or destination authority. Blocked rows still clear only username/password values, and original dedup/decode aggregation/callback barriers remain.

The extra fields stay in the private staged source batch and genuine AddLogins payload, never the public job/status result. Other importer/legacy serial metadata behavior is unchanged. No source account, credential or OS operation was performed.

## Proof and remaining scope

Original SQL bytes, complete field-loader range, native batch destination and current155 StoredCredential header are pinned. verify.py performs static pin checks plus disposable two-file replay only; root owns native compilation and runtime evidence.

The private base::Value UTF8-only staging restriction, original physical snapshot/copy fallback and other category/discovery limits remain separately tracked gaps. This does not claim complete original reader fidelity or real imported credential acceptance. No secret, source profile, database, Keychain or browser was used in verification.
