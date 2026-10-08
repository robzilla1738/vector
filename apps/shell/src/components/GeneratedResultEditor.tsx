import { useState } from "react";
import type { GeneratedResultSpec } from "@aux/contracts";
import { smallGhostButtonProps } from "../ui/button-props";
import { staticFieldProps, staticHintProps, staticRowProps } from "../ui/class-props";

type TableSource = Extract<GeneratedResultSpec, { kind: "csv" }>["table"];
/** Paged cells retain their source value types and the complete table when editing one row. */
export function GeneratedResultTable({
  table,
  disabled,
  onChange,
}: {
  table: TableSource;
  disabled?: boolean;
  onChange?(table: TableSource): void;
}) {
  const [page, setPage] = useState(0);
  const offset = Math.min(page * 20, Math.max(0, Math.floor((table.rows.length - 1) / 20) * 20));
  return (
    <fieldset disabled={disabled}>
      <legend>{table.name}</legend>
      {onChange && (
        <label {...staticFieldProps}>
          Name
          <input
            value={table.name}
            maxLength={80}
            onChange={(event) => onChange({ ...table, name: event.target.value })}
          />
        </label>
      )}
      <div className="answer-table-scroll">
        <table>
          <tbody>
            {table.rows.slice(offset, offset + 20).map((row, rowIndex) => (
              <tr key={offset + rowIndex}>
                {row.map((value, columnIndex) => {
                  const change = (next: string | number | boolean | null) =>
                    onChange?.({
                      ...table,
                      rows: table.rows.map((original, index) =>
                        index === offset + rowIndex
                          ? original.map((cell, column) => (column === columnIndex ? next : cell))
                          : original,
                      ),
                    });
                  const label = `Row ${offset + rowIndex + 1}, column ${columnIndex + 1}`;
                  return (
                    <td key={columnIndex}>
                      {!onChange ? (
                        value === null ? (
                          ""
                        ) : (
                          String(value)
                        )
                      ) : typeof value === "boolean" ? (
                        <select
                          aria-label={label}
                          value={String(value)}
                          onChange={(event) => change(event.target.value === "true")}
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : (
                        <input
                          aria-label={label}
                          value={value ?? ""}
                          type={typeof value === "number" ? "number" : "text"}
                          step="any"
                          onChange={(event) =>
                            change(
                              typeof value === "number"
                                ? event.target.value === ""
                                  ? null
                                  : Number(event.target.value)
                                : event.target.value,
                            )
                          }
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div {...staticRowProps}>
        <button
          type="button"
          {...smallGhostButtonProps}
          disabled={!offset}
          onClick={() => setPage(Math.max(0, page - 1))}
        >
          Previous rows
        </button>
        <span {...staticHintProps}>
          {offset + 1}–{Math.min(offset + 20, table.rows.length)} of {table.rows.length} rows
        </span>
        <button
          type="button"
          {...smallGhostButtonProps}
          disabled={offset + 20 >= table.rows.length}
          onClick={() => setPage(page + 1)}
        >
          Next rows
        </button>
      </div>
    </fieldset>
  );
}

/** The structured artifact stays typed; no implementation JSON appears in the editing flow. */
export function GeneratedResultEditor({
  spec,
  disabled,
  onChange,
}: {
  spec: GeneratedResultSpec;
  disabled: boolean;
  onChange(spec: GeneratedResultSpec): void;
}) {
  switch (spec.kind) {
    case "docx":
      return (
        <div {...staticFieldProps}>
          <label {...staticFieldProps}>
            Document title
            <input
              value={spec.title}
              maxLength={200}
              disabled={disabled}
              onChange={(event) => onChange({ ...spec, title: event.target.value })}
            />
          </label>
          <label {...staticFieldProps}>
            Document body
            <textarea
              aria-label="Document body"
              className="result-source-editor"
              value={spec.paragraphs.join("\n\n")}
              disabled={disabled}
              onChange={(event) => onChange({ ...spec, paragraphs: event.target.value.split("\n\n") })}
            />
          </label>
          <span {...staticHintProps}>
            Use Markdown for headings, lists, bold text, tables, and source links. Formatting is preserved in
            Word.
          </span>
          {spec.tables.map((table, index) => (
            <details key={index}>
              <summary>{table.name}</summary>
              <GeneratedResultTable
                table={table}
                disabled={disabled}
                onChange={(next) =>
                  onChange({ ...spec, tables: spec.tables.map((item, i) => (i === index ? next : item)) })
                }
              />
            </details>
          ))}
        </div>
      );
    case "csv":
      return (
        <GeneratedResultTable
          table={spec.table}
          disabled={disabled}
          onChange={(table) => onChange({ ...spec, table })}
        />
      );
    case "xlsx":
      return (
        <div {...staticFieldProps}>
          {spec.sheets.map((table, index) => (
            <details key={index} open={spec.sheets.length === 1 ? true : undefined}>
              <summary>{table.name}</summary>
              <GeneratedResultTable
                table={table}
                disabled={disabled}
                onChange={(next) =>
                  onChange({ ...spec, sheets: spec.sheets.map((item, i) => (i === index ? next : item)) })
                }
              />
            </details>
          ))}
        </div>
      );
    case "pptx":
      return (
        <div {...staticFieldProps}>
          {spec.slides.map((slide, index) => {
            const change = (next: typeof slide) =>
              onChange({ ...spec, slides: spec.slides.map((item, i) => (i === index ? next : item)) });
            return (
              <details key={index} open={spec.slides.length === 1 ? true : undefined}>
                <summary>
                  Slide {index + 1}: {slide.title}
                </summary>
                <fieldset disabled={disabled}>
                  <label {...staticFieldProps}>
                    Slide title
                    <input
                      value={slide.title}
                      maxLength={200}
                      onChange={(event) => change({ ...slide, title: event.target.value })}
                    />
                  </label>
                  <label {...staticFieldProps}>
                    Bullet points, one per line
                    <textarea
                      value={slide.bullets.join("\n")}
                      onChange={(event) => change({ ...slide, bullets: event.target.value.split("\n") })}
                    />
                  </label>
                  <label {...staticFieldProps}>
                    Speaker notes
                    <textarea
                      value={slide.notes ?? ""}
                      maxLength={2000}
                      onChange={(event) => change({ ...slide, notes: event.target.value })}
                    />
                  </label>
                </fieldset>
              </details>
            );
          })}
        </div>
      );
    case "chart": {
      const keys = [...new Set(spec.data.flatMap(Object.keys))];
      return (
        <div {...staticFieldProps}>
          <fieldset disabled={disabled}>
            <label {...staticFieldProps}>
              Chart type
              <select
                value={spec.mark}
                onChange={(event) => onChange({ ...spec, mark: event.target.value as typeof spec.mark })}
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="point">Scatter</option>
              </select>
            </label>
            {(["x", "y"] as const).map((axis) => (
              <label {...staticFieldProps} key={axis}>
                {axis.toUpperCase()} axis
                <select
                  value={spec[axis]}
                  onChange={(event) => onChange({ ...spec, [axis]: event.target.value })}
                >
                  {keys.map((key) => (
                    <option key={key}>{key}</option>
                  ))}
                </select>
              </label>
            ))}
          </fieldset>
          <GeneratedResultTable
            table={{ name: spec.title, rows: spec.data.map((row) => keys.map((key) => row[key] ?? "")) }}
            disabled={disabled}
            onChange={(table) =>
              onChange({
                ...spec,
                title: table.name,
                data: table.rows.map((row) =>
                  Object.fromEntries(
                    keys.map((key, index) => [
                      key,
                      typeof row[index] === "number" ? row[index] : String(row[index] ?? ""),
                    ]),
                  ),
                ),
              })
            }
          />
        </div>
      );
    }
  }
}
