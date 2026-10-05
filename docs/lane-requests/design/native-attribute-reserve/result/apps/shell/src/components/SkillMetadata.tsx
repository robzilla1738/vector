import { staticFieldProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { useState } from "react";
import type { Routine } from "@aux/contracts";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

export type SkillMetadataValues = Pick<Routine, "description" | "icon" | "autoInject">;

const lines = (value: string) => [
  ...new Set(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  ),
];

/** Matching metadata is a suggestion hint. Saving it never runs a Skill. */
export function SkillMetadata({
  routine,
  disabled,
  onSave,
}: {
  routine: Routine;
  disabled: boolean;
  onSave: (values: SkillMetadataValues) => void;
}) {
  const [description, setDescription] = useState(routine.description ?? "");
  const [icon, setIcon] = useState(routine.icon ?? "");
  const [keywords, setKeywords] = useState(routine.autoInject.keywords.join("\n"));
  const [urls, setUrls] = useState(routine.autoInject.urls.join("\n"));
  const [error, setError] = useState("");

  const save = () => {
    const parsedKeywords = lines(keywords);
    const parsedUrls = lines(urls);
    if (parsedKeywords.length > 20 || parsedKeywords.some((value) => value.length > 80)) {
      setError("Use at most 20 keywords, each under 80 characters.");
      return;
    }
    if (
      parsedUrls.length > 20 ||
      parsedUrls.some((value) => {
        try {
          const page = new URL(value);
          return !["http:", "https:"].includes(page.protocol) || value.length > 2048;
        } catch {
          return true;
        }
      })
    ) {
      setError("Use at most 20 complete http or https URL prefixes.");
      return;
    }
    setError("");
    onSave({
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      autoInject: { keywords: parsedKeywords, urls: parsedUrls },
    });
  };

  const dirty =
    description !== (routine.description ?? "") ||
    icon !== (routine.icon ?? "") ||
    keywords !== routine.autoInject.keywords.join("\n") ||
    urls !== routine.autoInject.urls.join("\n");

  return (
    <details className="routine-accounts" aria-label="Skill sharing and suggestions">
      <summary>Sharing and suggestions</summary>
      <p {...staticHintProps}>
        These details are saved in SKILL.md. Matches only suggest this Skill to you; they never start it.
      </p>
      <label {...staticFieldProps}>
        Description
        <textarea
          value={description}
          maxLength={2000}
          disabled={disabled}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label {...staticFieldProps}>
        Icon name or URL
        <input
          value={icon}
          maxLength={200}
          disabled={disabled}
          onChange={(event) => setIcon(event.target.value)}
        />
      </label>
      <label {...staticFieldProps}>
        Suggestion keywords · one per line
        <textarea
          value={keywords}
          disabled={disabled}
          placeholder="weekly report"
          onChange={(event) => setKeywords(event.target.value)}
        />
      </label>
      <label {...staticFieldProps}>
        Suggestion URL prefixes · one per line
        <textarea
          value={urls}
          disabled={disabled}
          placeholder="https://example.com/reports"
          onChange={(event) => setUrls(event.target.value)}
        />
      </label>
      <p {...staticHintProps}>URL matches require the exact site origin and a matching path segment.</p>
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
      <button {...smallButtonProps} disabled={disabled || !dirty} onClick={save}>
        Save sharing details
      </button>
    </details>
  );
}
