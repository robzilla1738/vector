import { lazy, type ComponentType } from "react";
import { VisitedSection } from "./visited-section";

/** A section loads on first visit and retains its form state until Settings closes. */
export function lazySection<P extends object>(load: () => Promise<ComponentType<P>>) {
  const Component = lazy(async () => ({ default: await load() }));
  return function LazySection(props: P & { active?: boolean }) {
    return (
      <VisitedSection active={props.active ?? false}>
        <Component {...props} />
      </VisitedSection>
    );
  };
}
