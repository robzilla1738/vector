import type { WorkspaceFolderPresentation } from "@aux/contracts";
import {
  Archive,
  AppWindow,
  Bookmark,
  Clock,
  Cloud,
  Code,
  Cpu,
  Eye,
  Folder,
  Globe,
  Layers,
  LayoutGrid,
  MessageCircle,
  Mic,
  Moon,
  Pin,
  Puzzle,
  Search,
  Shield,
  Sparkles,
  Sun,
  Table,
  User,
  Zap,
} from "../../ui/icons";
import { Popover } from "../../ui/popover";
import { moveListFocus } from "../../keyboard-list";

const icons = {
  folder: Folder,
  code: Code,
  globe: Globe,
  bookmark: Bookmark,
  cloud: Cloud,
  cpu: Cpu,
  message: MessageCircle,
  sparkles: Sparkles,
  layers: Layers,
  puzzle: Puzzle,
  shield: Shield,
  zap: Zap,
  sun: Sun,
  moon: Moon,
  clock: Clock,
  table: Table,
  user: User,
  eye: Eye,
  pin: Pin,
  archive: Archive,
  grid: LayoutGrid,
  search: Search,
  mic: Mic,
  window: AppWindow,
};
const colors = ["neutral", "red", "orange", "yellow", "green", "teal", "blue", "violet", "pink"] as const;
export function ProjectIcon({ icon = "folder", color = "neutral" }: WorkspaceFolderPresentation) {
  const Icon = icons[icon];
  return (
    <span className="project-identity" data-color={color}>
      <Icon />
    </span>
  );
}
export function ProjectIdentityPicker({
  value,
  onChange,
  disabled,
}: {
  value: WorkspaceFolderPresentation;
  onChange(value: WorkspaceFolderPresentation): void;
  disabled: boolean;
}) {
  return (
    <Popover
      label="Project icon and color"
      className="project-icon-trigger"
      disabled={disabled}
      trigger={<ProjectIcon {...value} />}
    >
      {() => (
        <div
          className="project-identity-picker"
          onKeyDown={(event) => moveListFocus(event, "button:not(:disabled)")}
        >
          <div className="project-colors" role="group" aria-label="Project color">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                aria-pressed={(value.color ?? "neutral") === color}
                onClick={() => onChange({ ...value, color })}
              >
                <span className="project-color project-identity" data-color={color} />
              </button>
            ))}
          </div>
          <div className="project-icons" role="group" aria-label="Project icon">
            {(Object.keys(icons) as (keyof typeof icons)[]).map((icon) => (
              <button
                key={icon}
                type="button"
                aria-label={icon}
                aria-pressed={(value.icon ?? "folder") === icon}
                onClick={() => onChange({ ...value, icon })}
              >
                <ProjectIcon icon={icon} color={value.color} />
              </button>
            ))}
          </div>
        </div>
      )}
    </Popover>
  );
}
