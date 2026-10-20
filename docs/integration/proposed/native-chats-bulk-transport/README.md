# Actual native Chats bulk action transport

The source header commands2100/2101 map to original4639c10 mark-all-read and466fb20 accepted archive-all-chats, both through real463b864 request helper. Actual pinned supplied daemon owns exactly POST /session/for-chrome/mark-all-read and /session/for-chrome/archive-all-chats. This narrow enum adapter uses the existing actual scoped account/auth/private POST lifecycle and response handling; no fabricated empty-feed or action success. It permits empty session IDs only for these two concrete bulk paths. Other per-session validation stays intact.

The continuing real header-menu owner will call ArchiveAll only after the original shared native confirmation returns accepted; this transport does not itself prompt or simulate acceptance. Source/native-handler pins plus pure temporary replay pass. No requests, owner state, shared native edits or build occurred.
