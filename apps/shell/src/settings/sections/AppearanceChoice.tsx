import { useId } from "react";
import { RadioCard } from "../../ui";

type Choice = { value: string; label: string; image: string; description: string };

export function AppearanceChoice({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: string;
  choices: readonly Choice[];
  onChange(value: string): void;
}) {
  const name = useId();
  return (
    <div className="settings-visual-choice" role="radiogroup" aria-label={label}>
      {choices.map((choice) => (
        <RadioCard
          key={choice.value}
          className="settings-visual-option"
          name={name}
          value={choice.value}
          checked={value === choice.value}
          onChange={() => onChange(choice.value)}
        >
          <img src={choice.image} alt="" width={72} height={44} title={choice.description} />
          <span>{choice.label}</span>
        </RadioCard>
      ))}
    </div>
  );
}
