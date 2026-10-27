# memory-census-scope-a1

Follows `prepared-lease-recovery-a1`. Its census treated any same-user `aux-memory` process as live, so a second Aux installation or a zombie helper blocked recovery. It now counts only helpers whose image is inside this installation's bundle (derived from the daemon's resolved executable path) and skips zombies. If the bundle root cannot be read, it refuses as before.
