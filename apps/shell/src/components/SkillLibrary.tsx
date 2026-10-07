import { useEffect, useRef, useState } from "react";
import type {
  SkillLibraryPreview,
  SkillLibrarySource,
} from "@aux/contracts/skill-library";
import { call } from "../store";
import { errorMessage } from "../error-message";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import {
  nativeCheckboxTypeProps,
  nativeAlertRoleProps,
  nativeStatusRoleProps,
} from "../ui/native-attribute-props";
export function SkillLibrary({
  workspaceId,
  onImported,
}: {
  workspaceId: string;
  onImported(): Promise<void>;
}) {
  const [review, setReview] = useState<SkillLibraryPreview>();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const epoch = useRef(0);
  useEffect(() => {
    ++epoch.current;
    setReview(undefined);
    setSelected([]);
    setBusy(false);
    return () => {
      ++epoch.current;
    };
  }, [workspaceId]);
  async function preview(source: SkillLibrarySource) {
    const original = ++epoch.current;
    setBusy(true);
    setError("");
    setNotice("");
    setReview(undefined);
    setSelected([]);
    try {
      const next = await call("routines.skills.preview", { source });
      if (epoch.current === original) setReview(next);
    } catch (reason) {
      if (epoch.current === original) setError(errorMessage(reason));
    } finally {
      if (epoch.current === original) setBusy(false);
    }
  }
  async function importSelected() {
    if (!review || !selected.length) return;
    const original = epoch.current;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await call("routines.skills.import", {
        reviewId: review.reviewId,
        skillIds: selected,
        workspaceId,
      });
      if (epoch.current !== original) return;
      setNotice(
        `Imported ${result.imported} paused Skills; ${result.skipped} duplicates skipped. Review and bind each Skill before use.`,
      );
      setSelected([]);
      await onImported();
    } catch (reason) {
      if (epoch.current === original) setError(errorMessage(reason));
    } finally {
      if (epoch.current === original) setBusy(false);
    }
  }
  return (
    <details className="routine-safety">
      <summary>Aux skills and compatible imports</summary>
      <p>
        Review Aux-authored guidance or select files from ~/.claude/skills.
        Import never runs a script or grants access.
      </p>
      <button
        {...smallGhostButtonProps}
        disabled={busy}
        onClick={() => void preview("aux")}
      >
        Browse Aux skills
      </button>{" "}
      <button
        {...smallGhostButtonProps}
        disabled={busy}
        onClick={() => void preview("claude")}
      >
        Review ~/.claude/skills
      </button>
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      {notice && <p {...nativeStatusRoleProps}>{notice}</p>}
      {review && (
        <>
          <p>{review.location}</p>
          {review.skills.map((skill) => (
            <div key={skill.skillId}>
              <label>
                <input
                  {...nativeCheckboxTypeProps}
                  disabled={busy || !!skill.error}
                  checked={selected.includes(skill.skillId)}
                  onChange={(event) =>
                    setSelected((old) =>
                      event.target.checked
                        ? [...old, skill.skillId]
                        : old.filter((id) => id !== skill.skillId),
                    )
                  }
                />{" "}
                {skill.title}
              </label>
              <p>{skill.error ?? skill.description}</p>
              {skill.objective && (
                <details>
                  <summary>Review instructions</summary>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {skill.objective}
                  </pre>
                </details>
              )}
            </div>
          ))}
          {!review.skills.length && <p>No SKILL.md documents found.</p>}
          <button
            {...smallButtonProps}
            disabled={busy || !selected.length}
            onClick={() => void importSelected()}
          >
            Import selected as paused Skills
          </button>
        </>
      )}
    </details>
  );
}
