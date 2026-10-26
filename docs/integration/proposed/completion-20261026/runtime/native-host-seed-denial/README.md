Native host own-app seed closure, successor to 176d4028c.

Derives canonical outer application path from the actual native browser bundle, refuses noncanonical/non-app paths, denies all child writes/links to the whole bundle, and protects all ancestor entries against unlink/rename. No policy-resource, addon flag or admission changes. Same system sandbox, stopped publication and original reaper remain. Existing host syntax command checks this exact source; integration retains input/output SHA verification.
