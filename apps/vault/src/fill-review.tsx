import { Button } from '@aux/ui';
import { useEffect, useState } from 'react';
import type { FieldKey, PageFillContext } from './autofill-protocol';

export function FillReview({
  category,
  context,
  pending,
  onFill,
}: {
  category: string;
  context?: PageFillContext;
  pending: boolean;
  onFill: (fields?: FieldKey[]) => void;
}) {
  const [selected, setSelected] = useState<FieldKey[]>([]);
  useEffect(() => {
    setSelected(
      context?.category === 'login'
        ? context.fields.map((field) => field.key)
        : [],
    );
  }, [context]);
  if (!context)
    return (
      <Button disabled={pending} onClick={() => onFill()}>
        Choose a field to fill
      </Button>
    );
  if (context.category !== category)
    return (
      <p>
        Select a saved{' '}
        {context.category === 'login'
          ? 'login'
          : context.category === 'card'
            ? 'card'
            : 'identity'}{' '}
        for these fields.
      </p>
    );
  return (
    <section className="stack">
      <small>Fill fields on {new URL(context.documentUrl).hostname}</small>
      {context.fields.map((field) => (
        <label className="row" key={field.key}>
          <input
            type="checkbox"
            disabled={pending}
            checked={selected.includes(field.key)}
            onChange={(event) =>
              setSelected((current) =>
                event.target.checked
                  ? [...current, field.key]
                  : current.filter((key) => key !== field.key),
              )
            }
          />
          {field.label}
        </label>
      ))}
      <Button
        disabled={pending || selected.length === 0}
        onClick={() => onFill(selected)}
      >
        Fill selected fields
      </Button>
      <Button disabled={pending} onClick={() => onFill()}>
        Choose another field
      </Button>
    </section>
  );
}
