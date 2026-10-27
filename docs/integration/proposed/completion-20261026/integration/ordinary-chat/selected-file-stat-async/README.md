# Return a promise from the selected-file stat helper

The 20:44 combined Muse check on candidate 2ed31bad attached a tab, `document.pdf` and `image.heic`. Every `read_file` call failed with `auxSelectedReadFileStat(...).catch is not a function`, while the REPL snapshot, memory search and `get_time` worked.

`read_file` awaits `auxSelectedReadFileStat(path).catch(()=>null)`. Without a native read scope the helper returns `fs.stat` (a promise). With the native scope (now always present for registered selected files) it returned a plain object, and a throwing `openReadFile` threw synchronously. Declaring the helper `async` restores the promise contract in both paths: a successful open resolves to the size record, and an open failure becomes a rejection that the caller maps to "not found", as with `fs.stat`.

One rule, applied to the REPL event-loop guard derivatives (current and future). `prepare.py` is the REPL guard lane's preparer (identical hash-pinned replacement). Outputs: `/private/tmp/aux-selected-file-stat-async-20261026-a1-{current,future}`.
