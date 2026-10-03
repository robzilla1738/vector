// Closed workload: no caller count, path, delay, credential or source selector.
export const IMPORT_INTERRUPTION_ROWS = 5001;
export function writeFixedInterruptionHistory(db, origin) {
  const url = db.prepare('INSERT INTO urls VALUES(?,?,?)');
  const visit = db.prepare('INSERT INTO visits VALUES(?,?,?)');
  db.exec('BEGIN');
  try {
    for (let index = 1; index <= IMPORT_INTERRUPTION_ROWS; index++) {
      url.run(index, new URL(`/setup/interrupt-history/${index}`, origin).href, `Synthetic interruption history ${index}`);
      visit.run(index, index, 13344473600000000n + BigInt(index) * 1000000n);
    }
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
