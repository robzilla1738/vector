# Reconciliation integration after Chromium155 compiler correction

Rebases the exact supplied pin reconciliation proposal onto applied v201. Every output equals native-pinned-tab-entry-reconciliation/source, except the already compiled saved_url binding rename retained from v201. No behavior changes. The source proposal retains its source pins and fixtures. //net registration is separate. The earlier interpretation of original7adfd94 as a close guard is superseded by the lane's SessionRestore recovery; that direct followup remains separate.
