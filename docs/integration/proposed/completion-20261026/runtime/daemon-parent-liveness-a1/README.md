# daemon-parent-liveness-a1

Follows `daemon-peerloss-deadline-a1`. That repair checked the pulse and authority failure flags during the worker drain, but both threads are joined by then, so a browser that died during the drain was never noticed. Now:

- the drain loop watches the browser itself (`getppid()` differs from the parent at start);
- the loop deadline and the drain deadline both run from the first observed peer loss, so a crash ends the daemon about 10 s later instead of about 21 s.

Built with `scripts/candidate/relink_daemon.py` from the peer-loss compile recipe and the prepared-lease link recipe (the link of the sealed executable), together with `runtime/memory-census-scope-a1`.
