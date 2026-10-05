import "./CommandRankingDebug.css";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

export interface RankingDebugRow {
  id: string;
  title: string;
  source: string;
  base: number;
  adjustment: number;
  score: number;
}

interface DuplicateRow {
  droppedId: string;
  keptId: string;
}

export default function CommandRankingDebug({
  rows,
  duplicates,
  choices,
  error,
  onClear,
}: {
  rows: RankingDebugRow[];
  duplicates: DuplicateRow[];
  choices: number;
  error: string | null;
  onClear: () => void;
}) {
  return (
    <section className="cb-ranking" aria-label="Ranking details">
      <h3>Result order</h3>
      <p>
        Chromium suggestions keep their supplied order. Aux results use text match, source, and learned
        choices.
      </p>
      <p>
        {duplicates.length} duplicate{duplicates.length === 1 ? "" : "s"} hidden by title and site.
      </p>
      {duplicates.length > 0 && (
        <details>
          <summary>Show hidden matches</summary>
          <ul>
            {duplicates.map((item) => (
              <li key={item.droppedId}>
                {item.droppedId} matched {item.keptId}
              </li>
            ))}
          </ul>
        </details>
      )}
      <ol>
        {rows.map((row) => (
          <li key={row.id}>
            <span>{row.title}</span>
            <small>
              {row.source} · match {row.base} + learned {row.adjustment} = {row.score}
            </small>
          </li>
        ))}
      </ol>
      <p>
        {choices} learned choice{choices === 1 ? "" : "s"} in this Profile.
      </p>
      {error && <p {...nativeAlertRoleProps}>Ranking unavailable: {error}</p>}
      <button type="button" onClick={onClear}>
        Clear learned ranking
      </button>
    </section>
  );
}
