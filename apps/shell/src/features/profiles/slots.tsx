import { lazy, Suspense } from "react";
const Switcher = lazy(() =>
  import("../../components/ProfileSwitcher").then((module) => ({ default: module.ProfileSwitcher })),
);
const Confirmation = lazy(() =>
  import("../../components/ProfileSwitcher").then((module) => ({ default: module.ProfileMoveConfirmation })),
);
export function ProfileMenu() {
  return (
    <Suspense fallback={null}>
      <Switcher />
    </Suspense>
  );
}
export function ProfileConfirmation() {
  return (
    <Suspense fallback={null}>
      <Confirmation />
    </Suspense>
  );
}
