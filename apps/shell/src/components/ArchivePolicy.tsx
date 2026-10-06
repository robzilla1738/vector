import { staticFieldInputProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { archiveSettings, ARCHIVE_POLICIES, type ArchiveHours } from "../auto-archive";
import { executeCommand } from "../commands";
import { useStore } from "../store";

export const ARCHIVE_POLICY_LABELS: Record<ArchiveHours, string> = {
  12: "12 hours",
  24: "24 hours",
  72: "3 days",
  168: "7 days",
  720: "30 days",
  never: "Never",
};
export function ArchivePolicy({ spaceId }: { spaceId: string }) {
  const settings = useStore((state) => state.settings.autoArchive);
  const value = archiveSettings(settings).bySpace[spaceId] ?? 12;
  return (
    <label>
      Archive unpinned tabs after
      <select
        {...staticFieldInputProps}
        data-command-id="set-auto-archive-policy"
        value={value}
        onChange={(event) => {
          const archiveHours =
            event.target.value === "never" ? "never" : (Number(event.target.value) as ArchiveHours);
          void executeCommand("set-auto-archive-policy", { payload: { spaceId, archiveHours } }).catch(
            () => undefined,
          );
        }}
      >
        {ARCHIVE_POLICIES.map((hours) => (
          <option key={hours} value={hours}>
            {ARCHIVE_POLICY_LABELS[hours]}
          </option>
        ))}
      </select>
      <span {...staticHintProps}>Pinned, filed, playing, unsaved and active tabs stay open.</span>
    </label>
  );
}
