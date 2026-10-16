import { useId, useRef, useState } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { runCommand } from "../commands";
import { pushSettingsPath } from "../settings/routes";
import { shellIconClose, shellIconOpen, shellIconQuestion } from "../ui/icons";
import "./SuggestedTasks.css";

const preferenceKey = "aux.home.suggestions.v1";
export const SUGGESTED_TASKS = [
  {
    id: "memory",
    title: "Set up Aux’s memory",
    description: "Ask Aux to learn the context you choose so it can help with less input.",
    prompt:
      "Help me set up Aux’s memory. Ask what I want Aux to remember, then draft organized notes for my review. Do not save secrets or sensitive identifiers. Wait for my approval before changing memory.",
  },
  {
    id: "routines",
    title: "Automate my routines",
    description: "Ask Aux to review your recent work and suggest tasks it can automate.",
    prompt:
      "Help me identify repeated workflows worth turning into Aux routines. Use the context I choose to share. For each suggestion, explain its inputs, steps, schedule, and output. Let me choose a workflow before creating or enabling a routine.",
  },
  {
    id: "customize",
    title: "Customize Aux",
    description: "Make Aux yours with custom skills, memory, shortcuts, and preferences.",
  },
] as const;

/** Available beyond first-run setup; prompt actions only request an ordinary composer draft. */
export function SuggestedTasks({ onChoose }: { onChoose(text: string): void }) {
  const hasRuns = useStore((state) => state.runs.length > 0);
  const [preference, setPreference] = useState<"expanded" | "folded" | undefined>(() => {
    if (!bridge.privateMode) {
      try {
        const saved = localStorage.getItem(preferenceKey);
        if (saved === "expanded" || saved === "folded") return saved;
      } catch {
        /* The in-window choice still works without storage. */
      }
    }
    return undefined;
  });
  const panelId = useId();
  const section = useRef<HTMLElement>(null);
  const expanded = preference ? preference === "expanded" : !hasRuns;
  if (bridge.privateMode) return null;
  const toggle = () => {
    const next = expanded ? "folded" : "expanded";
    setPreference(next);
    try {
      localStorage.setItem(preferenceKey, next);
    } catch {
      /* Optional presentation preference. */
    }
    if (next === "expanded")
      requestAnimationFrame(() =>
        section.current?.scrollIntoView({
          block: "nearest",
          behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        }),
      );
  };
  return (
    <section ref={section} className="home-suggestions" aria-label="Suggested tasks">
      <div id={panelId} hidden={!expanded}>
        <h2>Suggested tasks</h2>
        <div className="home-suggestion-cards">
          {SUGGESTED_TASKS.map((card) => (
            <article className="home-suggestion-card" key={card.id}>
              <div className="home-suggestion-hero" aria-hidden>
                <img src={`/suggestions/${card.id}.webp`} alt="" loading="lazy" decoding="async" />
                <span className="home-suggestion-icon">
                  <img src={`/suggestions/${card.id}.svg`} alt="" />
                </span>
              </div>
              <div className="home-suggestion-copy">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <button
                type="button"
                className="home-suggestion-action"
                aria-label={"prompt" in card ? `Use prompt: ${card.title}` : "Open customization settings"}
                onClick={() => {
                  if (bridge.privateMode) return;
                  if ("prompt" in card) onChoose(card.prompt);
                  else {
                    pushSettingsPath("Connections", "Plugins");
                    useStore.setState({ settingsCategory: "Connections" });
                    runCommand("settings");
                  }
                }}
              >
                {"prompt" in card ? "Use this prompt" : "Open Settings"} {shellIconOpen}
              </button>
            </article>
          ))}
        </div>
      </div>
      <div className="home-suggestions-footer">
        <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={toggle}>
          {expanded ? shellIconClose : shellIconQuestion}
          {expanded ? "Close" : "Show suggested tasks"}
        </button>
      </div>
    </section>
  );
}
